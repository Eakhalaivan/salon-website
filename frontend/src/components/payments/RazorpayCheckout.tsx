import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
    invoiceId: number;
    amount: number;
    onSuccess: (paymentResult: any) => void;
    onError: (error: any) => void;
}

export const RazorpayCheckout = ({ invoiceId, amount, onSuccess, onError }: RazorpayCheckoutProps) => {
    const [isLoading, setIsLoading] = useState(false);
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
        if (!orderId) {
            // Fallback for demo environments if order creation failed
            console.warn('Proceeding with mock payment as orderId is not present');
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                onSuccess({ razorpay_payment_id: 'mock_pay_123' });
            }, 1500);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SpEf15KaCAj2po',
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            name: 'Lumina Spa',
            description: `Payment for Invoice #${invoiceId}`,
            order_id: orderId,
            handler: function (response: any) {
                setIsLoading(true);
                // Payment was successful (we should also verify via webhook/backend, but this is client side)
                setTimeout(() => {
                    setIsLoading(false);
                    onSuccess(response);
                }, 1000);
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
        <div className="space-y-6 w-full">
            <div className="bg-primary-container-low text-on-surface p-4 rounded-xl text-sm border border-primary/20">
                <p className="font-semibold mb-1">Razorpay Secure Checkout</p>
                <p className="text-secondary">
                    Pay using UPI (GPay, PhonePe, Paytm), NetBanking, Credit or Debit cards.
                </p>
            </div>
            <button
                type="button"
                onClick={handlePayment}
                disabled={isLoading || (!orderId && import.meta.env.PROD)}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-base font-bold text-on-primary-container bg-primary-container hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with Razorpay`
                )}
            </button>
        </div>
    );
};
