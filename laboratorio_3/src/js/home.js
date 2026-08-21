/* PROCOMER · Página principal */

/* Asegura reproducción automática de ambos videos (políticas del navegador) */
document.querySelectorAll('video[autoplay]').forEach(v => {
  v.muted = true;
  const play = () => v.play().catch(() => {});
  play();
  document.addEventListener('click', play, { once: true });
});
