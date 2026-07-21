import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicesQuery } from '../../hooks/api/useAppointments';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { ShimmerText } from '../../components/luxury/ShimmerText';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const Services = () => {
  const { data: pageData, isLoading: loading, isError } = useServicesQuery();
  const services = pageData?.content || [];
  const error = isError ? 'Failed to load services. Please try again later.' : null;
  const navigate = useNavigate();
  
  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return cats.length > 0 ? cats : ['All Rituals'];
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'All Rituals');

  // Update active category when categories load
  useMemo(() => {
    if (categories.length > 0 && !categories.includes(activeCategory) && activeCategory === 'All Rituals') {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const handleBook = (serviceId: number) => {
    navigate(`/book?serviceId=${serviceId}`);
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

  const filteredServices = services.filter(
    (service) => activeCategory === 'All Rituals' || service.category === activeCategory
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="Our Rituals" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg mb-12 tracking-wide">
          Discover our tailored experiences designed for your absolute serenity.
        </p>
        
        {/* Category Selector Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-300 border",
                  activeCategory === cat 
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                    : "bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-on-surface)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <AnimatedSection stagger className="relative z-10">
        {filteredServices.length === 0 ? (
          <EmptyState 
            icon="spa" 
            title="No services found" 
            description={`We couldn't find any services in this category.`}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <LuxuryCard className="h-full flex flex-col p-0 overflow-hidden glass-card bg-[var(--color-surface)] group cursor-pointer" onClick={() => handleBook(service.id)}>
                    
                    {/* Full Bleed Image Area */}
                    <div className="h-56 relative bg-[var(--color-surface)] overflow-hidden">
                      {/* Placeholder background representing an image */}
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                      
                      {/* Top Action Bar (Wishlist Heart) */}
                      <button 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/50 transition-colors z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Wishlist logic
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                      </button>

                      {/* Title & Price positioned at bottom of image area */}
                      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end z-20">
                        <h3 className="font-serif text-2xl text-[var(--color-on-surface)] leading-tight">{service.name}</h3>
                        <span className="font-serif text-2xl text-[var(--color-primary)]">₹{service.price.toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="font-sans text-sm text-[var(--color-on-surface-variant)] flex-grow mb-6 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 mt-auto">
                        <div className="flex items-center text-[var(--color-on-surface-variant)] text-xs uppercase tracking-widest font-semibold bg-[var(--color-surface-elevated)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                          <span className="material-symbols-outlined text-[14px] mr-1.5 text-[var(--color-primary)]">schedule</span>
                          {service.durationMins} mins
                        </div>
                        
                        <button 
                          className="gradient-btn px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBook(service.id);
                          }}
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </LuxuryCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatedSection>
    </div>
  );
};
