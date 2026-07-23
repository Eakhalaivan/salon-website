package com.luxesuite.api.service;
import com.luxesuite.api.dto.WalletDto;
import com.luxesuite.api.model.Customer;
import com.luxesuite.api.model.Invoice;
import com.luxesuite.api.model.Wallet;
import com.luxesuite.api.model.WalletTransaction;
import com.luxesuite.api.repository.CustomerRepository;
import com.luxesuite.api.repository.InvoiceRepository;
import com.luxesuite.api.repository.WalletRepository;
import com.luxesuite.api.repository.WalletTransactionRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.exception.PaymentGatewayException;
import com.luxesuite.api.security.SecurityUtils;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletService {
    
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public WalletDto getMyWallet() {
        Long userId = securityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
                
        Wallet wallet = walletRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> createEmptyWallet(customer));
        return mapToDto(wallet);
    }

    @Transactional
    public Wallet createEmptyWallet(Customer customer) {
        Wallet wallet = Wallet.builder()
                .customer(customer)
                .balance(BigDecimal.ZERO)
                .build();
                
        return walletRepository.save(wallet);
    }

    public String createTopupPaymentIntent(BigDecimal amount) {
        Long customerId = securityUtils.getCurrentUserId();
        try {
            PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(new BigDecimal(100)).longValue())
                    .setCurrency("inr")
                    .putMetadata("walletTopupCustomerId", customerId.toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();
        } catch (Exception e) {
            throw new PaymentGatewayException("Failed to create Stripe PaymentIntent for Wallet Topup: " + e.getMessage(), e);
        }
    }

    public void mockTopup(BigDecimal amount) {
        Long customerId = securityUtils.getCurrentUserId();
        processTopup(customerId, amount, "MOCK-" + System.currentTimeMillis());
    }

    @Transactional
    public void processTopup(Long customerId, BigDecimal amount, String transactionRef) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseGet(() -> createEmptyWallet(customer));
                
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet saved = walletRepository.save(wallet);
        
        WalletTransaction tx = WalletTransaction.builder()
                .customer(saved.getCustomer())
                .amount(amount)
                .type("TOPUP")
                .build();
        walletTransactionRepository.save(tx);
    }



    @Transactional
    public BigDecimal debit(Long customerId, BigDecimal amount, Long invoiceId) {
        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new BadRequestException("Wallet not found"));
                
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient wallet balance");
        }
        
        Invoice invoice = null;
        if (invoiceId != null) {
            invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        }
        
        wallet.setBalance(wallet.getBalance().subtract(amount));
        Wallet saved = walletRepository.save(wallet);
        
        WalletTransaction tx = WalletTransaction.builder()
                .customer(saved.getCustomer())
                .amount(amount)
                .type("DEBIT")
                .relatedInvoice(invoice)
                .build();
        walletTransactionRepository.save(tx);
        
        return saved.getBalance();
    }
    
    @Transactional
    public void credit(Long customerId, BigDecimal amount, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Wallet wallet = walletRepository.findByCustomerId(customerId)
                .orElseGet(() -> createEmptyWallet(customer));
                
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet saved = walletRepository.save(wallet);
        
        WalletTransaction tx = WalletTransaction.builder()
                .customer(saved.getCustomer())
                .amount(amount)
                .type("REFUND") // Could use custom reason but keeping it simple
                .build();
        walletTransactionRepository.save(tx);
    }

    private WalletDto mapToDto(Wallet wallet) {
        WalletDto dto = new WalletDto();
        dto.setId(wallet.getId());
        dto.setCustomerId(wallet.getCustomer().getId());
        dto.setBalance(wallet.getBalance());
        return dto;
    }
}
