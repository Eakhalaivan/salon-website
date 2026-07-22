import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicesQuery } from '../../hooks/api/useAppointments';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Heart, Clock } from 'lucide-react';

export const Services = () => {
  const { data: pageData, isLoading: loading, isError } = useServicesQuery();
  const services = pageData?.content || [];
  const error = isError ? 'Failed to load services. Please try again later.' : null;
  const navigate = useNavigate();
  
  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return cats.length > 0 ? cats : ['Women\'s Services', 'Men\'s Services'];
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'Women\'s Services');

  const handleBook = (serviceId: number) => {
    navigate(`/book?serviceId=${serviceId}`);
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

  const filteredServices = services.filter(
    (service) => service.category === activeCategory || activeCategory === "All Rituals"
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-start max-w-7xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          Our Rituals
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
          Discover our tailored experiences designed for your absolute serenity.
        </p>
        
        {/* Category Selector Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-300 border",
                  activeCategory === cat 
                    ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.3)]" 
                    : "bg-surface text-ink-900 border-ink-200/50 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <AnimatedSection stagger className="relative z-10 max-w-7xl mx-auto">
        {filteredServices.length === 0 ? (
          <EmptyState 
            icon="spa" 
            title="No services found" 
            description={`We couldn't find any services in this category.`}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <Card className="flex flex-col p-4 pb-6 overflow-hidden group cursor-pointer h-full border border-ink-200/50 shadow-[0_4px_24px_rgba(33,29,23,0.04)] hover:shadow-[0_8px_32px_rgba(33,29,23,0.08)] bg-surface rounded-3xl" onClick={() => handleBook(service.id)}>
                    
                    {/* Image Area with Padding */}
                    <div className="relative mb-5">
                      <div className="h-56 relative overflow-hidden rounded-2xl bg-page">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                        
                        {/* Top Action Bar (Wishlist Heart) */}
                        <button 
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-ink-400 hover:text-[#D4AF37] transition-colors z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Wishlist logic
                          }}
                        >
                          <Heart className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow px-1">
                      <h3 className="font-serif text-lg text-ink-900 leading-tight font-medium mb-3 pr-2">{service.name}</h3>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-ink-400 text-[11px] uppercase tracking-widest font-semibold">
                          <Clock className="w-[14px] h-[14px] mr-1.5 text-gold-500 stroke-[1.5]" />
                          {service.durationMins} MINS
                        </div>
                        <span className="font-sans text-[15px] text-[#D4AF37] font-bold shrink-0 tracking-wide">₹{service.price.toFixed(0)}</span>
                      </div>
                      
                      <p className="font-sans text-[13px] text-ink-400 flex-grow mb-6 leading-relaxed line-clamp-3 pr-2">
                        {service.description || "A bespoke full body massage using warm basalt stones and botanical oils."}
                      </p>
                      
                      <PrimaryButton 
                        className="w-full text-[13px] h-11"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(service.id);
                        }}
                      >
                        Reserve
                      </PrimaryButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatedSection>
    </div>
  );
};
