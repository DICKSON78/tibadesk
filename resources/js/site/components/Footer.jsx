import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { SITE } from '../config';
import { IconHospital, IconPhone, IconMail, IconPin } from './icons';

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Packages', to: '/packages' },
  { label: 'Compare', to: '/compare' },
  { label: 'Modules', to: '/modules' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

const socialLinks = [
  { label: 'LinkedIn', href: SITE.social.linkedin, icon: faLinkedinIn },
  { label: 'Facebook', href: SITE.social.facebook, icon: faFacebookF },
  { label: 'X', href: SITE.social.x, icon: faXTwitter },
].filter((social) => Boolean(social.href));

export default function Footer() {
  const { address } = SITE.contact;

  return (
    <footer className="bg-ink text-white py-16 lg:py-20" id="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <h4 className="text-brand text-xs font-bold tracking-[2px] uppercase mb-5">OFFICE</h4>
            <a
              href={SITE.contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 text-gray-400 text-sm hover:text-white transition-colors"
            >
              <IconPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                {address.line1}
                <br />
                {address.line2}
                <br />
                {address.city}, {address.country}
              </span>
            </a>
          </div>

          <div>
            <h4 className="text-brand text-xs font-bold tracking-[2px] uppercase mb-5">COMPANY</h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand text-xs font-bold tracking-[2px] uppercase mb-5">
              KEEP IN TOUCH
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {SITE.contact.phones.map((phone) => (
                <li key={phone.number}>
                  <a
                    href={phone.href}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <IconPhone className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span>
                      <span className="text-gray-500 text-xs block">{phone.label}</span>
                      <span className="font-semibold">{phone.number}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <IconMail className="w-3.5 h-3.5 text-brand shrink-0" />
                  {SITE.contact.email}
                </a>
              </li>
            </ul>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-all"
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-xs" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-brand text-ink flex items-center justify-center">
                <IconHospital className="w-5 h-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-brand font-bold text-lg tracking-wide">TibaDesk</span>
                <span className="text-white/40 text-[9px] font-semibold tracking-[2px] uppercase mt-1">
                  by KADETECH
                </span>
              </span>
            </Link>
            <p className="text-gray-500 text-xs mt-4 leading-relaxed">
              On-premise hospital management for Tanzanian facilities. Subscribe for 3 months, 6
              months or a year and run your patients, pharmacy, laboratory and billing on your own
              server.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex gap-4">
            <Link to="/faq" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link to="/faq" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
