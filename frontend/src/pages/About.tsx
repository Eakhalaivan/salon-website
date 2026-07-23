import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { CountUp } from '../components/ui/CountUp';
import { Sparkles, Heart, Leaf, Star, Trophy, Users, Building, ArrowLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const stats = [
  { label: 'Years of Excellence', value: 12, icon: Trophy, suffix: '+' },
  { label: 'Happy Clients', value: 25000, icon: Users, suffix: '+' },
  { label: 'Locations', value: 4, icon: Building, suffix: '' },
  { label: '5-Star Reviews', value: 5000, icon: Star, suffix: '+' },
];

const values = [
  {
    title: 'Excellence in Service',
    description: 'We strive for perfection in every treatment, ensuring you receive the highest standard of care.',
    icon: Star
  },
  {
    title: 'Natural Ingredients',
    description: 'We use only premium, organic, and ethically sourced products for your well-being.',
    icon: Leaf
  },
  {
    title: 'Client-Centric',
    description: 'Your comfort and satisfaction are at the heart of everything we do.',
    icon: Heart
  },
  {
    title: 'Innovation',
    description: 'We continuously evolve our techniques to provide cutting-edge wellness solutions.',
    icon: Sparkles
  }
];

export default function About() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Back Button & Header */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-surface/50 hover:bg-surface rounded-full transition-colors border border-outline-variant/30 text-on-surface z-10"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Hero Section */}
        <motion.div ref={heroRef} style={{ y, opacity }} className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
              <TextReveal text="Our Story" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Founded in 2012, LuxeSuite represents the pinnacle of modern wellness and beauty. 
                We believe that true beauty radiates from within, and our mission is to provide 
                a sanctuary where you can escape the demands of daily life and focus entirely on yourself.
              </p>
            </AnimatedSection>
          </div>
        </motion.div>

        {/* Stats Section */}
        <AnimatedSection variant="slide-up" delay={0.2} className="bg-surface-container-low py-16 mb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-headline-lg font-serif text-primary mb-2 flex items-center justify-center">
                    <CountUp value={stat.value} duration={2} />
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-label-md text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Craft Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection variant="slide-right">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] glass-panel">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Massage Therapy"
                  className="object-cover w-full h-full"
                />
              </div>
            </AnimatedSection>
            
            <AnimatedSection variant="slide-left">
              <h2 className="text-headline-md font-serif text-on-surface mb-6">Masters of Our Craft</h2>
              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-6">
                Our team of master stylists, estheticians, and massage therapists are not just experts in their fields—they are artists dedicated to their craft.
              </p>
              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-8">
                Every professional at LuxeSuite undergoes rigorous continuous education to stay at the forefront of wellness trends, ensuring you receive innovative and effective treatments every time you visit.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                <div className="px-6 py-3 border border-primary text-primary rounded-full font-label-md cursor-pointer hover:bg-primary hover:text-on-primary transition-colors">
                  Meet the Team
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <AnimatedSection variant="fade">
            <h2 className="text-headline-md font-serif text-center text-on-surface mb-12">Our Core Values</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <AnimatedSection key={value.title} variant="slide-up" delay={i * 0.2}>
                <Card tilt className="p-8 h-full glass-panel hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 text-on-surface">
                    <value.icon size={24} />
                  </div>
                  <h3 className="text-title-lg text-on-surface mb-4 font-serif">{value.title}</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
