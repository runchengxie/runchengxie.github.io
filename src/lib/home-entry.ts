/** A visible, once-per-session intro with an explicit replay control. */
export function initializeHomeEntry() {
  const section = document.querySelector<HTMLElement>('#home-intro');
  const button = document.querySelector<HTMLButtonElement>('[data-home-replay]');
  const status = document.querySelector<HTMLElement>('[data-home-entry-status]');
  const frame = section?.querySelector<SVGPathElement>('.intro-frame path');
  if (!section || !button || !status || !frame || !section.getAnimations) return;
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'personal-site-home-motion-v2';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(timer);
    root.removeAttribute('data-home-motion');
  };
  const updatePreference = () => {
    button.disabled = preference.matches;
    status.hidden = !preference.matches;
    if (preference.matches) stop();
  };
  const play = () => {
    if (preference.matches || document.hidden) return;
    stop();
    // Resolve the static state before restarting an explicitly requested replay.
    void section.offsetWidth;
    root.dataset.homeMotion = 'play';
    timer = setTimeout(stop, 1200);
  };
  frame.addEventListener('animationstart', (event) => {
    if (event.animationName !== 'intro-frame-in' || document.hidden) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
    try { sessionStorage.setItem(key, 'true'); } catch { /* Replay works without storage. */ }
  });
  frame.addEventListener('animationend', (event) => {
    if (event.animationName === 'intro-frame-in' &&
        !frame.getAnimations().some(animation => animation.playState === 'running')) stop();
  });
  button.hidden = false;
  button.addEventListener('click', play);
  preference.addEventListener('change', updatePreference);
  updatePreference();
  addEventListener('pagehide', stop);
  addEventListener('pageshow', event => { if (event.persisted) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  const autoplay = () => {
    if (location.hash || performance.getEntriesByType('navigation')
      .some(entry => (entry as PerformanceNavigationTiming).type === 'back_forward')) return;
    try { if (sessionStorage.getItem(key)) return; } catch { return; }
    play();
  };
  if (document.readyState === 'complete') autoplay();
  else addEventListener('load', autoplay, { once: true });
}
