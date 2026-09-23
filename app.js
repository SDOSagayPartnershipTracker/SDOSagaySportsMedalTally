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
function render(){
 for(const [id,title,level,gender] of dashboards){
  const records=feed.records.filter(r=>(!level||r.level===level)&&(!gender||r.gender===gender));
  const rows=groups.map((district,i)=>{const a=records.filter(r=>r.cluster==='Cluster '+(i+1));const n=m=>a.filter(r=>r.medal===m).reduce((s,r)=>s+r.count,0);return {id:i+1,g:n('Gold'),s:n('Silver'),b:n('Bronze')}}).sort((a,b)=>b.g-a.g||b.s-a.s||b.b-a.b);
  const num=n=>feed.connected?n:'—';
  const totals=rows.reduce((t,r)=>({g:t.g+r.g,s:t.s+r.s,b:t.b+r.b}),{g:0,s:0,b:0});
  $('rows-'+id).innerHTML=rows.map(r=>{const rank=rows.findIndex(x=>x.g===r.g&&x.s===r.s&&x.b===r.b)+1;return '<tr><td>'+ (feed.connected&&r.g+r.s+r.b?rank:'—')+'</td><th scope="row">Cluster '+r.id+'</th><td class="gold-value">'+num(r.g)+'</td><td>'+num(r.s)+'</td><td>'+num(r.b)+'</td><td class="sum">'+num(r.g+r.s+r.b)+'</td></tr>'}).join('')+'<tr class="mini-total"><td></td><th scope="row">Total</th><td>'+num(totals.g)+'</td><td>'+num(totals.s)+'</td><td>'+num(totals.b)+'</td><td>'+num(totals.g+totals.s+totals.b)+'</td></tr>';
 }
 $('connection').hidden=feed.connected;
}
async function refresh(){
 $('refresh').disabled=true;$('status').textContent='Checking results…';
 try{const r=await fetch('./data/standings.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Unavailable');feed=validateFeed(await r.json());render();
 $('status').textContent=feed.connected?'Results loaded · checks every minute':'Awaiting workbook connection';
 $('updated').textContent=feed.connected?'Updated '+new Date(feed.updatedAt).toLocaleString('en-PH',{timeZone:'Asia/Manila'})+' PHT':'No official results loaded';
 }catch{$('status').textContent=feed.connected?'Unable to refresh · showing last loaded results':'Results temporarily unavailable'}finally{$('refresh').disabled=false}
}
$('refresh').addEventListener('click',refresh);
render();refresh();setInterval(refresh,60000);
