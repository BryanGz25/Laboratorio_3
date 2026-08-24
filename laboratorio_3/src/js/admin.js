/* PROCOMER · Panel administrativo: KPIs con accesos directos, resumen de zonas,
   anomalías y auditoría con búsqueda, filtros y modal de tiquet completo. */
import { guard, getData, kpis, badge, esc, audit, csvExport } from './store.js';

if (!guard('Administrador')) throw '';

const data = getData();
const k = kpis();

/* ============ 3 CAJAS DE IGUAL TAMAÑO (con acceso directo) ============ */
$('#kpiRow').innerHTML = `
  <article class="kpi-card">
    <div class="kpi-top">
      <h3>Tasa de aprobación</h3>
      <span class="kpi-icon green"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
    </div>
    <b class="kpi-value">${k.rate}<small>%</small></b>
    <span class="kpi-sub up">Solicitudes aprobadas o recomendadas</span>
    <div class="kpi-bar"><i style="width:${k.rate}%"></i></div>
    <a class="kpi-link" href="centroAdministracion.html">Aprobar / rechazar solicitudes →</a>
  </article>
  <article class="kpi-card">
    <div class="kpi-top">
      <h3>Total solicitudes procesadas</h3>
      <span class="kpi-icon blue"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg></span>
    </div>
    <b class="kpi-value">${k.processed}</b>
    <span class="kpi-sub up">De ${k.total} recibidas en el sistema</span>
    <div class="kpi-bar"><i style="width:${Math.round((k.processed / Math.max(k.total, 1)) * 100)}%"></i></div>
    <a class="kpi-link" href="centroAdministracion.html">Gestionar solicitudes →</a>
  </article>
  <article class="kpi-card">
    <div class="kpi-top">
      <h3>Promedio de respuesta</h3>
      <span class="kpi-icon violet"><svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>
    </div>
    <b class="kpi-value">${k.avg}<small>horas</small></b>
    <span class="kpi-sub up">Tiempo medio procesado por solicitud</span>
    <div class="kpi-bar"><i style="width:72%"></i></div>
    <a class="kpi-link" href="cumplimiento.html">Ver cumplimiento →</a>
  </article>`;

/* ============ RESUMEN DE ZONAS ============ */
$('#zoneStrip').innerHTML =
  data.zones.map(z => `<span class="zone-pill">
      <svg class="icon-svg" style="width:16px;height:16px;" viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></svg>
      ${esc(z.name)} · US$ ${z.minInvestment.toLocaleString()}
    </span>`).join('') +
  `<a class="zone-pill" href="zonasFrancas.html" style="background:#eaf6fc;border-color:#bcdff0;color:#066a9e;">
     Administrar zonas →
   </a>`;

/* ============ ANOMALÍAS DETECTADAS (rosado con letras rojas) ============ */
const iconAlert = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
$('#anomalyCard').innerHTML = `
  <header>${iconAlert}<h2>Anomalías detectadas</h2></header>
  ${k.anomalies.length
    ? `<ul class="anomaly-list">${k.anomalies.map(r => `
        <li>${iconAlert}
          <span>${esc(r.company)} (${r.id}) — puntaje ${r.score}/100, confianza IA ${r.confidence}%${r.documents.length < 4 ? ', documentación incompleta' : ''}.
            <a href="detalleSolicitud.html?id=${r.id}" style="color:#c1123f;">Abrir expediente →</a></span>
        </li>`).join('')}</ul>`
    : '<p class="anomaly-empty">No hay anomalías activas. Todo el sistema opera dentro de los parámetros normales.</p>'}`;

/* ============ TABLA DE AUDITORÍA CON FILTROS ============ */
let searchAudit = '', filterUser = '', filterEstado = '';

function filteredAudit() {
  return data.audit.filter(a => {
    const matchSearch = `${a.at} ${a.user} ${a.action} ${a.detail}`.toLowerCase().includes(searchAudit);
    const matchUser = !filterUser || a.user === filterUser;
    const matchEstado = !filterEstado || (a.estado || '') === filterEstado;
    return matchSearch && matchUser && matchEstado;
  });
}

function drawAudit() {
  $('#auditRows').innerHTML = filteredAudit().map((a) => {
    const estadoBadge = ['Aprobada', 'Procesado'].includes(a.estado) ? 'ok'
      : ['Rechazada', 'Observada'].includes(a.estado) ? 'bad' : 'warn';
    const code = (a.detail.match(/ZF-\d{4}-\d+/) || [])[0];
    return `<tr>
      <td>${a.at}</td>
      <td><b>${esc(a.user)}</b></td>
      <td>${esc(a.action)}</td>
      <td><span class="badge ${estadoBadge}">${esc(a.estado || '—')}</span></td>
      <td>${esc(a.detail)}</td>
      <td><button class="detail-btn" data-at="${a.at}">
        <svg class="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        Ver detalles</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6">No hay registros que coincidan con el filtro aplicado.</td></tr>';

  document.querySelectorAll('.detail-btn').forEach(b =>
    b.onclick = () => {
      const entry = data.audit.find(x => x.at === b.dataset.at);
      if (entry) openTicket(entry);
    });
}
drawAudit();

$('#auditSearch').addEventListener('input', e => { searchAudit = e.target.value.toLowerCase(); drawAudit(); });
$('#auditUser').addEventListener('change', e => { filterUser = e.target.value; drawAudit(); });
$('#auditEstado').addEventListener('change', e => { filterEstado = e.target.value; drawAudit(); });

/* ============ MODAL CON EL TIQUET COMPLETO ============ */
function openTicket(entry) {
  const code = (entry.detail.match(/ZF-\d{4}-\d+/) || [])[0];
  const r = code ? data.requests.find(x => x.id === code) : null;
  $('#modalTitle').textContent = r ? `Tiquet ${r.id} · ${r.company}` : `Detalle de la acción`;

  const info = (label, value) => `<div class="info-item"><b>${label}</b>${value}</div>`;

  $('#modalBody').innerHTML = r ? `
    <h3>Información de la solicitud</h3>
    <div class="info-grid">
      ${info('Código de seguimiento', r.id)}
      ${info('Empresa', esc(r.company))}
      ${info('Correo de contacto', esc(r.email))}
      ${info('Fecha de creación', r.createdAt)}
      ${info('Zona franca solicitada', esc(data.zones.find(z => z.id === r.zone)?.name || '—'))}
      ${info('Sector industrial', esc(r.sector))}
      ${info('Inversión proyectada', 'US$ ' + (+r.investment).toLocaleString())}
      ${info('Empleos proyectados', r.jobs)}
    </div>

    <h3>Evaluación</h3>
    <div class="info-grid">
      ${info('Puntaje de cumplimiento', `${r.score}/100`)}
      ${info('Clasificación IA', `${badge(r.ai)} · confianza ${r.confidence}%`)}
      ${info('Estado actual', badge(r.status))}
      ${info('Clasificación final', r.finalClassification ? badge(r.finalClassification) : 'Pendiente de decisión')}
    </div>

    <h3>Documentos adjuntos (${r.documents.length})</h3>
    <ul style="padding-left:1.1rem;color:#334e68;font-size:.9rem;">
      ${r.documents.map(d => `<li>${esc(d)}</li>`).join('')}
    </ul>

    ${r.notes.length ? `<h3>Justificaciones / Observaciones</h3>
      ${r.notes.map(n => `<p class="result"><b>${esc(n.user)}</b> · ${n.at}<br>${esc(n.text)}</p>`).join('')}` : ''}

    <h3>Movimientos del tiquet</h3>
    <table>
      <thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Anterior</th><th>Nuevo</th></tr></thead>
      <tbody>${r.history.map(h => `<tr><td>${h.at}</td><td>${esc(h.user)}</td><td>${esc(h.from)}</td><td>${badge(h.to)}</td></tr>`).join('')}</tbody>
    </table>

    <p style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap;">
      <a class="button secondary" href="detalleSolicitud.html?id=${r.id}">Abrir expediente completo →</a>
      <a class="button primary" href="centroAdministracion.html">Decidir en el Centro de Administración</a>
    </p>`
    : `
    <div class="info-grid">
      ${info('Marcación de tiempo', entry.at)}
      ${info('Usuario responsable', esc(entry.user))}
      ${info('Acción realizada', esc(entry.action))}
      ${info('Estado', esc(entry.estado || '—'))}
    </div>
    <h3>Justificación / Detalles</h3>
    <p class="result">${esc(entry.detail)}</p>
    <p style="color:#5a7089;font-size:.88rem;">Esta entrada de auditoría no está asociada a un tiquet de solicitud específico.</p>`;

  $('#ticketModal').classList.add('open');
}

$('#modalClose').onclick = () => $('#ticketModal').classList.remove('open');
$('#ticketModal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#ticketModal').classList.remove('open'); });

$('#csvBtn').onclick = () => { csvExport(); audit('Reporte CSV exportado', 'Panel administrativo exportó el listado de solicitudes.'); };
