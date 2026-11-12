document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      faqItems.forEach((faq) => {
        faq.classList.remove("active");
        const btn = faq.querySelector(".faq-question");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("mobile-open");
    });
  }
});
