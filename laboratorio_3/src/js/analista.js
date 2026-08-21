/* PROCOMER · Dashboard del analista: métricas, búsqueda, filtros por estado,
   revisión rápida desde la tabla y exportación. */
import { guard, getData, save, badge, esc, csvExport, audit, history, toast } from './store.js';

if (!guard('Analista')) throw '';

const data = getData();
const rs = [...data.requests].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
let currentFilter = 'todas';
let searchTerm = '';

const counters = () => {
  document.getElementById('statPending').textContent = rs.filter(r => r.status === 'Pendiente').length;
  document.getElementById('statOk').textContent = rs.filter(r => r.ai === 'Recomendada').length;
  document.getElementById('statReview').textContent = rs.filter(r => r.ai === 'Revisar').length;
};
counters();

/* Filtro por pestañas */
document.querySelectorAll('#filterTabs .chip-filter').forEach(chip => {
  chip.onclick = () => {
    document.querySelectorAll('#filterTabs .chip-filter').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    draw();
  };
});

/* Búsqueda */
document.getElementById('searchInput').addEventListener('input', e => {
  searchTerm = e.target.value.toLowerCase();
  draw();
});

function filtered() {
  return rs.filter(r => {
    const matchSearch = `${r.company} ${r.id}`.toLowerCase().includes(searchTerm);
    const matchFilter =
      currentFilter === 'todas' ? true :
      currentFilter === 'clasificadas' ? !!r.finalClassification || ['Aprobada', 'Rechazada', 'Pendiente de reclasificación'].includes(r.status) :
      r.status === currentFilter;
    return matchSearch && matchFilter;
  });
}

function draw() {
  const list = filtered();
  document.getElementById('rows').innerHTML = list.map(r => `
    <tr>
      <td><a href="detalleSolicitud.html?id=${r.id}"><b>${r.id}</b></a></td>
      <td>${esc(r.company)}<br><small style="color:#7d94a8;">${esc(r.sector)}</small></td>
      <td>${r.createdAt}</td>
      <td>${badge(r.status)}</td>
      <td>${badge(r.ai)}<br><small style="color:#7d94a8;">confianza ${r.confidence}%</small></td>
      <td>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;">
          ${r.status === 'Pendiente'
            ? `<button class="button primary small" data-start="${r.id}">Iniciar revisión</button>`
            : `<span class="badge ok">Gestionada</span>`}
          <a class="button secondary small" href="detalleSolicitud.html?id=${r.id}">Abrir</a>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6">Sin resultados para el filtro actual.</td></tr>';

  document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startReview(b.dataset.start));
}

/* Revisión rápida sin salir de la tabla */
function startReview(id) {
  const r = rs.find(x => x.id === id);
  if (!r || r.status !== 'Pendiente') return toast('Esta solicitud ya fue gestionada.', true);
  const old = r.status;
  r.status = 'En revisión';
  history(r, old, r.status);
  audit('Revisión iniciada', `El analista inició la revisión de ${id}`, 'En revisión');
  save();
  counters();
  draw();
  toast(`Revisión de ${id} iniciada.`);
}

/* Exportación */
document.getElementById('csvBtn').onclick = () => {
  csvExport();
  audit('Reporte CSV exportado', 'El analista exportó el listado de solicitudes.');
};
draw();
