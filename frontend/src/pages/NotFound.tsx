import { useNavigate } from 'react-router-dom';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <AnimatedSection variant="fade" delay={0.1}>
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[8rem] md:text-[12rem] font-bold font-serif text-primary leading-none mb-4 opacity-20"
        >
          404
        </motion.div>
      </AnimatedSection>

      <AnimatedSection variant="slide-up" delay={0.3} className="relative z-10 -mt-12">
        <h2 className="text-display-sm font-serif text-on-surface mb-4">
          Page Not Found
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center px-8 py-3 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Homepage
        </button>
      </AnimatedSection>
    </div>
  );
};
