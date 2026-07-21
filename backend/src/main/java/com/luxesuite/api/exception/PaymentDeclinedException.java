package com.luxesuite.api.exception;

import org.springframework.http.HttpStatus;

public class PaymentDeclinedException extends ApiException {
    public PaymentDeclinedException(String message) {
        super(message, HttpStatus.PAYMENT_REQUIRED);
    }
}
