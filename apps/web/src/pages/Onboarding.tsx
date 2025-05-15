import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Import design system components
import { 
  Button,
  GradientBanner,
  AnimatedCard,
  FeatureCard,
  FloatingElement
} from '../design-system/components';

// Import animation utilities
import { staggerContainer, fadeIn, slideIn } from '../design-system/animations';

const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<number>(0);
  
  // Refs for scroll-to sections
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll-based animations and navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.3;
      
      // Determine which section is currently in view
      const sections = [
        { ref: heroRef, index: 0 },
        { ref: featuresRef, index: 1 },
        { ref: howItWorksRef, index: 2 },
        { ref: testimonialsRef, index: 3 }
      ];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current && scrollPosition >= section.ref.current.offsetTop) {
          setCurrentSection(section.index);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Smooth scroll to section
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hero Section with animated gradient
  const HeroSection = () => (
    <section 
      ref={heroRef} 
      className="min-h-[calc(100vh-80px)] flex flex-col justify-center relative overflow-hidden"
    >
      <GradientBanner
        height="h-full"
        gradientStart="#0ea5e9"
        gradientEnd="#6366f1"
        wave={false}
        animateGradient={true}
        className="absolute inset-0 -z-10"
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -Math.random() * 200 - 50],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('onboarding.hero.title', 'Share Your Contact Info in Style')}
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-8 text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('onboarding.hero.subtitle', 'Create beautiful digital business cards that make sharing your contact information seamless and impressive.')}
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => navigate('/sign-in')}
              className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
            >
              {t('onboarding.hero.getStartedBtn', 'Get Started')}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection(howItWorksRef)}
              className="border-white text-white hover:bg-white/10"
            >
              {t('onboarding.hero.learnMoreBtn', 'Learn More')}
            </Button>
          </motion.div>
        </div>
        
        {/* Animated mockup */}
        <FloatingElement maxRotate={5} className="mt-16 max-w-md mx-auto">
          <motion.div
            className="rounded-lg overflow-hidden shadow-2xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.8 }}
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 mr-4 overflow-hidden">
                  <svg className="w-full h-full text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Sarah Johnson</h2>
                  <p className="opacity-90">UX Designer</p>
                  <p className="opacity-80 text-sm">InnovateUX Solutions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(555) 123-4567</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>sarah@innovateux.com</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>www.sarahjohnson.design</span>
                </div>
                
                <div className="flex items-start mt-1">
                  <svg className="w-5 h-5 mr-2 opacity-80 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div>123 Innovation Way</div>
                    <div>San Francisco, CA 94107</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </FloatingElement>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );

  // Features section with animated cards
  const FeaturesSection = () => (
    <section 
      ref={featuresRef} 
      className="py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {t('onboarding.features.title', 'Powerful Features')}
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            {t('onboarding.features.subtitle', 'Everything you need to create impressive digital business cards')}
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title={t('onboarding.features.feature1.title', 'Mobile Friendly')}
            description={t('onboarding.features.feature1.description', 'Your digital business card looks great on any device, ensuring a seamless experience for everyone.')}
            accentColor="primary-500"
            index={0}
          />
          
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title={t('onboarding.features.feature2.title', 'Custom Branding')}
            description={t('onboarding.features.feature2.description', 'Personalize your card with photos, logos, and custom colors to match your personal brand.')}
            accentColor="purple-500"
            index={1}
          />
          
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            }
            title={t('onboarding.features.feature3.title', 'One-Click Sharing')}
            description={t('onboarding.features.feature3.description', 'Share your contact details with a simple link or QR code, no app download required.')}
            accentColor="green-500"
            index={2}
          />
          
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title={t('onboarding.features.feature4.title', 'Analytics')}
            description={t('onboarding.features.feature4.description', 'Track views and interactions with your card to measure its effectiveness.')}
            accentColor="amber-500"
            index={3}
          />
          
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title={t('onboarding.features.feature5.title', 'Always Up-to-Date')}
            description={t('onboarding.features.feature5.description', 'Update your information anytime and it's instantly refreshed everywhere your card is shared.')}
            accentColor="rose-500"
            index={4}
          />
          
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title={t('onboarding.features.feature6.title', 'Eco-Friendly')}
            description={t('onboarding.features.feature6.description', 'Replace paper cards with digital alternatives and help reduce waste while making a statement.')}
            accentColor="cyan-500"
            index={5}
          />
        </div>
      </div>
    </section>
  );

  // How it works section with animated steps
  const HowItWorksSection = () => {
    const steps = [
      {
        title: t('onboarding.howItWorks.step1.title', 'Create Your Profile'),
        description: t('onboarding.howItWorks.step1.description', 'Sign up and enter your contact information, upload a photo, and choose a design theme.'),
        icon: (
          <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
      {
        title: t('onboarding.howItWorks.step2.title', 'Preview & Customize'),
        description: t('onboarding.howItWorks.step2.description', 'Preview your digital card in real time and make adjustments until it's perfect.'),
        icon: (
          <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )
      },
      {
        title: t('onboarding.howItWorks.step3.title', 'Share Your Card'),
        description: t('onboarding.howItWorks.step3.description', 'Share via a unique link, QR code, email, or social media with just a few clicks.'),
        icon: (
          <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )
      },
      {
        title: t('onboarding.howItWorks.step4.title', 'Track Engagement'),
        description: t('onboarding.howItWorks.step4.description', 'Monitor how many people view your card and which contact methods they use the most.'),
        icon: (
          <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ];

    return (
      <section 
        ref={howItWorksRef}
        className="py-20 bg-white relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 10 L40 10 M10 0 L10 40" stroke="#3b82f6" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t('onboarding.howItWorks.title', 'How It Works')}
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              {t('onboarding.howItWorks.subtitle', 'Simple process, powerful results')}
            </p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className={`flex flex-col md:flex-row items-center mb-16 last:mb-0 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-10' : 'md:pl-10'}`}>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mr-4">
                      <span className="text-xl font-bold text-primary-600">{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600">{step.description}</p>
                </div>
                
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <AnimatedCard
                    animationVariant={index % 2 === 0 ? "slide" : "fade"}
                    className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100"
                    border={true}
                    shadow="md"
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {step.icon}
                      </div>
                      <div className="text-lg font-medium text-gray-800">{step.title}</div>
                    </div>
                  </AnimatedCard>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Testimonials section
  const TestimonialsSection = () => {
    const testimonials = [
      {
        quote: t('onboarding.testimonials.quote1', "MyNameCard has completely changed how I network. I get compliments on my digital card all the time, and it's so much more convenient than paper cards."),
        author: "Michael Chen",
        title: "Marketing Director",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        quote: t('onboarding.testimonials.quote2', "As a freelancer, having a professional digital card has helped me stand out from the competition. My clients are always impressed when I share my contact info this way."),
        author: "Jessica Miller",
        title: "Graphic Designer",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        quote: t('onboarding.testimonials.quote3', "I love how easy it is to update my information. When I changed jobs recently, I just updated my digital card once and everyone automatically had my new details."),
        author: "David Thompson",
        title: "Sales Executive",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg"
      }
    ];

    return (
      <section 
        ref={testimonialsRef}
        className="py-20 bg-gradient-to-br from-primary-900 to-blue-900 text-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('onboarding.testimonials.title', 'What Our Users Say')}
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-white/80">
              {t('onboarding.testimonials.subtitle', 'Hear from professionals who have transformed their networking experience')}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
              >
                <svg className="w-10 h-10 text-white/60 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                
                <p className="text-lg mb-6">{testimonial.quote}</p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-white/70">{testimonial.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Call to action section
  const CTASection = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {t('onboarding.cta.title', 'Ready to Modernize Your Networking?')}
          </h2>
          <p className="text-xl mb-10 text-gray-600">
            {t('onboarding.cta.subtitle', 'Join thousands of professionals who have already made the switch to digital business cards.')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => navigate('/sign-in')}
            >
              {t('onboarding.cta.createCardBtn', 'Create Your Card Now')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              {t('onboarding.cta.exploreBtn', 'Explore Examples')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Sticky navigation
  const Navigation = () => (
    <motion.nav 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-full shadow-lg px-2 py-1 hidden md:block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <ul className="flex space-x-2">
        {[
          { name: t('onboarding.nav.home', 'Home'), ref: heroRef },
          { name: t('onboarding.nav.features', 'Features'), ref: featuresRef },
          { name: t('onboarding.nav.how', 'How It Works'), ref: howItWorksRef },
          { name: t('onboarding.nav.testimonials', 'Testimonials'), ref: testimonialsRef }
        ].map((item, index) => (
          <li key={index}>
            <button
              onClick={() => scrollToSection(item.ref)}
              className={`px-4 py-2 rounded-full text-sm transition-colors font-medium ${
                currentSection === index 
                  ? 'bg-primary-100 text-primary-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Navigation />
    </div>
  );
};

export default Onboarding;
