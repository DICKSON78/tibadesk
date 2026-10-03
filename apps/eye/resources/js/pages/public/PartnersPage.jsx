import React from "react";

const PartnersPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">STAKEHOLDERS &amp; PARTNERS</span>
          <h1>Collaborating to expand access and quality of care</h1>
          <p className="lead">
            Our clinic values strong relationships with key stakeholders, including patients, staff, regulators, suppliers, and the communities we serve.
            We work closely with hospitals, optical laboratories, suppliers, insurers, NGOs, and training institutions to enhance service delivery, expand access
            to care, and support sustainable, high-quality eye care through ethical and transparent collaboration.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Patients &amp; Community</h2><p className="small">Patient-centered care and community health engagement.</p></div>
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Regulatory &amp; Government Authorities</h2><p className="small">Compliance, standards, and accountability.</p></div>
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Clinical &amp; Professional Staff</h2><p className="small">Skilled professionals supporting safe outcomes.</p></div>
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Healthcare &amp; Referral Partners</h2><p className="small">Referrals and coordinated care pathways.</p></div>
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Suppliers &amp; Service Providers</h2><p className="small">Reliable supply of optical and clinical materials.</p></div>
            <div className="card"><h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Strategic &amp; Development Partners</h2><p className="small">Programs improving access, sustainability, and scale.</p></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PartnersPage;