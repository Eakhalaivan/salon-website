package com.luxesuite.api.service;

import com.luxesuite.api.model.*;
import com.luxesuite.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.razorpay.RazorpayClient;
import com.razorpay.Order;
import com.razorpay.Utils;
import org.json.JSONObject;
import com.luxesuite.api.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.HashMap;

import java.math.BigDecimal;
import com.luxesuite.api.exception.ApiException;
import com.luxesuite.api.exception.ResourceNotFoundException;
import com.luxesuite.api.exception.BadRequestException;
import com.luxesuite.api.exception.PaymentGatewayException;
import com.luxesuite.api.exception.PaymentDeclinedException;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final InventoryRepository inventoryRepository;
    private final SecurityUtils securityUtils;
    private final CustomerSubscriptionRepository customerSubscriptionRepository;
    private final LoyaltyService loyaltyService;
    private final ReferralService referralService;
    private final PayrollService payrollService;
    private final GiftCardService giftCardService;
    private final WalletService walletService;

    @Value("${stripe.key.secret}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    @Value("${razorpay.webhook-secret}")
    private String razorpayWebhookSecret;

    private final RazorpayClient razorpayClient;

    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    @Transactional
    public Invoice generateInvoiceFromAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Appointment must be COMPLETED to generate an invoice.");
        }

        Invoice invoice = new Invoice();
        invoice.setCustomer(appointment.getCustomer());
        invoice.setBranch(appointment.getBranch());
        invoice.setAppointment(appointment);
        
        BigDecimal subtotal = appointment.getTotalPrice();
        invoice.setSubtotal(subtotal);
        
        // Recompute discount server-side based on customer's subscription
        BigDecimal calculatedDiscount = BigDecimal.ZERO;
        java.util.List<CustomerSubscription> subs = customerSubscriptionRepository.findByCustomerIdAndStatus(appointment.getCustomer().getId(), "ACTIVE", org.springframework.data.domain.Pageable.unpaged()).getContent();
        if (subs != null && !subs.isEmpty()) {
            BigDecimal rate = subs.get(0).getPlan().getDiscountRate();
            if (rate != null && rate.compareTo(BigDecimal.ZERO) > 0) {
                calculatedDiscount = subtotal.multiply(rate).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
            }
        }
        invoice.setDiscountAmount(calculatedDiscount);
        
        // Simple 10% tax for demonstration (configurable in reality)
        BigDecimal taxRate = new BigDecimal("0.10");
        BigDecimal taxableAmount = subtotal.subtract(invoice.getDiscountAmount());
        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) {
            taxableAmount = BigDecimal.ZERO;
        }
        
        BigDecimal taxAmount = taxableAmount.multiply(taxRate);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(taxableAmount.add(taxAmount));

        // Create Invoice Items from Appointment Items
        for (AppointmentItem apptItem : appointment.getServices()) {
            InvoiceItem invItem = new InvoiceItem();
            invItem.setInvoice(invoice);
            invItem.setItemType("SERVICE");
            invItem.setItemId(apptItem.getService().getId());
            invItem.setItemName(apptItem.getService().getName());
            invItem.setQuantity(1);
            invItem.setUnitPrice(apptItem.getPrice());
            invItem.setTotalPrice(apptItem.getPrice());
            invoice.getItems().add(invItem);
        }

        return invoiceRepository.save(invoice);
    }
    
    @Transactional
    public Payment processPayment(Long invoiceId, BigDecimal amount, String paymentMethod, String transactionRef) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        securityUtils.validateCustomerOwnership(invoice.getCustomer().getId());
                
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionRef(transactionRef);
        // Real Stripe Gateway Integration should be handled via webhook.
        // For fallback or manual processing, we can assume the payment succeeded if it reached here
        // from a trusted source, but typically manual entry uses 'CASH' or 'CARD'.
        if ("STRIPE".equalsIgnoreCase(paymentMethod)) {
            throw new BadRequestException("Stripe payments must be processed via the webhook endpoint.");
        }
        
        // Calculate remaining balance
        BigDecimal totalPaid = invoice.getPayments().stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal remainingAmount = invoice.getTotalAmount().subtract(totalPaid);
        if (amount.compareTo(remainingAmount) > 0) {
            throw new BadRequestException("Payment amount exceeds the remaining invoice balance.");
        }
        
        payment.setStatus("SUCCESS");
        
        invoice.getPayments().add(payment);
        
        // Calculate if fully paid
        BigDecimal newTotalPaid = invoice.getPayments().stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (newTotalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
            loyaltyService.awardPoints(invoice.getCustomer(), invoice);
            referralService.checkAndIssueReward(invoice.getCustomer().getId());
            payrollService.calculateCommissions(invoice);
        } else {
            invoice.setStatus("PARTIAL");
        }
        
        invoiceRepository.save(invoice);
        return payment;
    }

    public String createStripePaymentIntent(Long invoiceId) {
        try {
            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
                    
            securityUtils.validateCustomerOwnership(invoice.getCustomer().getId());

            BigDecimal totalPaid = invoice.getPayments().stream()
                    .filter(p -> "SUCCESS".equals(p.getStatus()))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
            BigDecimal remainingAmount = invoice.getTotalAmount().subtract(totalPaid);
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Invoice is already fully paid.");
            }

            PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                    .setAmount(remainingAmount.multiply(new BigDecimal(100)).longValue()) // Stripe uses cents
                    .setCurrency("inr")
                    .putMetadata("invoiceId", invoice.getId().toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            
            return intent.getClientSecret();
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new PaymentGatewayException("Failed to create Stripe PaymentIntent: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
                if (dataObjectDeserializer.getObject().isPresent()) {
                    PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
                    
                    String invoiceIdStr = paymentIntent.getMetadata().get("invoiceId");
                    String walletTopupCustomerIdStr = paymentIntent.getMetadata().get("walletTopupCustomerId");
                    String giftCardAmountStr = paymentIntent.getMetadata().get("giftCardAmount");

                    if (invoiceIdStr != null) {
                        Long invoiceId = Long.parseLong(invoiceIdStr);
                        BigDecimal amount = new BigDecimal(paymentIntent.getAmountReceived()).divide(new BigDecimal(100));
                        
                        // Process the payment natively ignoring securityUtils since this is server-to-server
                        Invoice invoice = invoiceRepository.findById(invoiceId)
                            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

                        Payment payment = new Payment();
                        payment.setInvoice(invoice);
                        payment.setAmount(amount);
                        payment.setPaymentMethod("STRIPE");
                        payment.setTransactionRef(paymentIntent.getId());
                        payment.setStatus("SUCCESS");
                        
                        invoice.getPayments().add(payment);
                        
                        BigDecimal totalPaid = invoice.getPayments().stream()
                                .filter(p -> "SUCCESS".equals(p.getStatus()))
                                .map(Payment::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                
                        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                            invoice.setStatus("PAID");
                            loyaltyService.awardPoints(invoice.getCustomer(), invoice);
                            referralService.checkAndIssueReward(invoice.getCustomer().getId());
                            payrollService.calculateCommissions(invoice);
                        } else {
                            invoice.setStatus("PARTIAL");
                        }
                        
                        invoiceRepository.save(invoice);
                    } else if (walletTopupCustomerIdStr != null) {
                        Long customerId = Long.parseLong(walletTopupCustomerIdStr);
                        BigDecimal amount = new BigDecimal(paymentIntent.getAmountReceived()).divide(new BigDecimal(100));
                        walletService.processTopup(customerId, amount, paymentIntent.getId());
                    } else if (giftCardAmountStr != null) {
                        BigDecimal amount = new BigDecimal(giftCardAmountStr);
                        String recipientEmail = paymentIntent.getMetadata().get("recipientEmail");
                        String recipientName = paymentIntent.getMetadata().get("recipientName");
                        giftCardService.createGiftCard(amount, recipientEmail, recipientName);
                    }
                }
            }
        } catch (Exception e) {
            throw new PaymentGatewayException("Webhook processing failed: " + e.getMessage(), e);
        }
    }

    public String createRazorpayOrder(Long invoiceId) {
        try {
            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
                    
            securityUtils.validateCustomerOwnership(invoice.getCustomer().getId());

            BigDecimal totalPaid = invoice.getPayments().stream()
                    .filter(p -> "SUCCESS".equals(p.getStatus()))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
            BigDecimal remainingAmount = invoice.getTotalAmount().subtract(totalPaid);
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Invoice is already fully paid.");
            }

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", remainingAmount.multiply(new BigDecimal(100)).longValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "inv_" + invoice.getId());
            
            JSONObject notes = new JSONObject();
            notes.put("invoiceId", invoice.getId().toString());
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);
            return order.get("id");
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new PaymentGatewayException("Failed to create Razorpay Order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleRazorpayWebhook(String payload, String signature) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, razorpayWebhookSecret);
            if (!isValid) {
                throw new BadRequestException("Invalid webhook signature");
            }
            
            JSONObject event = new JSONObject(payload);
            String eventType = event.getString("event");
            
            if ("order.paid".equals(eventType) || "payment.captured".equals(eventType)) {
                JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                JSONObject notes = paymentEntity.optJSONObject("notes");
                
                if (notes != null && notes.has("invoiceId")) {
                    Long invoiceId = Long.parseLong(notes.getString("invoiceId"));
                    BigDecimal amount = new BigDecimal(paymentEntity.getInt("amount")).divide(new BigDecimal(100));
                    String paymentId = paymentEntity.getString("id");
                    
                    Invoice invoice = invoiceRepository.findById(invoiceId)
                            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

                    // Check if payment already exists
                    boolean paymentExists = invoice.getPayments().stream()
                            .anyMatch(p -> paymentId.equals(p.getTransactionRef()));
                            
                    if (!paymentExists) {
                        Payment payment = new Payment();
                        payment.setInvoice(invoice);
                        payment.setAmount(amount);
                        payment.setPaymentMethod("RAZORPAY");
                        payment.setTransactionRef(paymentId);
                        payment.setStatus("SUCCESS");
                        
                        invoice.getPayments().add(payment);
                        
                        BigDecimal totalPaid = invoice.getPayments().stream()
                                .filter(p -> "SUCCESS".equals(p.getStatus()))
                                .map(Payment::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                
                        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
                            invoice.setStatus("PAID");
                            loyaltyService.awardPoints(invoice.getCustomer(), invoice);
                            referralService.checkAndIssueReward(invoice.getCustomer().getId());
                            payrollService.calculateCommissions(invoice);
                        } else {
                            invoice.setStatus("PARTIAL");
                        }
                        
                        invoiceRepository.save(invoice);
                    }
                }
            }
        } catch (Exception e) {
            throw new PaymentGatewayException("Razorpay webhook processing failed: " + e.getMessage(), e);
        }
    }
}
