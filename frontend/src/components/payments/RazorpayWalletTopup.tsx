import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface RazorpayWalletTopupProps {
    amount: number;
    onSuccess: (paymentResult: any) => void;
    onError: (error: any) => void;
}

export const RazorpayWalletTopup = ({ amount, onSuccess, onError }: RazorpayWalletTopupProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const createOrder = async () => {
            try {
                const response = await axiosClient.post(`/wallet/razorpay/create-order`, { amount });
                setOrderId(response.data.orderId);
            } catch (error) {
                console.error('Failed to create Razorpay order for topup:', error);
                // Don't call onError here, we will fallback to mock payment if orderId is null
                // Just log it and leave orderId as null
            }
        };

        if (amount > 0) {
            createOrder();
        }
    }, [amount]);

    const handlePayment = () => {
        if (!orderId) {
            // Fallback for demo environments if order creation failed
            console.warn('Proceeding with mock payment as orderId is not present');
            setIsLoading(true);
            setTimeout(async () => {
                try {
                    // Use the dedicated mock endpoint
                    await axiosClient.post('/wallet/topup/mock', {
                        amount: amount
                    });
                    onSuccess({ razorpay_payment_id: 'mock_pay_123' });
                } catch (err) {
                    console.error('Failed to verify mock payment:', err);
                    onError(err);
                } finally {
                    setIsLoading(false);
                }
            }, 1500);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SpEf15KaCAj2po',
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            name: 'Lumina Spa',
            description: `Wallet Top-up of ₹${amount}`,
            order_id: orderId,
            handler: async function (response: any) {
                try {
                    setIsLoading(true);
                    // Verify the payment on the backend to actually credit the wallet
                    await axiosClient.post('/wallet/razorpay/verify', {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: amount
                    });
                    onSuccess(response);
                } catch (error) {
                    console.error('Failed to verify Razorpay payment:', error);
                    onError(error);
                } finally {
                    setIsLoading(false);
                }
            },
            prefill: {
                name: user ? `${user.firstName} ${user.lastName}` : '',
                email: user?.email || '',
                contact: ''
            },
            theme: {
                color: '#b1724a' // Matching Lumina Spa theme
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
        <div className="space-y-6">
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
