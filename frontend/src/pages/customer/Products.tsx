import { useState } from 'react';
import { useRetailProductsQuery } from '../../hooks/api/useProducts';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { Input } from '../../components/ui/Input';
import { ShimmerText } from '../../components/luxury/ShimmerText';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';


export const Products = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading: loading, isError } = useRetailProductsQuery(page, 10);
  const products = pageData?.content || [];
  
  const addItem = useCartStore((state) => state.addItem);
  // Optional wishlist state (local for now)
  const queryClient = useQueryClient();
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/customers/me/wishlist');
      return res.data;
    }
  });

  const wishlist = wishlistData?.map((w: any) => w.productId) || [];
  const error = isError ? 'Failed to load products. Please try again later.' : null;

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axiosClient.post(`/api/v1/customers/me/wishlist/${productId}`);
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
        <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-error)]/10 text-[var(--color-error)] p-6 rounded-2xl border border-[var(--color-error)]/20 font-body-md text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="Our Products" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg mb-10 tracking-wide">
          Premium retail products for your at-home rituals.
        </p>
        
        <div className="w-full max-w-md">
          <Input 
            icon={<span className="material-symbols-outlined text-[20px]">search</span>}
            type="text" 
            placeholder="Search our collection..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <AnimatedSection stagger className="relative z-10">
        {filteredProducts.length === 0 ? (
          <EmptyState 
            icon="inventory_2" 
            title="No Products Found" 
            description="We couldn't find any products matching your search criteria."
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const inWishlist = wishlist.includes(product.id);
                
                return (
                <AnimatedItem key={product.id}>
                  <LuxuryCard className="h-full flex flex-col p-0 overflow-hidden glass-card bg-[var(--color-surface)] group">
                    
                    {/* Full Bleed Image Area */}
                    <div className="h-56 relative bg-[var(--color-surface)] overflow-hidden">
                      {/* Placeholder background representing an image */}
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                      
                      {/* Top Action Bar (Wishlist Heart) */}
                      <button 
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-20 backdrop-blur-sm border ${
                          inWishlist 
                            ? 'bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)]' 
                            : 'bg-[var(--color-surface)]/80 border-[var(--color-border)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/50'
                        }`}
                        onClick={(e) => toggleWishlist(product.id, e)}
                      >
                        <span className={`material-symbols-outlined text-[20px] ${inWishlist ? 'icon-fill' : ''}`}>favorite</span>
                      </button>

                      {/* Title & Price positioned at bottom of image area */}
                      <div className="absolute bottom-4 left-6 right-6 flex flex-col z-20">
                        <div className="font-sans text-[10px] text-[var(--color-primary)] uppercase tracking-widest mb-1 font-semibold">{product.sku}</div>
                        <h3 className="font-serif text-xl text-[var(--color-on-surface)] leading-tight line-clamp-1">{product.name}</h3>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="font-sans text-sm text-[var(--color-on-surface-variant)] flex-grow mb-6 leading-relaxed line-clamp-3">
                        {product.description || 'Experience the pinnacle of luxury with our signature collection, designed to elevate your daily routine.'}
                      </p>
                      
                      <div className="flex items-end justify-between pt-4 mt-auto border-t border-[var(--color-border)]">
                        <span className="font-serif text-2xl text-[var(--color-primary)]">₹{product.price.toFixed(0)}</span>
                        
                        <button 
                          className="gradient-btn px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                          Add
                        </button>
                      </div>
                    </div>
                  </LuxuryCard>
                </AnimatedItem>
              )})}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-12 p-4 border border-[var(--color-primary)]/20 bg-[var(--color-surface)]/30 backdrop-blur-md flex justify-between items-center rounded-2xl">
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                page === 0 
                  ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                  : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
              }`}
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="text-[var(--color-on-surface-variant)] font-sans text-sm font-semibold tracking-wider uppercase">
              Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
            </span>
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                pageData?.last 
                  ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                  : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
              }`}
              disabled={pageData ? pageData.last : true} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};
