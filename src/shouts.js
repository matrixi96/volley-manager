// ================= OKRZYKI TRENERA (w trakcie gry, bez brania czasu) =================
function shoutPow(){return clamp(0.7+(cA('mot')-10)*0.03+(cA('aut')-10)*0.02,0.5,1.4);}
function shoutBarInner(m){const s=m.sides[0];const cd=s.shCd!=null&&m.rallies<s.shCd?s.shCd-m.rallies:0;
  const last=ui.shout&&Date.now()-ui.shout.t0<9000?ui.shout:null;
  return `<span class="small mut shl">🗣️ Okrzyk${cd?` <span class="shcd">(za ${cd} ${cd===1?'akcję':'akcje'})</span>`:''}:</span>${SHOUTS.map(([k,n,ic,d])=>`<button class="ghost sm shtb" ${cd||ui.to?'disabled':''} onclick="myShout('${k}')" title="${esc(d)}">${ic} ${esc(n)}</button>`).join('')}${last?`<span class="shlast">${last.ic} „${esc(last.t)}”${last.r?` <small class="mut">${esc(last.r)}</small>`:''}</span>`:''}`;}
function shoutBar(m){return `<div class="shbar" id="shbar">${shoutBarInner(m)}</div>`;}
function updateShoutBar(){const el=document.getElementById('shbar');if(el&&ui.match)el.innerHTML=shoutBarInner(ui.match);}
function myShout(k){const m=ui.match;if(!m||m.over||ui.to)return;const r=applyShout(m,0,k,shoutPow());if(!r){updateShoutBar();return;}
  const t=SHOUTS.find(x=>x[0]===k);const who=coach()?coach().last:'Trener';
  const rs=`${r.up?r.up+' ↑':''}${r.dn?' '+r.dn+' ↓':''}${r.f<0.5?' · słabszy efekt (powtarzasz się)':''}`.trim();
  m.log.push({t:`🗣️ ${esc(who)}: „${esc(t[1])}”${r.up?` — ${r.up} zawodników podbudowanych`:''}${r.dn?`, ${r.dn} spiętych`:''}${r.f<0.5?' (zawodnicy już to dziś słyszeli, słabszy efekt)':''}.`,c:'sys'});
  ui.shout={t:t[1],ic:t[2],t0:Date.now(),r:rs};m.comm={t:`🗣️ ${who}: „${t[1]}”`,w:0};persistLive();
  if(m.animating){updateShoutBar();document.querySelectorAll('.mcom').forEach(e=>{e.textContent=m.comm.t;e.className='mcom me';});return;}render();}
