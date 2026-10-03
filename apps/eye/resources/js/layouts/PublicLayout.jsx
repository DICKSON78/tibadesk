import React, { useEffect, useCallback } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const dict = {
  "nav.home": { en: "Home", sw: "Mwanzo" },
  "nav.about": { en: "About", sw: "Kuhusu" },
  "nav.services": { en: "Services", sw: "Huduma" },
  "nav.products": { en: "Products", sw: "Bidhaa" },
  "nav.facility": { en: "Facility", sw: "Vituo" },
  "nav.why": { en: "Why Choose Us", sw: "Kwa Nini Utuchague" },
  "nav.contact": { en: "Contact", sw: "Wasiliana" },
  "nav.blog": { en: "Blog", sw: "Blog" },
  "cta.book": { en: "Book Appointment", sw: "Panga Miadi" },
  "cta.open_maps": { en: "Open in Google Maps", sw: "Fungua kwenye Google Maps" },
  "cta.subscribe": { en: "Subscribe", sw: "Jisajili" },
  "ph.email": { en: "Your email", sw: "Barua pepe yako" },
  "footer.services": { en: "Our Services", sw: "Huduma Zetu" },
  "footer.stay": { en: "Stay in Touch", sw: "Endelea Kuwasiliana" },
  "footer.stay_desc": { en: "Get updates and clinic information.", sw: "Pata taarifa na habari za kliniki." },
};

const applyLang = (lang) => {
  document.documentElement.setAttribute("lang", lang);
  localStorage.setItem("bv_lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const entry = dict[key];
    if (!entry) return;
    const attr = el.getAttribute("data-i18n-attr");
    const value = entry[lang] || entry.en || "";
    if (attr) el.setAttribute(attr, value);
    else el.textContent = value;
  });
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
  });
};

const PublicLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href === path || (path.startsWith(href + "/") && href !== "/")) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }, [location]);

  useEffect(() => {
    const saved = localStorage.getItem("bv_lang") || "en";
    applyLang(saved);
  }, []);

  const switchLang = useCallback((lang) => {
    applyLang(lang);
  }, []);

  return (
    <div>
      <div className="topbar">
        <div className="container">
          <div className="row">
            <div className="topbar-info">
              <span>
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                Nata–Mwanza, Tanzania
              </span>
              <span>
                <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.85 21 3 13.15 3 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/></svg>
                <a href="tel:+255678110376">+255 678 110 376</a>
              </span>
              <span>
                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <a href="mailto:info@bestvisioneyecare.com">info@bestvisioneyecare.com</a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <div className="navrow">
            <Link className="brand" to="/">
              <img alt="Best Vision Eye Care Logo" className="logo-img" src="/assets/img/logo.png" />
            </Link>
            <nav aria-label="Primary" className="nav">
              <Link data-i18n="nav.home" data-nav="" to="/">Home</Link>
              <Link data-i18n="nav.about" data-nav="" to="/about">About</Link>
              <Link data-i18n="nav.services" data-nav="" to="/services">Services</Link>
              <Link data-i18n="nav.products" data-nav="" to="/products">Products</Link>
              <Link data-i18n="nav.facility" data-nav="" to="/facility">Facility</Link>
              <Link data-i18n="nav.why" data-nav="" to="/why-choose-us">Why Choose Us</Link>
              <Link data-i18n="nav.contact" data-nav="" to="/contact">Contact</Link>
              <Link data-i18n="nav.blog" data-nav="" to="/blog">Blog</Link>
            </nav>
            <div className="nav-cta">
              <div className="lang-switch">
                <button type="button" data-lang-btn="en" className="lang-flag" title="English" onClick={() => switchLang("en")}>
                  <img src="/assets/img/flags/uk.svg" alt="English" width="20" height="14" />
                </button>
                <span className="lang-sep">/</span>
                <button type="button" data-lang-btn="sw" className="lang-flag" title="Kiswahili" onClick={() => switchLang("sw")}>
                  <img src="/assets/img/flags/tz.svg" alt="Kiswahili" width="20" height="14" />
                </button>
              </div>
              <Link className="btn btn-primary" data-i18n="cta.book" to="/book">Book Appointment</Link>
            </div>
          </div>
        </div>
      </header>

      <Outlet />

      <div aria-label="Quick actions" className="sticky-actions">
        <a aria-label="Call" className="fab2 fab2-call" href="tel:+255678110376" title="Call">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.85 21 3 13.15 3 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" /></svg>
        </a>
        <a aria-label="WhatsApp" className="fab2 fab2-wa" href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank" title="WhatsApp">
          <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M19.11 17.53c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.55-.88-2.13-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.56-.01-.19 0-.51.07-.78.36-.26.29-1 1-1 2.44s1.02 2.84 1.16 3.03c.15.19 2.01 3.07 4.87 4.3.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.12-.26-.19-.55-.34z" /><path d="M16.03 3.2c-7.02 0-12.72 5.7-12.72 12.72 0 2.25.59 4.36 1.62 6.2L3.2 28.8l6.85-1.79c1.79.98 3.84 1.54 6.0 1.54 7.02 0 12.72-5.7 12.72-12.72S23.05 3.2 16.03 3.2zm0 22.9c-2.04 0-3.92-.6-5.5-1.62l-.4-.25-4.06 1.06 1.08-3.96-.26-.41c-1.06-1.63-1.68-3.58-1.68-5.68 0-5.73 4.66-10.39 10.39-10.39 5.73 0 10.39 4.66 10.39 10.39 0 5.73-4.66 10.39-10.39 10.39z" /></svg>
        </a>
        <Link aria-label="Book Appointment" className="fab2 fab2-book" to="/book" title="Book Appointment">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm12 8H5v10h14V10z" /></svg>
        </Link>
      </div>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <h3>Best Vision Eye Care</h3>
            <p>A private optometry clinic delivering comprehensive, high-quality vision care solutions for all age groups in Mwanza.</p>
            <ul className="footer-contact">
              <li><strong>Address:</strong> Nata–Mwanza, Tanzania</li>
              <li><strong>Phone:</strong> <a href="tel:+255678110376">+255 678 110 376</a></li>
              <li><strong>WhatsApp:</strong> <a href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank">+255 678 110 376</a></li>
              <li><strong>Email:</strong> <a href="mailto:info@bestvisioneyecare.com">info@bestvisioneyecare.com</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Useful Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/facility">Facility</Link></li>
              <li><Link to="/why-choose-us">Why Choose Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 data-i18n="footer.services">Our Services</h4>
            <ul className="footer-links">
              <li><a href="/services#comprehensive">Comprehensive Eye Examination</a></li>
              <li><a href="/services#pediatric">Pediatric &amp; Low Vision Assessment</a></li>
              <li><a href="/services#disorders">Diagnosis &amp; Treatment of Eye Disorders</a></li>
              <li><a href="/services#refraction">Clinical Refraction</a></li>
              <li><a href="/services#spectacles">Spectacles Dispensing</a></li>
              <li><a href="/services#contacts">Contact Lens Fitting</a></li>
              <li><Link to="/outreach">Community Eye Outreach Programs</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 data-i18n="footer.stay">Stay in Touch</h4>
            <p data-i18n="footer.stay_desc">Get updates and clinic information.</p>
            <form className="footer-newsletter" onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.email.value;
              try {
                const res = await fetch("/api/newsletter/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Accept: "application/json" },
                  body: JSON.stringify({ email }),
                });
                const json = await res.json();
                if (res.ok) { alert("Thank you for subscribing!"); e.target.reset(); }
                else { alert(json.message || "Subscription failed"); }
              } catch { alert("Network error. Please try again."); }
            }}>
              <input name="email" data-i18n="ph.email" data-i18n-attr="placeholder" placeholder="Your email" required type="email" />
              <button className="btn btn-primary" data-i18n="cta.subscribe" type="submit">Subscribe</button>
            </form>
            <div className="footer-social">
              <a aria-label="Instagram" href="https://www.instagram.com/bestvision_eyecare?igsh=MWRrN3lyc3VoMzVncA==" rel="noopener noreferrer" target="_blank" title="Instagram">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 4a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.2-.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" /></svg>
              </a>
              <a aria-label="TikTok" href="https://www.tiktok.com/@bestvision_eyecare?_r=1&amp;_t=ZS-93ThDtrRnSn" rel="noopener noreferrer" target="_blank" title="TikTok">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M16 3c.4 3.4 2.6 5.4 5 5.6v3.2c-1.9 0-3.6-.6-5-1.7v6.6c0 4-3.2 7.3-7.2 7.3-4 0-7.3-3.3-7.3-7.3 0-4 3.3-7.2 7.3-7.2.7 0 1.4.1 2 .3v3.6c-.6-.4-1.3-.6-2-.6-2 0-3.7 1.6-3.7 3.6s1.7 3.7 3.7 3.7c2.1 0 3.8-1.6 3.8-4V3h3.4z" /></svg>
              </a>
              <a aria-label="YouTube" href="#" title="YouTube">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21.6 7.2a3 3 0 00-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 002.4 7.2 31.2 31.2 0 002 12a31.2 31.2 0 00.4 4.8 3 3 0 002.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 002.1-2.1A31.2 31.2 0 0022 12a31.2 31.2 0 00-.4-4.8zM10 15.5V8.5L16 12l-6 3.5z" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>© 2026 Best Vision Eye Care. All rights reserved.</p>
            <p><Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link></p>
          </div>
        </div>
      </footer>
      <script src="/assets/js/main.js" />
      <script src="/assets/js/i18n.js" />
    </div>
  );
};

export default PublicLayout;
