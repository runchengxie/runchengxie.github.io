/** Brief entry decoration; content remains visible before this runs. */
export function initializeContentEntry() {
  const heading = document.querySelector<HTMLElement>('[data-page-entry]');
  if (!heading || !heading.getAnimations) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set<HTMLElement>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  const visible = (node: HTMLElement) => {
    const bounds = node.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < innerHeight;
  };
  const settle = (node: HTMLElement) => {
    node.removeAttribute('data-entry-active');
    node.style.removeProperty('--entry-delay');
    active.delete(node);
  };
  const stop = () => { clearTimeout(timer); active.forEach(settle); };
  const play = () => {
    stop();
    pending = document.hidden;
    if (pending || preference.matches) return;
    const candidates = heading.dataset.pageEntry === 'blog'
      ? document.querySelectorAll<HTMLElement>('[data-motion-archive] .post-list__item')
      : document.querySelectorAll<HTMLElement>('.about-content > section');
    const targets = [heading, ...[...candidates].filter(visible).slice(0, 2)]
      .filter(node => visible(node) && !node.contains(document.activeElement) && !node.hasAttribute('data-reveal'));
    // Reset any history-restored effect before starting a new pass.
    void heading.offsetWidth;
    targets.forEach((node, index) => {
      node.style.setProperty('--entry-delay', `${index * 15}ms`);
      node.dataset.entryActive = 'true'; active.add(node);
    });
    timer = setTimeout(stop, 600);
  };
  heading.parentElement?.addEventListener('animationend', event => {
    if ((event as AnimationEvent).animationName === 'page-entry') settle(event.target as HTMLElement);
  });
  document.addEventListener('focusin', event => {
    for (const node of active) if (node.contains(event.target as Node)) settle(node);
  });
  preference.addEventListener('change', () => {
    if (preference.matches) stop();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (pending) play();
  });
  addEventListener('pagehide', () => {
    pending = false; stop();
  });
  addEventListener('pageshow', event => {
    if (event.persisted) play();
  });
  const start = play;
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
