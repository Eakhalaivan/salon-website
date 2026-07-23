import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-toast';
import { Building2, TrendingUp, Users, HeartHandshake, ArrowLeft } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function Franchise() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', capital: '' });
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.1, 0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Inquiry Submitted', description: 'Our franchise director will contact you shortly.', variant: 'success' });
    setFormData({ name: '', email: '', phone: '', location: '', capital: '' });
  };

  const features = [
    { icon: Building2, title: 'Proven Model', desc: 'Our established operational model ensures high margins and quick break-even.' },
    { icon: TrendingUp, title: 'Marketing Support', desc: 'National brand campaigns and localized marketing strategies to drive footfall.' },
    { icon: Users, title: 'Training & HR', desc: 'Comprehensive staff training and recruitment assistance through our academy.' },
    { icon: HeartHandshake, title: 'Vendor Network', desc: 'Access to our exclusive supplier network for premium products at discounted rates.' }
  ];

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
          <AnimatedSection variant="slide-up">
            <div ref={heroRef} className="relative bg-surface-container-low rounded-[2.5rem] overflow-hidden py-24 px-6 text-center shadow-sm mb-24 border border-outline-variant/30">
              <motion.div 
                style={{ y, opacity }}
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-luminosity" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/80 to-transparent" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <h1 className="text-display-lg md:text-display-md font-bold font-serif text-on-surface">
                  <TextReveal text="Own a Lumina Spa" delay={0.2} />
                </h1>
                <AnimatedSection variant="fade" delay={0.5}>
                  <p className="text-body-lg text-on-surface-variant leading-relaxed">
                    Join the fastest-growing luxury wellness brand. Partner with us to bring premium beauty and relaxation services to your city.
                  </p>
                </AnimatedSection>
              </div>
            </div>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-24">
            {features.map((feature, idx) => (
              <AnimatedSection key={feature.title} variant="slide-up" delay={0.2 + idx * 0.1}>
                <Card className="text-center h-full glass-panel border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      <feature.icon size={32} />
                    </div>
                    <CardTitle className="text-title-lg font-serif text-on-surface">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-body-md text-on-surface-variant leading-relaxed">
                    {feature.desc}
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection variant="fade" delay={0.4}>
            <div className="max-w-3xl mx-auto">
              <Card className="glass-panel overflow-hidden border border-outline-variant/30 shadow-xl">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-600" />
                <CardHeader className="pt-8 px-8 md:px-12">
                  <CardTitle className="text-headline-sm font-serif text-center text-on-surface">Request Franchise Information</CardTitle>
                  <CardDescription className="text-center text-body-md text-on-surface-variant mt-2">
                    Fill out the form below and our franchise director will get in touch to discuss opportunities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:px-12 md:pb-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Full Name" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                      <Input 
                        label="Email Address" 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Phone Number" 
                        required 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                      />
                      <Input 
                        label="Target City/Location" 
                        required 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2 relative group flex-1">
                      <select 
                        className="peer w-full bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50 transition-all duration-300 py-3 px-4 appearance-none"
                        value={formData.capital}
                        onChange={e => setFormData({...formData, capital: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select Available Capital Range</option>
                        <option value="under50k">Under ₹50,000</option>
                        <option value="50k-100k">₹50,000 - ₹100,000</option>
                        <option value="100k-250k">₹100,000 - ₹250,000</option>
                        <option value="over250k">Over ₹250,000</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        <ChevronDownIcon />
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full mt-8">Submit Inquiry</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
