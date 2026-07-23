import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Loader2 } from 'lucide-react';

interface StripeWalletTopupProps {
    amount: number;
    onSuccess: (paymentResult: any) => void;
    onError: (error: any) => void;
}

export const StripeWalletTopup = (props: StripeWalletTopupProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleMockPayment = async () => {
        setIsLoading(true);
        try {
            // Using a mock endpoint to bypass Stripe and add balance directly
            await axiosClient.post(`/wallet/topup/mock`, { amount: props.amount });
            props.onSuccess({ status: 'succeeded', id: 'mock_payment' });
        } catch (error) {
            console.error('Failed mock payment:', error);
            props.onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-primary-container-low text-on-surface p-4 rounded-xl text-sm border border-primary/20">
                <p className="font-semibold mb-1">Demo Mode Active</p>
                <p className="text-secondary">
                    Stripe Elements are bypassed for this demo. Click the button below to instantly simulate a successful top-up.
                </p>
            </div>
            <button
                onClick={handleMockPayment}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-base font-bold text-on-primary-container bg-primary-container hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Simulate Payment of ₹${props.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                )}
            </button>
        </div>
    );
};
