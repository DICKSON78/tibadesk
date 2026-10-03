import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Rating,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Security as InsuranceIcon,
  ShoppingBag as ShopIcon,
  Visibility as EyeIcon,
  Healing as TreatmentIcon,
  Lens as ContactLensIcon,
  Groups as OutreachIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  EmojiEvents as AwardIcon,
  LocalHospital as HospitalIcon,
  Verified as VerifiedIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Favorite as FavoriteIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  PlayArrow as PlayIcon,
  Google as GoogleIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Map as MapIcon,
  ChildCare as ChildCareIcon,
  WaterDrop as WaterDropIcon,
  MedicalServices as MedicalServicesIcon,
  MenuBook as MenuBookIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './components/SEO';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Enhanced Color Scheme - Blue/Teal Theme
const colors = {
  primary: '#1E88E5',
  primaryLight: '#4FC3F7',
  primaryDark: '#1565c0',
  secondary: '#00ACC1',
  secondaryLight: '#4dd0e1',
  secondaryDark: '#0097a7',
  white: '#FFFFFF',
  offWhite: '#F5FAFF',
  lightGray: '#E9ECEF',
  mediumGray: '#DEE2E6',
  textPrimary: '#0D2B45',
  textSecondary: '#7A8A9A',
  textDarkGray: '#4A4A4A',
  darkCharcoal: '#0D2B45',
  borderLight: '#E0EAF3',
  success: '#2ECC71',
  info: '#00ACC1',
  warning: '#FFC107',
};

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const quickLinksRef = useRef(null);
  const whyChooseRef = useRef(null);
  const videoRef = useRef(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  // GSAP Animations
  useEffect(() => {
    // Hero animation - only animate position, keep opacity at 1 for full visibility (like Quick Access Services)
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      // Ensure all elements start fully visible - don't let GSAP touch opacity
      gsap.set(heroElements, { opacity: 1, y: 0 });
      // Only animate y position - opacity stays at 1 (matching Quick Access Services visibility)
      gsap.from(heroElements, {
        y: 30, // Only animate y, opacity is not in the animation object so it won't be touched
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        force3D: true,
      });
    }

    // Quick links animation - only animate position/scale, keep opacity at 1
    if (quickLinksRef.current) {
      const quickLinkCards = quickLinksRef.current.querySelectorAll('.quick-link-card');
      gsap.set(quickLinkCards, { opacity: 1 });
      gsap.from(quickLinkCards, {
        scrollTrigger: {
          trigger: quickLinksRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        scale: 0.9,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      });
    }

    // Why Choose animation - only animate position, keep opacity at 1
    if (whyChooseRef.current) {
      const whyChooseCards = whyChooseRef.current.querySelectorAll('.why-choose-card');
      gsap.set(whyChooseCards, { opacity: 1 });
      gsap.from(whyChooseCards, {
        scrollTrigger: {
          trigger: whyChooseRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const quickLinks = [
    {
      icon: <CalendarIcon sx={{ fontSize: 32 }} />,
      title: 'Book Appointment',
      subtitle: 'Book your comprehensive eye examination online in seconds',
      description: '',
      color: colors.primary,
      route: '/appointment',
      buttonText: 'Book Now',
    },
    {
      icon: <StarIcon sx={{ fontSize: 32 }} />,
      title: 'Rate Us',
      subtitle: 'Share your experience and help us improve our services',
      description: '',
      color: colors.secondary,
      route: 'https://g.page/r/CWNj2_Hl76OhEBM/review',
      buttonText: 'Rate Us',
      external: true,
    },
    {
      icon: <ShopIcon sx={{ fontSize: 32 }} />,
      title: 'Shop Eyewear',
      subtitle: 'Browse our collection of designer frame and lenses',
      description: '',
      color: colors.success,
      route: '/gallery', // Eyeware Gallery
      buttonText: 'Shop Now',
    },
  ];

  const services = [
    {
      icon: <EyeIcon sx={{ fontSize: 48 }} />,
      title: 'Comprehensive Eye Examination',
      description: 'Complete eye health assessment using advanced diagnostic technology. Our certified optometrists perform thorough examinations to evaluate your vision, detect eye diseases early, and ensure optimal eye health. We use state-of-the-art equipment for accurate diagnosis and personalized care.',
      features: [
        'Complete Vision Assessment',
        'Digital Retinal Imaging',
        'Glaucoma Screening',
        'Intraocular Pressure Testing',
        'Visual Field Analysis',
      ],
      color: colors.primary,
    },
    {
      icon: <EyeIcon sx={{ fontSize: 48 }} />,
      title: 'Vision Screening & Testing',
      description: 'Professional vision screening services to assess visual acuity, color vision, depth perception, and eye coordination. Early detection of vision problems helps prevent complications and ensures timely intervention. Our comprehensive testing covers all aspects of visual function.',
      features: [
        'Visual Acuity Testing',
        'Color Vision Assessment',
        'Depth Perception Evaluation',
        'Eye Movement Analysis',
        'Binocular Vision Testing',
      ],
      color: colors.secondary,
    },
    {
      icon: <TreatmentIcon sx={{ fontSize: 48 }} />,
      title: 'Eye Disease Diagnosis & Treatment',
      description: 'Advanced diagnosis and treatment of various eye conditions including cataracts, glaucoma, diabetic retinopathy, macular degeneration, and dry eye syndrome. Our experienced ophthalmologists provide comprehensive care with access to the latest treatment options and surgical interventions when needed.',
      features: [
        'Advanced Diagnostic Imaging',
        'Medical Treatment Plans',
        'Surgical Referrals',
        'Disease Monitoring',
        'Preventive Care',
      ],
      color: colors.info,
    },
    {
      icon: <EyeIcon sx={{ fontSize: 48 }} />,
      title: 'Prescription Services',
      description: 'Precise prescription determination for eyeglasses and contact lenses using modern refraction equipment. Our optometrists perform detailed assessments to identify refractive errors and provide accurate prescriptions for optimal vision correction.',
      features: [
        'Digital Refraction',
        'Prescription Accuracy',
        'Refractive Error Analysis',
        'Lens Power Calculation',
        'Progressive Lens Fitting',
      ],
      color: colors.success,
    },
    {
      icon: <ShopIcon sx={{ fontSize: 48 }} />,
      title: 'Eyewear & Optical Services',
      description: 'Complete optical services including prescription eyeglasses, contact lenses, and ophthalmic medications. We offer a wide selection of designer frames, premium lenses, and professional fitting services. Our certified opticians ensure perfect fit and optimal vision correction.',
      features: [
        'Designer Frame Selection',
        'Premium Lens Options',
        'Professional Frame Fitting',
        'Contact Lens Services',
        'Optical Accessories',
      ],
      color: colors.warning,
    },
    {
      icon: <OutreachIcon sx={{ fontSize: 48 }} />,
      title: 'Community Eye Health Programs',
      description: 'Dedicated community outreach programs to promote eye health awareness and provide accessible eye care services. We conduct free screenings, educational workshops, and collaborate with schools and organizations to improve community eye health and prevent vision loss.',
      features: [
        'Free Vision Screenings',
        'Health Education Workshops',
        'School Vision Programs',
        'Community Partnerships',
        'Preventive Eye Care',
      ],
      color: colors.primaryDark,
    },
  ];

  const whyChooseUs = [
    {
      image: '/images/eye_exam.jpeg',
      title: 'Advanced Eye Examinations',
      description: 'State-of-the-art diagnostic technology combined with years of clinical experience. Our comprehensive eye examinations use the latest equipment to detect vision problems early and ensure your eyes remain healthy. We tailor each examination to your individual needs and medical history.',
      color: colors.primary,
      route: '/services',
    },
    {
      image: '/images/eyecare.jpeg',
      title: 'Professional Vision Care',
      description: 'Expert care from certified optometrists and ophthalmologists. We provide comprehensive vision care services including routine check-ups, emergency care, and specialized treatments. Your vision health is our top priority, and we work with you to maintain optimal eye health.',
      color: colors.secondary,
      route: '/services',
    },
    {
      image: '/images/disease.jpeg',
      title: 'Disease Prevention & Treatment',
      description: 'Early detection and treatment of eye diseases to prevent vision loss. We screen for conditions like glaucoma, diabetic retinopathy, cataracts, and macular degeneration. Our proactive approach helps preserve your vision and prevents serious complications.',
      color: colors.info,
      route: '/services',
    },
    {
      image: '/images/lens_fitting.jpeg',
      title: 'Precision Prescriptions',
      description: 'Accurate prescription services for eyeglasses and contact lenses. Using advanced refraction technology, we determine the exact prescription you need for clear, comfortable vision. Our certified opticians ensure perfect fit and optimal visual correction.',
      color: colors.success,
      route: '/services',
    },
    {
      image: '/images/eyeware.jpeg',
      title: 'Quality Eyewear Solutions',
      description: 'Wide selection of designer frames, premium lenses, and contact lenses. We offer complete optical services including frame fitting, lens selection, and ongoing care. Our eyewear solutions combine fashion, function, and optimal vision correction.',
      color: colors.warning,
      route: '/services',
    },
    {
      image: '/images/dryeye.jpeg',
      title: 'Community Health Initiatives',
      description: 'Committed to improving eye health in our community. We provide free screenings, educational programs, and outreach services to underserved populations. Our community programs help prevent vision loss and promote eye health awareness.',
      color: colors.primaryDark,
      route: '/services',
    },
  ];

  const stats = [
    { number: '24/7', label: 'Online Booking' },
    { number: '5+', label: 'Years Experience' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <Box sx={{ bgcolor: colors.white, minHeight: '100vh', pt: { xs: '56px', sm: '64px' } }}>
      <SEO
        title="BestVision Eyecare - Premier Eye Care Clinic in Tanzania | Comprehensive Eye Examinations"
        description="BestVision Eyecare is the leading eye care clinic in Dar es Salaam, Tanzania. We offer comprehensive eye examinations, diagnosis & treatment of eye disorders, spectacles dispensing, contact lens fitting, and community eye outreach programs. Book your appointment today!"
        keywords="eye care Tanzania, optometrist Dar es Salaam, eye examination, eye clinic, contact lens fitting, spectacles Tanzania, eye treatment, BestVision Eyecare, eye doctor Tanzania, vision care, comprehensive eye exam, eye disorders treatment"
      />
      <Navbar />

      {/* Hero Section with Image Carousel */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '85vh' },
          color: colors.textPrimary,
          pt: { xs: 3, sm: 4, md: 0 },
          pb: { xs: 2, sm: 3, md: 0 },
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          width: '100%',
          backgroundImage: 'url(/images/clinic_exterior_with_insurance_promo.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'left center' },
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(232, 244, 248, 0.7) 0%, rgba(240, 232, 255, 0.7) 100%)',
            zIndex: 0,
            pointerEvents: 'none',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
                    zIndex: 1,
            pointerEvents: 'none',
                  },
                }}
              >
        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', gap: 0, height: { xs: 'auto', md: '85vh' }, alignItems: 'stretch', overflow: 'hidden', margin: 0, padding: 0 }}>
          {/* Left Content Section with Container - First on Mobile */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 50%' }, position: 'relative', height: { xs: 'auto', md: '100%' }, display: 'flex', alignItems: 'center', minHeight: { xs: 'auto', sm: 'auto', md: 'auto' } }}>
            <Container maxWidth="xl" sx={{ pr: { xs: 2, sm: 3, md: 4 }, pl: { xs: 2, sm: 3, md: 8 }, py: { xs: 3, sm: 4, md: 6 }, width: '100%', height: { xs: 'auto', md: '100%' }, display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 'auto', md: '100%' },
                  display: 'flex',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  minHeight: { xs: 'auto', sm: 'auto', md: 'auto' },
                  py: { xs: 2, sm: 3, md: 0 },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 3, width: '100%' }}>
              <Typography
                className="hero-animate"
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 900,
                  lineHeight: { xs: 1.3, sm: 1.2, md: 1.2 },
                  mb: { xs: 1, sm: 1.25, md: 1 },
                  letterSpacing: '-0.02em',
                  color: '#1E88E5 !important',
                  opacity: 1,
                  textShadow: '0 2px 8px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  wordBreak: 'break-word',
                }}
              >
                THE CARE YOUR EYES DESERVE.
              </Typography>
              <Typography
                className="hero-animate"
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.05rem' },
                  fontWeight: 500,
                  lineHeight: { xs: 1.5, sm: 1.6, md: 1.6 },
                  mb: { xs: 2, sm: 2.25, md: 2 },
                  color: '#4A4A4A !important',
                  opacity: 1,
                  textShadow: '0 1px 4px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.08)',
                  wordBreak: 'break-word',
                }}
              >
                One of the best eye clinics in Dar es Salaam, delivering expert eye care through precision, advanced technology, and trust. Your vision is our priority.
              </Typography>

              <Stack
                className="hero-animate"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.25, sm: 2 }}
                sx={{ mb: { xs: 2.5, sm: 3, md: 2.5 }, opacity: 1, width: '100%' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/appointment')}
                  sx={{
                    bgcolor: '#00ACC1',
                    color: 'white !important',
                    fontWeight: 600,
                    px: { xs: 2.5, sm: 3.5, md: 4 },
                    py: { xs: 1.1, sm: 1.5 },
                    fontSize: { xs: '0.8125rem', sm: '0.95rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: '#0097a7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Book Appointment Now
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  onClick={() => setPhoneDialogOpen(true)}
                  sx={{
                    borderColor: '#00ACC1',
                    color: '#00ACC1',
                    bgcolor: 'white',
                    fontWeight: 600,
                    px: { xs: 2.5, sm: 3.5, md: 4 },
                    py: { xs: 1.1, sm: 1.5 },
                    fontSize: { xs: '0.8125rem', sm: '0.95rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    borderWidth: 2,
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderColor: '#00ACC1',
                      bgcolor: '#00ACC1',
                      color: 'white !important',
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Call us now
                </Button>
              </Stack>

              <Box className="hero-animate" sx={{ opacity: 1, mt: { xs: 2.5, sm: 3, md: 2.5 }, width: '100%' }}>
                <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} justifyContent="center" alignItems="flex-start">
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 4 }} key={index}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          opacity: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          height: '100%',
                          px: { xs: 0.5, sm: 1, md: 0 },
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.5rem' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            mb: { xs: 0.25, sm: 0.35, md: 0.5 },
                            opacity: 1,
                            color: '#1E88E5 !important',
                            display: 'block',
                            textShadow: '0 2px 6px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {stat.number}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.95rem' },
                            fontWeight: 600,
                            lineHeight: { xs: 1.3, sm: 1.4, md: 1.4 },
                            opacity: 1,
                            color: '#4A4A4A !important',
                            display: 'block',
                            textAlign: 'center',
                            textShadow: '0 1px 3px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.08)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Right Video Section - Full Width - Second on Mobile */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 50%' },
              position: 'relative',
              display: 'flex',
              height: { xs: '300px', sm: '350px', md: '100%' },
              minHeight: { xs: '300px', sm: '350px', md: 'auto' },
              alignItems: 'stretch',
              marginTop: { xs: 0, md: 0 },
              marginBottom: { xs: 0, md: 0 },
              marginRight: { xs: 0, md: 0 },
              width: '100%',
            }}
          >
            <Box
              className="hero-animate"
              sx={{
                position: 'relative',
                borderRadius: { xs: 0, md: '0' },
                overflow: 'hidden',
                boxShadow: 'none',
                height: '100%',
                width: '100%',
                border: {
                  xs: '3px solid rgba(255, 255, 255, 0.8)',
                  sm: '4px solid rgba(255, 255, 255, 0.8)',
                  md: '5px solid rgba(255, 255, 255, 0.8)',
                  lg: '6px solid rgba(255, 255, 255, 0.8)'
                },
                margin: 0,
                padding: 0,
              }}
            >
              {/* Video Player */}
              <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                margin: 0,
                padding: {
                  xs: '8px 4px 8px 0', // Top 8px, Right 4px, Bottom 8px, Left 0
                  sm: '12px 6px 12px 0', // Slightly more spacing on larger screens
                  md: '16px 8px 16px 0', // More spacing on medium screens
                  lg: '20px 10px 20px 0' // Even more spacing on large screens
                }
              }}>
                <Box
                  component="video"
                  ref={videoRef}
                  src="/images/home_bg_video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    margin: 0,
                    padding: 0,
                    borderRadius: {
                      xs: '4px',
                      sm: '6px',
                      md: '8px'
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Quick Links Section - Enhanced */}
      <Box ref={quickLinksRef} sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Quick Access
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Quick Access
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Fast, convenient access to our most popular services and features. Everything you need for comprehensive eye care in one place.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {quickLinks.map((link, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  className="quick-link-card"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${link.color}15 0%, ${link.color}08 100%)`,
                    border: `2px solid ${link.color}30`,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: `${link.color}10`,
                      transform: 'scaleY(0)',
                      transformOrigin: 'bottom',
                      transition: 'transform 0.4s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 16px 40px ${link.color}40`,
                      borderColor: link.color,
                      '&::before': {
                        transform: 'scaleY(1)',
                      },
                      '& .quick-link-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: link.color,
                        color: 'white',
                      },
                      '& .quick-link-button': {
                        bgcolor: link.color,
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => {
                    if (link.external) {
                      window.open(link.route, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(link.route);
                    }
                  }}
                >
                  <Box
                    className="quick-link-icon"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: link.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 16px ${link.color}40`,
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: `${colors.darkCharcoal} !important`,
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    {link.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      color: `${colors.textDarkGray} !important`,
                      lineHeight: 1.7,
                      mb: 3,
                      textAlign: 'center',
                      flexGrow: 1,
                    }}
                  >
                    {link.subtitle}
                  </Typography>
                  <Button
                    className="quick-link-button"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (link.external) {
                        window.open(link.route, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(link.route);
                      }
                    }}
                    sx={{
                      bgcolor: `${link.color}20`,
                      color: link.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      width: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: link.color,
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.buttonText}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section - Enhanced Grid - Light Blue/Purple Gradient */}
      <Box
        ref={whyChooseRef}
        sx={{
          py: { xs: 4, md: 5 },
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.secondary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Services
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', md: '1rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Excellence in eye care through advanced technology, experienced professionals, and personalized service tailored to your unique vision needs.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {whyChooseUs.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  className="why-choose-card"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3.5,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `2px solid ${colors.lightGray}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
                      borderColor: item.color,
                    },
                  }}
                  onClick={() => item.route && navigate(item.route)}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      mx: 'auto',
                      mb: 2.5,
                      transition: 'all 0.3s ease',
                      border: `3px solid ${item.color}30`,
                      boxShadow: `0 4px 16px ${item.color}20`,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 6px 20px ${item.color}40`,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/clinic_examination_room_equipment.jpeg';
                        e.target.onerror = null;
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: `${colors.darkCharcoal} !important`,
                      mb: 1.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.95rem',
                      color: `${colors.textDarkGray} !important`,
                      lineHeight: 1.7,
                      mb: 2,
                      flexGrow: 1,
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.route) navigate(item.route);
                    }}
                    sx={{
                      color: item.color,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      mt: 'auto',
                      '&:hover': {
                        bgcolor: `${item.color}10`,
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Learn More
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us & Order Books Section - Two Column Layout */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: colors.white,
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
            {/* Left Side - Why Choose Us */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    fontWeight: 800,
                    color: `${colors.darkCharcoal} !important`,
                    mb: 3,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Why Choose Us
                </Typography>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      State-of-the-art diagnostic equipment
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Certified eye care professionals
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Comprehensive vision care services
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Convenient location with easy access
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Extensive collection of quality eyewear
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right Side - Order Books/Journal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  p: { xs: 4, md: 5 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
                  border: `2px solid ${colors.borderLight}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    borderColor: colors.primary,
                  },
                }}
              >
                {/* Book Image Background */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: '40%', md: '45%' },
                    height: '100%',
                    opacity: 0.15,
                    zIndex: 0,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'url(/images/professional_man_at_desk.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    },
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/professional_man_at_desk.jpeg"
                    alt="Jicho Book"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.src = '/images/professional_man_at_desk.jpeg';
                      e.target.onerror = null;
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 800,
                    color: `${colors.darkCharcoal} !important`,
                    mb: 2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Order Books/Journal
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: `${colors.textDarkGray} !important`,
                    lineHeight: 1.7,
                    mb: 3,
                  }}
                >
                  Access our comprehensive collection of eye care books and journals. Stay updated with the latest research, treatment protocols, and clinical guidelines in ophthalmology and optometry.
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Latest research publications
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Clinical practice guidelines
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Educational resources for professionals
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/books')}
                  sx={{
                    bgcolor: colors.primary,
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: `0 4px 16px ${colors.primary}40`,
                    '&:hover': {
                      bgcolor: colors.primaryDark,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${colors.primary}50`,
                    },
                    transition: 'all 0.3s ease',
                    mt: 'auto',
                  }}
                >
                  Order Now
                </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Visit Us Today Section - Map & Building Image */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: colors.white,
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Visit Us Today
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Find Our Location
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Visit our clinic at Natta-Mwanza, Tanzania. We're conveniently located and easily accessible.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            {/* Building Image - Left Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: `1px solid ${colors.borderLight}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500, lg: 600 },
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/clinic_exterior_with_insurance_promo.jpeg"
                    alt="BestVision Eyecare Clinic Building"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                    onError={(e) => {
                      e.target.src = '/images/clinic_interior_corridor_eyewear_display.jpeg';
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        mb: 0.5,
                      }}
                    >
                      BestVision Eyecare Clinic
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                      }}
                    >
                      Natta-Mwanza, Tanzania
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Map - Right Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: `1px solid ${colors.borderLight}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500, lg: 600 },
                    bgcolor: '#f0f0f0',
                  }}
                >
                  <Box
                    component="iframe"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.638!2d39.2752407!3d-6.8275607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!2sSikaf%20Eye%20Care!5e0!3m2!1sen!2stz!4v1704792000000!5m2!1sen!2stz"
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BestVision Eyecare Location - Natta-Mwanza, Tanzania"
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 15, md: 20 },
                      right: { xs: 15, md: 20 },
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<MapIcon />}
                      component="a"
                      href="https://www.google.com/maps/place/Sikaf+Eye+Care/@-6.8275607,39.2752407,17z/data=!4m14!1m7!3m6!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!2sSikaf+Eye+Care!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v!3m5!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v?entry=ttu"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: colors.primary,
                        color: 'white',
                        fontWeight: 700,
                        px: { xs: 2, md: 3 },
                        py: { xs: 1, md: 1.5 },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        boxShadow: `0 4px 16px ${colors.primary}40`,
                        '&:hover': {
                          bgcolor: colors.primaryDark,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${colors.primary}50`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Open in Google Maps
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Phone Number Dialog */}
      <Dialog
        open={phoneDialogOpen}
        onClose={() => setPhoneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#00ACC1' }}>
            Contact Us
          </Typography>
          <IconButton
            onClick={() => setPhoneDialogOpen(false)}
            size="small"
            sx={{
              color: '#666',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <PhoneIcon sx={{ fontSize: 48, color: '#00ACC1', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#1C1C1C' }}>
              +255 678 110 376
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Click the number below to call us directly
            </Typography>
            <Button
              variant="contained"
              component="a"
              href="tel:+255678110376"
              startIcon={<PhoneIcon />}
              sx={{
                bgcolor: '#00ACC1',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0097a7',
                },
              }}
            >
              Call Now
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setPhoneDialogOpen(false)}
            sx={{
              textTransform: 'none',
              color: '#666',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />

      {/* Fixed Social Media Icons - Right Side */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          right: { xs: 8, sm: 12, md: 20 },
          transform: 'translateY(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <IconButton
          component="a"
          href="https://www.instagram.com/bestvision_eyecare"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          sx={{
            bgcolor: '#E4405F',
            color: 'white',
            width: { xs: 36, sm: 40, md: 44 },
            height: { xs: 36, sm: 40, md: 44 },
            borderRadius: '50%',
            boxShadow: '0 3px 10px rgba(228, 64, 95, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#C13584',
              transform: 'scale(1.1)',
              boxShadow: '0 5px 15px rgba(228, 64, 95, 0.6)',
            },
            '& svg': {
              fontSize: { xs: 18, sm: 20, md: 22 },
            },
          }}
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          component="a"
          href="https://wa.me/255678110376"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          sx={{
            bgcolor: '#25D366',
            color: 'white',
            width: { xs: 36, sm: 40, md: 44 },
            height: { xs: 36, sm: 40, md: 44 },
            borderRadius: '50%',
            boxShadow: '0 3px 10px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#20BA5A',
              transform: 'scale(1.1)',
              boxShadow: '0 5px 15px rgba(37, 211, 102, 0.6)',
            },
            '& svg': {
              fontSize: { xs: 18, sm: 20, md: 22 },
            },
          }}
        >
          <WhatsAppIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Home;