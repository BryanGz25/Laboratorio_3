/* PROCOMER · Dashboard de empresa: solicitudes propias, borrador, timeline,
   notificaciones y exportación. */
import { guard, getData, save, badge, esc, audit, csvExport, DRAFT, toast } from './store.js';

if (!guard('Empresa')) throw '';

const data = getData();
const mine = data.requests.filter(r => r.email === 'empresa@demo.cr');

/* Métricas */
document.getElementById('statSent').textContent = mine.length;
document.getElementById('statReview').textContent = mine.filter(r => r.status === 'En revisión').length;
document.getElementById('statClassified').textContent = mine.filter(r => r.finalClassification).length;

/* Tabla de mis solicitudes */
const rowsEl = document.getElementById('mineRows');
rowsEl.innerHTML = mine.map(r => `
  <tr>
    <td><a href="detalleSolicitud.html?id=${r.id}"><b>${r.id}</b></a></td>
    <td>${esc(r.company)}</td>
    <td>${r.createdAt}</td>
    <td>${r.score}/100</td>
    <td>${badge(r.status)}</td>
    <td><a href="detalleSolicitud.html?id=${r.id}">Ver detalle →</a></td>
  </tr>`).join('') || '<tr><td colspan="6">Aún no tiene solicitudes registradas.</td></tr>';

/* Banner de borrador */
const draft = JSON.parse(localStorage.getItem(DRAFT) || 'null');
if (draft && draft.company) {
  document.getElementById('draftBanner').innerHTML = `
    <div class="draft-banner">
      <div>
        <b>Tiene un borrador sin terminar</b>
        <p>Empresa: "${esc(draft.company)}". Puede continuarlo donde lo dejó.</p>
      </div>
      <div class="draft-actions">
        <a class="button primary small" href="solicitud.html">Continuar borrador</a>
        <button class="button danger-outline small" id="discardDraft">Descartar</button>
      </div>
    </div>`;
  document.getElementById('discardDraft').onclick = () => {
    localStorage.removeItem(DRAFT);
    audit('Borrador descartado', 'La empresa eliminó su borrador de solicitud.');
    save();
    location.reload();
  };
}

/* Timeline: últimos movimientos de mis expedientes */
const moves = [];
mine.forEach(r => r.history.slice(0, 3).forEach(h => moves.push({ ...h, id: r.id })));
moves.sort((a, b) => (b.at > a.at ? 1 : -1));
document.getElementById('timeline').innerHTML = moves.slice(0, 6).map(m =>
  `<li><b>${m.id}</b> · ${esc(m.from)} → ${esc(m.to)} <br><small style="color:#7d94a8;">${m.at} · ${esc(m.user)}</small></li>`
).join('') || '<li>Sin movimientos todavía.</li>';

/* Notificaciones derivadas del estado */
const notifIcon = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
const notifs = mine.flatMap(r => {
  const n = [{ icon: notifIcon, text: `Su solicitud ${r.id} está "${r.status}".`, at: r.history[0]?.at || r.createdAt }];
  if (r.confidence < 60) n.push({ icon: notifIcon, text: `Alerta: confianza IA baja en ${r.id} (${r.confidence}%). Un analista la revisará.`, at: 'Reciente' });
  if (r.documents.length < 4) n.push({ icon: notifIcon, text: `Documentación incompleta en ${r.id}: adjunte los documentos faltantes.`, at: 'Pendiente' });
  return n;
});
document.getElementById('notifs').innerHTML =
  notifs.slice(0, 5).map(n => `<li>${n.icon}<span>${n.text}<time>${n.at}</time></span></li>`).join('')
  || '<li>No hay notificaciones nuevas.</li>';

/* Exportación CSV propia */
document.getElementById('exportMine').onclick = () => {
  const content = ['ID,Empresa,Fecha,Puntaje,Estado',
    ...mine.map(r => `${r.id},"${r.company}",${r.createdAt},${r.score},${r.status}`)].join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mis-solicitudes-procomer.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  toast('Listado exportado correctamente.');
};
