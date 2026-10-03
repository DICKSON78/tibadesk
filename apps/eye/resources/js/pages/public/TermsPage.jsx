import React from "react";

const TermsPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">TERMS</span>
          <h1>Terms of Use</h1>
          <p className="lead">Starter terms template. Replace with your final legal text.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Medical disclaimer</h2>
            <p className="small">Website content is general information and not a substitute for professional medical advice. For urgent eye problems, contact the clinic immediately.</p>
            <h2 style={{ margin: "16px 0 10px", fontSize: 20 }}>Appointments</h2>
            <p className="small">Submitting a request does not guarantee an appointment until confirmed by the clinic.</p>
            <h2 style={{ margin: "16px 0 10px", fontSize: 20 }}>Changes</h2>
            <p className="small">We may update these terms as the website evolves.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsPage;