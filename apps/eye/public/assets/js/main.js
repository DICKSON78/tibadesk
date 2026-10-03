(function(){
  const setCurrent = () => {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('[data-nav]').forEach(a=>{
      const href=(a.getAttribute('href')||'').toLowerCase();
      if(href===path) a.setAttribute('aria-current','page');
    });
  };

  const bookingEnhance = () => {
    const form = document.querySelector('#bookingForm');
    if(!form) return;

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      const lines = [
        `Booking Request - Best Vision Eye Care`,
        `Name: ${data.full_name||''}`,
        `Phone: ${data.phone||''}`,
        `Email: ${data.email||''}`,
        `Preferred Date: ${data.date||''}`,
        `Preferred Time: ${data.time||''}`,
        `Service: ${data.service||''}`,
        `Message: ${data.message||''}`,
      ].join('\n');

      // WhatsApp link (recommended for Tanzania)
      const waNumber = '255678110376'; // clinic call center
      const waText = encodeURIComponent(lines);
      const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

      // Email fallback
      const mailTo = `mailto:info@bestvisioneyecare.com?subject=${encodeURIComponent('Booking Request - Best Vision Eye Care')}&body=${encodeURIComponent(lines)}`;

      // Try WhatsApp first; user can switch to email.
      window.open(waUrl, '_blank');
      window.location.href = mailTo;
    });
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    setCurrent();
    bookingEnhance();
  });
})();
