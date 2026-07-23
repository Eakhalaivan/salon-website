import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MessageCircle, ArrowLeft } from 'lucide-react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const faqs = [
  {
    question: 'What is your cancellation policy?',
    answer: 'We require 24 hours notice for any cancellations or rescheduling. Cancellations made with less than 24 hours notice may be subject to a fee of 50% of the scheduled service cost.'
  },
  {
    question: 'Do you accept walk-ins?',
    answer: 'While we recommend booking in advance to guarantee your preferred time and stylist, we do welcome walk-ins based on our daily availability.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), cash, and contactless payments including Apple Pay and Google Pay.'
  },
  {
    question: 'Do you offer gift cards?',
    answer: 'Yes! Gift cards are available for purchase both in-salon and online. They can be loaded with any denomination and never expire.'
  },
  {
    question: 'How early should I arrive for my appointment?',
    answer: 'We suggest arriving 10-15 minutes prior to your scheduled appointment time to check in, relax with a complimentary beverage, and consult with your stylist or therapist.'
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-surface/50 hover:bg-surface rounded-full transition-colors border border-outline-variant/30 text-on-surface z-10"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          <motion.div ref={heroRef} style={{ y, opacity }} className="text-center mb-16">
            <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
              <TextReveal text="Client Questions" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Everything you need to know about your Lumina Spa experience.
              </p>
            </AnimatedSection>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <AnimatedSection key={index} variant="slide-up" delay={0.2 + index * 0.1}>
                  <div 
                    className={`border border-outline-variant/30 rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-surface-container-low shadow-sm' : 'glass-panel hover:bg-surface-container-lowest'}`}
                  >
                    <button
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <h3 className="text-title-lg font-serif text-on-surface pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="text-primary flex-shrink-0"
                      >
                        <ChevronDown size={24} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-5 pt-0 text-body-lg text-on-surface-variant leading-relaxed border-t border-outline-variant/10 mt-2 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          
          <AnimatedSection variant="fade" delay={0.8} className="mt-16 text-center">
            <div className="inline-flex flex-col items-center p-8 glass-panel border border-outline-variant/30 rounded-3xl">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-title-lg font-serif text-on-surface mb-2">Still have questions?</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Our concierge team is here to help you design your perfect experience.
              </p>
              <button onClick={() => navigate('/about')} className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary/90 transition-colors">
                Contact Us
              </button>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
