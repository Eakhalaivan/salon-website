import { useParams, useNavigate, Link } from 'react-router-dom';
import { useServicesQuery } from '../hooks/api/useAppointments';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { transitionSpring } from '../utils/motion';

// A mapping of categories to their aesthetic icons and hero images
const categoryAesthetics: Record<string, { icon: string, image: string }> = {
  'Massage': { icon: 'spa', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1600&q=80' },
  'Skin': { icon: 'face', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80' },
  'Hair': { icon: 'content_cut', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80' },
  'Nails': { icon: 'back_hand', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80' },
  'Grooming': { icon: 'face_retouching_natural', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1600&q=80' },
  'default': { icon: 'self_improvement', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80' }
};

export const CategoryServices = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const { data: pageData, isLoading } = useServicesQuery();
  const allServices = pageData?.content || [];

  const services = allServices.filter(s => s.category?.toLowerCase() === categoryName?.toLowerCase());
  
  const aesthetics = categoryAesthetics[categoryName || ''] || categoryAesthetics['default'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ...transitionSpring } }
  };

  return (
    <div className="dark bg-[var(--color-background)] text-[var(--color-on-surface)] font-body-md overflow-x-hidden min-h-screen flex flex-col selection:bg-[var(--color-primary)]/20">
      <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] transition-all duration-300">
        <nav className="flex justify-between items-center px-6 lg:px-12 py-5 max-w-7xl mx-auto">
          <Link to="/" className="font-display-md text-2xl text-[var(--color-primary)] tracking-widest">LUMINA SPA</Link>
          <button 
            onClick={() => navigate('/book')}
            className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-label-md uppercase tracking-wider transition-colors duration-300 flex items-center gap-2"
          >
            <span className="material-symbols-outlined font-light text-[20px]">west</span>
            Back to Categories
          </button>
        </nav>
      </header>

      <div className="relative pt-32 pb-16 bg-[var(--color-surface)] overflow-hidden">
        <div className="absolute inset-0 z-0 h-64 opacity-30">
          <img src={aesthetics.image} alt={categoryName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-surface"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={transitionSpring}
            className="w-20 h-20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <span className="material-symbols-outlined font-light text-[36px]">{aesthetics.icon}</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, ...transitionSpring }}
            className="font-display-md text-4xl md:text-5xl mb-4 capitalize"
          >
            {categoryName} Services
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, ...transitionSpring }}
            className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl mx-auto"
          >
            Select a specialized ritual to begin your curated {categoryName?.toLowerCase()} experience.
          </motion.p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-24 w-full flex-grow">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-8">
                <div className="flex justify-between mb-4">
                  <Skeleton className="w-1/2 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-8" />
                <Skeleton className="w-24 h-4" />
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-sm">
            <span className="material-symbols-outlined text-6xl text-[var(--color-outline)] mb-4 font-light">category</span>
            <h3 className="font-display-sm text-2xl text-[var(--color-on-surface)] mb-2">No Services Found</h3>
            <p className="text-[var(--color-on-surface-variant)] font-body-md max-w-md mx-auto mb-8">
              We currently do not offer any services in this category.
            </p>
            <Button onClick={() => navigate('/book')} variant="outline">Browse Other Categories</Button>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map(svc => (
              <motion.div 
                key={svc.id}
                variants={itemVariants}
                className="h-full"
              >
                <Card tilt className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)]/40 hover:shadow-xl transition-all duration-300 relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-4 pr-6 flex-grow">
                  <div>
                    <h3 className="font-display-sm text-xl text-[var(--color-on-surface)] leading-tight mb-2">{svc.name}</h3>
                    <p className="font-body-md text-[var(--color-on-surface-variant)] line-clamp-3">{svc.description}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-end border-t border-[var(--color-border)] pt-6">
                  <div>
                    <span className="text-[var(--color-primary)] font-display-sm text-2xl block mb-1">₹{svc.price}</span>
                    <div className="flex items-center gap-1.5 text-[var(--color-on-surface-variant)] font-label-sm uppercase tracking-widest text-[10px]">
                      <span className="material-symbols-outlined font-light text-[14px]">schedule</span>
                      {svc.durationMins} min
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/book?serviceId=${svc.id}&step=2`)}
                    size="sm"
                    className="shadow-[0px_4px_14px_rgba(212,175,55,0.2)]"
                  >
                    Select
                  </Button>
                </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};
