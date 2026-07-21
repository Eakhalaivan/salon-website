import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
}

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/content/blog');
      return response.data.content as BlogPost[];
    },
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <motion.div ref={heroRef} style={{ y, opacity }} className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-display-lg md:text-display-md text-on-surface mb-6 font-serif">
            <TextReveal text="The Journal" delay={0.1} />
          </h1>
          <AnimatedSection variant="fade" delay={0.4}>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Insights, trends, and inspiration from the experts at LuxeSuite. Explore our world of wellness and beauty.
            </p>
          </AnimatedSection>
        </div>
      </motion.div>
      
      {isLoading ? (
        <AnimatedSection variant="fade" className="flex justify-center p-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </AnimatedSection>
      ) : posts?.length === 0 ? (
        <AnimatedSection variant="fade" className="text-center p-24 text-on-surface-variant">
          Check back soon for new articles.
        </AnimatedSection>
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.map((post, i) => (
              <AnimatedSection key={post.id} variant="slide-up" delay={i * 0.1}>
                <Link to={`/blog/${post.slug}`} className="block h-full group">
                  <Card className="h-full overflow-hidden flex flex-col border-transparent glass-panel hover:border-primary/30 transition-all duration-300">
                    {post.coverImageUrl ? (
                      <div className="h-64 overflow-hidden bg-surface-container-highest relative">
                        <img 
                          src={post.coverImageUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                      </div>
                    ) : (
                      <div className="h-64 bg-surface-container-high flex items-center justify-center text-primary/40 font-serif text-2xl">
                        LuxeSuite
                      </div>
                    )}
                    <CardHeader className="pt-6">
                      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant uppercase tracking-widest mb-3">
                        <Calendar size={14} />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <CardTitle className="text-title-lg font-serif text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-body-md text-on-surface-variant line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-label-md text-primary font-medium tracking-wide">
                        Read Article <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
