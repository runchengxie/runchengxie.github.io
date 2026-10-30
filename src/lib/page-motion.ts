/** One-shot decoration only: content is present and readable before this runs. */
export function initializeMotion():void {
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches || location.hash || !('IntersectionObserver' in window))return;
  const targets=[...document.querySelectorAll<HTMLElement>('main > .portfolio-section, main > .home-latest, .about-content > section')].filter(target=>target.getBoundingClientRect().top>window.innerHeight);
  if(!targets.length)return;
  const pending=new Set(targets),active=new Set<HTMLElement>();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const target=entry.target as HTMLElement;
      observer.unobserve(target);pending.delete(target);target.dataset.revealed='true';
      if(!preference.matches && !target.contains(document.activeElement)){
        target.dataset.reveal='play';active.add(target);
      }
    }
    idle();
  },{rootMargin:'0px 0px -16px 0px',threshold:0});
  function idle(){if(!pending.size && !active.size)stop();}
  function stop(){
    observer.disconnect();
    active.forEach(target=>target.removeAttribute('data-reveal'));active.clear();pending.clear();
    document.removeEventListener('animationend',finish);
    document.removeEventListener('focusin',focus);
    preference.removeEventListener('change',reduce);
    window.removeEventListener('hashchange',hash);
    window.removeEventListener('pageshow',restore);
  }
  function finish(event:AnimationEvent){
    if(event.animationName!=='section-reveal')return;
    const target=event.target as HTMLElement;target.removeAttribute('data-reveal');active.delete(target);idle();
  }
  function focus(event:FocusEvent){
    const target=(event.target as Element)?.closest<HTMLElement>('[data-reveal="play"]');
    if(target){target.removeAttribute('data-reveal');active.delete(target);idle();}
  }
  function reduce(){if(preference.matches)stop();}
  function hash(){if(location.hash)stop();}
  function restore(event:PageTransitionEvent){if(event.persisted)stop();}
  document.addEventListener('animationend',finish);
  document.addEventListener('focusin',focus);
  preference.addEventListener('change',reduce);
  window.addEventListener('hashchange',hash);
  window.addEventListener('pageshow',restore);
  targets.forEach(target=>observer.observe(target));
}
