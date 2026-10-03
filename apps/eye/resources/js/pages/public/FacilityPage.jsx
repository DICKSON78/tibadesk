import React from "react";

const FacilityPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">OUR FACILITY</span>
          <h1>Modern clinic designed for comfort, efficiency, and advanced care</h1>
          <p className="lead">Our clinic features modern facilities designed for comfort, efficiency, and advanced care. Cutting-edge technology supports precise eye examinations and treatments.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="split">
            <div className="card">
              <h2 data-i18n="facility.inside" style={{ margin: "0 0 8px" }}>Inside Our Clinic</h2>
              <p className="small">A modern setup designed for comfort, efficiency, and advanced care.</p>
              <ul className="list list-arrow">
                <li>Digital imaging and automated screening for enhanced diagnosis</li>
                <li>Professional waiting space supporting smooth workflow</li>
                <li>Private consultation rooms for personalized care</li>
              </ul>
              <div className="decor-wrap">
                <div className="decor-chips">
                  <span className="chip">Comfortable waiting</span>
                  <span className="chip">Private rooms</span>
                  <span className="chip">Digital imaging</span>
                  <span className="chip">Efficient workflow</span>
                </div>
                <div className="decor-photos">
                  <img alt="Inside clinic" src="/assets/img/facility/inside-our-clinic.jpg" />
                  <img alt="Technology" src="/assets/img/facility/technology.jpg" />
                  <img alt="Consultation room" src="/assets/img/facility/consultation-room.jpg" />
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Clinic equipment" src="/assets/img/facility/consultation-room.jpg" />
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Advanced Technology" src="/assets/img/facility/technology.jpg" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "18px 18px 20px" }}>
                <h3 style={{ margin: "0 0 6px" }}>Advanced Technology</h3>
                <p className="muted" style={{ margin: 0 }}>From digital imaging to automated screening—enhancing diagnosis and patient care.</p>
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Comfortable Waiting Space" src="/assets/img/facility/waiting-space.jpg" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "18px 18px 20px" }}>
                <h3 style={{ margin: "0 0 6px" }}>Comfortable Waiting Space</h3>
                <p className="muted" style={{ margin: 0 }}>Spacious, organized offices providing a professional environment that supports smooth workflow and efficient service delivery.</p>
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <img alt="Private Consultation Room" src="/assets/img/facility/consultation-room.jpg" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "18px 18px 20px" }}>
                <h3 style={{ margin: "0 0 6px" }}>Private Consultation Room</h3>
                <p className="muted" style={{ margin: 0 }}>Privacy and comfort enabling thorough examinations and personalized patient care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FacilityPage;