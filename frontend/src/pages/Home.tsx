import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCmsContent } from '../hooks/api/useCmsContent';

import DOMPurify from 'dompurify';

export const Home = () => {
  const { data: cms = {} } = useCmsContent('home');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState<'WOMEN' | 'MEN'>('WOMEN');
  
  // Parallax effect for hero (capped to avoid excessive shift)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[100svh] min-h-[700px] flex items-center pt-20 overflow-hidden bg-on-background">
          <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent z-10" />
            <img 
              src={cms.hero_image_url?.contentValue || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"} 
              srcSet={`
                ${cms.hero_image_url?.contentValue || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop"}&w=800&q=80 800w,
                ${cms.hero_image_url?.contentValue || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop"}&w=1600&q=80 1600w,
                ${cms.hero_image_url?.contentValue || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop"}&w=2850&q=80 2850w
              `}
              sizes="100vw"
              alt="A serene and luxurious high-end spa interior" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
          
          <div className="relative z-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-block px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm tracking-[0.2em] mb-8 shadow-sm"
              >
                EST. 2024 • THE ART OF RITUAL
              </motion.span>
              
              <div className="font-display-lg text-5xl md:text-7xl text-white mb-8 leading-[1.1] tracking-tight">
                {cms.hero_headline?.contentValue ? (
                  <TextReveal text={cms.hero_headline.contentValue} delay={0.3} />
                ) : (
                  <>
                    <TextReveal text="Your Sanctuary" delay={0.3} />
                    <TextReveal text="of Serenity" delay={0.5} />
                  </>
                )}
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.8, duration: 0.8 }}
                className="font-body-lg text-lg text-white/80 mb-10 max-w-lg leading-relaxed"
              >
                {cms.hero_subtext?.contentValue || "Step away from the noise of the world. Experience transformative rituals designed to harmonize mind, body, and spirit in our gold-standard sanctuary."}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Button onClick={() => navigate('/login')} variant="primary" size="lg">
                  Book Ritual
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-md"
                  onClick={() => {
                    import('framer-motion').then(({ animate }) => {
                      const element = document.getElementById('services');
                      if (element) {
                        const y = element.getBoundingClientRect().top + window.scrollY - 80;
                        animate(window.scrollY, y, {
                          type: 'spring',
                          stiffness: 50,
                          damping: 20,
                          onUpdate: (latest) => window.scrollTo(0, latest)
                        });
                      }
                    });
                  }}
                >
                  View Services
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/50 animate-float"
          >
            <span className="text-label-sm font-label-sm uppercase tracking-[0.3em]">Discover</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent"></div>
          </motion.div>
        </section>

        {/* About Section (Alternating Rows) */}
        <section id="about" className="py-32 overflow-hidden bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
              <AnimatedSection variant="slide-right" className="w-full md:w-1/2">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Therapist preparing oils" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </AnimatedSection>
              <AnimatedSection variant="slide-left" className="w-full md:w-1/2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.3em] mb-4 block">Our Philosophy</span>
                <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-6">
                  {cms.about_headline?.contentValue ? (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cms.about_headline.contentValue.replace(/\n/g, '<br/>')) }} />
                  ) : (
                    <>Rooted in Tradition,<br/>Refined for Today</>
                  )}
                </h2>
                <p className="font-body-md text-on-surface-variant leading-loose mb-6 whitespace-pre-wrap">
                  {cms.about_subtext?.contentValue || "We believe that true wellness requires an unhurried approach. By merging ancient healing methodologies with modern, evidence-based practices, we create a space where genuine restoration happens.\n\nEvery product, every touch, and every sound in our sanctuary is meticulously chosen to lower cortisol and elevate the spirit."}
                </p>
              </AnimatedSection>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <AnimatedSection variant="slide-left" className="w-full md:w-1/2">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Relaxation area" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </AnimatedSection>
              <AnimatedSection variant="slide-right" className="w-full md:w-1/2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.3em] mb-4 block">The Environment</span>
                <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-6">An Atmosphere of <br/>Pure Stillness</h2>
                <p className="font-body-md text-on-surface-variant leading-loose mb-6">
                  Our architecture embraces natural light, raw stone, and acoustic damping to ensure that the moment you cross our threshold, the city fades away entirely.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Featured Services: Bento Grid */}
        <AnimatedSection id="services" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-4xl text-on-surface mb-6">Curated Rituals</h2>
            <div className="w-12 h-[2px] bg-primary mx-auto opacity-60 mb-12"></div>
            
            {/* Category Selector Tabs */}
            <div className="flex bg-surface-dim p-1 rounded-full border border-outline-variant/30 shadow-inner w-full max-w-md mx-auto relative overflow-hidden">
              <button 
                onClick={() => setActiveCategory('WOMEN')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-label-md tracking-wider transition-all duration-300 relative z-10 ${activeCategory === 'WOMEN' ? 'text-white' : 'text-on-surface hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">face_3</span>
                Women's Rituals
              </button>
              
              <button 
                onClick={() => setActiveCategory('MEN')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-label-md tracking-wider transition-all duration-300 relative z-10 ${activeCategory === 'MEN' ? 'text-white' : 'text-on-surface hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">face_6</span>
                Men's Rituals
              </button>

              {/* Active indicator */}
              <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
                style={{ 
                  transform: activeCategory === 'WOMEN' ? 'translateX(0)' : 'translateX(calc(100% + 8px))',
                  left: '4px'
                }}
              />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {activeCategory === 'WOMEN' ? (
              <motion.div 
                key="women"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[700px]"
              >
                {/* Massage (Large Card) */}
                <div className="lg:col-span-7 h-full">
                  <Card tilt className="group relative h-full min-h-[400px]" onClick={() => navigate('/book')}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                      alt="Massage therapy"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                    />
                    <div className="absolute bottom-0 left-0 p-10 z-20 w-full">
                      <span className="inline-block px-3 py-1 rounded-full bg-sage/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-4 border border-sage/30">MASSAGE</span>
                      <h3 className="font-headline-sm text-3xl text-white mb-3">Deep Tissue Harmony</h3>
                      <p className="text-white/70 font-body-md max-w-md">Unlock deep-seated tension with our signature rhythmic pressure techniques.</p>
                    </div>
                  </Card>
                </div>
                
                <div className="lg:col-span-5 grid grid-rows-2 gap-6">
                  {/* Skin (Medium Card) */}
                  <div className="h-full">
                    <Card tilt className="group relative h-full" onClick={() => navigate('/book')}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                        alt="Skincare treatment"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-3 border border-secondary/30">SKIN</span>
                        <h3 className="font-headline-sm text-2xl text-white">Botanical Radiance</h3>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Hair (Medium Card) */}
                  <div className="h-full">
                    <Card tilt className="group relative h-full" onClick={() => navigate('/book')}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                        alt="Hair ritual"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-3 border border-primary/30">HAIR</span>
                        <h3 className="font-headline-sm text-2xl text-white">Silken Scalp Ritual</h3>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="men"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[700px]"
              >
                {/* Barbering (Large Card) */}
                <div className="lg:col-span-7 h-full">
                  <Card tilt className="group relative h-full min-h-[400px]" onClick={() => navigate('/book')}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1532710093739-9470ac1d4b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                      alt="Barbering service"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                    />
                    <div className="absolute bottom-0 left-0 p-10 z-20 w-full">
                      <span className="inline-block px-3 py-1 rounded-full bg-sage/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-4 border border-sage/30">GROOMING</span>
                      <h3 className="font-headline-sm text-3xl text-white mb-3">Executive Hair & Beard</h3>
                      <p className="text-white/70 font-body-md max-w-md">Precision cutting and traditional hot towel shave for the modern gentleman.</p>
                    </div>
                  </Card>
                </div>
                
                <div className="lg:col-span-5 grid grid-rows-2 gap-6">
                  {/* Skin (Medium Card) */}
                  <div className="h-full">
                    <Card tilt className="group relative h-full" onClick={() => navigate('/book')}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1598452963314-b09f397a5c48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                        alt="Men's Skincare"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-3 border border-secondary/30">SKIN</span>
                        <h3 className="font-headline-sm text-2xl text-white">Energizing Facial</h3>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Massage (Medium Card) */}
                  <div className="h-full">
                    <Card tilt className="group relative h-full" onClick={() => navigate('/book')}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent z-10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                        alt="Sports Massage"
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.03]"
                      />
                      <div className="absolute bottom-0 left-0 p-8 z-20">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-white backdrop-blur-md font-label-sm tracking-widest mb-3 border border-primary/30">MASSAGE</span>
                        <h3 className="font-headline-sm text-2xl text-white">Sports Recovery</h3>
                      </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection className="py-32 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
            <div className="w-full md:w-1/2 relative">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.3em] mb-6 block">The Experience</span>
              <h2 className="font-display-lg text-5xl md:text-6xl text-on-surface mb-8 leading-[1.1]">Voices of <br/>Serenity</h2>
              <div className="relative mb-20 md:mb-0 after:content-[''] after:absolute after:left-1/2 after:bottom-[-60px] after:w-[1px] after:h-[60px] after:bg-primary after:opacity-30"></div>
            </div>
            
            <div className="w-full md:w-1/2 relative">
              <div className="glass-panel p-12 md:p-16 rounded-[2.5rem] relative z-10 shadow-xl">
                <span className="material-symbols-outlined text-primary text-6xl mb-8 opacity-40 font-light">format_quote</span>
                <p className="font-serif text-xl italic text-on-surface mb-10 leading-loose">
                  "The moment I walked through the doors of Lumina, the weight of the city just vanished. The Deep Tissue Harmony ritual wasn't just a massage; it was a profound reset for my entire being. Truly the most premium experience in the city."
                </p>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant/50">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                      alt="Helena Richardson"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="font-label-lg tracking-wide text-on-surface">Helena Richardson</p>
                    <p className="text-label-sm tracking-wider text-on-surface-variant uppercase mt-1">Private Equity Partner</p>
                  </div>
                </div>
              </div>
              {/* Decorative subtle glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[80px] z-0 pointer-events-none"></div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection variant="scale-in" className="mb-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="relative bg-on-background rounded-[3rem] p-16 md:p-32 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
              <div 
                className="bg-cover bg-center w-full h-full" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600334089648-b5d9d06b52dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
              ></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]/80"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-display-lg text-5xl md:text-6xl text-white mb-8">Begin Your Journey</h2>
              <p className="text-white/80 font-body-lg mb-14 text-lg max-w-xl mx-auto leading-relaxed">
                Spaces are limited. Secure your ritual today and embrace the stillness within.
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                variant="primary" 
                size="lg"
                className="text-white px-14 py-5 shadow-[0_0_40px_rgba(212,175,55,0.3)]"
              >
                Reserve Your Session
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 px-6 md:px-12 py-24 max-w-7xl mx-auto">
          <div className="md:col-span-1">
            <Link to="/" className="font-display-lg text-3xl text-primary mb-8 block tracking-tighter">LUMINA</Link>
            <p className="text-on-surface-variant font-body-md leading-loose">
              Defining the gold standard of holistic wellness and luxury rituals since 2024.
            </p>
          </div>
          
          <div>
            <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Rituals</h4>
            <ul className="space-y-5 font-body-md text-on-surface-variant">
              <li><Link to="/#services" className="hover:text-primary transition-colors">Body Therapy</Link></li>
              <li><Link to="/#services" className="hover:text-primary transition-colors">Facial Artistry</Link></li>
              <li><Link to="/#services" className="hover:text-primary transition-colors">Hair Restoration</Link></li>
              <li><Link to="/#services" className="hover:text-primary transition-colors">Meditation Suites</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Connect</h4>
            <ul className="space-y-5 font-body-md text-on-surface-variant">
              <li><a href="#about" className="hover:text-primary transition-colors">Contact</a></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              {/* <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li> */}
              {/* <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li> */}
            </ul>
          </div>
          
          <div>
            <h4 className="font-label-md tracking-[0.2em] text-on-surface mb-8 uppercase">Location</h4>
            <p className="text-on-surface-variant font-body-md mb-8 leading-loose">1221 Serenity Blvd,<br/>Gold Coast, QLD 4217</p>
            <div className="flex space-x-4">
              <a href="https://lumina-spa.com" target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-full text-on-surface hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined font-light text-xl">public</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-full text-on-surface hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined font-light text-xl">camera</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="px-6 md:px-12 py-8 border-t border-outline-variant/20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-label-sm tracking-widest uppercase text-on-surface-variant/60 gap-4">
          <p>© 2024 Lumina Spa. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Melbourne</span>
            <span>Sydney</span>
            <span>Bali</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
