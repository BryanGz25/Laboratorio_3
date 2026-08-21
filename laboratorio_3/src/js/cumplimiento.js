/* PROCOMER · Cumplimiento: métricas, alertas gestionables (marcar como atendida)
   y exportación de alertas. */
import { guard, getData, save, badge, esc, audit, toast } from './store.js';

if (!guard('Administrador')) throw '';

const data = getData();
const iconAlert = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';

const openAlerts = () => data.requests.filter(r =>
  !data.resolvedAlerts.includes(r.id) && (r.confidence < 60 || r.score < 80 || r.documents.length < 4));

function renderMetrics() {
  const alerts = openAlerts();
  const validated = data.requests.filter(r => r.finalClassification);
  document.getElementById('metrics').innerHTML = `
    <article><small>Índice de cumplimiento</small><b>${Math.max(100 - Math.round((alerts.length / Math.max(data.requests.length, 1)) * 40), 60)}%</b></article>
    <article><small>Alertas abiertas</small><b>${alerts.length}</b></article>
    <article><small>Solicitudes validadas</small><b>${validated.length}</b></article>`;
}

function renderAlerts() {
  const alerts = openAlerts();
  document.getElementById('alerts').innerHTML = alerts.length
    ? `<ul class="anomaly-list">${alerts.map(r => `
        <li>${iconAlert}
          <span style="flex:1;">${esc(r.company)} (${r.id}) — ${r.score < 80 ? 'puntaje menor a 80' : 'confianza IA baja'}${r.documents.length < 4 ? ', documentación incompleta' : ''}.
            <a href="detalleSolicitud.html?id=${r.id}" style="color:#c1123f;font-weight:800;">Abrir expediente →</a>
          </span>
          <button class="button secondary small" data-resolve="${r.id}">Marcar como atendida</button>
        </li>`).join('')}</ul>`
    : '<p class="anomaly-empty">No hay alertas activas en este momento. Todas fueron atendidas.</p>';

  document.querySelectorAll('[data-resolve]').forEach(b => b.onclick = () => {
    const r = data.requests.find(x => x.id === b.dataset.resolve);
    if (!r) return;
    data.resolvedAlerts.push(r.id);
    r.notes.push({ at: new Date().toLocaleString('es-CR'), user: 'admin', text: 'Anomalía revisada y marcada como atendida por el administrador.' });
    audit('Alerta atendida', `La anomalía de ${r.id} fue marcada como atendida.`, 'Procesado');
    save();
    renderMetrics();
    renderAlerts();
    toast(`Alerta de ${r.id} marcada como atendida.`);
  });
}

renderMetrics();
renderAlerts();

/* Solicitudes validadas */
document.getElementById('validatedRows').innerHTML =
  data.requests.filter(r => r.finalClassification).map(r => `
    <tr><td><a href="detalleSolicitud.html?id=${r.id}"><b>${r.id}</b></a></td>
    <td>${esc(r.company)}</td><td>${badge(r.ai)}</td><td>${badge(r.finalClassification)}</td></tr>`
  ).join('') || '<tr><td colspan="4">Aún no hay solicitudes validadas.</td></tr>';

/* Exportar alertas */
document.getElementById('exportAlerts').onclick = () => {
  const rows = openAlerts();
  const content = ['ID,Empresa,Puntaje,Confianza IA,Motivo',
    ...rows.map(r => `${r.id},"${r.company}",${r.score},${r.confidence}%,"${r.score < 80 ? 'Puntaje bajo' : 'Confianza baja'}${r.documents.length < 4 ? ' + docs incompletos' : ''}"`)].join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'alertas-procomer.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  audit('Alertas exportadas', `El administrador exportó ${openAlerts().length} alertas activas.`);
  toast('Alertas exportadas correctamente.');
};
