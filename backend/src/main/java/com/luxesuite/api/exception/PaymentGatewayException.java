package com.luxesuite.api.exception;

import org.springframework.http.HttpStatus;

public class PaymentGatewayException extends ApiException {
    public PaymentGatewayException(String message) {
        super(message, HttpStatus.BAD_GATEWAY);
    }
    
    public PaymentGatewayException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_GATEWAY);
    }
}
