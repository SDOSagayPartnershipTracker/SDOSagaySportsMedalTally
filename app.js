'use strict';
const groups=['Districts 1A, 1B, 1C and 1D','District 2A','District 2B','Districts 3A, 3B, 3C and 3D','Private Schools'];
let feed={connected:false,updatedAt:null,records:[]};
const $=id=>document.getElementById(id);
function validateFeed(data){
 if(typeof data?.connected!=='boolean'||!Array.isArray(data.records))throw Error('Invalid feed');
 for(const r of data.records){if(!/^Cluster [1-5]$/.test(r.cluster)||!['Elementary','Secondary'].includes(r.level)||!['Boys','Girls','Mixed'].includes(r.gender)||typeof r.sport!=='string'||!['Gold','Silver','Bronze'].includes(r.medal)||!Number.isSafeInteger(r.count)||r.count<0)throw Error('Invalid record')}
 if(data.connected&&(!data.updatedAt||Number.isNaN(Date.parse(data.updatedAt))))throw Error('Missing update date');
 return data;
}
const dashboards=[["elementary-boys","Elementary Boys","Elementary","Boys"],["elementary-girls","Elementary Girls","Elementary","Girls"],["secondary-boys","Secondary Boys","Secondary","Boys"],["secondary-girls","Secondary Girls","Secondary","Girls"],["overall","Overall","",""]];
let activeDashboard='overall';
function chooseDashboard(id){
 activeDashboard=id;
 const view=dashboards.find(v=>v[0]===id);
 document.querySelectorAll('[role="tab"]').forEach(tab=>{const active=tab.dataset.dashboard===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
 $('dashboard-panel').setAttribute('aria-labelledby','tab-'+id);
 $('dashboard-title').textContent=view[1]+' Standings';
 $('dashboard-note').textContent=id==='overall'?'All levels and categories, including mixed events.':view[2]+' · '+view[3];
 $('sport').selectedIndex=0;render();
}
function render(){
 const [, ,level,gender]=dashboards.find(v=>v[0]===activeDashboard),sport=$('sport').value;
 $('reset').hidden=sport==='All sports';
 const records=feed.records.filter(r=>(!level||r.level===level)&&(!gender||r.gender===gender)&&(sport==='All sports'||r.sport===sport));
 const rows=groups.map((district,i)=>{const a=records.filter(r=>r.cluster===`Cluster ${i+1}`);const n=m=>a.filter(r=>r.medal===m).reduce((s,r)=>s+r.count,0);return {name:`Cluster ${i+1}`,district,id:i+1,g:n('Gold'),s:n('Silver'),b:n('Bronze')}}).sort((a,b)=>b.g-a.g||b.s-a.s||b.b-a.b);
 const num=n=>feed.connected?n:'—';const totals=rows.reduce((t,r)=>({g:t.g+r.g,s:t.s+r.s,b:t.b+r.b}),{g:0,s:0,b:0});
 // All HTML below uses fixed delegation labels and validated numeric aggregates only.
 $('standings').innerHTML=rows.map(r=>{const rank=rows.findIndex(x=>x.g===r.g&&x.s===r.s&&x.b===r.b)+1;return `<tr><td class="rank">${feed.connected&&r.g+r.s+r.b?String(rank).padStart(2,'0'):'—'}</td><td><div class="delegation"><span class="cluster-symbol c${r.id}">${r.id}</span><div><strong>${r.name}</strong><small>${r.district}</small></div></div></td><td class="number gold-value">${num(r.g)}</td><td class="number">${num(r.s)}</td><td class="number">${num(r.b)}</td><td class="number total">${num(r.g+r.s+r.b)}</td></tr>`}).join('')+`<tr class="totals"><td></td><td>Total medals</td><td class="number">${num(totals.g)}</td><td class="number">${num(totals.s)}</td><td class="number">${num(totals.b)}</td><td class="number">${num(totals.g+totals.s+totals.b)}</td></tr>`;
 $('connection').hidden=feed.connected;
}
async function refresh(){
 $('refresh').disabled=true;$('status').textContent='Checking results…';
 try{const r=await fetch('./data/standings.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Unavailable');feed=validateFeed(await r.json());
 const selected=$('sport').value;const sports=['All sports',...new Set(feed.records.map(r=>r.sport).sort())];$('sport').replaceChildren(...sports.map(s=>new Option(s,s)));$('sport').value=sports.includes(selected)?selected:'All sports';
 render();$('status').textContent=feed.connected?'Results loaded · checks every minute':'Awaiting workbook connection';$('updated').textContent=feed.connected?'Updated '+new Date(feed.updatedAt).toLocaleString('en-PH',{timeZone:'Asia/Manila'})+' PHT':'No official results loaded';
 }catch{$('status').textContent=feed.connected?'Unable to refresh · showing last loaded results':'Results temporarily unavailable'}finally{$('refresh').disabled=false}
}
$('sport').addEventListener('change',render);
document.querySelectorAll('[role="tab"]').forEach((tab,i)=>{tab.addEventListener('click',()=>chooseDashboard(tab.dataset.dashboard));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%5;else if(e.key==='ArrowLeft')n=(i+4)%5;else if(e.key==='Home')n=0;else if(e.key==='End')n=4;else return;e.preventDefault();const id=dashboards[n][0];chooseDashboard(id);$('tab-'+id).focus()})});
$('reset').addEventListener('click',()=>{$('sport').selectedIndex=0;render()});$('refresh').addEventListener('click',refresh);
render();refresh();setInterval(refresh,60000);
