export const SITE = {
  name: 'TibaDesk',
  legalName: 'TibaDesk by KADETECH',
  tagline: 'On-premise hospital management for Tanzanian facilities.',
  contact: {
    phone: '+255 623 173 537',
    phoneHref: 'tel:+255623173537',
    whatsapp: 'https://wa.me/255623173537',
    email: 'kadetech.online@gmail.com',
    address: {
      line1: 'Sharif PBZ House, Floor 3',
      line2: 'Nyerere Square',
      city: 'Dodoma',
      country: 'Tanzania',
    },
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Sharif%20PBZ%20House%2C%20Nyerere%20Square%2C%20Dodoma%2C%20Tanzania',
    /** Every number TibaDesk answers on, in display order. */
    phones: [
      { label: 'TibaDesk', number: '+255 623 173 537', href: 'tel:+255623173537' },
      { label: 'KADETECH', number: '+255 750 731 387', href: 'tel:+255750731387' },
    ],
  },
  /**
   * KADETECH profile URLs. Left empty until the real accounts exist, so the
   * footer never links out to a bare platform homepage that is not ours.
   */
  social: {
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN ?? '',
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK ?? '',
    x: import.meta.env.VITE_SOCIAL_X ?? '',
  },
};

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Packages', to: '/packages' },
  { label: 'Compare', to: '/compare' },
  { label: 'Modules', to: '/modules' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export const LICENCE_TERMS = [
  { key: '3-months', months: 3, label: '3 months' },
  { key: '6-months', months: 6, label: '6 months' },
  { key: '12-months', months: 12, label: '1 year' },
];

/**
 * Photography. Every image must show African or Tanzanian people and a local
 * healthcare setting, never a Western subject.
 */
export const EDITION_IMAGES = {
  'dental-clinic': {
    src: '/images/tanzania-dental.jpg',
    alt: 'Dentist working with a patient in a dental surgery room',
  },
  'eye-clinic': {
    src: '/images/tanzania-eye.jpg',
    alt: 'Ophthalmologist examining a patient at an eye clinic',
  },
  pharmacy: {
    src: '/images/tanzania-pharmacy.jpg',
    alt: 'Pharmacist dispensing medicines at a pharmacy counter',
  },
  polyclinic: {
    src: '/images/tanzania-polyclinic.jpg',
    alt: 'Doctor and nurse attending to a patient in a consultation room',
  },
  hospital: {
    src: '/images/tanzania-hospital.jpg',
    alt: 'Bombo Regional Hospital in Tanga, Tanzania',
  },
};
