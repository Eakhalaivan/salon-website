package com.luxesuite.api.service;

import com.luxesuite.api.dto.AdminGiftCardSendRequest;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.GiftCard;
import com.luxesuite.api.model.GiftCardTransaction;
import com.luxesuite.api.model.NotificationType;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.GiftCardRepository;
import com.luxesuite.api.repository.GiftCardTransactionRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GiftCardServiceTest {

    @Mock
    private GiftCardRepository giftCardRepository;

    @Mock
    private GiftCardTransactionRepository giftCardTransactionRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private GiftCardService giftCardService;

    private User adminUser;
    private User customerUser;
    private Customer recipientCustomer;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");

        customerUser = new User();
        customerUser.setId(2L);
        customerUser.setEmail("customer@test.com");
        customerUser.setFirstName("Customer");
        customerUser.setLastName("User");

        recipientCustomer = new Customer();
        recipientCustomer.setId(10L);
        recipientCustomer.setUser(customerUser);
        recipientCustomer.setFirstName("Customer");
        recipientCustomer.setLastName("User");
    }

    @Test
    void testSendGiftCardFromAdminTriggersNotifications() {
        when(securityUtils.getCurrentUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(customerRepository.findById(10L)).thenReturn(Optional.of(recipientCustomer));
        
        when(giftCardRepository.save(any(GiftCard.class))).thenAnswer(i -> {
            GiftCard gc = i.getArgument(0);
            gc.setId(100L);
            return gc;
        });
        
        when(giftCardTransactionRepository.save(any(GiftCardTransaction.class))).thenAnswer(i -> i.getArgument(0));

        AdminGiftCardSendRequest request = new AdminGiftCardSendRequest();
        request.setRecipientCustomerId(10L);
        request.setAmount(new BigDecimal("100.00"));
        request.setMessage("Happy Birthday!");

        giftCardService.sendGiftCardFromAdmin(request);

        verify(notificationService, times(1)).sendAppNotification(
            eq(customerUser),
            eq("You received a gift card!"),
            contains("Happy Birthday!"),
            eq(NotificationType.GIFT_CARD_RECEIVED)
        );

        verify(notificationService, times(1)).sendEmail(
            eq("customer@test.com"),
            eq("You received a gift card!"),
            contains("Happy Birthday!")
        );
    }
}
