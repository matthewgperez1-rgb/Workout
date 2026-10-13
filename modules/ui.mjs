import {pretty} from './dates.mjs';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 today:'<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 plan:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m6 0h2"/>',
 history:'<path d="M3 10a9 9 0 1 1 1 7M3 3v7h7M12 7v5l4 2"/>',
 progress:'<path d="M4 4v16h16M7 15l4-5 4 3 5-7"/><circle cx="11" cy="10" r="1"/>',
 library:'<rect x="3" y="4" width="7" height="7" rx="2"/><rect x="14" y="4" width="7" height="7" rx="2"/><rect x="3" y="15" width="7" height="6" rx="2"/><rect x="14" y="15" width="7" height="6" rx="2"/>',
 lift:'<path d="M7 8v8m10-8v8M4 6v12m16-12v12M4 12h16"/>',
 run:'<circle cx="15" cy="4" r="2"/><path d="m7 9 5-2 3 5 5 1M12 7l-2 6-5 3m5-3 4 3-1 5"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 back:'<path d="M19 12H5m5-5-5 5 5 5"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6m-3 0v3m0 8 3-3m3-6 2 2"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
 mobility:'<circle cx="12" cy="4" r="2"/><path d="m5 10 7-3 7 3m-7-3v8m-6 6 6-6 6 6"/>',
 play:'<path d="m9 5 10 7-10 7z"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
 cloud:'<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 1 11M9 14l3-3 3 3m-3-3v10"/>',
 shield:'<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6zM8 12l3 3 5-6"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 edit:'<path d="m16 3 5 5-12 12-6 1 1-6zM13 6l5 5"/>',
 recovery:'<path d="M19 4a9 9 0 1 0 1 15A8 8 0 0 1 19 4z"/>',
 shoulder:'<path d="M4 20V9c0-4 5-5 8-5s8 1 8 5v11M8 9l4 3 4-3"/><circle cx="6" cy="9" r="3"/>',
 spine:'<path d="M8 3c8 6-8 12 0 18M16 3c-8 6 8 12 0 18M8 7h8m-8 5h8m-8 5h8"/>',
 knee:'<path d="m9 3 4 8-3 10M16 3l2 8-2 10"/><circle cx="14" cy="11" r="3"/>',
 hip:'<path d="M8 3v6l-4 6 3 6m9-18v6l4 6-3 6M8 9h8M7 15h10"/><circle cx="12" cy="12" r="3"/>',
 chest:'<path d="M4 20V8l5-4h6l5 4v12M12 7v11M4 10l5 2m11-2-5 2"/>',
 ankle:'<path d="M8 3v13l-4 5h16v-3l-6-2V3"/><circle cx="11" cy="15" r="3"/>',
 core:'<path d="m6 3 1 6-2 7 2 5m11-18-1 6 2 7-2 5M8 8h8M8 12h8m-8 4h8M12 7v11"/>',
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.mobility}</svg>`;
export const btn=(label,action,cls='button',attrs='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
export const heading=(title,sub='',right='')=>`<div class="view-head"><div><div class="eyebrow">${esc(sub)}</div><h1>${esc(title)}</h1></div>${right}</div>`;
export const pill=(label,color='')=>`<span class="pill ${color}"><i></i>${esc(label)}</span>`;
export const empty=(title,text,action='')=>`<div class="empty-state"><div class="empty-glyph">${icon('progress')}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
export function ring(value,total,size=104,color='orange'){const p=Math.min(1,Math.max(0,total?value/total:0)),r=42,c=2*Math.PI*r;return `<div class="ring ${color}" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-track" cx="50" cy="50" r="${r}"/><circle class="ring-fill" cx="50" cy="50" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p)}" transform="rotate(-90 50 50)"/></svg><div class="ring-number"><strong>${esc(value)}</strong><small>/ ${esc(total)}</small></div></div>`;}
export function weekBars(week){const max=Math.max(1,...week.days.map(d=>d.lift));return `<div class="week-chart" role="img" aria-label="Completed sets by day this week">${week.days.map(d=>`<div class="chart-column"><span class="bar-space"><i class="week-bar" style="height:${d.lift?Math.max(8,d.lift/max*100):3}%" data-value="${d.lift}"></i></span><small>${pretty(d.date,{weekday:'short'}).slice(0,1)}</small><span class="chart-run ${d.run?'has-run':''}" title="${d.run.toFixed(2)} miles"></span></div>`).join('')}</div>`;}
export function lineChart(rows,key,color='orange',label=''){const values=rows.map(r=>Number(r[key]));if(values.length<2)return '';const min=Math.min(...values),max=Math.max(...values),span=max-min||1;const points=values.map((v,i)=>[12+i/(values.length-1)*296,86-(v-min)/span*64]);const path=points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');return `<div class="line-chart ${color}" role="img" aria-label="${esc(label)}: ${values.map((v,i)=>`${rows[i].date} ${v.toFixed(1)}`).join(', ')}"><svg viewBox="0 0 320 110"><path class="chart-grid" d="M12 22h296M12 54h296M12 86h296"/><path class="line-fill" d="${path} L308 100 L12 100Z"/><path class="line-stroke" d="${path}"/>${points.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3"/>`).join('')}</svg><div class="chart-labels"><span>${pretty(rows[0].date,{month:'short',day:'numeric'})}</span><span>${pretty(rows.at(-1).date,{month:'short',day:'numeric'})}</span></div></div>`;}
export const field=(label,id,value='',type='number',attrs='')=>`<label class="field" for="${id}"><span>${esc(label)}</span><input id="${id}" name="${id}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
export const select=(label,id,options,value)=>`<label class="field" for="${id}"><span>${esc(label)}</span><select id="${id}">${options.map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
