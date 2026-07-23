import { useMemo, useState } from 'react';
import { useRetailProductsQuery } from '../../hooks/api/useProducts';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductSkeleton } from '../../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
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
      const res = await axiosClient.get('/customers/my/wishlist');
      return res.data;
    }
  });

  const wishlist = wishlistData?.map((w: any) => w.productId) || [];
  const error = isError ? 'Failed to load products. Please try again later.' : null;

  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axiosClient.post(`/customers/my/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);
  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistMutation.mutate(id);
  };

  if (loading && products.length === 0) {
    return (
      <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative py-12">
        <div className="max-w-container-max-width mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="h-4 w-32 bg-surface-container-high/50 rounded-md animate-pulse mb-4"></div>
            <div className="h-10 w-64 bg-surface-container-high/50 rounded-md animate-pulse mb-4"></div>
            <div className="h-6 w-96 bg-surface-container-high/50 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
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
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      <div className="max-w-container-max-width mx-auto relative z-10">
        
        {/* Header Section */}
        <section className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-label-sm text-secondary mb-4">
              <span>Customer</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-primary font-bold">Products</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Our Collection</h2>
            <p className="text-secondary max-w-lg font-body-md">
              Premium retail products for your at-home rituals. Discover the essence of tranquility crafted for your daily self-care.
            </p>
          </div>

          {/* Search & Filters Container */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
              <input 
                type="text" 
                placeholder="Search our collection..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-full focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-md transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary hover:border-primary transition-all">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary hover:border-primary transition-all">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-stack-lg">
          {['All', 'Skincare', 'Haircare', 'Bodycare', 'Wellness', 'Accessories'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-6 py-2 rounded-full font-label-md transition-all active:scale-95",
                activeCategory === cat 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:border-primary hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState 
            icon="inventory_2" 
            title="No Products Found" 
            description="We couldn't find any products matching your search criteria."
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const inWishlist = wishlist.includes(product.id);
                return (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 hover:shadow-[0_12px_40px_rgba(119,90,25,0.12)] transition-all duration-300 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop" 
                      alt={product.name} 
                      loading="lazy"
                    />
                    <button 
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
                      onClick={(e) => toggleWishlist(product.id, e)}
                    >
                      <span className={clsx("material-symbols-outlined text-[20px]", inWishlist ? "text-primary" : "text-secondary hover:text-primary")} style={inWishlist ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        favorite
                      </span>
                    </button>
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4 flex-1">
                      <h3 className="font-headline-md text-on-surface text-[18px] mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-secondary text-[13px] font-label-sm uppercase tracking-wider">{activeCategory === 'All' ? 'Wellness' : activeCategory}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-headline-md text-primary text-[20px] font-semibold">₹{product.price.toFixed(2)}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(product);
                        }}
                        className="flex items-center gap-2 font-label-md text-primary px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )})}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination Section */}
        {pageData && pageData.totalPages > 1 && (
          <div className="mt-stack-lg p-4 border border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <button 
              className={`px-6 py-2 rounded-full font-label-md transition-all border ${
                page === 0 
                  ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                  : 'border-primary text-primary hover:bg-primary/5'
              }`}
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              PREVIOUS
            </button>
            <span className="text-secondary font-label-md tracking-wider uppercase">
              Page {pageData.pageNo + 1} of {pageData.totalPages}
            </span>
            <button 
              className={`px-6 py-2 rounded-full font-label-md transition-all border ${
                pageData.last 
                  ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                  : 'border-primary text-primary hover:bg-primary/5'
              }`}
              disabled={pageData.last} 
              onClick={() => setPage(p => p + 1)}
            >
              NEXT
            </button>
          </div>
        )}

        {/* Footer Banner Section */}
        <section className="mt-stack-lg bg-primary-container/5 rounded-2xl p-stack-lg flex flex-col md:flex-row items-center gap-8 overflow-hidden relative border border-primary/5">
          <div className="flex-1 z-10">
            <p className="text-primary font-bold tracking-widest text-[12px] uppercase mb-3">Membership Benefit</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4">Elite Members get 20% OFF all retail.</h3>
            <p className="text-secondary font-body-md mb-6">Upgrade your lifestyle today and enjoy exclusive discounts on our entire boutique collection, priority booking, and complimentary upgrades.</p>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md hover:shadow-lg shadow-primary/20 transition-all active:scale-95">View Membership Plans</button>
          </div>
          <div className="w-full md:w-1/3 aspect-video md:aspect-square relative rounded-xl overflow-hidden shadow-xl z-10">
            <img
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA76y9RUMRQr5UcoH7qlEaXgY4VyIvSsmOpGNPz5ajpN1WlgfM1-ts37v6rNjYRGhEy6Q_MQ89YF_FVYDBvE5OduLbxlMzUgOn8-N9TGVi2HOocukiHJnScZ1SdmwMA3qD3r7W-zL7D1NU7GGDR1LK72KegwE-MMmuao7yKmbSsuuMtpBWrLGPZLDO0ykWXtmyuABoUajfamRAK6DSsVX2pFiILKVgWT106A2BfWznGXbZSSG3syf6EGzvuUx-W-gQcgUydLmdy99KZ" 
              alt="Retail Boutique" 
            />
          </div>
          
          {/* Abstract Design Elements */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -left-10 top-0 w-48 h-48 rounded-full bg-primary/10 blur-3xl"></div>
        </section>

      </div>
    </main>
  );
};
