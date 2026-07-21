package com.luxesuite.api.service;

import com.luxesuite.api.dto.AdminGiftCardSendRequest;
import com.luxesuite.api.dto.GiftCardDto;
import com.luxesuite.api.dto.PageResponse;
import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.GiftCardRepository;
import com.luxesuite.api.repository.GiftCardTransactionRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.UserRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftCardService {
    
    private final GiftCardRepository giftCardRepository;
    private final GiftCardTransactionRepository giftCardTransactionRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @Transactional
    public GiftCardDto createGiftCard(BigDecimal amount, String recipientEmail, String recipientName) {
        Customer customer = null;
        try {
            Long userId = securityUtils.getCurrentUserId();
            customer = customerRepository.findByUserId(userId).orElse(null);
        } catch (Exception e) {
            // Unauthenticated purchase allowed
        }

        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        GiftCard card = GiftCard.builder()
                .code(code)
                .initialBalance(amount)
                .currentBalance(amount)
                .purchasedByCustomer(customer)
                .recipientEmail(recipientEmail)
                .recipientName(recipientName)
                .status("ACTIVE")
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusYears(1))
                .source("PURCHASED")
                .build();
                
        GiftCard saved = giftCardRepository.save(card);
        
        GiftCardTransaction tx = GiftCardTransaction.builder()
                .giftCard(saved)
                .amount(amount)
                .type("PURCHASE")
                .build();
        giftCardTransactionRepository.save(tx);
        
        return mapToDto(saved);
    }

    public BigDecimal checkBalance(String code) {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found or invalid"));
        
        if (!"ACTIVE".equals(card.getStatus()) || (card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDateTime.now()))) {
            return BigDecimal.ZERO;
        }
        
        return card.getCurrentBalance();
    }

    public PageResponse<GiftCardDto> getMyGiftCards(int page, int size) {
        Long userId = securityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId).orElse(null);
        Long customerId = customer != null ? customer.getId() : -1L; // Fallback
        Page<GiftCard> cards = giftCardRepository.findByPurchasedByCustomerId(customerId, PageRequest.of(page, size));
        return PageResponse.of(cards.map(this::mapToDto));
    }

    @Transactional
    public BigDecimal redeem(String code, BigDecimal amount, Long invoiceId) {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found"));
                
        if (!"ACTIVE".equals(card.getStatus())) {
            throw new BadRequestException("Gift card is not active");
        }
        
        if (card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Gift card is expired");
        }
        
        if (card.getCurrentBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient gift card balance");
        }
        
        Invoice invoice = null;
        if (invoiceId != null) {
            invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        }
        
        card.setCurrentBalance(card.getCurrentBalance().subtract(amount));
        if (card.getCurrentBalance().compareTo(BigDecimal.ZERO) == 0) {
            card.setStatus("REDEEMED");
        }
        
        GiftCard saved = giftCardRepository.save(card);
        
        GiftCardTransaction tx = GiftCardTransaction.builder()
                .giftCard(saved)
                .amount(amount)
                .type("REDEMPTION")
                .relatedInvoice(invoice)
                .build();
        giftCardTransactionRepository.save(tx);
        
        return saved.getCurrentBalance();
    }

    @Transactional
    public GiftCardDto sendGiftCardFromAdmin(AdminGiftCardSendRequest request) {
        Long adminUserId = securityUtils.getCurrentUserId();
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
                
        Customer recipient = customerRepository.findById(request.getRecipientCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient customer not found"));
                
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        GiftCard card = GiftCard.builder()
                .code(code)
                .initialBalance(request.getAmount())
                .currentBalance(request.getAmount())
                .sentByAdmin(adminUser)
                .recipientCustomer(recipient)
                .recipientEmail(recipient.getUser() != null ? recipient.getUser().getEmail() : null)
                .recipientName(recipient.getFirstName() + " " + recipient.getLastName())
                .message(request.getMessage())
                .status("ACTIVE")
                .issuedAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt() != null ? request.getExpiresAt() : LocalDateTime.now().plusYears(1))
                .source("ADMIN_GIFTED")
                .build();
                
        GiftCard saved = giftCardRepository.save(card);
        
        GiftCardTransaction tx = GiftCardTransaction.builder()
                .giftCard(saved)
                .amount(request.getAmount())
                .type("GIFT_SENT")
                .build();
        giftCardTransactionRepository.save(tx);
        
        if (recipient.getUser() != null) {
            try {
                String amountStr = request.getAmount().toString();
                String messageNote = request.getMessage() != null ? " Message: " + request.getMessage() : "";
                String appMessage = "You've received a ₹" + amountStr + " gift card from Lumina Spa!" + messageNote + " <a href='/gift-cards'>View here</a>";
                
                notificationService.sendAppNotification(
                    recipient.getUser(),
                    "You received a gift card!",
                    appMessage,
                    NotificationType.GIFT_CARD_RECEIVED
                );
                
                String emailBody = "You've received a ₹" + amountStr + " gift card from Lumina Spa!\n\n" +
                                   "Code: " + code + "\n" +
                                   "Expiry Date: " + card.getExpiresAt().toLocalDate() + "\n" +
                                   messageNote;
                                   
                notificationService.sendEmail(
                    recipient.getUser().getEmail(),
                    "You received a gift card!",
                    emailBody
                );
            } catch (Exception e) {
                // Swallow so failure never rolls back gift card creation
            }
        }
        
        return mapToDto(saved);
    }
    
    @Transactional
    public BigDecimal redeemAdminGiftCard(String code, Long redeemingCustomerId) {
        GiftCard card = giftCardRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found"));
                
        if (!"ACTIVE".equals(card.getStatus())) {
            throw new BadRequestException("Gift card is already redeemed or not active");
        }
        
        if (card.getExpiresAt() != null && card.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Gift card is expired");
        }
        
        if (card.getRecipientCustomer() == null || !card.getRecipientCustomer().getId().equals(redeemingCustomerId)) {
            throw new BadRequestException("You are not authorized to redeem this gift card");
        }
        
        BigDecimal amount = card.getCurrentBalance();
        
        card.setCurrentBalance(BigDecimal.ZERO);
        card.setStatus("REDEEMED");
        card.setRedeemedAt(LocalDateTime.now());
        
        GiftCard saved = giftCardRepository.save(card);
        
        GiftCardTransaction tx = GiftCardTransaction.builder()
                .giftCard(saved)
                .amount(amount)
                .type("REDEMPTION")
                .build();
        giftCardTransactionRepository.save(tx);
        
        return amount; // Return the amount that was redeemed
    }
    
    public PageResponse<GiftCardDto> getAdminGiftCardsHistory(int page, int size) {
        Page<GiftCard> cards = giftCardRepository.findBySourceOrderByCreatedAtDesc("ADMIN_GIFTED", PageRequest.of(page, size));
        return PageResponse.of(cards.map(this::mapToDto));
    }
    
    public PageResponse<GiftCardDto> getReceivedGiftCards(int page, int size) {
        Long userId = securityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Page<GiftCard> cards = giftCardRepository.findByRecipientCustomerId(customer.getId(), PageRequest.of(page, size));
        return PageResponse.of(cards.map(this::mapToDto));
    }

    private GiftCardDto mapToDto(GiftCard card) {
        GiftCardDto dto = new GiftCardDto();
        dto.setId(card.getId());
        dto.setCode(card.getCode());
        dto.setInitialBalance(card.getInitialBalance());
        dto.setCurrentBalance(card.getCurrentBalance());
        dto.setPurchasedByCustomerId(card.getPurchasedByCustomer() != null ? card.getPurchasedByCustomer().getId() : null);
        dto.setRecipientEmail(card.getRecipientEmail());
        dto.setRecipientName(card.getRecipientName());
        dto.setStatus(card.getStatus());
        dto.setIssuedAt(card.getIssuedAt());
        dto.setExpiresAt(card.getExpiresAt());
        
        dto.setMessage(card.getMessage());
        dto.setSentByAdminName(card.getSentByAdmin() != null ? card.getSentByAdmin().getFirstName() + " " + card.getSentByAdmin().getLastName() : null);
        dto.setRecipientCustomerId(card.getRecipientCustomer() != null ? card.getRecipientCustomer().getId() : null);
        dto.setRedeemedAt(card.getRedeemedAt());
        dto.setSource(card.getSource());
        
        return dto;
    }
}
