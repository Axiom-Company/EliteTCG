// Dependency-free confetti that shoots from the left and right edges of the
// screen toward the center. Spawns a temporary full-screen canvas overlay and
// removes itself once every particle has settled.

export function sideConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999';
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  document.body.appendChild(canvas);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  const particles = [];

  const launch = (side) => {
    const fromLeft = side === 'left';
    for (let i = 0; i < 70; i++) {
      // up-and-inward: left cannon aims up-right, right cannon aims up-left
      const base = fromLeft ? -Math.PI / 4 : (-3 * Math.PI) / 4;
      const angle = base + (Math.random() - 0.5) * 0.6;
      const speed = 11 + Math.random() * 11;
      particles.push({
        x: fromLeft ? -8 : W() + 8,
        y: H() * (0.55 + (Math.random() - 0.5) * 0.35),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 7,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        life: 1,
      });
    }
  };
  launch('left');
  launch('right');

  const gravity = 0.32;
  const drag = 0.99;
  let raf;

  const frame = () => {
    ctx.clearRect(0, 0, W(), H());
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.008;
      if (p.life > 0 && p.y < H() + 24) alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);
}
