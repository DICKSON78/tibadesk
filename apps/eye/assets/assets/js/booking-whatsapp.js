(function(){
  const WA_NUMBER = "255678110376";
  function enc(v){ return encodeURIComponent((v||"").toString().trim()); }

  function buildMessage(data){
    const lines = [
      "📅 *Appointment Request*",
      "",
      `👤 Name: ${data.full_name || "-"}`,
      `📞 Phone: ${data.phone || "-"}`,
      `📧 Email: ${data.email || "-"}`,
      `🗓️ Date: ${data.date || "-"}`,
      `⏰ Time: ${data.time || "-"}`,
      `🩺 Service: ${data.service || "-"}`,
      "",
      `📝 Notes: ${data.message || "-"}`,
    ];
    return lines.join("\n");
  }

  function getFormData(form){
    const fd = new FormData(form);
    return {
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      date: fd.get("date"),
      time: fd.get("time"),
      service: fd.get("service"),
      message: fd.get("message"),
    };
  }

  function openWhatsApp(message){
    const url = `https://wa.me/${WA_NUMBER}?text=${enc(message)}`;
    window.open(url, "_blank", "noopener");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bookingForm") || document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = getFormData(form);

      // Basic validation: name + phone + date at least
      if (!data.full_name || !data.phone || !data.date){
        alert("Please fill Name, Phone, and Date to continue.");
        return;
      }

      openWhatsApp(buildMessage(data));
    });
  });
})();