/* PROCOMER · Administración de zonas francas: crear, editar, eliminar criterios */
import { guard, getData, save, esc, audit, toast } from './store.js';

if (!guard('Administrador')) throw '';

const data = getData();

const resetForm = () => {
  const f = document.getElementById('zoneForm');
  f.reset();
  f.id.value = '';
  document.getElementById('formTitle').textContent = 'Nueva zona franca';
};

const drawZones = () => {
  document.getElementById('zoneRows').innerHTML = data.zones.map(z => `
    <tr>
      <td><b>${esc(z.name)}</b></td>
      <td>US$ ${z.minInvestment.toLocaleString()}</td>
      <td>${z.minJobs}</td>
      <td>${z.sectors.join(', ')}</td>
      <td>
        <div style="display:flex;gap:.35rem;">
          <button class="button secondary small" data-edit="${z.id}">Editar</button>
          <button class="button danger-outline small" data-delete="${z.id}">Eliminar</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="5">No hay zonas registradas.</td></tr>';

  /* Editar */
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const z = data.zones.find(x => x.id === b.dataset.edit);
    if (!z) return;
    const f = document.getElementById('zoneForm');
    f.id.value = z.id;
    f.name.value = z.name;
    f.minInvestment.value = z.minInvestment;
    f.minJobs.value = z.minJobs;
    f.sectors.value = z.sectors.join(', ');
    document.getElementById('formTitle').textContent = `Editar ${z.name}`;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  /* Eliminar con confirmación */
  document.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => {
    const z = data.zones.find(x => x.id === b.dataset.delete);
    if (!z) return;
    if (!confirm(`¿Eliminar "${z.name}"? Esta acción no afecta solicitudes ya recibidas.`)) return;
    data.zones = data.zones.filter(x => x.id !== b.dataset.delete);
    audit('Zona franca eliminada', `${z.name} fue eliminada del sistema.`, 'Procesado');
    save();
    drawZones();
    toast(`Zona "${z.name}" eliminada.`);
  });
};
drawZones();

document.getElementById('cancelEdit').onclick = resetForm;

document.getElementById('zoneForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  if (!f.name) return toast('Debe indicar el nombre de la zona.', true);
  if (!f.minInvestment) return toast('Debe indicar la inversión mínima.', true);
  if (!f.minJobs) return toast('Debe indicar los empleos mínimos.', true);
  if (!f.sectors) return toast('Debe indicar los sectores permitidos.', true);

  const zoneData = {
    id: f.id || `zf-${Date.now()}`,
    name: f.name,
    minInvestment: +f.minInvestment,
    minJobs: +f.minJobs,
    sectors: f.sectors.split(',').map(s => s.trim()).filter(Boolean)
  };
  const pos = data.zones.findIndex(z => z.id === zoneData.id);
  const isNew = pos < 0;
  isNew ? data.zones.push(zoneData) : data.zones[pos] = zoneData;
  audit(isNew ? 'Zona franca registrada' : 'Zona franca actualizada', zoneData.name);
  save();
  location.reload();
});
