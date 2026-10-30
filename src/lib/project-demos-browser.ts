import {checkMarketRows,cleanMarketRows,calculateRebalance,marketFields,sampleMarketRows,type MarketRow} from "./project-demos";

export function initializeProjectDemos(root: HTMLElement): void {
  const messages = JSON.parse(root.dataset.messages ?? "{}") as Record<string,string>;
  const language = root.dataset.demoLocale === "zh" ? "zh-CN" : "en";
  const numbers = new Intl.NumberFormat(language,{maximumFractionDigits:2});
  const percentages = new Intl.NumberFormat(language,{style:"percent",maximumFractionDigits:2});
  const message = (key:string,values:Record<string,string|number>={}) => (messages[key]??key).replace(/\{(\w+)\}/g,(token,name:string)=>String(values[name]??token));
  const one = <T extends HTMLElement>(selector:string) => {
    const element=root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing demo element: ${selector}`);
    return element;
  };
  const marketForm=one<HTMLFormElement>("[data-market-form]");
  const marketBody=one<HTMLTableSectionElement>("[data-market-body]");
  const summary=one<HTMLParagraphElement>("[data-market-summary]");
  const issues=one<HTMLUListElement>("[data-market-issues]");
  const addButton=one<HTMLButtonElement>("[data-add]");
  const readRows = (): MarketRow[] => Array.from(marketBody.rows).map(row => Object.fromEntries(marketFields.map(field=>[field,row.querySelector<HTMLInputElement>(`[data-field="${field}"]`)?.value??""])) as MarketRow);
  function checkRows() {
    const rows=readRows();
    const report=checkMarketRows(rows);
    summary.textContent=message("demo.data.summary",{total:numbers.format(report.totalRows),valid:numbers.format(report.validRows),issues:numbers.format(report.issues.length)});
    issues.replaceChildren();
    marketBody.querySelectorAll<HTMLInputElement>("input").forEach(input=>{
      input.removeAttribute("aria-invalid");input.removeAttribute("aria-describedby");
    });
    if(report.issues.length===0) {
      const li=document.createElement("li");li.textContent=message(rows.length?"demo.data.noIssues":"demo.data.empty");issues.append(li);
    }
    for(const issue of report.issues) {
      const li=document.createElement("li");
      li.id=`demo-issue-${issue.row}-${issue.field}`;
      li.textContent=message("demo.data.issue",{row:numbers.format(issue.row),field:message(`demo.field.${issue.field}`),reason:message(`demo.issue.${issue.code}`)});
      issues.append(li);
      const input=marketBody.querySelector<HTMLInputElement>(`[data-row="${issue.row-1}"][data-field="${issue.field}"]`);
      input?.setAttribute("aria-invalid","true");input?.setAttribute("aria-describedby",li.id);
    }
    addButton.disabled=rows.length>=12;
  }
  function writeRows(rows:readonly MarketRow[]) {
    marketBody.replaceChildren();
    rows.forEach((row,index)=>{
      const tr=document.createElement("tr");
      const heading=document.createElement("th");heading.scope="row";heading.textContent=numbers.format(index+1);tr.append(heading);
      for(const field of marketFields) {
        const cell=document.createElement("td");const input=document.createElement("input");
        input.type=field==="date"||field==="symbol"?"text":"number";input.step="any";input.value=row[field];
        input.dataset.field=field;input.dataset.row=String(index);
        input.setAttribute("aria-label",message("demo.data.fieldLabel",{row:numbers.format(index+1),field:message(`demo.field.${field}`)}));
        cell.append(input);tr.append(cell);
      }
      marketBody.append(tr);
    });
    checkRows();
  }
  marketForm.addEventListener("submit",event=>event.preventDefault());
  marketForm.addEventListener("input",checkRows);
  one<HTMLButtonElement>("[data-clean]").addEventListener("click",()=>writeRows(cleanMarketRows(readRows())));
  one<HTMLButtonElement>("[data-reset-market]").addEventListener("click",()=>writeRows(sampleMarketRows));
  addButton.addEventListener("click",()=>{
    const rows=readRows();
    if(rows.length<12) writeRows([...rows,{date:"",symbol:"",close:"",volume:""}]);
    marketBody.lastElementChild?.querySelector<HTMLInputElement>("input")?.focus();
  });

  const rebalanceForm=one<HTMLFormElement>("[data-rebalance-form]");
  const error=one<HTMLParagraphElement>("[data-rebalance-error]");
  const results=one<HTMLDListElement>("[data-rebalance-results]");
  const readNumber=(input:HTMLInputElement)=>input.value.trim()?Number(input.value):NaN;
  const readWeights=(selector:string)=>Array.from(root.querySelectorAll<HTMLInputElement>(selector)).map(readNumber);
  const tradeCells=Array.from(root.querySelectorAll<HTMLTableCellElement>("[data-trade]"));
  function renderRebalance() {
    const result=calculateRebalance(readWeights("[data-current-weight]"),readWeights("[data-target-weight]"),readNumber(one<HTMLInputElement>("[data-portfolio-value]")),readNumber(one<HTMLInputElement>("[data-fee-bps]")));
    results.hidden=!result.ok;error.hidden=result.ok;
    error.textContent=result.ok?"":message(`demo.rebalance.error.${result.code}`);
    if (!result.ok) {tradeCells.forEach(cell=>cell.textContent="—");return;}
    const metrics={buy:result.buyAmount,sell:result.sellAmount,traded:result.tradedAmount,turnover:result.turnover,fee:result.fee};
    for(const [key,value] of Object.entries(metrics)) one<HTMLElement>(`[data-metric="${key}"]`).textContent=key==="turnover"?percentages.format(value):numbers.format(value);
    tradeCells.forEach((cell,index)=>cell.textContent=new Intl.NumberFormat(language,{maximumFractionDigits:2,signDisplay:"exceptZero"}).format(result.trades[index]??0));
  }
  rebalanceForm.addEventListener("submit",event=>event.preventDefault());
  rebalanceForm.addEventListener("input",renderRebalance);
  rebalanceForm.addEventListener("reset",()=>setTimeout(renderRebalance,0));
  root.querySelectorAll<HTMLFieldSetElement>("[data-demo-controls]").forEach(fieldset=>fieldset.disabled=false);
  checkRows();renderRebalance();
}
