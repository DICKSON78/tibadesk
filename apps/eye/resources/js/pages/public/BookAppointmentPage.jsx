import React, { useState } from "react";

const BookAppointmentPage = () => {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    const form = e.target;
    const body = {
      full_name: form.full_name.value,
      phone: form.phone.value,
      email: form.email.value,
      preferred_date: form.date.value,
      preferred_time: form.time.value,
      service: form.service.value,
      message: form.message.value,
    };
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Something went wrong");
      setDone(true);
      form.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <>
        <section className="hero">
          <div className="container">
            <span className="badge">BOOK APPOINTMENT</span>
            <h1>Request Sent!</h1>
            <p className="lead">Thank you! Your appointment request has been received. We will contact you shortly to confirm.</p>
            <button className="btn btn-primary" onClick={() => setDone(false)} style={{ marginTop: 16 }}>Book Another</button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge">BOOK APPOINTMENT</span>
          <h1>Appointment Request</h1>
          <p className="lead">Send your appointment request to the clinic call center.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ margin: "0 0 10px" }}>Booking Form</h2>
              {error && <div className="alert alert-error" style={{ color: "#b91c1c", background: "#fee2e2", padding: "8px 12px", borderRadius: 4, marginBottom: 12 }}>{error}</div>}
              <form className="form" id="bookingForm" onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="full_name">Full name</label>
                  <input id="full_name" name="full_name" required />
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" placeholder="+255 ..." required />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label htmlFor="date">Preferred date</label>
                    <input id="date" name="date" type="date" />
                  </div>
                  <div className="field">
                    <label htmlFor="time">Preferred time</label>
                    <input id="time" name="time" type="time" />
                  </div>
                </div>
                <div className="field">
                  <label data-i18n="book.service" htmlFor="service">Service</label>
                  <select id="service" name="service">
                    <option>Comprehensive Eye Examination</option>
                    <option>Pediatric and Low Vision Assessment</option>
                    <option>Diagnose, Manage and Treat Disorders of the Eye</option>
                    <option>Clinical Refraction</option>
                    <option>Eyeglasses, Ophthalmic Medications and Contact Lenses</option>
                    <option>Outreach Programs</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="message">Additional notes</label>
                  <textarea id="message" name="message" placeholder="Symptoms, prescription details, or special needs"></textarea>
                </div>
                <button className="btn btn-primary" type="submit" disabled={sending}>
                  {sending ? "Sending..." : "Send Booking Request"}
                </button>
                <div className="notice">Staff will confirm by call/WhatsApp.</div>
              </form>
            </div>
            <div className="card">
              <h2 style={{ margin: "0 0 10px" }}>What happens next</h2>
              <ol className="list">
                <li>Submit the booking request.</li>
                <li>Clinic team reviews your service and preferred time.</li>
                <li>Confirmation is sent via call or WhatsApp.</li>
              </ol>
              <hr className="sep" />
              <p className="small"><strong>Tip:</strong> For faster response, use WhatsApp and include your preferred date/time.</p>
              <a className="btn btn-outline" href="https://wa.me/255678110376" rel="noopener noreferrer" target="_blank">Open WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookAppointmentPage;
