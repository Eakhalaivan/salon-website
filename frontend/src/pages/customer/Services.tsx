import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicesQuery } from '../../hooks/api/useAppointments';
import { EmptyState } from '../../components/ui/EmptyState';
import { ServiceSkeleton } from '../../components/ui/Skeleton';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { motion, AnimatePresence, useScroll, useTransform, LayoutGroup } from 'framer-motion';
import { ShimmerSweep } from '../../components/ui/ShimmerSweep';
import { RippleLayer, useRipple } from '../../components/ui/RippleLayer';

export const Services = () => {
  const { data: pageData, isLoading: loading, isError } = useServicesQuery();
  const services = pageData?.content || [];
  const error = isError ? 'Failed to load services. Please try again later.' : null;
  const navigate = useNavigate();
  
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 300], [0, -20]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return cats.length > 0 ? cats : ['Women\'s Services', 'Men\'s Services'];
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'Women\'s Services');
  const [businessType, setBusinessType] = useState<'SPA' | 'SALON' | 'BOTH'>('BOTH');

  const filteredServices = useMemo(() => {
    return services.filter(
      (service) => 
        (service.category === activeCategory || activeCategory === "All Rituals") &&
        (businessType === 'BOTH' || service.businessType === businessType || service.businessType === 'BOTH')
    );
  }, [services, activeCategory, businessType]);

  const handleBook = (serviceId: number) => {
    navigate(`/book?serviceId=${serviceId}`);
  };

  if (loading && services.length === 0) {
    return (
      <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative py-12">
        <div className="mb-10">
          <div className="h-10 w-48 bg-surface-container-high/50 rounded-md animate-pulse mb-4"></div>
          <div className="h-4 w-96 bg-surface-container-high/50 rounded-md animate-pulse mb-10"></div>
        </div>
        <div className="flex flex-wrap gap-4 mb-10">
          {[1, 2, 3].map(i => <div key={i} className="h-12 w-32 bg-surface-container-high/50 rounded-full animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {[1, 2, 3, 4, 5, 6].map(i => <ServiceSkeleton key={i} />)}
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
      {/* Abstract background elements */}
      <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[400px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
      </div>
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-[#F5D06F]/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[10%] -right-[5%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <motion.div style={{ y: yParallax }} className="mb-12">
          <AnimatedSection variant="slide-up">
            <motion.h2 
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="font-headline-lg text-display-lg bg-[length:200%_auto] bg-gradient-to-r from-[#CCA44A] via-[#FDE29F] to-[#C3943A] bg-clip-text text-transparent pb-2"
            >
              Our Rituals
            </motion.h2>
          </AnimatedSection>
          <AnimatedSection variant="fade" delay={0.15}>
            <p className="font-body-md text-secondary mt-2 max-w-2xl">Discover our tailored experiences designed for your absolute serenity.</p>
          </AnimatedSection>
        </motion.div>

        {/* Category Selector Tabs */}
        <LayoutGroup>
          <div className="flex flex-col gap-6 mb-12">
            {/* Business Type Segmented Control */}
            <div className="flex bg-surface-container-high rounded-full p-1 self-start">
              {['Spa', 'Salon', 'Both'].map((type) => {
                const mappedType = type.toUpperCase() as 'SPA' | 'SALON' | 'BOTH';
                const isActive = businessType === mappedType;
                return (
                  <button
                    key={type}
                    onClick={() => setBusinessType(mappedType)}
                    className={`relative px-6 py-2 rounded-full font-label-md transition-all duration-300 ${
                      isActive ? 'text-[#2A2000]' : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="businessTypeIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-[#CCA44A] via-[#FDE29F] to-[#C3943A] rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{type}</span>
                  </button>
                );
              })}
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <CategoryButton 
                  key={cat}
                  cat={cat}
                  isActive={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
              </div>
            )}
          </div>

          <AnimatedSection stagger className="max-w-7xl">
            {filteredServices.length === 0 ? (
              <EmptyState 
                icon="spa" 
                title="No services found" 
                description={`We couldn't find any services in this category.`}
              />
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((service, index) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      index={index} 
                      onBook={handleBook} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatedSection>
        </LayoutGroup>
      </div>
    </main>
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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className={`relative px-8 py-3 rounded-full font-label-md transition-all duration-300 overflow-hidden border ${
        isActive 
          ? "text-[#2A2000] border-white/60 shadow-[0_4px_20px_rgba(204,164,74,0.35)]" 
          : "border-transparent bg-surface-container-high text-secondary hover:border-[#CCA44A]/30 hover:bg-surface-container-highest"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="serviceCategoryIndicator"
          className="absolute inset-0 bg-gradient-to-r from-[#CCA44A] via-[#FDE29F] to-[#C3943A] z-0"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <RippleLayer ripples={ripples} />
      {isActive && <ShimmerSweep />}
      <span className="relative z-10">{cat}</span>
    </motion.button>
  );
};

const ServiceCard = ({ service, index, onBook }: { service: any, index: number, onBook: (id: number) => void }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { ripples: reserveRipples, addRipple: addReserveRipple } = useRipple();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -11, scale: 1.02 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className="bg-surface-container-lowest/85 backdrop-blur-md rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] group hover:shadow-[0_24px_60px_rgba(204,164,74,0.18)] border border-transparent hover:border-[#CCA44A]/40 transition-colors duration-400 flex flex-col cursor-pointer relative"
      onClick={() => onBook(service.id)}
    >
      <ShimmerSweep angle={-12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Image Area */}
      <div className="h-64 relative overflow-hidden bg-surface-container rounded-t-[24px]">
        <motion.div 
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <img 
            src={service.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop'} 
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.07] group-hover:brightness-105 transition-all duration-700 ease-out"
          />
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.15, rotate: -8 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary hover:shadow-[0_4px_14px_rgba(204,164,74,0.4)] transition-all z-20"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
            // TODO: wire to real wishlist mutation once implemented
          }}
        >
          <motion.span 
            animate={{ scale: isFavorited ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.4 }}
            className={`material-symbols-outlined text-[20px] ${isFavorited ? 'text-primary' : ''}`}
            style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </motion.span>
        </motion.button>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 relative z-10">
        <AnimatedSection variant="fade" delay={0.1}>
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">{service.name}</h3>
            <div className="flex items-center font-bold shrink-0 bg-gradient-to-r from-[#CCA44A] to-[#C3943A] bg-clip-text text-transparent">
              <span className="text-sm mr-0.5">₹</span>
              <span className="text-xl">{service.price.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-secondary font-label-sm mb-4">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="tracking-widest">{service.durationMins} MINS</span>
          </div>

          <p className="font-body-md text-secondary mb-8 flex-1">
            {service.description || "A bespoke treatment designed for your absolute serenity."}
          </p>
        </AnimatedSection>

        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="group/btn relative overflow-hidden w-full py-3.5 rounded-full bg-primary-container text-on-primary-container font-label-md transition-all mt-auto hover:bg-gradient-to-r hover:from-[#CCA44A] hover:via-[#FDE29F] hover:to-[#C3943A] hover:text-[#2A2000] hover:shadow-[0_8px_20px_rgba(204,164,74,0.35)] flex justify-center items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            addReserveRipple(e as any);
            onBook(service.id);
          }}
        >
          <RippleLayer ripples={reserveRipples} />
          <span className="relative z-10 uppercase tracking-widest text-[12px]">Reserve</span>
          <span className="material-symbols-outlined text-[18px] relative z-10 group-hover/btn:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};
