package com.luxesuite.api.service;

import com.luxesuite.api.dto.AppointmentDto;
import com.luxesuite.api.dto.AppointmentItemDto;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import com.luxesuite.api.exception.ConflictException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
public class AppointmentConcurrentTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @MockBean
    private com.luxesuite.api.security.SecurityUtils securityUtils;

    private Customer testCustomer;
    private Branch testBranch;
    private Staff testStaff;
    private com.luxesuite.api.model.Service testService;

    @BeforeEach
    void setUp() {
        doNothing().when(securityUtils).validateCustomerOwnership(any());

        Role customerRole = roleRepository.findByName("CUSTOMER").orElseGet(() -> {
            Role r = new Role();
            r.setName("CUSTOMER");
            return roleRepository.save(r);
        });

        User user = new User();
        user.setEmail("concurrent@test.com");
        user.setPasswordHash("hash");
        user.setRole(customerRole);
        user = userRepository.save(user);

        testBranch = new Branch();
        testBranch.setName("Test Branch");
        testBranch = branchRepository.save(testBranch);

        testCustomer = new Customer();
        testCustomer.setFirstName("Test");
        testCustomer.setUser(user);
        testCustomer = customerRepository.save(testCustomer);

        testService = new com.luxesuite.api.model.Service();
        testService.setName("Test Service");
        testService.setDurationMins(60);
        testService.setPrice(BigDecimal.valueOf(100));
        testService.setCategory("HAIR");
        testService = serviceRepository.save(testService);

        testStaff = new Staff();
        testStaff.setBranch(testBranch);
        testStaff.setUser(user);
        testStaff.setServices(Collections.singleton(testService));
        testStaff = staffRepository.save(testStaff);
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @AfterEach
    void tearDown() {
        jdbcTemplate.execute("DELETE FROM invoices");
        jdbcTemplate.execute("DELETE FROM appointment_services");
        jdbcTemplate.execute("DELETE FROM appointments");
        jdbcTemplate.execute("DELETE FROM staff_services");
        jdbcTemplate.execute("DELETE FROM staff");
        jdbcTemplate.execute("DELETE FROM services");
        jdbcTemplate.execute("DELETE FROM branches");
        jdbcTemplate.execute("DELETE FROM customers");
        jdbcTemplate.execute("DELETE FROM users");
        jdbcTemplate.execute("DELETE FROM roles");
    }

    @Test
    void testConcurrentBooking() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    startLatch.await(); // wait for all threads to be ready

                    AppointmentDto dto = new AppointmentDto();
                    dto.setCustomerId(testCustomer.getId());
                    dto.setBranchId(testBranch.getId());
                    dto.setNotes("Concurrent Booking");

                    AppointmentItemDto itemDto = new AppointmentItemDto();
                    itemDto.setServiceId(testService.getId());
                    itemDto.setStaffId(testStaff.getId());
                    itemDto.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));

                    dto.setServices(Collections.singletonList(itemDto));

                    appointmentService.createAppointment(dto);
                    successCount.incrementAndGet();
                } catch (ConflictException e) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    if (e.getMessage() != null && e.getMessage().contains("Double booking")) {
                        conflictCount.incrementAndGet();
                    } else if (e.getCause() instanceof org.hibernate.exception.LockAcquisitionException || e instanceof org.springframework.dao.CannotAcquireLockException) {
                        conflictCount.incrementAndGet();
                    }
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // start all threads simultaneously
        endLatch.await(); // wait for all threads to finish
        executorService.shutdown();

        assertEquals(1, successCount.get(), "Exactly one appointment should be successfully created.");
        assertEquals(9, conflictCount.get(), "The other 9 attempts should fail due to conflict or lock timeout.");
    }
}
