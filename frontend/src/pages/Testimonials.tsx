import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Loader2, Quote } from 'lucide-react';
import { Card } from '../components/ui/Card';
import axiosClient from '../api/axiosClient';
import { useQuery } from '@tanstack/react-query';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Review {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

const Testimonials: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/reviews?size=20');
      return response.data.content as Review[];
    }
  });

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
        
        <motion.div ref={heroRef} style={{ y, opacity }} className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
            <TextReveal text="Client Stories" delay={0.1} />
          </h1>
          <AnimatedSection variant="fade" delay={0.4}>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Don't just take our word for it. Hear what our wonderful clients have to say 
              about their LuxeSuite experience.
            </p>
          </AnimatedSection>
        </motion.div>

        {isLoading ? (
          <AnimatedSection variant="fade" className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </AnimatedSection>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {reviews?.map((review, idx) => (
              <AnimatedSection key={review.id} variant="slide-up" delay={0.1 + (idx % 3) * 0.1}>
                <Card tilt className="p-8 break-inside-avoid glass-panel border-transparent hover:border-primary/30 transition-all duration-300">
                  <div className="absolute top-6 right-6 text-primary/10">
                    <Quote size={48} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 flex-shrink-0 ${
                            i < review.rating ? 'text-primary fill-primary' : 'text-outline-variant'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    {review.title && (
                      <h3 className="text-title-lg font-serif text-on-surface mb-4">{review.title}</h3>
                    )}
                    <p className="text-body-lg text-on-surface-variant italic mb-8 leading-relaxed">"{review.body}"</p>
                    
                    <div className="border-t border-outline-variant/30 pt-6 flex justify-between items-end">
                      <div>
                        <p className="font-label-md font-semibold text-on-surface">{review.customerName}</p>
                      </div>
                      <div className="text-label-sm text-on-surface-variant/70 uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
            
            {reviews?.length === 0 && (
              <div className="col-span-full text-center py-24 text-on-surface-variant glass-panel rounded-2xl">
                No stories shared yet. Be the first to share your LuxeSuite experience!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
