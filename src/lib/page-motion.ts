/** One-shot decoration only: content is present and readable before this runs. */
export function initializeMotion():void {
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if(preference.matches || location.hash || navigation?.type==='back_forward' || !('IntersectionObserver' in window))return;
  const targets=[...document.querySelectorAll<HTMLElement>('main > .portfolio-section, main > .home-latest, .about-content > section, [data-motion-archive] .post-list__item')].filter(target=>target.getBoundingClientRect().top>window.innerHeight);
  targets.forEach(target=>{
    if(target.matches('.post-list__item'))target.dataset.motionKind='blog';
  });
  if(!targets.length)return;
  const pending=new Set(targets),active=new Set<HTMLElement>();
  const observer=new IntersectionObserver(entries=>{
    let blogIndex=0;
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const target=entry.target as HTMLElement;
      observer.unobserve(target);pending.delete(target);target.dataset.revealed='true';
      const bounds=target.getBoundingClientRect();
      if(!preference.matches && !target.contains(document.activeElement) && bounds.bottom>0 && bounds.top<window.innerHeight){
        if(target.dataset.motionKind==='blog')target.style.setProperty('--content-reveal-delay',`${Math.min(blogIndex++,2)*12}ms`);
        target.dataset.reveal='play';active.add(target);
      }
    }
    idle();
  },{rootMargin:'0px 0px -16px 0px',threshold:0});
  function idle(){if(!pending.size && !active.size)stop();}
  function settle(target:HTMLElement){
    target.removeAttribute('data-reveal');target.style.removeProperty('--content-reveal-delay');active.delete(target);
  }
  function stop(){
    observer.disconnect();
    active.forEach(settle);pending.clear();
    document.removeEventListener('animationend',finish);
    document.removeEventListener('focusin',focus);
    preference.removeEventListener('change',reduce);
    window.removeEventListener('hashchange',hash);
    window.removeEventListener('popstate',stop);
    window.removeEventListener('pageshow',restore);
  }
  function finish(event:AnimationEvent){
    if(!['section-reveal','content-reveal'].includes(event.animationName))return;
    settle(event.target as HTMLElement);idle();
  }
  function focus(event:FocusEvent){
    const focused=event.target as Node;
    for(const target of [...pending,...active]){
      if(!target.contains(focused))continue;
      observer.unobserve(target);pending.delete(target);target.dataset.revealed='true';settle(target);
    }
    idle();
  }
  function reduce(){if(preference.matches)stop();}
  function hash(){if(location.hash)stop();}
  function restore(event:PageTransitionEvent){if(event.persisted)stop();}
  document.addEventListener('animationend',finish);
  document.addEventListener('focusin',focus);
  preference.addEventListener('change',reduce);
  window.addEventListener('hashchange',hash);
  window.addEventListener('popstate',stop);
  window.addEventListener('pageshow',restore);
  targets.forEach(target=>observer.observe(target));
}
