import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
} from './components/ui/index.jsx';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Google as GoogleIcon,
  WhatsApp as WhatsAppIcon,
  VideoLibrary as TikTokIcon,
} from './components/ui/icons.jsx';

// Color Scheme
const colors = {
  primaryGold: '#C9B48A',
  primaryOrange: '#FF6B35',
  darkCharcoal: '#1C1C1C',
  offWhite: '#FAFAF8',
  textDarkGray: '#4A4A4A',
  borderLight: '#E6E6E6',
};

const Footer = () => {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' },
  ];

  const services = [
    { label: 'General Dentistry', path: '/services' },
    { label: 'Oral Surgery & Extractions', path: '/services' },
    { label: 'Root Canal Treatment', path: '/services' },
    { label: 'Teeth Cleaning & Scaling', path: '/services' },
    { label: 'Crowns, Bridges & Dentures', path: '/services' },
    { label: 'Orthodontics & Braces', path: '/services' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, label: 'Facebook', url: 'https://www.facebook.com/medicoredental' },
    { icon: <InstagramIcon />, label: 'Instagram', url: 'https://www.instagram.com/medicore_dental?igsh=dGc1YWJhM2FwN3k2&utm_source=qr' },
    { icon: <TikTokIcon />, label: 'TikTok', url: 'https://www.tiktok.com/@medicoredental' },
    { icon: <YouTubeIcon />, label: 'YouTube', url: 'https://youtube.com' },
    { icon: <WhatsAppIcon />, label: 'WhatsApp', url: 'https://wa.me/255678110376' },
  ];

  const FooterLink = ({ to, children }) => {
    // Only render if path exists (all paths in our arrays are valid routes)
    return (
      <Link
        to={to}
        style={{
          color: 'rgba(255,255,255,0.8)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 0',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.color = colors.primaryOrange;
          const arrow = e.target.querySelector('svg');
          if (arrow) {
            arrow.style.transform = 'translateX(4px)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'rgba(255,255,255,0.8)';
          const arrow = e.target.querySelector('svg');
          if (arrow) {
            arrow.style.transform = 'translateX(0)';
          }
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: '14px', color: colors.primaryOrange }} />
        {children}
      </Link>
    );
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: colors.darkCharcoal,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${colors.primaryOrange} 0%, ${colors.primaryOrange}dd 100%)`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 3 }, pb: { xs: 1.5, md: 2 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Column 1: Company Information */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ pr: { md: 2 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: 'white',
                fontSize: { xs: '1.2rem', md: '1.3rem' },
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  color: colors.primaryOrange,
                },
              }}
            >
              Sarah Dental Clinic
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 1.5,
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              Premier Dental Clinic in Tanzania
            </Typography>

            {/* Contact Information */}
            <Stack spacing={1}>
              <Box
                component="a"
                href="https://maps.app.goo.gl/hHiVY3VkJhoY9Xe27?g_st=iwb"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <LocationIcon sx={{ color: colors.primaryOrange, fontSize: '18px', mt: 0.5, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  Natta-Mwanza, Tanzania
                </Typography>
              </Box>
              <Box
                component="a"
                href="tel:+255678110376"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <PhoneIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  +255 678 110 376
                </Typography>
              </Box>
              <Box
                component="a"
                href="https://wa.me/255676506323"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <WhatsAppIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  WhatsApp: +255 678 110 376
                </Typography>
              </Box>
              <Box
                component="a"
                href="mailto:info@medicore-dental.co.tz"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <EmailIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  info@medicore-dental.co.tz
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Column 2: Useful Links */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ px: { md: 1.5 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'white',
              }}
            >
              Useful Links
            </Typography>
            <Stack spacing={0.25}>
              {quickLinks.map((link, index) => (
                <FooterLink key={index} to={link.path}>
                  {link.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Our Services */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ px: { md: 1.5 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'white',
              }}
            >
              Our Services
            </Typography>
            <Stack spacing={0.25}>
              {services.map((service, index) => (
                <FooterLink key={index} to={service.path}>
                  {service.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Connect */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ pl: { md: 2 } }}>
            {/* Google Reviews Button */}
            <Button
              component="a"
              href="https://g.page/r/CWNj2_Hl76OhEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<GoogleIcon sx={{ fontSize: '16px' }} />}
              endIcon={<StarIcon sx={{ fontSize: '14px' }} />}
              sx={{
                mb: 1.5,
                bgcolor: '#4285F4',
                color: 'white',
                fontWeight: 600,
                py: 0.5,
                px: 1.5,
                borderRadius: '4px',
                fontSize: '0.75rem',
                textTransform: 'none',
                height: '32px',
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#357AE8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
                },
              }}
            >
              Rate us
            </Button>

            {/* Social Media */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: '0.85rem',
                color: 'white',
              }}
            >
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    width: { xs: 36, md: 38 },
                    height: { xs: 36, md: 38 },
                    '& svg': { fontSize: { xs: 16, md: 18 } },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: colors.primaryOrange,
                      bgcolor: `${colors.primaryOrange}20`,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Divider
          sx={{
            my: { xs: 1.5, md: 1.5 },
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            pb: 0,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: { xs: '0.75rem', md: '0.85rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            © {new Date().getFullYear()} Sarah Dental Clinic. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              to="/privacy"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Cookie Policy
            </Link>
            <Link
              to="/accessibility"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Accessibility
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;