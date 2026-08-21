/* PROCOMER · Expediente de solicitud: evaluación, documentos, acciones del
   analista, observaciones, historial y reporte PDF. */
import { guard, user, getData, request, zone, badge, esc, audit, history, save, pdfReport, toast } from './store.js';

const session = user();
if (!session) { location.href = 'login.html'; throw ''; }
const allowed = ['Administrador', 'Analista', 'Empresa'];
if (!allowed.includes(session.role)) { location.href = 'login.html'; throw ''; }

/* Navegación según rol */
document.getElementById('roleNav').innerHTML =
  session.role === 'Analista'
    ? '<a href="dashboardAnalista.html">Mi dashboard</a><a href="../../index.html">Inicio</a>'
    : session.role === 'Administrador'
      ? '<a href="dashboardAdministrador.html">Panel principal</a><a href="centroAdministracion.html">Centro de Administración</a>'
      : '<a href="dashboardEmpresa.html">Mi dashboard</a><a href="../../index.html">Inicio</a>';

const data = getData();
const r = request(new URLSearchParams(location.search).get('id'));
const main = document.getElementById('detailMain');

if (!r) {
  main.innerHTML = '<h1>Solicitud no encontrada</h1><p class="lead">No se encontró el expediente solicitado.</p>';
  throw '';
}

main.innerHTML = `
  <p class="eyebrow">EXPEDIENTE</p>
  <h1>${r.id}</h1>
  <p class="lead"><b>${esc(r.company)}</b> · ${esc(zone(r.zone)?.name || 'Zona no disponible')} · Recibida el ${r.createdAt}</p>

  <section class="detail-grid">
    <article class="table-card" style="margin:0;">
      <h2>Evaluación</h2>
      <p>Puntaje de cumplimiento: <strong class="score">${r.score}/100</strong></p>
      <p style="margin:.4rem 0;">Clasificación IA: ${badge(r.ai)} · Confianza ${r.confidence}%</p>
      <p style="margin:.4rem 0;">Clasificación final: ${r.finalClassification ? badge(r.finalClassification) : 'Pendiente de decisión'}</p>
      <p style="margin:.4rem 0;">Estado actual: ${badge(r.status)}</p>
    </article>
    <article class="table-card" style="margin:0;">
      <h2>Documentos adjuntos</h2>
      <ul class="doc-list">
        ${r.documents.map(n => `<li><a href="#" class="doc" data-name="${esc(n)}">Descargar ${esc(n)}</a></li>`).join('')}
      </ul>
    </article>
  </section>

  <section class="criteria">
    <h2>Criterios evaluados</h2>
    <p>Inversión: ${r.investment >= (zone(r.zone)?.minInvestment || Infinity) ? 'Cumple' : 'No cumple'} · Empleos: ${r.jobs} · Sector: ${esc(r.sector)} · Documentos: ${r.documents.length}/5</p>
  </section>

  ${session.role === 'Analista' ? `
  <section class="form-card analyst-actions">
    <h2>Acciones del analista</h2>
    ${r.status === 'Pendiente' ? '<button id="startBtn" class="button secondary">Iniciar revisión</button>' : ''}
    <form id="classForm">
      <label>Clasificación final
        <select name="classification">
          ${['Recomendada', 'Revisar', 'Rechazada'].map(x => `<option ${x === r.ai ? 'selected' : ''}>${x}</option>`).join('')}
        </select>
      </label>
      <div class="actions">
        <button class="button primary">Confirmar / modificar clasificación</button>
        <button id="rejectAiBtn" type="button" class="button danger">Rechazar clasificación IA</button>
      </div>
    </form>
    <form id="noteForm">
      <label>Observación<textarea name="note" placeholder="Escriba una observación"></textarea></label>
      <button class="button secondary">Guardar observación</button>
    </form>
    <div class="notes">
      <h3>Observaciones</h3>
      ${r.notes.map(n => `<p><b>${esc(n.user)}</b> · ${n.at}<br>${esc(n.text)}</p>`).join('') || '<p>Sin observaciones.</p>'}
    </div>
    <div class="actions">
      <button class="button secondary" id="pdfBtn">Generar reporte PDF</button>
    </div>
  </section>` : ''}

  <section class="table-card">
    <h2>Historial de cambios</h2>
    <table>
      <thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Estado anterior</th><th>Estado nuevo</th></tr></thead>
      <tbody>${r.history.map(h => `<tr><td>${h.at}</td><td>${esc(h.user)}</td><td>${esc(h.from)}</td><td>${badge(h.to)}</td></tr>`).join('')}</tbody>
    </table>
  </section>`;

/* Descarga simulada de documentos */
document.querySelectorAll('.doc').forEach(a => a.onclick = e => {
  e.preventDefault();
  const blob = new Blob([`Documento de respaldo PROCOMER — ${a.dataset.name}`], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = a.dataset.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
});

if (session.role === 'Analista') {
  document.getElementById('startBtn')?.addEventListener('click', () => {
    if (r.status === 'En revisión') return toast('Esta solicitud ya está siendo revisada.', true);
    const old = r.status;
    r.status = 'En revisión';
    history(r, old, r.status);
    audit('Revisión iniciada', `El analista inició la revisión de ${r.id}`, 'En revisión');
    save();
    location.reload();
  });

  document.getElementById('classForm').addEventListener('submit', e => {
    e.preventDefault();
    const value = new FormData(e.target).get('classification');
    const old = r.status;
    r.finalClassification = value;
    r.status = value;
    history(r, old, value);
    audit('Clasificación final registrada', `${r.id}: ${value}`, value);
    save();
    location.reload();
  });

  document.getElementById('rejectAiBtn').onclick = () => {
    const text = prompt('Indique la justificación para rechazar la clasificación de IA:');
    if (!text || !text.trim()) return toast('Debe indicar una justificación para rechazar la clasificación.', true);
    r.notes.push({ at: new Date().toLocaleString('es-CR'), user: user().user, text });
    const old = r.status;
    r.status = 'Pendiente de reclasificación';
    history(r, old, r.status);
    audit('Clasificación IA rechazada', `Justificación registrada en ${r.id}`, 'Observada');
    save();
    location.reload();
  };

  document.getElementById('noteForm').addEventListener('submit', e => {
    e.preventDefault();
    const text = new FormData(e.target).get('note').trim();
    if (!text) return toast('La observación no puede estar vacía.', true);
    r.notes.push({ at: new Date().toLocaleString('es-CR'), user: user().user, text });
    audit('Observación agregada', `${r.id}: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);
    save();
    location.reload();
  });

  document.getElementById('pdfBtn').onclick = () => {
    pdfReport(r);
    audit('Reporte PDF generado', `Reporte de cumplimiento descargado para ${r.id}`);
    toast('Reporte PDF generado correctamente.');
  };
}
