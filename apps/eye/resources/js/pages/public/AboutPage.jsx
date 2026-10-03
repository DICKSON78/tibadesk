import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">COMPANY PROFILE • 2026 EDITION</span>
          <h1>About Best Vision Eye Care</h1>
          <p className="lead">
            Best Vision Eye Care Clinic is a professionally managed eye care and optical services provider delivering comprehensive, high-quality
            vision care solutions for patients across all age groups. Strategically located in Nata, Mwanza – Tanzania, we focus on clinical excellence,
            efficiency, and long-term sustainability. With over five (5) years of operational experience, we have established a solid reputation for
            accuracy, reliability, and ethical medical practice.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="split about-split">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Best Vision Eye Care clinic storefront" src="/assets/img/storefront.jpg" />
            </div>
            <div className="card">
              <h2 data-i18n="about.who" style={{ margin: "0 0 8px" }}>Who We Are</h2>
              <p className="small">A private optometry clinic delivering comprehensive, high-quality vision care solutions for patients across all age groups, located in Nata, Mwanza – Tanzania.</p>
              <ul className="list list-arrow">
                <li>Clinical excellence and ethical practice</li>
                <li>Experienced and professionally trained personnel</li>
                <li>Modern diagnostic and optical equipment</li>
              </ul>
              <Link className="btn btn-gold" to="/book">Book Appointment</Link>
              <div className="decor-wrap">
                <div className="decor-chips">
                  <span className="chip">Patient-first</span>
                  <span className="chip">Modern diagnostics</span>
                  <span className="chip">Trusted optical products</span>
                  <span className="chip">Mwanza-based</span>
                </div>
                <div className="decor-photos">
                  <img alt="Team" src="/assets/img/team.jpg" />
                  <img alt="Equipment" src="/assets/img/equipment.jpg" />
                  <img alt="Waiting space" src="/assets/img/facility/waiting-space.jpg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section" id="mission-vision">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Mission</h2>
              <p>To provide high-quality, affordable, and comprehensive eye care services using modern technology and a compassionate approach, improving the vision and quality of life for our community.</p>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Vision</h2>
              <p>To be the leading eye care provider in Mwanza, recognized for excellence, innovation, and commitment to enhancing every patient's visual health and well-being.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Core Values</h2>
              <div className="grid">
                <div className="kpi">
                  <span className="dot"></span>
                  <div><strong>Patient-centric care</strong><div className="small">We prioritize the needs and well-being of our patients, ensuring they receive personalized care and attention.</div></div>
                </div>
                <div className="kpi">
                  <span className="dot"></span>
                  <div><strong>Excellence &amp; innovation</strong><div className="small">We strive for excellence, investing in advanced technology and staying at the forefront of optometric advancements.</div></div>
                </div>
                <div className="kpi">
                  <span className="dot"></span>
                  <div><strong>Integrity and ethics</strong><div className="small">We uphold the highest standards of professionalism, honesty, and ethical conduct in all aspects of our practice.</div></div>
                </div>
                <div className="kpi">
                  <span className="dot"></span>
                  <div><strong>Community engagement</strong><div className="small">We actively participate in community outreach programs, promoting eye health and education.</div></div>
                </div>
              </div>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Competitive Advantage</h2>
              <ul className="list list-arrow">
                <li>Comprehensive eye care services under one roof</li>
                <li>Experienced and professionally trained personnel</li>
                <li>Modern diagnostic and optical equipment</li>
                <li>Advanced ophthalmic instruments for precise and professional eye examinations</li>
              </ul>
              <hr className="sep" />
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Business Details</h2>
              <p className="small" style={{ margin: 0 }}><strong>Business name:</strong> Best Vision Eye Care</p>
              <p className="small" style={{ margin: 0 }}><strong>Form:</strong> Private Optometry Clinic</p>
              <p className="small" style={{ margin: 0 }}><strong>Trading sector:</strong> Health sector</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;