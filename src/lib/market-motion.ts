export function initializeMarketMotion(): void {
  const backgrounds = [...document.querySelectorAll<HTMLElement>('[data-market-background]')];
  if (!backgrounds.length) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set<HTMLElement>();
  const sync = () => {
    for (const background of backgrounds) {
      background.dataset.running = String(visible.has(background) && !document.hidden && !preference.matches);
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const background = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(background);
        else visible.delete(background);
      }
      sync();
    });
    backgrounds.forEach(background => observer.observe(background));
  }

  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => {
    backgrounds.forEach(background => { background.dataset.running = 'false'; });
  });
  addEventListener('pageshow', event => {
    if (event.persisted) sync();
  });
  sync();
}
