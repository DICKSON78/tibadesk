import React from "react";

const OutreachPage = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">OUTREACH PROGRAMS</span>
          <h1>Community eye health and education</h1>
          <p className="lead">We actively participate in community outreach programs, promoting eye health and education to enhance overall well-being.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>Request an Outreach Visit</h2>
              <p className="small">For schools, companies, NGOs, or community groups. Provide details and we will contact you.</p>
              <form action="mailto:info@bestvisioneyecare.com" className="form" encType="text/plain" method="post">
                <div className="field"><label>Organization</label><input name="Organization" required /></div>
                <div className="field"><label>Contact person</label><input name="Contact Person" required /></div>
                <div className="grid grid-2">
                  <div className="field"><label>Phone</label><input name="Phone" required /></div>
                  <div className="field"><label>Email</label><input name="Email" type="email" /></div>
                </div>
                <div className="field"><label>Location</label><input name="Location" placeholder="Mwanza / nearby regions" /></div>
                <div className="field"><label>Notes</label><textarea name="Notes" placeholder="Target group, size, preferred dates, needs"></textarea></div>
                <button className="btn btn-primary" type="submit">Send Request</button>
                <div className="notice">If email is not configured on the device, use WhatsApp from the Contact page.</div>
              </form>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 8px" }}>What we can support</h2>
              <ul className="list">
                <li>Vision screening for groups</li>
                <li>Eye health education sessions</li>
                <li>Referral guidance when needed</li>
                <li>Follow-up scheduling at the clinic</li>
              </ul>
              <hr className="sep" />
              <p className="small"><strong>Fast coordination:</strong> WhatsApp the clinic call center with your request details.</p>
              <a className="btn btn-outline" href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank">WhatsApp Outreach Request</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OutreachPage;