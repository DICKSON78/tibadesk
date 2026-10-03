import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <section className="home-banner">
        <img alt="Best Vision Eye Care Team" src="/assets/img/bango.jpeg" />
        <div className="banner-overlay banner-overlay-lower">
          <h2>WE CARE ABOUT YOUR EYES</h2>
          <p>Expert eye care through precision, advanced technology, and trust.</p>
          <div className="banner-cta">
            <Link className="btn btn-primary" to="/book">Book Appointment</Link>
            <Link className="btn btn-outline" to="/services">Our Services</Link>
            <a className="btn btn-outline" href="tel:+255678110376">Call +255 678 110 376</a>
          </div>
          <div aria-label="Clinic statistics" className="banner-stats">
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Online<br />Booking</div>
            </div>
            <div className="stat">
              <div className="stat-number">5+</div>
              <div className="stat-label">Years<br />Experience</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Satisfaction<br />Rate</div>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <h2 style={{ margin: "0 0 6px" }}>Our Eye Care Services</h2>
            <p className="small">Best Vision Eye Care ensures patients are properly taken care of by highly trained professionals.</p>
          </div>
          <div className="grid grid-3">
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Comprehensive eye examination" src="/assets/img/svc_comprehensive_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Comprehensive Eye Examination</h3>
              <p className="small">Full vision check to support accurate diagnosis and patient care.</p>
              <Link className="btn btn-primary" to="/book">Book Appointment</Link>
            </div>
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Pediatric and low vision assessment" src="/assets/img/svc_pediatric_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Pediatric &amp; Low Vision Assessment</h3>
              <p className="small">Assessment tailored for children and low-vision support needs.</p>
              <Link className="btn btn-primary" to="/book">Book Appointment</Link>
            </div>
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Diagnose and treat eye disorders" src="/assets/img/svc_disorders_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Diagnose &amp; Treat Eye Disorders</h3>
              <p className="small">Diagnosis, management, and treatment of disorders of the eye.</p>
              <Link className="btn btn-primary" to="/book">Book Appointment</Link>
            </div>
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Clinical refraction" src="/assets/img/svc_disorders_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Clinical Refraction</h3>
              <p className="small">Precision refraction for accurate prescriptions and clear vision.</p>
              <Link className="btn btn-primary" to="/book">Book Appointment</Link>
            </div>
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Eyeglasses and contact lenses" src="/assets/img/svc_prescribe_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Eyeglasses &amp; Contact Lenses</h3>
              <p className="small">Prescribe and provide eyeglasses, medications, and contact lenses.</p>
              <Link className="btn btn-primary" to="/products">View Products</Link>
            </div>
            <div className="card soft" style={{ textAlign: "center" }}>
              <div className="thumb-circle"><img alt="Outreach programs" src="/assets/img/svc_outreach_sq.jpg" /></div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Outreach Programs</h3>
              <p className="small">Community outreach supporting eye health access and education.</p>
              <Link className="btn btn-primary" to="/outreach">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card" style={{ background: "linear-gradient(180deg, rgba(26,91,164,.08), rgba(255,255,255,.95))" }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <h2 style={{ margin: "0 0 6px" }}>Why Choose Us</h2>
              <p className="small">Serving the Mwanza community with excellence in eye care for 5+ years.</p>
            </div>
            <div className="grid grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <div className="card soft" style={{ textAlign: "center", boxShadow: "none" }}>
                <div className="thumb-circle"><img alt="Professionals" src="/assets/img/storefront.jpg" /></div>
                <strong>We are professionals</strong>
                <div className="small">Skilled team delivering tailored services.</div>
              </div>
              <div className="card soft" style={{ textAlign: "center", boxShadow: "none" }}>
                <div className="thumb-circle"><img alt="Technology" src="/assets/img/svc_disorders_sq.jpg" /></div>
                <strong>Advanced Technology</strong>
                <div className="small">Technology supports accurate examinations.</div>
              </div>
              <div className="card soft" style={{ textAlign: "center", boxShadow: "none" }}>
                <div className="thumb-circle"><img alt="Services" src="/assets/img/frames.jpg" /></div>
                <strong>Award Services</strong>
                <div className="small">Service-driven culture focused on quality.</div>
              </div>
              <div className="card soft" style={{ textAlign: "center", boxShadow: "none" }}>
                <div className="thumb-circle"><img alt="Registered" src="/assets/img/team.jpg" /></div>
                <strong>Fully Registered</strong>
                <div className="small">Operates under recognized standards.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="callout">
            <h2 style={{ margin: "0 0 8px" }}>Need directions or fast support?</h2>
            <p style={{ margin: "0 0 14px" }}>Contact our call center or message us on WhatsApp to confirm availability.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="tel:+255678110376">Call +255 678 110 376</a>
              <Link className="btn btn-outline" to="/contact" style={{ background: "transparent", borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>Contact page</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="visit-us">
        <div className="container">
        <div className="visit-wrap">
          <div className="visit-card">
            <h2>Visit Us</h2>
            <p>Find Best Vision Eye Care in Nata, Mwanza. We are ready to welcome you for professional eye care services.</p>
            <div className="visit-meta">
              <div className="item"><strong>Address</strong> Nata–Mwanza, Tanzania</div>
              <div className="item"><strong>Call Center</strong> <a href="tel:+255678110376">+255 678 110 376</a></div>
              <div className="item"><strong>Email</strong> <a href="mailto:info@bestvisioneyecare.com">info@bestvisioneyecare.com</a></div>
              <div className="item"><strong>Website</strong> www.bestvisioneyecare.com</div>
            </div>
            <iframe className="visit-map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Best%20Vision%20Eye%20Care%20Nate%20Mwanza&amp;output=embed" title="Google Maps">
            </iframe>
            <div style={{ marginTop: 14 }}>
              <a className="btn btn-primary" data-i18n="cta.open_maps" href="https://www.google.com/maps?q=Best%20Vision%20Eye%20Care%20Nate%20Mwanza" rel="noopener" target="_blank">Open in Google Maps</a>
            </div>
            <a className="btn btn-outline" data-i18n="cta.open_maps" href="https://maps.app.goo.gl/ASSLWSJzHrc3C2tR7" rel="noopener" target="_blank">Open in Google Maps</a>
          </div>
          <div className="visit-photo">
            <img alt="Best Vision Eye Care Building" src="/assets/img/visit-us.jpg" />
          </div>
        </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;