/* PROCOMER · Capa de datos compartida (localStorage + sesión) */

export const KEY = 'procomer-cr-v1';
export const SESSION = 'procomer-session';
export const DRAFT = 'procomer-draft';

/* Migración silenciosa desde las claves antiguas para no perder datos */
const legacyData = localStorage.getItem('zofranca-cr-v3');
if (legacyData && !localStorage.getItem(KEY)) localStorage.setItem(KEY, legacyData);
const legacySession = sessionStorage.getItem('zofranca-session');
if (legacySession && !sessionStorage.getItem(SESSION)) sessionStorage.setItem(SESSION, legacySession);

export const roles = {
  Administrador: { user: 'admin', password: 'admin123', page: 'dashboardAdministrador.html' },
  Analista: { user: 'analista', password: 'analista123', page: 'dashboardAnalista.html' },
  Empresa: { user: 'empresa', password: 'empresa123', page: 'dashboardEmpresa.html' }
};

export const sectors = ['Manufactura', 'Servicios', 'Ciencias de la vida', 'Agroindustria', 'Tecnologías de la información'];
const docs = ['Formulario de solicitud.pdf', 'Plan de inversión.pdf', 'Estudio de factibilidad.pdf', 'Personería jurídica.pdf'];

const initial = () => ({
  zones: [{ id: 'coyol', name: 'Zona Franca Coyol', minInvestment: 150000, minJobs: 10, sectors }],
  requests: [
    {
      id: 'ZF-2026-8841', company: 'BioTech Costa Rica S.A.', email: 'empresa@demo.cr', zone: 'coyol',
      sector: 'Ciencias de la vida', investment: 300000, jobs: 35, documents: docs, score: 100,
      ai: 'Recomendada', confidence: 92, status: 'Pendiente', finalClassification: null, notes: [],
      responseHours: 18, createdAt: '20/08/2026',
      history: [{ at: '20/08/2026 09:00', user: 'Sistema', from: '—', to: 'Pendiente' }]
    },
    {
      id: 'ZF-2026-8842', company: 'EcoSolar del Pacífico Ltda.', email: 'info@ecosolar.cr', zone: 'coyol',
      sector: 'Servicios', investment: 175000, jobs: 8, documents: docs.slice(0, 2), score: 50,
      ai: 'Revisar', confidence: 64, status: 'Pendiente', finalClassification: null, notes: [],
      responseHours: 26, createdAt: '19/08/2026',
      history: [{ at: '19/08/2026 09:00', user: 'Sistema', from: '—', to: 'Pendiente' }]
    },
    {
      id: 'ZF-2026-8845', company: 'Global Trade Syndicate', email: 'info@globaltrade.cr', zone: 'coyol',
      sector: 'Otro', investment: 50000, jobs: 2, documents: [docs[0]], score: 25,
      ai: 'Rechazada', confidence: 21, status: 'Pendiente', finalClassification: null, notes: [],
      responseHours: 9, createdAt: '18/08/2026',
      history: [{ at: '18/08/2026 09:00', user: 'Sistema', from: '—', to: 'Pendiente' }]
    }
  ],
  audit: [
    { at: '20/08/2026 09:05', user: 'Sistema', action: 'Clasificación IA generada', estado: 'Pendiente', detail: 'ZF-2026-8841: Recomendada con 92% de confianza' },
    { at: '20/08/2026 09:00', user: 'empresa', action: 'Solicitud enviada', estado: 'Pendiente', detail: 'ZF-2026-8841 recibida y almacenada correctamente' },
    { at: '19/08/2026 10:12', user: 'analista', action: 'Revisión iniciada', estado: 'En revisión', detail: 'ZF-2026-8842 asignada a mesa de análisis' },
    { at: '19/08/2026 09:00', user: 'empresa', action: 'Solicitud enviada', estado: 'Pendiente', detail: 'ZF-2026-8842 recibida y almacenada correctamente' },
    { at: '18/08/2026 15:40', user: 'Sistema', action: 'Alerta de anomalía', estado: 'Observada', detail: 'Confianza IA baja en ZF-2026-8845 (21%) y documentación incompleta' },
    { at: '18/08/2026 09:00', user: 'empresa', action: 'Solicitud enviada', estado: 'Pendiente', detail: 'ZF-2026-8845 recibida y almacenada correctamente' }
  ]
});

let data = JSON.parse(localStorage.getItem(KEY) || 'null') || initial();
if (!Array.isArray(data.resolvedAlerts)) data.resolvedAlerts = [];
export const save = () => localStorage.setItem(KEY, JSON.stringify(data));
export const getData = () => data;
export const user = () => JSON.parse(sessionStorage.getItem(SESSION) || 'null');
export const request = id => data.requests.find(r => r.id === id);
export const zone = id => data.zones.find(z => z.id === id);

export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const badge = x => `<span class="badge ${['Recomendada', 'Aprobada'].includes(x) ? 'ok' : ['Rechazada', 'Denegada'].includes(x) ? 'bad' : 'warn'}">${esc(x)}</span>`;

export function toast(text, error = false) {
  const n = $('#toast');
  if (!n) return alert(text);
  n.textContent = text;
  n.className = `toast visible ${error ? 'error' : ''}`;
  setTimeout(() => n.className = 'toast', 3600);
}

export function audit(action, detail, estado = 'Procesado') {
  data.audit.unshift({ at: new Date().toLocaleString('es-CR'), user: user()?.user || 'Sistema', action, estado, detail });
  save();
}

export function history(r, from, to) {
  r.history.unshift({ at: new Date().toLocaleString('es-CR'), user: user()?.user || 'Sistema', from, to });
}

export function guard(...allowed) {
  if (!user() || !allowed.includes(user().role)) { location.href = 'login.html'; return false; }
  return true;
}

/* KPIs del panel administrativo */
export function kpis() {
  const rs = data.requests;
  const processed = rs.filter(r => r.finalClassification || r.status !== 'Pendiente');
  const approved = rs.filter(r => ['Aprobada', 'Recomendada'].includes(r.finalClassification || r.ai)).length;
  const rate = rs.length ? Math.round((approved / rs.length) * 100) : 0;
  const avg = rs.length ? (rs.reduce((s, r) => s + (r.responseHours || 24), 0) / rs.length).toFixed(1) : '0.0';
  const anomalies = rs.filter(r => r.confidence < 60 || r.score < 80 || r.documents.length < 4);
  return { total: rs.length, processed: processed.length || rs.length, rate, avg, anomalies };
}

/* Descargas: CSV y reporte PDF */
function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 100);
}

export function csvExport() {
  download('solicitudes-procomer.csv',
    ['ID,Empresa,Fecha,Estado,Clasificación IA,Puntaje', ...data.requests.map(r => `${r.id},"${r.company}",${r.createdAt},${r.status},${r.ai},${r.score}`)].join('\n'),
    'text/csv');
}

export function pdfReport(r) {
  const clean = s => String(s).replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '');
  const lines = [
    'REPORTE DE CUMPLIMIENTO - PROCOMER', `Empresa: ${r.company}`,
    'Criterios: inversion, empleos, sector y documentos', `Puntaje: ${r.score}/100`,
    `Clasificacion: ${r.finalClassification || r.ai}`, `Estado: ${r.status}`,
    `Observaciones: ${r.notes.map(n => n.text).join('; ') || 'Sin observaciones'}`
  ];
  const stream = `BT /F1 12 Tf 50 760 Td ${lines.map((x, i) => `${i ? '0 -22 Td ' : ''}(${clean(x)}) Tj`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n', offs = [0];
  objects.forEach((x, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${x}\nendobj\n`; });
  const start = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offs.slice(1).map(x => `${String(x).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  download(`reporte-${r.id}.pdf`, pdf, 'application/pdf');
}

export async function evaluate(f, z, files) {
  try {
    const checks = await Promise.all([
      Promise.resolve(+f.investment >= z.minInvestment),
      Promise.resolve(+f.jobs >= z.minJobs),
      Promise.resolve(z.sectors.includes(f.sector)),
      Promise.resolve(files.length >= 4)
    ]);
    return checks.filter(Boolean).length * 25;
  } catch { throw new Error('No se pudo completar la operación. Por favor, verificá tu conexión e intentá de nuevo.'); }
}
