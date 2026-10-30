/** Play the silent intro on each homepage visit, after styles have loaded. */
export function initializeHomeEntry() {
  const section = document.querySelector<HTMLElement>('#home-intro');
  const frame = section?.querySelector<SVGPathElement>('.intro-frame path');
  if (!section || !frame || !section.getAnimations) return;
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  const stop = () => {
    clearTimeout(timer);
    root.removeAttribute('data-home-motion');
  };
  const play = () => {
    pending = document.hidden;
    if (preference.matches || pending) return;
    stop();
    // Restart cleanly when the browser restores this document from history.
    void section.offsetWidth;
    root.dataset.homeMotion = 'play';
    timer = setTimeout(stop, 1200);
  };
  frame.addEventListener('animationend', (event) => {
    if (event.animationName === 'intro-frame-in' &&
        !frame.getAnimations().some(animation => animation.playState === 'running')) stop();
  });
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  addEventListener('pagehide', () => { pending = false; stop(); });
  addEventListener('pageshow', event => { if (event.persisted) play(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (pending) play();
  });
  if (document.readyState === 'complete') play();
  else addEventListener('load', play, { once: true });
}
