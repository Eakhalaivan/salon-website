import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import React, { Suspense } from 'react';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const MarkdownRenderer = React.lazy(() => import('../components/ui/MarkdownRenderer'));

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
}

const fallbackPosts: Record<string, BlogPost> = {
  'benefits-of-deep-tissue-massage': {
    id: 1,
    title: 'The Benefits of Deep Tissue Massage',
    slug: 'benefits-of-deep-tissue-massage',
    excerpt: 'Discover how deep tissue massage can relieve chronic pain, improve mobility, and reduce stress levels significantly.',
    content: `Deep tissue massage is a massage technique that\'s mainly used to treat musculoskeletal issues, such as strains and sports injuries. It involves applying sustained pressure using slow, deep strokes to target the inner layers of your muscles and connective tissues.\n\n## Key Benefits\n\n- **Pain Relief:** Relieves chronic pain and muscle tension.\n- **Improved Mobility:** Helps break down scar tissue and improve range of motion.\n- **Stress Reduction:** Lowers stress hormone levels and heart rate while boosting mood.\n\nAt Lumina Spa, our expert therapists tailor each session to your specific needs, ensuring maximum benefit and relaxation.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600',
    author: 'Elena Rodriguez',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  'winter-skincare-routine': {
    id: 2,
    title: 'Winter Skincare Routine Essentials',
    slug: 'winter-skincare-routine',
    excerpt: 'Keep your skin glowing and hydrated during the harsh winter months with these professional tips and recommended products.',
    content: `Winter weather can be incredibly harsh on your skin, stripping away its natural moisture and leaving it dry, flaky, and irritated. Here\'s how you can protect and nourish your skin during the colder months.\n\n## Top Tips\n\n1. **Hydrate, Hydrate, Hydrate:** Drink plenty of water and use a rich, emollient moisturizer.\n2. **Gentle Cleansing:** Switch to a cream-based or hydrating cleanser that won't strip natural oils.\n3. **Humidify:** Use a humidifier in your home, especially in the bedroom, to add moisture back into the air.\n4. **Don't Forget Sunscreen:** UV rays can still damage your skin in the winter, especially when reflecting off snow.\n\nBook a hydrating facial with us today to kickstart your winter skincare routine.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
    author: 'Sarah Jenkins',
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  'mindfulness-and-relaxation': {
    id: 3,
    title: 'Mindfulness and Relaxation Techniques',
    slug: 'mindfulness-and-relaxation',
    excerpt: 'Learn simple mindfulness exercises you can practice daily to complement your spa treatments and maintain a state of calm.',
    content: `Mindfulness is the practice of purposely bringing one\'s attention to experiences occurring in the present moment without judgment. Incorporating mindfulness into your daily routine can significantly reduce stress and improve your overall well-being.\n\n## Techniques to Try\n\n- **Deep Breathing:** Take five deep breaths, focusing entirely on the sensation of the air entering and leaving your body.\n- **Body Scan:** Mentally scan your body from head to toe, noticing any areas of tension and consciously relaxing them.\n- **Mindful Walking:** Pay attention to the feeling of your feet touching the ground and the sounds around you as you walk.\n\nThese practices, combined with regular spa visits, can create a powerful foundation for a balanced and relaxed life.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=600',
    author: 'Michael Chen',
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      try {
        const response = await axiosClient.get(`/content/blog/${slug}`);
        if (response.data) {
           return response.data as BlogPost;
        }
        return fallbackPosts[slug as string];
      } catch (err) {
        return fallbackPosts[slug as string];
      }
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-24 flex flex-col items-center justify-center space-y-6">
          <h1 className="text-display-sm font-serif text-error">Article Not Found</h1>
          <p className="text-body-lg text-on-surface-variant">The article you are looking for has been moved or no longer exists.</p>
          <Link to="/blog" className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-600 transition-colors">
            Return to Journal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <article className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => navigate('/blog')}
              className="p-2 bg-surface/50 hover:bg-surface rounded-full transition-colors border border-outline-variant/30 text-on-surface z-10"
              aria-label="Back to Journal"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="text-label-md text-on-surface-variant">Back to Journal</span>
          </div>
          
          <header className="space-y-8 text-center mb-16">
            <h1 className="text-display-md font-serif text-on-surface leading-tight">
              <TextReveal text={post.title} delay={0.1} />
            </h1>
            <AnimatedSection variant="fade" delay={0.3}>
              <div className="flex justify-center items-center gap-4 text-label-md text-on-surface-variant uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>By <span className="font-semibold text-primary">{post.author}</span></span>
              </div>
            </AnimatedSection>
          </header>
          
          {post.coverImageUrl && (
            <AnimatedSection variant="slide-up" delay={0.4}>
              <div className="w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-16 relative glass-panel border border-outline-variant/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay z-10" />
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            </AnimatedSection>
          )}
          
          <AnimatedSection variant="fade" delay={0.6}>
            <div className="prose prose-lg max-w-none mx-auto font-serif leading-relaxed text-on-surface-variant
              prose-headings:font-serif prose-headings:text-on-surface prose-headings:font-normal
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors
              prose-strong:text-on-surface prose-strong:font-semibold
              prose-blockquote:border-l-primary prose-blockquote:text-on-surface prose-blockquote:font-style-italic
            ">
              <Suspense fallback={<div className="animate-pulse h-32 bg-surface-container rounded-xl"></div>}>
                <MarkdownRenderer content={post.content} />
              </Suspense>
            </div>
          </AnimatedSection>
        </article>
      </main>

      <Footer />
    </div>
  );
}
