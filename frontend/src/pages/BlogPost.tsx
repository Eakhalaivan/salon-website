import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { TextReveal } from '../components/ui/TextReveal';

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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const response = await axiosClient.get(`/api/v1/content/blog/${slug}`);
      return response.data as BlogPost;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center space-y-6">
        <h1 className="text-display-sm font-serif text-error">Article Not Found</h1>
        <p className="text-body-lg text-on-surface-variant">The article you are looking for has been moved or no longer exists.</p>
        <Link to="/blog" className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-600 transition-colors">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-24 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <Link to="/blog" className="inline-flex items-center text-label-md text-on-surface-variant hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
        </Link>
        
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
            <div className="w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-16 relative glass-panel">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay z-10" />
              <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </AnimatedSection>
        )}
        
        <AnimatedSection variant="fade" delay={0.6}>
          <div className="prose prose-lg max-w-none mx-auto font-serif leading-relaxed text-on-surface-variant
            prose-headings:font-serif prose-headings:text-on-surface prose-headings:font-normal
            prose-a:text-primary hover:prose-a:text-primary-600 prose-a:transition-colors
            prose-strong:text-on-surface prose-strong:font-semibold
            prose-blockquote:border-l-primary prose-blockquote:text-on-surface prose-blockquote:font-style-italic
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </AnimatedSection>
      </div>
    </article>
  );
}
