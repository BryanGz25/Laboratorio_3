/* PROCOMER · Centro de Administración: información del analista + panel de
   clasificación con pestañas, filas expandibles y decisión final. */
import { guard, getData, save, badge, esc, audit, history, toast } from './store.js';

if (!guard('Administrador')) throw '';

const data = getData();
const rs = data.requests;
let tab = 'todas';
let expandedId = null;

/* ============ INFORMACIÓN DEL ANALISTA ============ */
const pending = rs.filter(r => r.status === 'Pendiente').length;
const reviewed = rs.filter(r => r.finalClassification || ['En revisión', 'Aprobada', 'Rechazada'].includes(r.status)).length;
const aiOk = rs.filter(r => r.ai === 'Recomendada').length;

const infoCard = (label, value, sub, color) => `
  <article class="kpi-card">
    <div class="kpi-top"><h3>${label}</h3>
      <span class="kpi-icon ${color}"><svg class="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></span>
    </div>
    <b class="kpi-value">${value}</b>
    <span class="kpi-sub up">${sub}</span>
    <a class="kpi-link" href="dashboardAnalista.html">Ver mesa de análisis →</a>
  </article>`;

$('#analystInfo').innerHTML =
  infoCard('Solicitudes pendientes', pending, 'En espera de revisión del analista', 'violet') +
  infoCard('Casos gestionados', reviewed, 'Revisiones y decisiones registradas', 'blue') +
  infoCard('Recomendadas por IA', aiOk, 'Clasificadas como aptas para aprobación', 'green');

/* ============ PESTAÑAS ============ */
document.querySelectorAll('#decisionTabs .chip-filter').forEach(chip => {
  chip.onclick = () => {
    document.querySelectorAll('#decisionTabs .chip-filter').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    tab = chip.dataset.tab;
    draw();
  };
});

const matchTab = r =>
  tab === 'pendientes' ? !['Aprobada', 'Rechazada'].includes(r.finalClassification) :
  tab === 'aprobadas' ? r.finalClassification === 'Aprobada' :
  tab === 'rechazadas' ? r.finalClassification === 'Rechazada' : true;

/* ============ TABLA CON FILAS EXPANDIBLES ============ */
function draw() {
  $('#classRows').innerHTML = rs.filter(matchTab).map(r => {
    const decided = ['Aprobada', 'Rechazada'].includes(r.finalClassification);
    const extraRow = expandedId === r.id ? `
      <tr class="row-extra"><td colspan="7">
        <div class="extra-wrap">
          <span><b>Sector:</b> ${esc(r.sector)} · <b>Inversión:</b> US$ ${(+r.investment).toLocaleString()} · <b>Empleos:</b> ${r.jobs}</span>
          <span><b>Confianza IA:</b> ${r.confidence}% · <b>Documentos:</b> ${r.documents.length}/5 (${r.documents.join(', ')})</span>
          <span><b>Correo:</b> ${esc(r.email)}</span>
          ${r.notes.length ? `<span><b>Observaciones del analista:</b> ${r.notes.map(n => `"${esc(n.text)}" — ${esc(n.user)}`).join(' | ')}</span>` : '<span><b>Observaciones:</b> ninguna</span>'}
          <a href="detalleSolicitud.html?id=${r.id}" style="font-weight:800;color:#066a9e;">Abrir expediente completo →</a>
        </div>
      </td></tr>` : '';
    return `<tr data-id="${r.id}" class="${expandedId === r.id ? 'expanded' : ''}">
      <td><b>${r.id}</b></td>
      <td>${esc(r.company)}</td>
      <td>${r.score}/100</td>
      <td>${badge(r.ai)}</td>
      <td>${r.notes.length ? esc(r.notes[r.notes.length - 1].text.slice(0, 50)) + '…' : 'Sin observaciones'}</td>
      <td>${badge(r.status)}</td>
      <td ${expandedId === r.id ? 'onclick="event.stopPropagation()"' : ''}>
        ${decided ? badge(r.finalClassification)
        : `<div style="display:flex;gap:.4rem;flex-wrap:wrap;">
             <button class="button primary small" data-approve="${r.id}">Aprobar</button>
             <button class="button danger small" data-reject="${r.id}">Rechazar</button>
           </div>`}
      </td>
    </tr>${extraRow}`;
  }).join('') || `<tr><td colspan="7">No hay solicitudes en esta categoría.</td></tr>`;

  document.querySelectorAll('[data-approve]').forEach(b => b.onclick = e => { e.stopPropagation(); decide(b.dataset.approve, true); });
  document.querySelectorAll('[data-reject]').forEach(b => b.onclick = e => { e.stopPropagation(); decide(b.dataset.reject, false); });

  /* Clic en fila: expandir/contraer detalle */
  document.querySelectorAll('#classRows tr[data-id]').forEach(tr => {
    tr.onclick = () => {
      expandedId = expandedId === tr.dataset.id ? null : tr.dataset.id;
      draw();
    };
  });
}

function decide(id, approve) {
  const r = data.requests.find(x => x.id === id);
  if (!r) return;
  const value = approve ? 'Aprobada' : 'Rechazada';
  const old = r.status;
  r.finalClassification = value;
  r.status = value;
  history(r, old, value);
  audit(`Decisión final: ${value}`, `${id}: el administrador ${approve ? 'aprobó' : 'rechazó'} la solicitud desde el Centro de Administración`, value);
  save();
  draw();
  toast(`Solicitud ${id} ${value.toLowerCase()} correctamente.`);
}

draw();
