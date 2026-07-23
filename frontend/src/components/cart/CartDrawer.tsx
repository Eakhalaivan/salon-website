import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    onClose();
    // For now, since there isn't a dedicated checkout page in context, navigate to payments or just show alert
    navigate('/customer/payments');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-2xl z-[101] flex flex-col border-l border-outline-variant/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="font-display-sm text-xl text-on-surface">Your Cart</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-outline">
                    <ShoppingBag size={48} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface">Your cart is empty</h3>
                    <p className="text-secondary mt-2">Looks like you haven't added any products yet.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
                      <div className="w-20 h-20 bg-surface-container rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {/* Fallback image */}
                        <span className="material-symbols-outlined text-outline text-3xl">inventory_2</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-on-surface line-clamp-1">{item.name}</h4>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-error/80 hover:bg-error/10 hover:text-error rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <p className="font-bold text-primary">₹{item.price.toLocaleString('en-IN')}</p>
                          
                          <div className="flex items-center gap-3 bg-background rounded-full border border-outline-variant/50 px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-surface-container-high rounded-full transition-colors text-on-surface"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-surface-container-high rounded-full transition-colors text-on-surface"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-secondary text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-secondary text-sm">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-on-surface font-bold text-lg pt-3 border-t border-outline-variant/30">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  Checkout <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full mt-3 py-3 text-secondary hover:text-error transition-colors text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
