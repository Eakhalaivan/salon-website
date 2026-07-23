import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const images = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1516975080661-46bdcb396145?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600',
];

export default function Gallery() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
              <TextReveal text="Our Portfolio" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Take a look at some of the beautiful transformations and relaxing moments 
                created by our expert team.
              </p>
            </AnimatedSection>
          </motion.div>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((src, index) => (
              <AnimatedSection key={index} variant="slide-up" delay={0.1 + (index % 3) * 0.1}>
                <div className="group relative rounded-2xl overflow-hidden glass-panel mb-6 break-inside-avoid shadow-lg hover:shadow-primary/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />
                  <img 
                    src={src} 
                    alt={`Gallery image ${index + 1}`}
                    className="object-cover w-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
