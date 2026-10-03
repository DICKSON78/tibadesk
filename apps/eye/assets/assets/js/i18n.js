(function() {
  const dict = {"nav.home": {"en": "Home", "sw": "Mwanzo"}, "nav.about": {"en": "About", "sw": "Kuhusu"}, "nav.services": {"en": "Services", "sw": "Huduma"}, "nav.products": {"en": "Products", "sw": "Bidhaa"}, "nav.facility": {"en": "Facility", "sw": "Vituo"}, "nav.why": {"en": "Why Choose Us", "sw": "Kwa Nini Utuchague"}, "nav.contact": {"en": "Contact", "sw": "Wasiliana"}, "cta.book": {"en": "Book Appointment", "sw": "Panga Miadi"}, "cta.open_maps": {"en": "Open in Google Maps", "sw": "Fungua kwenye Google Maps"}, "cta.subscribe": {"en": "Subscribe", "sw": "Jisajili"}, "ph.email": {"en": "Your email", "sw": "Barua pepe yako"}, "float.call": {"en": "Call", "sw": "Piga"}, "float.book": {"en": "Book", "sw": "Miadi"}, "footer.services": {"en": "Our Services", "sw": "Huduma Zetu"}, "footer.stay": {"en": "Stay in Touch", "sw": "Endelea Kuwasiliana"}, "footer.stay_desc": {"en": "Get updates and clinic information.", "sw": "Pata taarifa na habari za kliniki."}, "about.who": {"en": "Who We Are", "sw": "Sisi ni Nani"}, "facility.inside": {"en": "Inside Our Clinic", "sw": "Ndani ya Kliniki Yetu"}, "why.expect": {"en": "What you can expect", "sw": "Unachoweza Kutegemea"}, "why.trust": {"en": "Trust signals", "sw": "Ishara za Uaminifu"}, "book.title": {"en": "Book Appointment", "sw": "Panga Miadi"}, "book.name": {"en": "Full Name", "sw": "Jina Kamili"}, "book.phone": {"en": "Phone Number", "sw": "Namba ya Simu"}, "book.email": {"en": "Email Address", "sw": "Barua Pepe"}, "book.date": {"en": "Preferred Date", "sw": "Tarehe Unayopendelea"}, "book.time": {"en": "Preferred Time", "sw": "Muda Unayopendelea"}, "book.service": {"en": "Service", "sw": "Huduma"}, "book.message": {"en": "Message / Notes", "sw": "Ujumbe / Maelezo"}, "book.submit": {"en": "Submit", "sw": "Tuma"}};

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('bv_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const entry = dict[key];
      if (!entry) return;

      const attr = el.getAttribute('data-i18n-attr');
      const value = (entry[lang] || entry.en || "");
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    });
  }

  function init() {
    const saved = localStorage.getItem('bv_lang');
    const lang = saved || 'en';

    const sel = document.querySelector('.lang-select');
    if (sel) {
      sel.value = lang;
      sel.addEventListener('change', (e) => applyLang(e.target.value));
    }
    applyLang(lang);
  }

  document.addEventListener('DOMContentLoaded', init);
})();