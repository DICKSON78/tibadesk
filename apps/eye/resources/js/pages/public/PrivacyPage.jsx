import React from "react";

const PrivacyPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">PRIVACY POLICY</span>
          <h1>Privacy Policy</h1>
          <p className="lead">This is a starter privacy policy template. Replace with your final legal text.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <h2 style={{ margin: "0 0 10px", fontSize: 20 }}>Information we collect</h2>
            <p className="small">Contact details you submit through booking or outreach forms (name, phone, email, message).</p>
            <h2 style={{ margin: "16px 0 10px", fontSize: 20 }}>How we use it</h2>
            <p className="small">To respond to your requests, confirm appointments, and improve service delivery.</p>
            <h2 style={{ margin: "16px 0 10px", fontSize: 20 }}>Data retention</h2>
            <p className="small">Keep only as long as needed to respond and manage services, unless required for compliance.</p>
            <h2 style={{ margin: "16px 0 10px", fontSize: 20 }}>Contact</h2>
            <p className="small">If you have questions, email <a href="mailto:info@bestvisioneyecare.com">info@bestvisioneyecare.com</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPage;