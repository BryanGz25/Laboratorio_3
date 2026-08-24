/* PROCOMER · Consulta pública por código de seguimiento con ejemplos rápidos */
import { getData, request, badge, esc } from './store.js';

/* Botón volver: regresa a la página anterior (dashboard u origen) */
document.getElementById('backBtn').addEventListener('click', () => {
  if (history.length > 1) history.back();
  else location.href = '../../index.html';
});

/* Chips de ejemplo: autocompletan y consultan de inmediato */
document.querySelectorAll('.demo-code').forEach(chip => {
  chip.onclick = () => {
    const input = document.getElementById('codeInput');
    input.value = chip.textContent.trim();
    input.dispatchEvent(new Event('input'));
    document.getElementById('lookupForm').dispatchEvent(new Event('submit', { cancelable: true }));
  };
});

document.getElementById('lookupForm').addEventListener('submit', e => {
  e.preventDefault();
  const code = new FormData(e.target).get('code').trim().toUpperCase();
  const data = getData();
  const r = request(code);
  document.getElementById('result').innerHTML = r ? `
    <section class="result" style="margin-top:1.2rem;">
      <h2 style="color:#16405f;">${esc(r.company)}</h2>
      <p>Estado actual: ${badge(r.status)} · Clasificación IA: ${badge(r.ai)} · Puntaje: ${r.score}/100</p>
      <p style="color:#5a7089;font-size:.88rem;">Sector: ${esc(r.sector)} · Recibida el ${r.createdAt}</p>
      <h3 style="margin:.8rem 0 .4rem;">Historial</h3>
      <ul style="padding-left:1.1rem;">
        ${r.history.map(h => `<li>${h.at}: ${esc(h.from)} → ${esc(h.to)} (${esc(h.user)})</li>`).join('')}
      </ul>
    </section>`
    : `<p class="form-error">No se encontró ninguna solicitud con el código "${esc(code)}". Pruebe con uno de los códigos de ejemplo.</p>`;
});
