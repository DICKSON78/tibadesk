import React from "react";

const ContactPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">CONTACT US</span>
          <h1>Get in touch</h1>
          <p className="lead">Call, email, or message us on WhatsApp. We will confirm appointment availability and support your eye care needs.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Clinic Contact</h2>
              <p className="small" style={{ margin: 0 }}><strong>Phone:</strong> <a href="tel:+255678110376">+255 678 110 376</a></p>
              <p className="small" style={{ margin: 0 }}><strong>Email:</strong> <a href="mailto:info@bestvisioneyecare.com">info@bestvisioneyecare.com</a></p>
              <p className="small" style={{ margin: 0 }}><strong>Website:</strong> <a href="https://www.bestvisioneyecare.com" rel="noopener noreferrer" target="_blank">www.bestvisioneyecare.com</a></p>
              <p className="small" style={{ margin: 0 }}><strong>Address:</strong> Nata–Mwanza, Tanzania</p>
              <hr className="sep" />
              <div id="whatsapp">
                <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>WhatsApp</h2>
                <p className="small">Tap to message us. Include your name, service, and preferred date/time.</p>
                <a className="btn btn-primary" href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank">Message on WhatsApp</a>
              </div>
              <div className="contact-highlight">➤ We are available for appointments, consultations, and emergency eye care.</div>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Visit Us</h2>
              <div className="map-embed">
                <iframe allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=BEST+VISION+EYE+CARE,+Natta+33102&amp;output=embed" title="Best Vision Eye Care - Google Map"></iframe>
              </div>
              <a className="btn btn-outline" data-i18n="cta.open_maps" href="https://maps.app.goo.gl/ASSLWSJzHrc3C2tR7" rel="noopener noreferrer" target="_blank">Open in Google Maps</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;