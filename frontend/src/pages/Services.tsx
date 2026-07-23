import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { transitionSpring } from '../utils/motion';


const categories = [
  { name: 'Massage', icon: 'spa', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1600&q=80', description: 'Rejuvenate your body with our signature massage therapies.' },
  { name: 'Skin', icon: 'face', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80', description: 'Advanced facial treatments for a radiant, youthful glow.' },
  { name: 'Hair', icon: 'content_cut', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80', description: 'Expert styling, coloring, and holistic hair restoration.' },
  { name: 'Nails', icon: 'back_hand', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80', description: 'Luxurious manicures and pedicures with premium finishes.' },
  { name: 'Grooming', icon: 'face_retouching_natural', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1600&q=80', description: 'Refined grooming rituals tailored for gentlemen.' },
];

export default function Services() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ...transitionSpring } }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="font-display-lg text-4xl md:text-5xl text-primary">Our Rituals</h1>
        </div>

        <p className="font-body-lg text-on-surface-variant max-w-2xl mb-16 leading-relaxed">
          Discover a world of tranquility. Our meticulously curated services are designed to harmonize your body, mind, and spirit using the finest sustainable products and time-honored techniques.
        </p>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map(cat => (
            <motion.div key={cat.name} variants={itemVariants} className="h-full">
              <Card tilt className="h-full bg-surface rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 transition-all duration-500 group flex flex-col cursor-pointer" onClick={() => navigate(`/book/category/${cat.name}`)}>
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute top-4 right-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center z-20 text-primary">
                    <span className="material-symbols-outlined font-light">{cat.icon}</span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="font-display-md text-2xl text-on-surface mb-3 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="font-body-md text-on-surface-variant mb-6 flex-grow">{cat.description}</p>
                  
                  <div className="flex items-center text-primary font-label-md uppercase tracking-wider text-sm group-hover:translate-x-2 transition-transform duration-300">
                    Explore Rituals <span className="material-symbols-outlined ml-2 text-[18px]">east</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-24 text-center">
          <h2 className="font-display-md text-3xl mb-6 text-on-surface">Ready for your transformation?</h2>
          <Button size="lg" onClick={() => navigate('/book')} className="px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-primary/20 transition-all">
            Book an Appointment
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
