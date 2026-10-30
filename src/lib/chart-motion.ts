/** Reveal final geometry from zero; exact data never waits for decoration. */
export function createChartMotion() {
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const running=new Map<HTMLElement,Set<Animation>>();
  function settle(container:HTMLElement) {
    const animations=running.get(container);running.delete(container);
    animations?.forEach(animation=>animation.cancel());
  }
  function stop(){for(const container of running.keys())settle(container);}
  function reveal(container:HTMLElement) {
    settle(container);
    if(preference.matches || document.hidden || typeof Element.prototype.animate!=='function')return;
    const bounds=container.getBoundingClientRect();
    if(!bounds.width || !bounds.height || bounds.bottom<=0 || bounds.top>=window.innerHeight)return;
    const animations=new Set<Animation>();running.set(container,animations);
    container.querySelectorAll<HTMLElement>('.research-bar').forEach((bar,index)=>{
      if(!parseFloat(bar.style.width))return;
      try {
        const animation=bar.animate([{transform:'scaleX(0)',opacity:.65},{transform:'scaleX(1)',opacity:1}],{
          duration:160,delay:Math.min(index*8,40),easing:'cubic-bezier(.22,.7,.25,1)',fill:'backwards',
        });
        animations.add(animation);
        const done=()=>{animations.delete(animation);if(!animations.size && running.get(container)===animations)running.delete(container);};
        animation.onfinish=done;animation.oncancel=done;
      } catch { /* Missing/disabled animation support leaves the final geometry visible. */ }
    });
    if(!animations.size)running.delete(container);
  }
  preference.addEventListener('change',()=>{if(preference.matches)stop();});
  window.addEventListener('pagehide',stop);
  return {settle,reveal};
}
