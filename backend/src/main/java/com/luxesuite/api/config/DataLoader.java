package com.luxesuite.api.config;

import com.luxesuite.api.model.Role;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.RoleRepository;
import com.luxesuite.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.StaffRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true", matchIfMissing = false)
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(
            UserRepository userRepository, 
            RoleRepository roleRepository, 
            PasswordEncoder passwordEncoder,
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository,
            BranchRepository branchRepository,
            com.luxesuite.api.repository.ServiceRepository serviceRepository,
            com.luxesuite.api.repository.ProductRepository productRepository,
            com.luxesuite.api.repository.SubscriptionPlanRepository subscriptionPlanRepository,
            StaffRepository staffRepository) {
        return args -> {
            if (true) {
                // Ensure roles exist
                Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));
                Role staffRole = roleRepository.findByName("THERAPIST").orElseGet(() -> roleRepository.save(Role.builder().name("THERAPIST").build()));
                Role customerRole = roleRepository.findByName("CUSTOMER").orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));

                // Create Admin
                User admin = userRepository.findByEmail("admin@luxesuite.com").orElse(null);
                if (admin == null) {
                    admin = User.builder()
                            .firstName("Admin")
                            .lastName("User")
                            .email("admin@luxesuite.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .role(adminRole)
                            .isActive(true)
                            .build();
                    userRepository.save(admin);
                } else {
                    admin.setPasswordHash(passwordEncoder.encode("password123"));
                    userRepository.save(admin);
                }

                // Create Staff
                User staff = userRepository.findByEmail("staff@luxesuite.com").orElse(null);
                if (staff == null) {
                    staff = User.builder()
                            .firstName("Staff")
                            .lastName("User")
                            .email("staff@luxesuite.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .role(staffRole)
                            .isActive(true)
                            .build();
                    userRepository.save(staff);
                } else {
                    staff.setPasswordHash(passwordEncoder.encode("password123"));
                    userRepository.save(staff);
                }

                // Create Customer
                User customer = userRepository.findByEmail("customer@luxesuite.com").orElse(null);
                if (customer == null) {
                    customer = User.builder()
                            .firstName("Customer")
                            .lastName("User")
                            .email("customer@luxesuite.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .role(customerRole)
                            .isActive(true)
                            .build();
                    userRepository.save(customer);
                }


                // Create Customer profile
                Customer customerProfile = customerRepository.findByUserId(customer.getId()).orElse(null);
                if (customerProfile == null) {
                    customerProfile = Customer.builder()
                            .user(customer)
                            .firstName("Customer")
                            .lastName("User")
                            .email("customer@luxesuite.com")
                            .phone("1234567890")
                            .totalPoints(0)
                            .build();
                    customerRepository.save(customerProfile);
                }

                // Ensure a Branch exists
                Branch branch = null;
                if (branchRepository.count() == 0) {
                    branch = Branch.builder()
                            .name("Main Branch")
                            .address("123 Main St")
                            .build();
                    branch = branchRepository.save(branch);
                } else {
                    branch = branchRepository.findAll().get(0);
                }

                // Create a test Invoice for the customer
                Invoice testInvoice = Invoice.builder()
                        .customer(customerProfile)
                        .branch(branch)
                        .subtotal(new BigDecimal("1500.00"))
                        .taxAmount(new BigDecimal("0.00"))
                        .discountAmount(new BigDecimal("0.00"))
                        .totalAmount(new BigDecimal("1500.00"))
                        .status("UNPAID")
                        .build();
                invoiceRepository.save(testInvoice);
                log.info("✅ Seeded test invoice ID: {} for Customer", testInvoice.getId());

                // Seed Services
                if (serviceRepository.count() == 0) {
                    java.util.List<com.luxesuite.api.model.Service> initialServices = java.util.Arrays.asList(
                        com.luxesuite.api.model.Service.builder()
                            .name("Signature Renewal Massage")
                            .description("A bespoke 90-minute full body massage using warm basalt stones and our signature blend of botanical oils.")
                            .durationMins(90)
                            .price(new BigDecimal("180.00"))
                            .genderCategory("UNISEX")
                            .category("Massage")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Lumina Glow Facial")
                            .description("Our premier anti-aging facial incorporating LED light therapy and rare botanical extracts for immediate radiance.")
                            .durationMins(60)
                            .price(new BigDecimal("145.00"))
                            .genderCategory("WOMEN")
                            .category("Skin")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Tranquility Scalp & Neck Ritual")
                            .description("A targeted 45-minute treatment focusing on tension release in the head, neck and shoulders with warmed oils.")
                            .durationMins(45)
                            .price(new BigDecimal("95.00"))
                            .genderCategory("UNISEX")
                            .category("Massage")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Precision Haircut & Styling")
                            .description("A customized haircut tailored to your features, complete with a soothing wash and professional styling.")
                            .durationMins(60)
                            .price(new BigDecimal("120.00"))
                            .genderCategory("WOMEN")
                            .category("Hair")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Balayage & Color Gloss")
                            .description("Artisan hand-painted highlights providing a natural, sun-kissed dimension, finished with a luminous gloss.")
                            .durationMins(180)
                            .price(new BigDecimal("250.00"))
                            .genderCategory("WOMEN")
                            .category("Hair")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Signature Gel Manicure")
                            .description("A restorative hand treatment including shaping, cuticle care, and a long-lasting gel polish of your choice.")
                            .durationMins(60)
                            .price(new BigDecimal("65.00"))
                            .genderCategory("WOMEN")
                            .category("Nails")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Executive Men's Haircut")
                            .description("A tailored haircut experience complete with a hot towel treatment and scalp massage.")
                            .durationMins(45)
                            .price(new BigDecimal("65.00"))
                            .genderCategory("MEN")
                            .category("Hair")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Luxury Beard Grooming")
                            .description("A complete beard shaping, conditioning, and straight razor lineup.")
                            .durationMins(30)
                            .price(new BigDecimal("45.00"))
                            .genderCategory("MEN")
                            .category("Grooming")
                            .build(),
                        com.luxesuite.api.model.Service.builder()
                            .name("Men's Energizing Facial")
                            .description("A deep cleansing facial designed specifically for men's skin to remove impurities and hydrate.")
                            .durationMins(45)
                            .price(new BigDecimal("110.00"))
                            .genderCategory("MEN")
                            .category("Skin")
                            .build()
                    );
                    serviceRepository.saveAll(initialServices);
                    log.info("✅ Test services seeded successfully");
                }

                // Create Staff profile
                User staffUser = userRepository.findByEmail("staff@luxesuite.com").orElse(null);
                if (staffUser != null) {
                    Staff staffProfile = staffRepository.findByUserId(staffUser.getId()).orElse(null);
                    if (staffProfile == null) {
                        java.util.List<com.luxesuite.api.model.Service> allServices = serviceRepository.findAll();
                        staffProfile = Staff.builder()
                                .user(staffUser)
                                .branch(branch)
                                .baseSalary(new BigDecimal("3000.00"))
                                .commissionRate(new BigDecimal("10.00"))
                                .services(new java.util.HashSet<>(allServices))
                                .build();
                        staffRepository.save(staffProfile);
                        log.info("✅ Staff profile created and associated with services");
                    }
                }

                // Seed Products
                if (productRepository.count() == 0) {
                    java.util.List<com.luxesuite.api.model.Product> initialProducts = java.util.Arrays.asList(
                        com.luxesuite.api.model.Product.builder()
                            .name("Lumina Glow Serum")
                            .sku("PROD-001")
                            .type("RETAIL")
                            .price(new BigDecimal("85.00"))
                            .cost(new BigDecimal("25.00"))
                            .build(),
                        com.luxesuite.api.model.Product.builder()
                            .name("Botanical Body Oil")
                            .sku("PROD-002")
                            .type("RETAIL")
                            .price(new BigDecimal("55.00"))
                            .cost(new BigDecimal("15.00"))
                            .build(),
                        com.luxesuite.api.model.Product.builder()
                            .name("Restorative Hydrating Shampoo")
                            .sku("PROD-003")
                            .type("RETAIL")
                            .price(new BigDecimal("45.00"))
                            .cost(new BigDecimal("12.00"))
                            .build(),
                        com.luxesuite.api.model.Product.builder()
                            .name("Deep Nourish Conditioner")
                            .sku("PROD-004")
                            .type("RETAIL")
                            .price(new BigDecimal("48.00"))
                            .cost(new BigDecimal("14.00"))
                            .build(),
                        com.luxesuite.api.model.Product.builder()
                            .name("Satin Finish Hair Serum")
                            .sku("PROD-005")
                            .type("RETAIL")
                            .price(new BigDecimal("65.00"))
                            .cost(new BigDecimal("18.00"))
                            .build()
                    );
                    productRepository.saveAll(initialProducts);
                    log.info("✅ Test products seeded successfully");
                }

                // Seed Subscription Plans
                if (subscriptionPlanRepository.count() == 0) {
                    java.util.List<com.luxesuite.api.model.SubscriptionPlan> initialPlans = java.util.Arrays.asList(
                        com.luxesuite.api.model.SubscriptionPlan.builder()
                            .name("Lumina Platinum Membership")
                            .description("Our most exclusive tier offering priority booking, complimentary upgrades, and premium retail discounts.")
                            .validityDays(365)
                            .price(new BigDecimal("1200.00"))
                            .discountRate(new BigDecimal("20.00"))
                            .planType("WALLET")
                            .totalSessions(0)
                            .build(),
                        com.luxesuite.api.model.SubscriptionPlan.builder()
                            .name("Signature Massage Package")
                            .description("A bundle of 5 signature 90-minute massage sessions at a special rate.")
                            .validityDays(180)
                            .price(new BigDecimal("750.00"))
                            .discountRate(new BigDecimal("10.00"))
                            .planType("SESSION_COUNT")
                            .totalSessions(5)
                            .build()
                    );
                    subscriptionPlanRepository.saveAll(initialPlans);
                    log.info("✅ Test subscription plans seeded successfully");
                }
            }
        };
    }
}
