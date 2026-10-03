import React from "react";

const WhyChooseUsPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">WHY CHOOSE US</span>
          <h1>Expert care with compassion and modern technology</h1>
          <p className="lead">Best Vision Eye Care Clinic combines expert eye care with compassion and modern technology to ensure every patient feels valued and supported on their journey to clearer vision.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 data-i18n="why.expect" style={{ margin: "0 0 8px" }}>What you can expect</h2>
              <ul className="list list-arrow">
                <li>Professional and patient-centered service</li>
                <li>Advanced technology supporting accurate examinations</li>
                <li>Comprehensive services and optical products in one place</li>
                <li>Ethical medical practice and integrity</li>
              </ul>
              <div className="mini-callout"><strong>Quick promise</strong><p className="small">Clear communication, careful examination, and evidence-based recommendations every visit.</p></div>
              <div className="decor-wrap">
                <div className="decor-chips">
                  <span className="chip">Accurate exams</span>
                  <span className="chip">Clear pricing</span>
                  <span className="chip">Friendly team</span>
                  <span className="chip">Follow-up support</span>
                </div>
                <div className="decor-photos">
                  <img alt="Eye exam" src="/assets/img/exam.jpg" />
                  <img alt="Refraction" src="/assets/img/svc_refraction_sq.jpg" />
                  <img alt="Comprehensive care" src="/assets/img/svc_comprehensive_sq.jpg" />
                </div>
              </div>
            </div>
            <div className="card">
              <h2 data-i18n="why.trust" style={{ margin: "0 0 8px" }}>Trust signals</h2>
              <div className="grid grid-2" style={{ marginTop: 14 }}>
                <div className="card soft" style={{ padding: 12 }}>
                  <div className="thumb"><img alt="We are professionals" src="/assets/img/wcu_professionals.jpg" /></div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 18 }}>We are professionals</h3>
                  <p className="small" style={{ margin: "6px 0 0" }}>Skilled team delivering patient-centered care.</p>
                </div>
                <div className="card soft" style={{ padding: 12 }}>
                  <div className="thumb"><img alt="Advanced Technology" src="/assets/img/wcu_technology.jpg" /></div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 18 }}>Advanced Technology</h3>
                  <p className="small" style={{ margin: "6px 0 0" }}>Modern tools supporting precise diagnosis.</p>
                </div>
                <div className="card soft" style={{ padding: 12 }}>
                  <div className="thumb"><img alt="Award services" src="/assets/img/wcu_award.jpg" /></div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 18 }}>Award Services</h3>
                  <p className="small" style={{ margin: "6px 0 0" }}>Recognized service and trusted partnerships.</p>
                </div>
                <div className="card soft" style={{ padding: 12 }}>
                  <div className="thumb"><img alt="Fully registered" src="/assets/img/wcu_registered.jpg" /></div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 18 }}>Fully Registered</h3>
                  <p className="small" style={{ margin: "6px 0 0" }}>Licensed clinic operating with integrity and standards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChooseUsPage;