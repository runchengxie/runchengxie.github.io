/** Shared Enrichr wave, pinned to the research publication; no market data. */
import {mount, type WaveOptions} from '../vendor/enrichr/particle-wave.js';
export function initializeHomeWave(): void {
 const root=document.querySelector<HTMLElement>('.home-editorial');
 const canvas=root?.querySelector<HTMLCanvasElement>('[data-home-wave]');
 const toggle=root?.querySelector<HTMLButtonElement>('[data-wave-toggle]');
 const hero=root?.querySelector<HTMLElement>('.ef-pwave');
 if(!root||!canvas||!toggle||!hero)return;
 const html=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false, suspended=false;
 try {paused=localStorage.getItem('home-wave-paused')==='true';} catch {}
 const options=():WaveOptions=>{
  const dark=html.dataset.theme==='dark';let saved=null;
  try{saved=localStorage.getItem('smallcaps-chart-colours');}catch{}
  const redUp=saved==='red-up'||(saved!=='green-up'&&html.lang.startsWith('zh'));
  const red=dark?'#c78c79':'#a76c5c',green=dark?'#a2b596':'#758c70';
  return {...(dark?{background:'#211b18',deep:'#492b22',mid:'#995c38',crest:'#edc88a',accent:'#edc88a',blend:'additive' as const}:{background:'#f5f2ea',deep:'#c9bba6',mid:'#a77a59',crest:'#805135',accent:'#955c39',blend:'alpha' as const}),up:redUp?red:green,down:redUp?green:red,preserveTitleMarkup:true,title1:'',title2:'',caption:hero.querySelector('.ef-pwave__cap')?.textContent??'',next:hero.querySelector('.ef-pwave__next')?.textContent??'',labels:JSON.parse(toggle.dataset.labels!) };
 };
 const effect=mount(root,options());
 const sync=()=>{effect.setMotion(paused||suspended,media.matches);toggle.hidden=media.matches||canvas.style.display==='none';toggle.textContent=(paused?toggle.dataset.resumeLabel:toggle.dataset.pauseLabel)??'';toggle.setAttribute('aria-pressed',String(paused));hero.classList.toggle('motion-paused',paused||media.matches);};
 const update=()=>{effect.update(options());sync();};
 const click=()=>{paused=!paused;try{localStorage.setItem('home-wave-paused',String(paused));}catch{}sync();};
 const storage=(e:StorageEvent)=>{if(e.key==='smallcaps-chart-colours'||e.key===null)update();};
 const observer=new MutationObserver(update);observer.observe(html,{attributes:true,attributeFilter:['data-theme','lang']});
 toggle.addEventListener('click',click);media.addEventListener('change',update);addEventListener('storage',storage);
 canvas.addEventListener('webglcontextlost',sync);canvas.addEventListener('webglcontextrestored',sync);
 sync();
 addEventListener('pageshow',e=>{if(e.persisted){suspended=false;sync();}});
 addEventListener('pagehide',e=>{if(e.persisted){suspended=true;sync();return;}observer.disconnect();effect.destroy();toggle.removeEventListener('click',click);media.removeEventListener('change',update);removeEventListener('storage',storage);});
}
