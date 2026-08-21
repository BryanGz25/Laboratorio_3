/* PROCOMER · Interacciones comunes: menú móvil, año del footer y animaciones al hacer scroll */

const toggle = document.getElementById('navToggle');
if (toggle) toggle.addEventListener('click', () => document.getElementById('mainNav').classList.toggle('open'));

const updateYears = () => {
  const y = new Date().getFullYear();
  document.querySelectorAll('#year, .year').forEach(el => el.textContent = y);
};
updateYears();

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
