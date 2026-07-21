import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';

interface RazorpayCheckoutProps {
    invoiceId: number;
    amount: number;
    onSuccess: (paymentResult: any) => void;
    onError: (error: any) => void;
}

export const RazorpayCheckout = ({ invoiceId, amount, onSuccess, onError }: RazorpayCheckoutProps) => {
    const [isLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const createOrder = async () => {
            try {
                const response = await axiosClient.post(`/payments/razorpay/create-order/${invoiceId}`);
                setOrderId(response.data.orderId);
            } catch (error) {
                console.error('Failed to create Razorpay order:', error);
                onError(error);
            }
        };

        createOrder();
    }, [invoiceId]);

    const handlePayment = () => {
        if (!orderId) return;

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key_id',
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            name: 'Lumina Spa',
            description: `Payment for Invoice #${invoiceId}`,
            order_id: orderId,
            handler: function (response: any) {
                // Payment was successful (we should also verify via webhook/backend, but this is client side)
                onSuccess(response);
            },
            prefill: {
                name: user ? `${user.firstName} ${user.lastName}` : '',
                email: user?.email || '',
                contact: ''

            },
            theme: {
                color: '#3399cc'
            }
        };

        const rzp = new (window as any).Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response.error);
            onError(response.error);
        });

        rzp.open();
    };

    return (
        <div className="razorpay-checkout-container w-full">
            <button
                type="button"
                onClick={handlePayment}
                disabled={isLoading || !orderId}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
            </button>
        </div>
    );
};
