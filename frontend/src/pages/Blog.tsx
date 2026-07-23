import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
}

const fallbackPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Benefits of Deep Tissue Massage',
    slug: 'benefits-of-deep-tissue-massage',
    excerpt: 'Discover how deep tissue massage can relieve chronic pain, improve mobility, and reduce stress levels significantly.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600',
    author: 'Elena Rodriguez',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 2,
    title: 'Winter Skincare Routine Essentials',
    slug: 'winter-skincare-routine',
    excerpt: 'Keep your skin glowing and hydrated during the harsh winter months with these professional tips and recommended products.',
    coverImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
    author: 'Sarah Jenkins',
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 3,
    title: 'Mindfulness and Relaxation Techniques',
    slug: 'mindfulness-and-relaxation',
    excerpt: 'Learn simple mindfulness exercises you can practice daily to complement your spa treatments and maintain a state of calm.',
    coverImageUrl: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=600',
    author: 'Michael Chen',
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export default function Blog() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/content/blog');
        if (response.data?.content && response.data.content.length > 0) {
          return response.data.content as BlogPost[];
        }
        return fallbackPosts;
      } catch (err) {
        return fallbackPosts;
      }
    },
  });

  const displayPosts = posts || fallbackPosts;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
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
              <TextReveal text="The Journal" delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.4}>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                Insights, trends, and inspiration from the experts at Lumina Spa. Explore our world of wellness and beauty.
              </p>
            </AnimatedSection>
          </div>
        </motion.div>
        
        {isLoading ? (
          <AnimatedSection variant="fade" className="flex justify-center p-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </AnimatedSection>
        ) : displayPosts.length === 0 ? (
          <AnimatedSection variant="fade" className="text-center p-24 text-on-surface-variant">
            Check back soon for new articles.
          </AnimatedSection>
        ) : (
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post, i) => (
                <AnimatedSection key={post.id} variant="slide-up" delay={i * 0.1}>
                  <Link to={`/blog/${post.slug}`} className="block h-full group">
                    <Card className="h-full overflow-hidden flex flex-col border border-outline-variant/30 glass-panel hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
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
                          Lumina Spa
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
                      <CardContent className="flex-1 flex flex-col justify-between pb-6">
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
      </main>

      <Footer />
    </div>
  );
}
