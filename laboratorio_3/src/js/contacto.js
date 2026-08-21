/* PROCOMER · Formulario de contacto (demostración) */
import { toast, audit } from './store.js';

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  audit('Mensaje de contacto recibido', `Consulta de ${f.get('name')} (${f.get('email')}), motivo: ${f.get('topic')}`);
  toast('¡Gracias! Su mensaje fue enviado. Le responderemos en un plazo de 48 horas.');
  e.target.reset();
});
