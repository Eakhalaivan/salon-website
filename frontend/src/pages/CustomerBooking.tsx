import { useEffect, useCallback, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useServicesQuery, useCreateAppointmentMutation } from '../hooks/api/useAppointments';
import { useMyProfileQuery } from '../hooks/api/useCustomers';
import { useAiRecommendations } from '../hooks/api/useAi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { transitionSpring } from '../utils/motion';
import clsx from 'clsx';
import {
  useBookingStore,
  BOOKING_STEPS,
  type BookingStep,
} from '../store/useBookingStore';

const steps = [
  { id: BOOKING_STEPS.CATEGORY, name: 'Category' },
  { id: BOOKING_STEPS.SPECIALIST, name: 'Specialist' },
  { id: BOOKING_STEPS.RITUAL, name: 'Ritual' },
  { id: BOOKING_STEPS.TIME, name: 'Time' },
];

const CATEGORY_AESTHETICS: Record<string, { icon: string; image: string }> = {
  Massage: { icon: 'spa', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80' },
  Skin: { icon: 'face', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
  Hair: { icon: 'content_cut', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80' },
  Nails: { icon: 'back_hand', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80' },
  Grooming: { icon: 'face_retouching_natural', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80' },
  default: { icon: 'self_improvement', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80' },
};

export const CustomerBooking = () => {
  // --- Booking wizard state from global store (survives page refresh) ---
  const {
    currentStep,
    selectedSpecialist,
    selectedServices,
    selectedTime,
    setStep,
    setSpecialist,
    toggleService,
    setTime,
    resetBooking,
  } = useBookingStore();

  // --- Server state via TanStack Query (NOT duplicated in Zustand) ---
  const { data: pageData, isLoading: isLoadingServices } = useServicesQuery();
  const services = pageData?.content || [];
  const { data: myProfile } = useMyProfileQuery();
  const { data: recommendations, isLoading: isRecsLoading } = useAiRecommendations();
  const createAppointment = useCreateAppointmentMutation();

  // --- Local ephemeral UI state (no need to persist) ---
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // --- Derive categories from server data (do not store in Zustand) ---
  const uniqueCategories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  // --- Handle query params (from /book/category/:name redirect) ---
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const serviceIdParam = searchParams.get('serviceId');
    if (stepParam) {
      setStep(parseInt(stepParam, 10) as BookingStep);
    }
    if (serviceIdParam) {
      useBookingStore.getState().setServices([parseInt(serviceIdParam, 10)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // --- Handlers ---
  const handleCategorySelect = useCallback(
    (categoryName: string) => {
      navigate(`/book/category/${categoryName.toLowerCase()}`);
    },
    [navigate]
  );

  const handleSpecialistSelect = useCallback(
    (specialistId: number) => {
      setSpecialist(specialistId); // Also advances step to RITUAL in store
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSpecialist]
  );

  const handleServicesConfirm = useCallback(() => {
    if (selectedServices.length === 0) {
      setError('Please select at least one ritual to proceed.');
      return;
    }
    setError(null);
    setStep(BOOKING_STEPS.TIME);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedServices.length, setStep]);

  const handleBook = async () => {
    if (!selectedTime) {
      setError('Please select an elegant moment for your arrival.');
      return;
    }
    setError(null);

    createAppointment.mutate(
      {
        customerId: myProfile?.id,
        branchId: 1,
        services: selectedServices.map((svcId) => ({
          serviceId: svcId,
          staffId: selectedSpecialist || 1,
          startTime: selectedTime,
        })),
        notes: 'Booked via customer portal',
      },
      {
        onSuccess: () => {
          resetBooking(); // Clear wizard state after successful booking
          setSuccess(true);
        },
        onError: (err: any) => {
          let errMsg = 'Failed to book appointment.';
          if (err.response?.data?.message) {
            if (typeof err.response.data.message === 'string') {
              errMsg = err.response.data.message;
            } else if (typeof err.response.data.message === 'object') {
              errMsg = String(Object.values(err.response.data.message)[0]);
            }
          }
          setError(errMsg);
        },
      }
    );
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { y: 0, opacity: 1, transition: { ...transitionSpring } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  if (success) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-[var(--color-background)] relative overflow-hidden p-6 text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/30">
        <div className="absolute inset-0 bg-scrim/80 z-0"></div>
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Spa background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 mix-blend-luminosity"
        />
        <AnimatedSection className="relative z-10 w-full max-w-lg">
          <Card className="glass-panel text-center p-14 bg-[var(--color-surface)]/10 border-[var(--color-border)] backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, ...transitionSpring }}
              className="w-24 h-24 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-float shadow-inner"
            >
              <span className="material-symbols-outlined text-[var(--color-primary)] text-5xl font-light">spa</span>
            </motion.div>
            <h2 className="font-display-lg text-4xl mb-4 text-[#F5F0E6]">Your Sanctuary Awaits</h2>
            <p className="font-body-lg text-[#F5F0E6]/60 mb-10 leading-relaxed">
              Your ritual has been elegantly scheduled. We look forward to guiding you through a moment of complete serenity.
            </p>
            <Button onClick={() => navigate('/customer/dashboard')} size="lg" className="w-full">
              Return to Guest Portal
            </Button>
          </Card>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="dark bg-[var(--color-background)] text-[var(--color-on-surface)] font-body-md overflow-x-hidden min-h-screen flex flex-col selection:bg-[var(--color-primary)]/20">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] transition-all duration-300">
        <nav className="flex justify-between items-center px-6 lg:px-12 py-5 max-w-7xl mx-auto">
          <Link to="/" className="font-display-md text-2xl text-[var(--color-primary)] tracking-widest">LUMINA SPA</Link>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-label-md uppercase tracking-wider transition-colors duration-300 flex items-center gap-2"
          >
            <span className="material-symbols-outlined font-light text-[20px]">west</span>
            Guest Portal
          </button>
        </nav>
      </header>

      <main className="pt-36 pb-24 max-w-5xl mx-auto px-6 w-full flex-grow relative">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-20 px-4">
          <div className="flex justify-between items-center relative mb-6">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/20 -z-10"></div>
            <motion.div
              className="absolute top-1/2 left-0 h-[1px] bg-[var(--color-primary)] -z-10"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            {steps.map((step) => (
              <div
                key={step.id}
                className={clsx(
                  'flex flex-col items-center gap-4 group transition-all duration-300',
                  step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
                onClick={() => step.id < currentStep && setStep(step.id as BookingStep)}
              >
                <motion.div
                  layout
                  className={clsx(
                    'w-3 h-3 rounded-full transition-all duration-500',
                    step.id === currentStep
                      ? 'bg-[var(--color-primary)] ring-4 ring-primary/20 scale-125'
                      : step.id < currentStep
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                  )}
                />
                <span
                  className={clsx(
                    'font-label-sm text-xs tracking-widest uppercase transition-colors duration-300',
                    step.id === currentStep
                      ? 'text-[var(--color-primary)] font-semibold'
                      : step.id < currentStep
                      ? 'text-[var(--color-on-surface-variant)]'
                      : 'text-[var(--color-outline)]'
                  )}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <AnimatedSection>
            <div className="max-w-3xl mx-auto mb-10 bg-error/10 text-error p-4 rounded-xl border border-error/20 text-center font-body-md shadow-sm">
              {error}
            </div>
          </AnimatedSection>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Category */}
          {currentStep === BOOKING_STEPS.CATEGORY && (
            <motion.section key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-16">
                <h1 className="font-display-md text-4xl md:text-5xl text-[var(--color-on-surface)] mb-6">Begin Your Journey</h1>
                <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl mx-auto leading-relaxed">
                  Select an area of focus to discover rituals tailored to your personal restoration.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {uniqueCategories.map((categoryName) => {
                  const aesthetics = CATEGORY_AESTHETICS[categoryName] || CATEGORY_AESTHETICS['default'];
                  return (
                    <motion.div
                      key={categoryName}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      onClick={() => handleCategorySelect(categoryName)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-2xl transition-shadow bg-[var(--color-surface)] relative"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[var(--color-on-background)]/20 z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                        <img src={aesthetics.image} alt={categoryName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-6 text-center relative z-20 bg-[var(--color-surface)]">
                        <div className="w-12 h-12 bg-[var(--color-primary)]/5 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-primary)] group-hover:text-[#F5F0E6] transition-colors duration-300">
                          <span className="material-symbols-outlined font-light text-[24px]">{aesthetics.icon}</span>
                        </div>
                        <h3 className="font-display-sm text-xl text-[var(--color-on-surface)]">{categoryName}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Step 2: Specialist */}
          {currentStep === BOOKING_STEPS.SPECIALIST && (
            <motion.section key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-16">
                <h1 className="font-display-md text-4xl md:text-5xl text-[var(--color-on-surface)] mb-6">Choose Your Guide</h1>
                <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl mx-auto leading-relaxed">
                  Select a specialist whose expertise aligns with your desired experience.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((id) => (
                  <motion.div
                    key={id}
                    whileHover={{ y: -5 }}
                    className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-sm hover:shadow-xl transition-all text-center relative overflow-hidden group"
                  >
                    <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-surface shadow-md relative z-10">
                      <img
                        src={`https://i.pravatar.cc/300?img=${id + 20}`}
                        alt="Staff"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-display-sm text-2xl text-[var(--color-on-surface)] mb-2">Artisan {id}</h3>
                    <p className="font-label-sm text-xs text-[var(--color-primary)] uppercase tracking-widest mb-8">Master Therapist</p>
                    <Button variant="outline" onClick={() => handleSpecialistSelect(id)} className="w-full opacity-80 group-hover:opacity-100">
                      Select Artisan
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Step 3: Ritual (Services) */}
          {currentStep === BOOKING_STEPS.RITUAL && (
            <motion.section key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-16">
                <h1 className="font-display-md text-4xl md:text-5xl text-[var(--color-on-surface)] mb-6">Curate Your Ritual</h1>
                <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl mx-auto leading-relaxed">
                  Combine treatments to design a personalized experience of complete renewal.
                </p>
              </div>

              {isLoadingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-8">
                      <div className="flex justify-between mb-4">
                        <Skeleton className="w-1/2 h-6" />
                        <Skeleton className="w-16 h-6" />
                      </div>
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-3/4 h-4 mb-8" />
                      <Skeleton className="w-24 h-4" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {services.map((svc) => {
                    const isSelected = selectedServices.includes(svc.id);
                    return (
                      <motion.div
                        key={svc.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleService(svc.id)}
                        className={clsx(
                          'cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 relative overflow-hidden',
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0px_10px_30px_rgba(212,175,55,0.1)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:border-[var(--color-primary)]/30'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-primary)]/10 rounded-bl-full flex items-start justify-end p-3">
                            <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">check</span>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-4 pr-6">
                          <h3 className="font-display-sm text-xl text-[var(--color-on-surface)] leading-tight">{svc.name}</h3>
                          <span className="text-[var(--color-primary)] font-display-sm text-xl">₹{svc.price}</span>
                        </div>
                        <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8 line-clamp-2">{svc.description}</p>
                        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] font-label-sm uppercase tracking-widest text-xs">
                          <span className="material-symbols-outlined font-light text-[16px]">schedule</span>
                          {svc.durationMins} min
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* AI Recommendations */}
              {!isRecsLoading && recommendations && recommendations.length > 0 && (
                <div className="mb-16">
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">auto_awesome</span>
                    <h3 className="font-display-md text-2xl text-[var(--color-on-surface)]">Recommended For You</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((rec) => {
                      const isSelected = selectedServices.includes(rec.serviceId);
                      return (
                        <Card 
                          key={`rec-${rec.serviceId}`} 
                          className={clsx(
                            "p-6 cursor-pointer border-2 transition-all duration-300 relative",
                            isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50"
                          )}
                          onClick={() => toggleService(rec.serviceId)}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--color-primary)]/10 rounded-bl-full flex items-start justify-end p-2">
                              <span className="material-symbols-outlined text-[var(--color-primary)] text-[16px]">check</span>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-display-sm text-xl text-[var(--color-on-surface)]">{rec.name}</h4>
                            <span className="text-[var(--color-primary)] font-display-sm">₹{rec.price}</span>
                          </div>
                          <p className="font-body-md text-[var(--color-on-surface-variant)] mb-6 text-sm italic">"{rec.rationale}"</p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button onClick={handleServicesConfirm} size="lg" className="px-12 shadow-[0px_10px_30px_rgba(212,175,55,0.2)]">
                  Continue to Scheduling
                </Button>
              </div>
            </motion.section>
          )}

          {/* Step 4: Time Selection */}
          {currentStep === BOOKING_STEPS.TIME && (
            <motion.section key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <div className="text-center mb-16">
                <h1 className="font-display-md text-4xl md:text-5xl text-[var(--color-on-surface)] mb-6">Select a Moment</h1>
                <p className="font-body-lg text-[var(--color-on-surface-variant)] max-w-xl mx-auto leading-relaxed">
                  Choose the perfect time for your sanctuary experience.
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <Card className="p-10 md:p-14 border-[var(--color-border)] shadow-xl bg-[var(--color-surface)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-primary)]/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                  <div className="mb-10 text-center">
                    <h3 className="font-label-md text-sm text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Available Slots</h3>
                    <p className="font-display-sm text-2xl text-[var(--color-on-surface)]">
                      Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                    {['10:00:00', '12:00:00', '14:00:00', '16:00:00'].map((time) => {
                      const today = new Date();
                      const isoString = `${today.toISOString().split('T')[0]}T${time}`;
                      const isSelected = selectedTime === isoString;
                      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      });
                      return (
                        <motion.button
                          key={time}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTime(isoString)}
                          className={clsx(
                            'py-4 rounded-xl border text-center transition-all duration-300 font-display-sm text-lg',
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[#F5F0E6] shadow-[0px_8px_20px_rgba(212,175,55,0.3)]'
                              : 'border-[var(--color-border)] text-[var(--color-on-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5'
                          )}
                        >
                          {displayTime}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="pt-8 border-t border-[var(--color-border)]">
                    <Button
                      onClick={handleBook}
                      disabled={createAppointment.isPending}
                      size="lg"
                      className="w-full h-16 text-lg shadow-[0px_10px_30px_rgba(212,175,55,0.2)]"
                    >
                      {createAppointment.isPending ? (
                        <>
                          <span className="material-symbols-outlined animate-spin mr-3 font-light">progress_activity</span>
                          Securing Ritual...
                        </>
                      ) : (
                        'Confirm Reservation'
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
