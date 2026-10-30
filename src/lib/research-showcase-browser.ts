import {chartDomain,styleIds,metricIds,parseMarketEvidence,parseFactorEvidence,researchSources,type MarketEvidence,type FactorEvidence,type StyleId,type MetricId} from "./research-showcase";

export function initializeResearchShowcase(root:HTMLElement):void {
  const locale=root.dataset.researchLocale==="zh"?"zh-CN":"en";
  const messages=JSON.parse(root.dataset.messages??"{}") as Record<string,string>;
  const text=(key:string,values:Record<string,string|number>={})=>(messages[key]??key).replace(/\{(\w+)\}/g,(token,name:string)=>String(values[name]??token));
  const numbers=new Intl.NumberFormat(locale,{maximumFractionDigits:2});
  const percent=new Intl.NumberFormat(locale,{style:"percent",maximumFractionDigits:2});
  const dates=new Intl.DateTimeFormat(locale,{year:"numeric",month:"short",day:"numeric",timeZone:"Asia/Shanghai"});
  const date=(value:string)=>dates.format(new Date(value.includes("T")?value:`${value}T00:00:00Z`));
  const el=<K extends keyof HTMLElementTagNameMap>(tag:K,content?:string)=>{const node=document.createElement(tag);if(content!==undefined)node.textContent=content;return node;};
  const query=<T extends HTMLElement>(parent:Element,selector:string):T=>{const element=parent.querySelector<T>(selector);if(!element)throw new Error(`Missing research element: ${selector}`);return element;};
  interface Mark {label:string;value:number;formatted:string;}
  function plot(container:HTMLElement,rows:Mark[],domain:[number,number],format:(value:number)=>string) {
    container.replaceChildren();
    const position=(value:number)=>(value-domain[0])/(domain[1]-domain[0])*100;
    for(const row of rows) {
      const line=el("div");line.className="research-chart-row";
      const label=el("span",row.label);label.className="research-chart-label";
      const track=el("div");track.className="research-track";
      const zero=el("span");zero.className="research-zero";zero.style.left=`${position(0)}%`;track.append(zero);
      const bar=el("span");bar.className="research-bar";bar.style.left=`${Math.min(position(0),position(row.value))}%`;bar.style.width=`${Math.abs(position(row.value)-position(0))}%`;track.append(bar);
      const value=el("span",row.formatted);value.className="research-chart-value";line.append(label,track,value);container.append(line);
    }
    const axis=el("div");axis.className="research-axis";axis.append(el("span",format(domain[0])),el("span",format(domain[1])));container.append(axis);
  }
  function values(panel:HTMLElement,rows:{label:string;value:string;range?:string;days?:string}[]) {
    const body=query<HTMLTableSectionElement>(panel,"[data-research-values]");body.replaceChildren();
    for(const row of rows){const tr=el("tr"),th=el("th",row.label);th.scope="row";tr.append(th,el("td",row.value));if(row.range!==undefined)tr.append(el("td",row.range));if(row.days!==undefined)tr.append(el("td",row.days));body.append(tr);}
  }
  function provenance(panel:HTMLElement,rows:[string,string][]) {
    const body=query<HTMLDListElement>(panel,"[data-research-provenance]");body.replaceChildren();
    for(const [name,value]of rows)body.append(el("dt",name),el("dd",value));
  }
  for(const kind of ["market","factor"] as const) {
    const panel=query<HTMLElement>(root,`[data-study="${kind}"]`);
    const select=query<HTMLSelectElement>(panel,"select");
    const result=query<HTMLElement>(panel,"[data-research-result]");
    const status=query<HTMLElement>(panel,"[data-source-status]");
    const retry=query<HTMLButtonElement>(panel,"[data-research-retry]");
    let market:MarketEvidence|undefined,factor:FactorEvidence|undefined;
    const parameter=kind==="market"?"researchStyle":"researchMetric";
    const choices:readonly string[]=kind==="market"?styleIds:metricIds;
    const requested=new URL(window.location.href).searchParams.get(parameter);
    select.value=requested&&choices.includes(requested)?requested:choices[0]!;
    function render() {
      if(kind==="market"&&market) {
        const selected=market.factors.find(row=>row.id===select.value as StyleId)!;
        const rows=selected.annual;
        const format=(value:number)=>percent.format(value/100);
        const marks=rows.map(row=>({label:`${row.year}${row.partial?" *":""}`,value:row.value,formatted:format(row.value)}));
        plot(query(panel,"[data-research-chart]"),marks,chartDomain(rows.map(row=>row.value)),format);
        query(panel,"[data-research-unit]").textContent=text("research.market.axis");
        values(panel,rows.map(row=>({label:`${row.year}${row.partial?" *":""}`,value:format(row.value),range:`${date(row.periodStart)} – ${date(row.periodEnd)}`,days:numbers.format(row.days)})));
        query(panel,"[data-research-period]").textContent=text("research.market.period",{start:date(rows[0]!.periodStart),end:date(rows[rows.length-1]!.periodEnd),years:numbers.format(rows.length)});
        query(panel,"[data-research-caption]").textContent=`${text(`research.style.${selected.id}`)} · ${text("research.market.plot")}`;
        query(panel,"[data-research-version]").textContent=text("research.market.version");
        provenance(panel,[["summarySha256",market.sourceHashes.summary],["yearlySha256",market.sourceHashes.yearly]]);
      } else if(kind==="factor"&&factor) {
        const metric=select.value as MetricId;
        const format=metric==="informationRatio"?numbers.format:percent.format;
        const marks=factor.rows.map(row=>({label:text(`research.factor.${row.id}`),value:row[metric],formatted:format(row[metric])}));
        plot(query(panel,"[data-research-chart]"),marks,chartDomain(marks.map(row=>row.value)),format);
        query(panel,"[data-research-caption]").textContent=text(`research.metric.${metric}`);
        query(panel,"[data-research-unit]").textContent=text(metric==="informationRatio"?"research.ratioUnit":"research.percentUnit");
        values(panel,marks.map(row=>({label:row.label,value:row.formatted})));
        query(panel,"[data-research-period]").textContent=text("research.factor.period",{start:date(factor.start),end:date(factor.end)});
        query(panel,"[data-research-version]").textContent=text("research.factor.version",{updated:date(factor.updatedAt),checked:date(factor.checkedAt)});
        provenance(panel,[["publication_id","pb-roe"],["evidence_stage","retrospective_diagnostic"]]);
      }
      query(root,"[data-research-announcement]").textContent=text("research.updated",{selection:select.selectedOptions[0]?.textContent??""});
    }
    async function load() {
      panel.dataset.state="loading";panel.setAttribute("aria-busy","true");result.hidden=true;select.disabled=true;retry.hidden=true;status.hidden=false;status.textContent=text("research.loading");market=undefined;factor=undefined;
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
      try {
        const response=await fetch(researchSources[kind],{signal:controller.signal,credentials:"omit"});
        if(!response.ok)throw new Error(`Research source HTTP ${response.status}`);
        const payload:unknown=await response.json();
        if(kind==="market")market=parseMarketEvidence(payload);else factor=parseFactorEvidence(payload);
        render();result.hidden=false;status.hidden=true;status.textContent="";select.disabled=false;panel.dataset.state="ready";
      } catch {panel.dataset.state="error";status.textContent=text("research.unavailable");retry.hidden=false;}
      finally {clearTimeout(timer);panel.setAttribute("aria-busy","false");}
    }
    select.addEventListener("change",()=>{
      const url=new URL(window.location.href);if(select.value===choices[0])url.searchParams.delete(parameter);else url.searchParams.set(parameter,select.value);
      window.history.replaceState(null,"",url);render();
    });
    retry.addEventListener("click",()=>{void load();});
    void load();
  }
}
