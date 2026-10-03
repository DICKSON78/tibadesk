import React from "react";

const TeamPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">OUR TEAM</span>
          <h1>Leadership and Organization</h1>
          <p className="lead">Experienced professionals managing operations and patient care with integrity and compassion.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Our Team</h2>
              <p className="small">Professional staff committed to high-quality eye care and patient support.</p>
              <ul className="list">
                <li>Optometrists and ophthalmic assistance</li>
                <li>Customer care and administration</li>
                <li>Clinical support staff</li>
              </ul>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Best Vision Eye Care team" src="/assets/img/team.jpg" />
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <div className="thumb"><img alt="Director" src="/assets/img/director.jpg" /></div>
              <h2 style={{ margin: "0 0 8px" }}>Director Message</h2>
              <p className="small">"Welcome to our Best Vision Eye care profile, As a director I'm thrilled to share our commitment to provide exceptional eye health services. Explore our profile to discover how our team is dedicated to services tailored to your eye health needs."</p>
              <hr className="sep" />
              <p style={{ margin: 0 }}><strong>Opt. Masudi Sylivester Kayoka</strong></p>
              <p className="small" style={{ margin: 0 }}>Business Director • Optometrist &amp; ophthalmic assistance</p>
              <p className="small" style={{ margin: 0 }}>Mobile: <a href="tel:+255763110376">+255 763 110 376</a></p>
              <p className="small" style={{ margin: 0 }}>Email: <a href="mailto:director@bestvisioneyecare.com">director@bestvisioneyecare.com</a></p>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Organization Structure</h2>
              <ul className="list">
                <li><strong>Managing Director:</strong> Oversees overall operations, strategic direction, and management.</li>
                <li><strong>Executive Team:</strong> Operations manager; Finance &amp; Administration manager.</li>
                <li><strong>Department Heads:</strong> Manage departments and report to operations manager.</li>
                <li><strong>Supervisors:</strong> Specialized roles within departments (optometrists, ophthalmologists, technicians).</li>
                <li><strong>Support Staff:</strong> Administrative assistants, customer care representatives, facility maintenance.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamPage;