
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Loader2, Quote } from 'lucide-react';
import { Card } from '../components/ui/Card';
import axiosClient from '../api/axiosClient';
import { useQuery } from '@tanstack/react-query';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface Review {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

const fallbackReviews: Review[] = [
  {
    id: 101,
    customerName: 'Sarah Jenkins',
    rating: 5,
    title: 'An absolute dream',
    body: 'From the moment I walked in, I felt completely at peace. The therapist was incredibly skilled and the ambiance was just perfect.',
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    customerName: 'Michael Chen',
    rating: 5,
    title: 'Best massage in the city',
    body: 'I have been to many spas, but Lumina stands out. The deep tissue massage relieved weeks of stress.',
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    customerName: 'Elena Rodriguez',
    rating: 5,
    title: 'Glowing skin',
    body: 'The facial artistry treatment left my skin glowing for days. The organic products they use are top notch.',
    createdAt: new Date().toISOString()
  },
  {
    id: 104,
    customerName: 'David Smith',
    rating: 5,
    title: 'A true sanctuary',
    body: 'Highly recommend the meditation suites before a treatment. It really sets the mood and helps you disconnect.',
    createdAt: new Date().toISOString()
  }
];

export default function Testimonials() {
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
      try {
        const response = await axiosClient.get('/reviews?size=20');
        if (response.data?.content && response.data.content.length > 0) {
          return response.data.content as Review[];
        }
        return fallbackReviews;
      } catch (err) {
        return fallbackReviews;
      }
    }
  });

  const displayReviews = reviews || fallbackReviews;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-surface/50 hover:bg-surface rounded-full transition-colors border border-outline-variant/30 text-on-surface z-10"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div ref={heroRef} style={{ y, opacity }} className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
              <TextReveal text="Client Stories" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Don't just take our word for it. Hear what our wonderful clients have to say 
                about their Lumina Spa experience.
              </p>
            </AnimatedSection>
          </motion.div>

          {isLoading ? (
            <AnimatedSection variant="fade" className="flex justify-center items-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </AnimatedSection>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {displayReviews.map((review, idx) => (
                <AnimatedSection key={review.id} variant="slide-up" delay={0.1 + (idx % 3) * 0.1}>
                  <Card tilt className="p-8 break-inside-avoid glass-panel border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
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
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
