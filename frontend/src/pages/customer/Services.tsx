import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicesQuery } from '../../hooks/api/useAppointments';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';

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
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-6 rounded-2xl font-body-md text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  const filteredServices = services.filter(
    (service) => service.category === activeCategory || activeCategory === "All Rituals"
  );

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      {/* Abstract background elements */}
      <div className="absolute -right-20 -top-20 opacity-10">
        <span className="material-symbols-outlined text-[400px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
      </div>

      <div className="relative z-10">
        <div className="mb-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Our Rituals</h2>
          <p className="font-body-md text-secondary mt-2">Discover our tailored experiences designed for your absolute serenity.</p>
        </div>

        {/* Category Selector Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-4 mb-10">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full font-label-md transition-colors ${
                  activeCategory === cat 
                    ? 'bg-primary-container text-on-primary-container shadow-sm' 
                    : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

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
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => handleBook(service.id)}
                  >
                    {/* Image Area */}
                    <div className="h-64 relative overflow-hidden bg-surface-container">
                      <img 
                        src={service.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop'} 
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <button 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Wishlist logic
                        }}
                      >
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="font-headline-md text-headline-md text-on-surface">{service.name}</h3>
                        <div className="flex items-center text-primary font-bold shrink-0">
                          <span className="text-sm mr-0.5">₹</span>
                          <span className="text-xl">{service.price.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-secondary font-label-sm mb-4">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{service.durationMins} MINS</span>
                      </div>

                      <p className="font-body-md text-secondary mb-8 flex-1">
                        {service.description || "A bespoke treatment designed for your absolute serenity."}
                      </p>

                      <button 
                        className="w-full py-3 rounded-full bg-primary-container text-on-primary-container font-label-md hover:brightness-110 active:scale-95 transition-all shadow-md mt-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(service.id);
                        }}
                      >
                        Reserve
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatedSection>
      </div>
    </main>
  );
};
