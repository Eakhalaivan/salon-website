import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosClient from '../../api/axiosClient';

// Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface StripeSubscriptionCheckoutProps {
    planId: number;
    planName: string;
    amount: number;
    onSuccess: (paymentResult: any) => void;
    onError: (error: any) => void;
}

const CheckoutForm = ({ planName, amount, onSuccess, onError }: StripeSubscriptionCheckoutProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/customer/membership`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            onError(error);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} for ${planName}`}
            </button>
        </form>
    );
};

export const StripeSubscriptionCheckout = (props: StripeSubscriptionCheckoutProps) => {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const fetchClientSecret = async () => {
            try {
                const response = await axiosClient.post(`/payments/stripe/create-subscription-intent/${props.planId}`);
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error('Failed to create payment intent:', error);
                props.onError(error);
            }
        };

        fetchClientSecret();
    }, [props.planId]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
        },
    };

    return (
        <div className="stripe-checkout-container">
            {clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm {...props} />
                </Elements>
            ) : (
                <div className="text-center py-4 text-surface-dim">Loading payment details...</div>
            )}
        </div>
    );
};
