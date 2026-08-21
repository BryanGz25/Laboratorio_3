/* PROCOMER · Formulario de solicitud: borrador, validación de archivos,
   evaluación automática y asistente virtual. */
import { guard, getData, save, evaluate, audit, history, toast, sectors, DRAFT } from './store.js';

if (!guard('Empresa')) throw '';

const data = getData();

/* Opciones dinámicas */
document.getElementById('zoneSelect').innerHTML =
  data.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
const sectorSel = document.querySelector('select[name="sector"]');
sectors.forEach(s => {
  const o = document.createElement('option');
  o.textContent = s;
  sectorSel.appendChild(o);
});

/* Validación de documentos */
document.getElementById('files').addEventListener('change', e => {
  const fs = [...e.target.files];
  if (fs.length > 5 || fs.some(f => f.type !== 'application/pdf' || f.size > 10485760)) {
    e.target.value = '';
    return toast('Cada archivo debe ser PDF, máximo 10 MB; puede adjuntar hasta 5 archivos.', true);
  }
  document.getElementById('fileInfo').textContent = `${fs.length} archivo(s): ${fs.map(f => f.name).join(', ')}`;
});

/* Borradores locales */
document.getElementById('draftBtn').onclick = () => {
  localStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(new FormData(document.getElementById('requestForm')))));
  toast('Borrador guardado en este dispositivo.');
};
const draft = JSON.parse(localStorage.getItem(DRAFT) || 'null');
if (draft) Object.entries(draft).forEach(([k, v]) => {
  const el = document.getElementById('requestForm')[k];
  if (el) el.value = v;
});

/* Envío + evaluación automática */
document.getElementById('requestForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const fs = [...document.getElementById('files').files];
  if (fs.length < 4) return toast('Adjunte los 4 documentos obligatorios antes de enviar.', true);

  document.getElementById('progress').classList.add('show');
  try {
    const score = await evaluate(f, data.zones.find(z => z.id === f.zone), fs);
    const id = `ZF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const r = {
      ...f, id, investment: +f.investment, jobs: +f.jobs,
      documents: fs.map(x => x.name), score,
      ai: score >= 80 ? 'Recomendada' : score >= 50 ? 'Revisar' : 'Rechazada',
      confidence: score >= 80 ? 92 : 64,
      status: 'Pendiente', finalClassification: null, notes: [],
      responseHours: 24, createdAt: new Date().toLocaleDateString('es-CR'), history: []
    };
    setTimeout(() => {
      history(r, '—', 'Pendiente');
      data.requests.unshift(r);
      audit('Solicitud enviada', `${id} recibida correctamente`, 'Pendiente');
      save();
      localStorage.removeItem(DRAFT);
      toast(`Solicitud guardada. Código de seguimiento: ${id}`);
      setTimeout(() => location.href = `detalleSolicitud.html?id=${id}`, 1400);
    }, 700);
  } catch (err) {
    document.getElementById('progress').classList.remove('show');
    toast(err.message || 'No se pudo guardar la solicitud. Intente de nuevo.', true);
  }
});

/* Asistente virtual */
const chat = document.getElementById('chat');
document.getElementById('chatToggle').onclick = () => chat.classList.add('open');
document.getElementById('closeChat').onclick = () => chat.classList.remove('open');
document.getElementById('chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.elements[0], q = input.value.toLowerCase(), box = document.getElementById('messages');
  const answer =
    q.includes('document') ? 'Adjunte formulario de solicitud, plan de inversión, estudio de factibilidad y personería jurídica, en PDF.' :
    q.includes('invers') ? 'La inversión mínima depende de la zona seleccionada; actualmente inicia en US$150 000.' :
    q.includes('emple') ? 'El mínimo de empleos varía por zona; la mayoría exige al menos 10 puestos directos.' :
    q.includes('sector') ? `Los sectores permitidos son: ${sectors.join(', ')}.` :
    q.includes('estado') ? 'Podrá seguir el estado con el código ZF-2026-XXXX desde la sección Seguimiento.' :
    'Un analista le responderá pronto. Puede consultar también info@procomer.com.';
  const userP = document.createElement('p');
  userP.className = 'user';
  userP.textContent = input.value;
  box.appendChild(userP);
  const botP = document.createElement('p');
  botP.textContent = answer;
  box.appendChild(botP);
  box.scrollTop = box.scrollHeight;
  input.value = '';
});
