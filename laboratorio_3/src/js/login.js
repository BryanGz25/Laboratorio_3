/* PROCOMER · Login interactivo: selector de perfiles, mostrar/ocultar contraseña,
   autocompletado de demo, validación con animaciones y fondo natural en bucle. */
import { initNature } from './nature.js';
import { roles, SESSION, $ } from './store.js';

initNature();

/* Selector de perfil tipo tarjetas */
let selectedRole = 'Administrador';
document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedRole = card.dataset.role;
    document.querySelector('input[name="role"]').value = selectedRole;
  });
});

/* Mostrar / ocultar contraseña */
const passInput = $('#passInput');
$('#togglePass').addEventListener('click', () => {
  const show = passInput.type === 'password';
  passInput.type = show ? 'text' : 'password';
  $('#togglePass').innerHTML = show
    ? '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.2 3.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
    : '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
});

/* Autocompletado con chips de demostración */
document.querySelectorAll('.cred-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelector('input[name="username"]').value = chip.dataset.user;
    passInput.value = chip.dataset.pass;
    ['Administrador', 'Analista', 'Empresa'].forEach(role => {
      if (roles[role].user === chip.dataset.user) {
        document.querySelectorAll('.role-card').forEach(c =>
          c.classList.toggle('selected', c.dataset.role === role));
        selectedRole = role;
        document.querySelector('input[name="role"]').value = role;
      }
    });
  });
});

/* Envío con estados visuales */
const card = $('#authCard');
$('#login').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const r = roles[selectedRole];
  if (f.get('username') !== r.user || f.get('password') !== r.password) {
    toast('Usuario, contraseña o perfil incorrectos.', true);
    card.classList.remove('shake');
    void card.offsetWidth; /* reinicia la animación */
    card.classList.add('shake');
    return;
  }
  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Ingresando…';
  setTimeout(() => {
    sessionStorage.setItem(SESSION, JSON.stringify({ role: selectedRole, user: r.user }));
    location.href = r.page;
  }, 650);
});
