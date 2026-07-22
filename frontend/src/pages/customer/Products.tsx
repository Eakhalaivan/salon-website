import { useState } from 'react';
import { useRetailProductsQuery } from '../../hooks/api/useProducts';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

export const Products = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: pageData, isLoading: loading, isError } = useRetailProductsQuery(page, 10);
  const products = pageData?.content || [];
  
  const { items: cartItems, addItem } = useCartStore();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const queryClient = useQueryClient();
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await axiosClient.get('/customers/me/wishlist');
      return res.data;
    }
  });

  const wishlist = wishlistData?.map((w: any) => w.productId) || [];
  const error = isError ? 'Failed to load products. Please try again later.' : null;

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axiosClient.post(`/customers/me/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistMutation.mutate(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-gold-500 text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-bg text-danger-text p-6 rounded-2xl border border-danger-bg/50 font-sans text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-5xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          Our Collection
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
          Premium retail products for your at-home rituals.
        </p>
        
        {/* Search and Icons Row */}
        <div className="w-full flex items-center justify-between gap-6 mb-8">
           <div className="flex-1 max-w-md ml-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 w-5 h-5 stroke-[1.5]" />
             <input 
               type="text" 
               placeholder="Search our collection..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-11 pr-4 py-3 rounded-full border border-ink-200/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-sm bg-surface text-ink-900 shadow-[0_2px_8px_rgba(33,29,23,0.04)] placeholder:text-ink-400"
             />
           </div>
           
           <div className="flex items-center gap-4 mr-auto">
             <button className="p-2 text-ink-400 hover:text-ink-900 transition-colors">
               <Heart className="w-6 h-6 stroke-[1.5]" />
             </button>
             <button className="p-2 text-ink-400 hover:text-ink-900 transition-colors relative">
               <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
               {cartItemCount > 0 && (
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-page"></span>
               )}
             </button>
           </div>
        </div>

        {/* Temporary static categories since we don't have them in the endpoint yet */}
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
            {['All', 'Skincare', 'Haircare', 'Bodycare', 'Wellness', 'Accessories'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-full font-sans text-[13px] font-semibold transition-all duration-300 border",
                  activeCategory === cat 
                    ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.3)]" 
                    : "bg-surface text-ink-900 border-ink-200/50 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                )}
              >
                {cat}
              </button>
            ))}
        </div>
      </header>

      <AnimatedSection stagger className="relative z-10 max-w-6xl mx-auto">
        {filteredProducts.length === 0 ? (
          <EmptyState 
            icon="inventory_2" 
            title="No Products Found" 
            description="We couldn't find any products matching your search criteria."
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const inWishlist = wishlist.includes(product.id);
                
                return (
                <AnimatedItem key={product.id}>
                  <Card className="h-full flex flex-col p-4 group border-none shadow-[0_4px_24px_rgba(33,29,23,0.04)] hover:shadow-[0_8px_32px_rgba(33,29,23,0.08)] bg-surface rounded-3xl" hoverable>
                    
                    {/* Image Area */}
                    <div className="h-64 relative overflow-hidden rounded-2xl bg-white mb-6">
                      {/* Using a clear product-like background */}
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                      
                      {/* Top Action Bar (Wishlist Heart) */}
                      <button 
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-20 bg-white shadow-sm border border-ink-200/50 ${
                          inWishlist 
                            ? 'text-[#D4AF37]' 
                            : 'text-ink-400 hover:text-[#D4AF37]'
                        }`}
                        onClick={(e) => toggleWishlist(product.id, e)}
                      >
                        <Heart className={`w-4 h-4 stroke-[1.5] ${inWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex flex-col flex-grow items-center text-center px-2">
                      <h3 className="font-serif text-lg text-ink-900 leading-tight mb-2">{product.name}</h3>
                      <span className="font-sans text-[15px] font-bold text-[#D4AF37] mb-6">₹{product.price.toFixed(2)}</span>
                      
                      <div className="mt-auto w-full pt-4 border-t border-ink-200/50">
                        <button 
                          className="w-full text-center text-[#D4AF37] font-sans text-[13px] font-semibold transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Card>
                </AnimatedItem>
              )})}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-12 p-4 border border-ink-200/50 bg-surface/50 backdrop-blur-md flex justify-between items-center rounded-2xl max-w-6xl mx-auto">
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                page === 0 
                  ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                  : 'border-[#D4AF37] text-[#D4AF37] hover:bg-gold-50'
              }`}
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              PREVIOUS
            </button>
            <span className="text-ink-400 font-sans text-sm font-semibold tracking-wider uppercase">
              Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
            </span>
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                pageData?.last 
                  ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                  : 'border-[#D4AF37] text-[#D4AF37] hover:bg-gold-50'
              }`}
              disabled={pageData ? pageData.last : true} 
              onClick={() => setPage(p => p + 1)}
            >
              NEXT
            </button>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};
