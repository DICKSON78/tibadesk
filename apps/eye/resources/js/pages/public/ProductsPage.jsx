import React from "react";

const ProductsPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">OUR PRODUCTS</span>
          <h1>Optical Products</h1>
          <p className="lead">Quality optical products supporting clear vision, comfort, and protection.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card with-thumb">
              <div className="thumb"><img alt="Spectacles" src="/assets/img/products/spectacles.jpeg" /></div>
              <h2>Spectacles</h2>
              <p className="small">Frames and lenses to match your prescription and lifestyle.</p>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Contact lenses" src="/assets/img/products/contact-lens.jpeg" /></div>
              <h2>Contact lenses</h2>
              <p className="small">Daily and extended options (availability may vary).</p>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Eye medication" src="/assets/img/products/eyeware-glasses.jpeg" /></div>
              <h2>Eye medication</h2>
              <p className="small">Ophthalmic medications prescribed appropriately.</p>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Low vision aids" src="/assets/img/products/visual-aid.jpeg" /></div>
              <h2>Low vision aid</h2>
              <p className="small">Tools and aids to support low-vision needs.</p>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Eye PPE" src="/assets/img/products/personal-protective.jpeg" /></div>
              <h2>Eye Personal Protective Equipment</h2>
              <p className="small">Protection solutions supporting safety and prevention.</p>
            </div>
            <div className="card with-thumb">
              <div className="thumb"><img alt="Hard cases for glasses" src="/assets/img/products/eyeware-cases.jpeg" /></div>
              <h2>Hard cases for glasses</h2>
              <p className="small">Durable protection for your eyewear.</p>
            </div>
          </div>
          <div className="callout" style={{ marginTop: 18 }}>
            <h2 style={{ margin: "0 0 8px" }}>Need product availability or a quote?</h2>
            <p style={{ margin: "0 0 14px" }}>Message us on WhatsApp with the product you want and your prescription details (if applicable).</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank">Request on WhatsApp</a>
              <a className="btn btn-outline" href="/contact" style={{ background: "transparent", borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>Contact</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;