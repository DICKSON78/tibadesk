import React from "react";
import { Link } from "react-router-dom";

const ServicesPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">OUR SERVICES</span>
          <h1>Eye Care Services</h1>
          <p className="lead">Best Vision Eye Care ensures our patients are properly taken care of and our services are carried out by highly trained professionals in the optometry and ophthalmic industry.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card with-thumb">
              <div className="thumb"><img alt="Comprehensive eye examination" src="/assets/img/svc_comprehensive.jpg" /></div>
              <h2>Comprehensive Eye Examination</h2>
              <p className="small">Full vision check to support accurate diagnosis and patient care.</p>
              <Link className="btn btn-primary" to="/book">Book this service</Link>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Pediatric and low vision assessment" src="/assets/img/svc_pediatric.jpg" /></div>
              <h2>Pediatric &amp; Low Vision Assessment</h2>
              <p className="small">Assessment tailored for children and low-vision support needs.</p>
              <Link className="btn btn-primary" to="/book">Book this service</Link>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Diagnosis and treatment" src="/assets/img/svc_disorders.jpg" /></div>
              <h2>Diagnose &amp; Treat Eye Disorders</h2>
              <p className="small">Diagnosis, management, and treatment of disorders of the eye.</p>
              <Link className="btn btn-primary" to="/book">Book this service</Link>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Clinical refraction" src="/assets/img/svc_refraction.jpg" /></div>
              <h2>Clinical Refraction</h2>
              <p className="small">Precision refraction for accurate prescriptions and clear vision.</p>
              <Link className="btn btn-primary" to="/book">Book this service</Link>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Eyeglasses and contact lenses" src="/assets/img/svc_prescribe.jpg" /></div>
              <h2>Eyeglasses, Medications &amp; Contact Lenses</h2>
              <p className="small">Prescribe and provide eyeglasses, ophthalmic medications, and contact lenses.</p>
              <Link className="btn btn-primary" to="/book">Book this service</Link>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Outreach programs" src="/assets/img/svc_outreach.jpg" /></div>
              <h2>Outreach Programs</h2>
              <p className="small">Community outreach supporting eye health access and education.</p>
              <Link className="btn btn-primary" to="/outreach">Learn more</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;