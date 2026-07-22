import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  description: string;
  employmentType: string;
}

export default function Careers() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      const response = await axiosClient.get('/content/careers');
      return response.data.content as JobOpening[];
    },
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="pt-32 pb-24 min-h-screen">
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
        ) : jobs?.length === 0 ? (
          <AnimatedSection variant="fade" className="text-center text-on-surface-variant py-12 glass-panel rounded-2xl">
            We don't have any open positions right now. Please check back later!
          </AnimatedSection>
        ) : (
          <div className="space-y-6">
            {jobs?.map((job, i) => (
              <AnimatedSection key={job.id} variant="slide-up" delay={0.6 + i * 0.1}>
                <Card className="hover:border-primary/50 transition-colors duration-300 glass-panel border-transparent overflow-hidden group">
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
                        onClick={() => window.location.href = `mailto:careers@luxesuite.com?subject=Application for ${job.title}`}
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
    </div>
  );
}
