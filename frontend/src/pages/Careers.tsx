import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, Briefcase, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  description: string;
  employmentType: string;
}

const fallbackJobs: JobOpening[] = [
  {
    id: 1,
    title: 'Senior Massage Therapist',
    department: 'Therapy',
    location: 'Downtown Studio',
    description: 'We are seeking an experienced Massage Therapist specializing in deep tissue and Swedish techniques. Minimum 5 years experience required. Must be licensed and passionate about holistic healing.',
    employmentType: 'Full-time'
  },
  {
    id: 2,
    title: 'Esthetician',
    department: 'Skincare',
    location: 'Westside Location',
    description: 'Looking for a licensed esthetician with expertise in advanced facial treatments, peels, and skincare consultations. Product sales experience is a plus.',
    employmentType: 'Part-time'
  },
  {
    id: 3,
    title: 'Spa Concierge',
    department: 'Customer Experience',
    location: 'Multiple Locations',
    description: 'The first point of contact for our guests. You will manage bookings, handle inquiries, and ensure every guest receives a warm, five-star welcome.',
    employmentType: 'Full-time'
  }
];

export default function Careers() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/content/careers');
        if (response.data?.content && response.data.content.length > 0) {
          return response.data.content as JobOpening[];
        }
        return fallbackJobs;
      } catch (err) {
        return fallbackJobs;
      }
    },
  });

  const displayJobs = jobs || fallbackJobs;

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

        <motion.div ref={heroRef} style={{ y, opacity }} className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
              <TextReveal text="Join Our Team" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                We're always looking for passionate, talented professionals to join our growing family of stylists, estheticians, and support staff.
              </p>
            </AnimatedSection>
          </div>
        </motion.div>
        
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <AnimatedSection variant="fade" delay={0.5}>
            <h2 className="text-headline-sm font-serif border-b border-outline-variant/30 pb-4 mb-8 text-on-surface">Open Positions</h2>
          </AnimatedSection>
          
          {isLoading ? (
            <AnimatedSection variant="fade" className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </AnimatedSection>
          ) : displayJobs.length === 0 ? (
            <AnimatedSection variant="fade" className="text-center text-on-surface-variant py-12 glass-panel rounded-2xl">
              We don't have any open positions right now. Please check back later!
            </AnimatedSection>
          ) : (
            <div className="space-y-6">
              {displayJobs.map((job, i) => (
                <AnimatedSection key={job.id} variant="slide-up" delay={0.6 + i * 0.1}>
                  <Card className="hover:border-primary/50 transition-colors duration-300 glass-panel border border-outline-variant/30 overflow-hidden group shadow-lg hover:shadow-primary/10">
                    <CardHeader className="bg-surface-container-lowest/50 border-b border-outline-variant/20 p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                          <CardTitle className="text-title-lg font-serif text-on-surface mb-2">{job.title}</CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-4 text-label-md text-on-surface-variant">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" /> {job.department}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {job.location}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {job.employmentType}</span>
                          </CardDescription>
                        </div>
                        <Button 
                          onClick={() => window.location.href = `mailto:careers@luminaspa.com?subject=Application for ${job.title}`}
                          variant="primary"
                          className="shrink-0 group-hover:scale-105 transition-transform"
                        >
                          Apply Now <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </CardContent>
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
