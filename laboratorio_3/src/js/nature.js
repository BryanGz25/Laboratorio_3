/* PROCOMER · Fondo animado de vegetación, flora y fauna.
   Inicia automáticamente y se repite en bucle infinito (animación basada en tiempo). */

export function initNature(canvasId = 'natureCanvas') {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H;

  const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  resize();
  window.addEventListener('resize', resize);

  /* Fauna: mariposas */
  const butterflies = Array.from({ length: 7 }, (_, i) => ({
    x: Math.random(), y: .25 + Math.random() * .55,
    speed: .0006 + Math.random() * .0009,
    amp: .04 + Math.random() * .07,
    phase: Math.random() * Math.PI * 2,
    size: 9 + Math.random() * 8,
    hue: [32, 340, 275, 16][i % 4]
  }));

  /* Fauna: aves */
  const birds = Array.from({ length: 4 }, () => ({
    x: Math.random(), y: .1 + Math.random() * .22,
    speed: .0012 + Math.random() * .0009, flap: Math.random() * 6
  }));

  /* Flora: hojas cayendo */
  const leaves = Array.from({ length: 14 }, () => ({
    x: Math.random(), y: Math.random(),
    speed: .0004 + Math.random() * .0005,
    sway: 20 + Math.random() * 30,
    phase: Math.random() * 6.28,
    size: 7 + Math.random() * 7,
    rot: Math.random() * 6.28
  }));

  const clouds = [
    { x: .15, y: .18, s: 1 }, { x: .5, y: .12, s: 1.4 }, { x: .8, y: .24, s: .9 }
  ];

  function drawPlant(baseX, baseY, h, blades, t) {
    ctx.strokeStyle = 'rgba(20,90,60,.85)';
    for (let i = 0; i < blades; i++) {
      const off = (i - blades / 2) * 7;
      const sway = Math.sin(t * .0012 + i * .7 + baseX) * 10;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(baseX + off, baseY);
      ctx.quadraticCurveTo(baseX + off + sway, baseY - h * .6, baseX + off + sway * 2.2, baseY - h);
      ctx.stroke();
    }
  }

  function drawTree(x, y, scale, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const sway = Math.sin(t * .0009 + x) * 3;
    ctx.fillStyle = 'rgba(58,44,28,.9)';
    ctx.fillRect(-4, -34, 8, 36);
    ctx.fillStyle = 'rgba(18,94,62,.92)';
    [[0,-52,30],[sway,-70,24],[-14,-46,18],[14,-48,18]].forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.29);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawButterfly(b, t) {
    b.x += b.speed;
    if (b.x > 1.08) b.x = -.08;
    const px = b.x * W;
    const py = (b.y + Math.sin(t * .0016 + b.phase) * b.amp) * H;
    const flap = Math.abs(Math.sin(t * .012 + b.phase));
    ctx.save();
    ctx.translate(px, py);
    const wing = b.size * (.35 + .65 * flap);
    ctx.fillStyle = `hsla(${b.hue},80%,60%,.95)`;
    ctx.beginPath(); ctx.ellipse(-wing * .55, 0, wing * .6, wing * .38, .45, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wing * .55, 0, wing * .6, wing * .38, -.45, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#3a2b20';
    ctx.beginPath(); ctx.ellipse(0, 0, 1.6, b.size * .34, 0, 0, 6.29); ctx.fill();
    ctx.restore();
  }

  function frame(t) {
    /* Cielo */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a4d33');
    sky.addColorStop(.55, '#0c6b52');
    sky.addColorStop(1, '#07423f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* Nubes a la deriva */
    ctx.fillStyle = 'rgba(255,255,255,.09)';
    clouds.forEach(c => {
      c.x += .00012 * c.s;
      if (c.x > 1.2) c.x = -.25;
      ctx.beginPath();
      ctx.ellipse(((c.x % 1.4) - .2) * W, c.y * H, 60 * c.s, 17 * c.s, 0, 0, 6.29);
      ctx.ellipse(((c.x % 1.4) - .2) * W + 40 * c.s, c.y * H - 9, 42 * c.s, 13 * c.s, 0, 0, 6.29);
      ctx.fill();
    });

    /* Aves volando */
    ctx.strokeStyle = 'rgba(235,250,240,.65)';
    ctx.lineWidth = 2;
    birds.forEach(b => {
      b.x += b.speed;
      b.flap += .18;
      if (b.x > 1.1) { b.x = -.1; b.y = .08 + Math.random() * .25; }
      const px = b.x * W, py = b.y * H;
      const f = Math.sin(b.flap) * 4;
      ctx.beginPath();
      ctx.moveTo(px - 9, py + f * .4);
      ctx.quadraticCurveTo(px - 4, py - f, px, py);
      ctx.quadraticCurveTo(px + 4, py - f, px + 9, py + f * .4);
      ctx.stroke();
    });

    /* Colinas de vegetación */
    const hill = (yBase, color, amp, freq, shift) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) {
        ctx.lineTo(x, yBase * H + Math.sin(x * freq + t * .0004 + shift) * amp);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    };
    hill(.72, 'rgba(11,84,56,.9)', 16, .008, 0);
    hill(.82, 'rgba(9,68,47,.96)', 20, .01, 2);
    hill(.92, 'rgba(6,52,38,1)', 14, .012, 4);

    /* Árboles */
    for (let i = 0; i < 5; i++) drawTree(W * (.08 + i * .21), H * .78, .8 + (i % 3) * .25, t);

    /* Matas de hierba en primer plano */
    for (let i = 0; i < 9; i++) drawPlant(W * (i / 8), H + 4, 46 + (i % 4) * 14, 5, t);

    /* Hojas cayendo */
    leaves.forEach(l => {
      l.y += l.speed;
      if (l.y > 1.05) { l.y = -.05; l.x = Math.random(); }
      const px = l.x * W + Math.sin(t * .001 + l.phase) * l.sway;
      const py = l.y * H;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(l.rot + t * .0012);
      ctx.fillStyle = 'rgba(126,188,110,.75)';
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * .45, 0, 0, 6.29);
      ctx.fill();
      ctx.strokeStyle = 'rgba(70,130,66,.8)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-l.size, 0); ctx.lineTo(l.size, 0); ctx.stroke();
      ctx.restore();
    });

    /* Mariposas */
    butterflies.forEach(b => drawButterfly(b, t));

    requestAnimationFrame(frame); /* Bucle infinito: se reinicia solo al terminar cada fotograma */
  }

  requestAnimationFrame(frame);
}
