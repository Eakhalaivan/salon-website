import { useMemo, useState } from 'react';
import { useRetailProductsQuery } from '../../hooks/api/useProducts';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductSkeleton } from '../../components/ui/Skeleton';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import clsx from 'clsx';
import { ShimmerSweep } from '../../components/ui/ShimmerSweep';
import { RippleLayer, useRipple } from '../../components/ui/RippleLayer';

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

  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesWishlist = showWishlistOnly ? wishlist.includes(p.id) : true;
      return matchesSearch && matchesWishlist;
    });
  }, [products, search, showWishlistOnly, wishlist]);

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistMutation.mutate(id);
  };

  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (loading && products.length === 0) {
    return (
      <main className="min-h-screen relative py-12 px-[40px]">
        <div className="max-w-6xl">
          <div className="mb-12">
            <div className="h-4 w-32 bg-surface-container-high/50 rounded-md animate-pulse mb-4"></div>
            <div className="h-10 w-64 bg-surface-container-high/50 rounded-md animate-pulse mb-4"></div>
            <div className="h-6 w-96 bg-surface-container-high/50 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-6 rounded-2xl font-body-md text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-lg antialiased overflow-hidden">
      {/* Secondary Topbar / Actions */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-[40px] h-20 w-full flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <nav className="hidden lg:flex items-center space-x-4">
            <a className="font-label-caps text-on-surface-variant hover:text-primary transition-colors text-[12px]" href="#">Customer</a>
            <span className="text-outline-variant">/</span>
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-caps text-[12px]" href="#">Products</a>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <input 
              type="text"
              className="w-64 bg-surface-container-low border-none rounded-full py-2.5 px-6 font-body-sm focus:ring-1 focus:ring-primary/30 transition-all duration-300 outline-none text-[14px]" 
              placeholder="Search our collection..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          </div>
          <button 
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={clsx(
              "relative p-2 transition-colors",
              showWishlistOnly ? "text-primary bg-primary/10 rounded-full" : "text-on-surface-variant hover:text-primary"
            )}
          >
            <span className="material-symbols-outlined" style={showWishlistOnly ? { fontVariationSettings: "'FILL' 1" } : {}}>
              favorite
            </span>
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Page Header & Filters */}
      <section className="px-[40px] py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-headline-lg text-display-lg text-primary mb-4">Our Collection</h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10 text-[16px]">
            Premium retail products for your at-home rituals. Discover the essence of tranquility crafted for your daily self-care journey.
          </p>

          {/* Filter Chips */}
          <LayoutGroup>
            <div className="flex flex-wrap gap-3 mb-12">
              {['All', 'Skincare', 'Haircare', 'Bodycare', 'Wellness', 'Accessories'].map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <CategoryButton 
                    key={cat} 
                    cat={cat} 
                    isActive={isActive} 
                    onClick={() => setActiveCategory(cat)} 
                  />
                );
              })}
            </div>
          </LayoutGroup>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <EmptyState 
              icon="inventory_2" 
              title="No Products Found" 
              description="We couldn't find any products matching your search criteria."
            />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => {
                  const inWishlist = wishlist.includes(product.id);
                  // Provide fallback images matching the mock style if backend doesn't provide one
                  const defaultImages = [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3bEU1wqrGn7Def-S0nzfffYsdH_d9hjcpE3PNqfmp9lcFQKQ0jDAZCMcqJUN70RZXNy1sLS4Mrw8vmMKlAsITxgAHYAZN2nkuwFdZqtwcRCC9yh__kJlGtbW3t7mvwFfLd2awy80rtc53ezmNY2invjiAfoPptGeaboj6LxXGjCtmeke-JWPzDD0NWi5lwC_B-3X4So_MSYelwyiTAUgj_8pe3gHTp3W3hjR4h4btbUYUJa9qNmbk3XyLjncCVgi7hHC7crJbBgE",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuABh1QNSMZ9KaeXkKN6OMkigNQ455BAYOQu1XC7AffOLbZPdCsDh0k5bDjCYUdjN0CBjjBFWbmNkZmREFsebwVh-5DaAtfBhYx1XWUDApp3Iu3-_cSDu2t88DXkr0kApI_F_CMFcjCWEuEjU3u_6DsztXMvdoDPJ2afzJzN9Mv_MmzxUkJfxsPKaeOXAlHxwwZF47S0kRXFJgI2Ob5cuLFezeQUUc4E2WNhkqx0BV0gRF9RkZzPvlVKMI4LqeZlKSyD2rIv8VqakZY",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuD8xlHs5bW9ZCVViTteDimvHgdNVnfC-SFIzJU1oU2YlD_jK7m6NajckwnGkudaWB5kMYOlYrpuUuXi6hjOrCGbVVevTqBtNWTSOnIFqRmzCMJi_yoUdKP0BIR-i6NAU558l6RaP3udzd0eB1k06IID3n17HLPF7YIm1F4oKXdeRaJXCbo4jz9LCEY66-suDZcFktLV13Ta05D1sQKs-6t_r2i8rIuvIL1gQKLssDaap7MMi3kV-XVA84kQVJsRjSoHKSuOaRXEOgQ",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDfRNjAjkvqYBWYCzut5FsWdNgJJ2GWi63G2Pq05RZqfMWqI2diHVWZR3SjFfV6NtfHacNEj5HiAmod9RDqGSZ4vx-a2Ns4MNO-qnm-KbFCyE1-jUkBFaVssQGMu1qcjZUjwBUg0lhTHHIuUierGZYDcy7m0HWulZElMFLLryJP-DF1wwhYB5SLLdztYUC6F_qONFNrPHPFcOq6ABQFUuqiyIuAMJAdRLwC7ECJGDX4ktC9VTtGFEGKNZCzexPrex_dvY8cw6qqUAs"
                  ];
                  const imgUrl = (product as any).imageUrl || defaultImages[i % defaultImages.length];

                  return (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                    whileHover={{ y: -11, scale: 1.02 }}
                    className="group relative flex flex-col bg-surface-container-lowest/80 backdrop-blur-md border border-transparent hover:border-[#CCA44A]/40 transition-colors duration-400 hover:shadow-[0_24px_60px_rgba(204,164,74,0.18)] rounded-[24px] overflow-hidden"
                  >
                    <ShimmerSweep angle={-12} />
                    
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-high rounded-t-[24px]">
                      <motion.div 
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-full"
                      >
                        <motion.img 
                          whileHover={{ scale: 1.07 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="w-full h-full object-cover group-hover:brightness-105" 
                          src={imgUrl}
                          alt={product.name}
                        />
                      </motion.div>
                      <motion.button 
                        whileHover={{ scale: 1.15, rotate: -8 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-20"
                        onClick={(e) => toggleWishlist(product.id, e as any)}
                      >
                        <motion.span 
                          animate={{ scale: inWishlist ? [1, 1.3, 1] : 1 }}
                          transition={{ duration: 0.4 }}
                          className={clsx("material-symbols-outlined text-[20px]", inWishlist && "text-primary")}
                          style={inWishlist ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </motion.span>
                      </motion.button>
                    </div>
                    <div className="p-6 flex flex-col flex-grow z-20 relative">
                      <span className="font-label-caps text-[10px] tracking-[0.2em] text-outline mb-2 uppercase">{activeCategory === 'All' ? 'Wellness' : activeCategory}</span>
                      <h3 className="font-headline-lg text-[22px] text-primary mb-4 leading-tight">{product.name}</h3>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-headline-lg text-primary text-[20px]">₹{product.price.toFixed(2)}</span>
                        <AddToCartButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product);
                            setAddingToCartId(product.id);
                            setTimeout(() => setAddingToCartId(null), 600);
                          }}
                          isAdding={addingToCartId === product.id}
                        />
                      </div>
                    </div>
                  </motion.div>
                )})}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination Section */}
          {pageData && pageData.totalPages > 1 && (
            <div className="mt-16 p-4 border border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center rounded-2xl shadow-sm">
              <button 
                className={`px-6 py-2 rounded-full font-label-caps text-[12px] tracking-widest uppercase transition-all border ${
                  page === 0 
                    ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                    : 'border-primary text-primary hover:bg-primary/5'
                }`}
                disabled={page === 0} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="text-secondary font-label-caps text-[12px] tracking-widest uppercase">
                Page {pageData.pageNo + 1} of {pageData.totalPages}
              </span>
              <button 
                className={`px-6 py-2 rounded-full font-label-caps text-[12px] tracking-widest uppercase transition-all border ${
                  pageData.last 
                    ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                    : 'border-primary text-primary hover:bg-primary/5'
                }`}
                disabled={pageData.last} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const CategoryButton = ({ cat, isActive, onClick }: { cat: string, isActive: boolean, onClick: () => void }) => {
  const { ripples, addRipple } = useRipple();

  return (
    <motion.button 
      onClick={(e) => {
        addRipple(e as any);
        onClick();
      }}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        "relative px-8 py-2.5 rounded-full font-label-caps text-[12px] uppercase tracking-widest transition-all duration-300 overflow-hidden border",
        isActive 
          ? "text-[#2A2000] border-white/60 shadow-[0_4px_20px_rgba(204,164,74,0.35)]" 
          : "border-transparent bg-surface-container text-on-surface-variant hover:border-[#CCA44A]/30 shadow-sm"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="categoryActiveIndicator"
          className="absolute inset-0 bg-gradient-to-r from-[#CCA44A] via-[#FDE29F] to-[#C3943A] z-0"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <RippleLayer ripples={ripples} />
      <ShimmerSweep />
      <span className="relative z-10">{cat}</span>
    </motion.button>
  );
};

const AddToCartButton = ({ onClick, isAdding }: { onClick: (e: React.MouseEvent) => void, isAdding: boolean }) => {
  const { ripples, addRipple } = useRipple();
  
  return (
    <motion.button 
      onClick={(e) => {
        addRipple(e as any);
        onClick(e);
      }}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className="group/btn relative overflow-hidden flex items-center space-x-2 px-4 py-2 border border-primary/20 rounded-lg text-primary font-label-caps text-[11px] uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#CCA44A] hover:via-[#FDE29F] hover:to-[#C3943A] hover:text-[#2A2000] hover:shadow-[0_8px_20px_rgba(204,164,74,0.35)] transition-all duration-300"
    >
      <RippleLayer ripples={ripples} />
      <motion.div 
        variants={{ hover: { y: -2 } }}
        className="flex items-center space-x-2 relative z-10"
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              className="material-symbols-outlined text-[18px]"
            >
              check
            </motion.span>
          ) : (
            <motion.span
              key="cart"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              className="material-symbols-outlined text-[18px]"
            >
              add_shopping_cart
            </motion.span>
          )}
        </AnimatePresence>
        <span>{isAdding ? 'Added' : 'Add'}</span>
      </motion.div>
    </motion.button>
  );
};
