/** Decorative synthetic surface; no market data or external assets. */
export function initializeHomeWave(): void {
  const layer = document.querySelector<HTMLElement>('[data-home-wave]');
  const canvas = layer?.querySelector('canvas');
  const toggle = document.querySelector<HTMLButtonElement>('[data-wave-toggle]');
  if (!layer || !canvas || !toggle) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const ctx = context;
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'home-wave-paused';
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === 'true'; } catch { /* Optional preference. */ }
  let width = 0, height = 0, columns = 0, rows = 0;
  let coordinates = new Float32Array(0);
  let time = 0, last = 0, frame = 0;
  let visible = false, active = true;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let dark = root.dataset.theme === 'dark';

  function draw(): void {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    for (let j = 0; j < rows; j++) {
      const v = j / (rows - 1), depth = 1 + v * 2.9;
      for (let i = 0; i < columns; i++) {
        const u = i / (columns - 1);
        const wave = Math.sin(u * 7.5 + v * 3 - time * .65) * .43
          + Math.cos(u * 4 - v * 5 + time * .38) * .24;
        const offset = (j * columns + i) * 2;
        coordinates[offset] = width * .67 + ((u - .5) * width * 2.05 + pointerX * 30) / depth;
        coordinates[offset + 1] = height * .39 + (v * height * .97 + wave * height * .19 + pointerY * 18) / depth;
      }
    }
    const ink = dark ? '99,220,213' : '19,108,119';
    ctx.lineWidth = .65;
    for (let j = 0; j < rows; j++) {
      ctx.beginPath();
      for (let i = 0; i < columns; i++) {
        const k = (j * columns + i) * 2;
        if (i) ctx.lineTo(coordinates[k]!, coordinates[k + 1]!);
        else ctx.moveTo(coordinates[k]!, coordinates[k + 1]!);
      }
      ctx.strokeStyle = `rgba(${ink},${.10 + j / rows * .18})`;
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(${ink},.12)`;
    for (let i = 0; i < columns; i += 2) {
      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        const k = (j * columns + i) * 2;
        if (j) ctx.lineTo(coordinates[k]!, coordinates[k + 1]!);
        else ctx.moveTo(coordinates[k]!, coordinates[k + 1]!);
      }
      ctx.stroke();
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
      const depth = 1 + j / (rows - 1) * 2.9;
      const pulse = Math.pow(Math.max(0, Math.sin(i * .71 + j * 1.27 - time * .85)), 16);
      const k = (j * columns + i) * 2;
      ctx.fillStyle = `rgba(${ink},${.16 + pulse * .72})`;
      ctx.beginPath();
      ctx.arc(coordinates[k]!, coordinates[k + 1]!, (.65 + pulse * 1.1) / Math.sqrt(depth), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function running(): boolean {
    return active && visible && !document.hidden && !paused && !preference.matches;
  }
  function tick(now: number): void {
    frame = 0;
    if (!running()) return;
    if (!last || now - last >= 1000 / 30) {
      const delta = last ? Math.min((now - last) / 1000, .08) : 0;
      time += delta;
      last = now;
      pointerX += (targetX - pointerX) * .07;
      pointerY += (targetY - pointerY) * .07;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    toggle!.hidden = preference.matches;
    toggle!.textContent = (paused ? toggle!.dataset.resumeLabel : toggle!.dataset.pauseLabel) ?? '';
    toggle!.setAttribute('aria-pressed', String(paused));
    layer!.dataset.running = String(running());
    if (running()) frame = requestAnimationFrame(tick);
    else draw();
  }
  function resize(): void {
    const bounds = layer!.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas!.width = Math.round(width * ratio);
    canvas!.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = width < 650 ? 34 : 58;
    rows = width < 650 ? 20 : 30;
    coordinates = new Float32Array(columns * rows * 2);
    draw();
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(storageKey, String(paused)); } catch { /* Animation still works. */ }
    sync();
  });
  const section = layer.closest('section');
  section?.addEventListener('pointermove', (event: PointerEvent) => {
    if (!running() || event.pointerType === 'touch') return;
    const bounds = layer.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / Math.max(width, 1) - .5;
    targetY = (event.clientY - bounds.top) / Math.max(height, 1) - .5;
  });
  section?.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(layer);
  else addEventListener('resize', resize);
  new MutationObserver(() => { dark = root.dataset.theme === 'dark'; draw(); })
    .observe(root, {attributes: true, attributeFilter: ['data-theme']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); }).observe(layer);
  }
  // Without an intersection observer, keep a static surface rather than an unbounded background loop.
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => { active = false; sync(); });
  addEventListener('pageshow', () => { active = true; sync(); });
  resize();
  sync();
}
