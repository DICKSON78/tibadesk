import React from "react";

const FAQPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">FAQ</span>
          <h1>Frequently Asked Questions</h1>
          <p className="lead">Common questions about clinic services, optical products, and appointments.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid">
            <div className="card">
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>How do I book an appointment?</h2>
              <p className="small">Use the Book Appointment page. Your request will be sent to WhatsApp and email, and the clinic will confirm.</p>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Do you provide eyeglasses and contact lenses?</h2>
              <p className="small">Yes. The clinic prescribes and provides eyeglasses, ophthalmic medications, and contact lenses.</p>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Do you have pediatric and low-vision services?</h2>
              <p className="small">Yes. Pediatric and low vision assessment is available.</p>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Where are you located?</h2>
              <p className="small">Nata–Mwanza, Tanzania. See Contact page for details.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;