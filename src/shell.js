// ================= SZKIELET INTERFEJSU: MENU BOCZNE, PASEK KLUBU, EKRAN GŁÓWNY =================
const NAV=[['home','🏠','Ekran główny'],['mecz','🏐','Mecz i sezon'],['sklad','👥','Skład'],['taktyka','📋','Taktyka'],['trening','🏋️','Trening'],['kalendarz','📅','Terminarz'],['tabela','🏆','Tabela'],['staty','📈','Statystyki'],['transfery','🔁','Transfery'],['finanse','💰','Finanse'],['sztab','🧑‍🏫','Sztab'],['juniorzy','🌱','Juniorzy'],['klub','🏟️','Infrastruktura'],['trener','🎓','Trener']];
function teamCrest(i,size){const t=TEAMS[i];if(!t)return '';if(SAVE.custom&&SAVE.custom.idx===i)return crestSvg(t.name,t.short,t.color,size,SAVE.custom.crest);return crestSvg(t.name,t.short,t.color,size,(i*7+3)%20);}
function liveMatch(){return ui.match&&!ui.match.over;}
// ikony liniowe (styl jak w menedżerach)
const IC={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 mecz:'<circle cx="12" cy="12" r="9"/><path d="M12 3c-1 4 0 8 4 10M5 7c4 0 8 2 9 6M4.5 16c3-1 7-1 10 2"/>',
 kalendarz:'<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 sklad:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c3 0 5 2 5 5"/>',
 taktyka:'<rect x="5" y="4" width="14" height="17" rx="1.5"/><path d="M9 4V3h6v1M8.5 10l2 2 4-4M8.5 16h7"/>',
 trening:'<path d="M6.5 8v8M3.5 10v4M17.5 8v8M20.5 10v4M6.5 12h11"/>',
 juniorzy:'<path d="M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
 transfery:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
 sztab:'<circle cx="12" cy="7.5" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7M12 14l-1.5 3 1.5 4 1.5-4z"/>',
 klub:'<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 11h.01M15 11h.01"/>',
 finanse:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>',
 trener:'<path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
 tabela:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7l-1-3h-5z"/>',
 staty:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
 zapis:'<path d="M5 3h11l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM8 3v5h7V3M8 21v-7h8v7"/>',
 test:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9"/>',
 play:'<path d="M7 4.5v15l12-7.5z"/>',day:'<path d="M9 5l7 7-7 7"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',collapse:'<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M9 4.5v15"/>'};
function ico(k,sz){return `<svg viewBox="0 0 24 24" width="${sz||18}" height="${sz||18}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="svgi">${IC[k]||''}</svg>`;}
const NAV_GROUPS=[['Przegląd',['home','mecz','kalendarz']],['Drużyna',['sklad','taktyka','trening','juniorzy']],['Rekrutacja',['transfery']],['Klub',['sztab','klub','finanse','trener']],['Świat',['tabela','staty']]];
const NAV_L=Object.fromEntries(NAV.map(x=>[x[0],x[2]]));NAV_L.zapis='Zapis gry';NAV_L.test='Test silnika';
function sideNav(){const mini=ui.tab==='mecz'&&liveMatch();const newsN=(SAVE.news||[]).filter(x=>x.d===today()).length;
  const item=k=>`<button class="nav ${ui.tab===k?'on':''}" onclick="ui.navOpen=false;go('${k}')" title="${NAV_L[k]}"><span class="ic">${ico(k)}</span><span class="tx">${NAV_L[k]}</span>${k==='home'&&newsN?`<span class="nbad">${newsN}</span>`:''}</button>`;
  return `<aside class="side ${mini?'mini':''} ${ui.navOpen?'open':''}">
   <div class="sbrand"><span class="sbm">${ico('mecz',20)}</span><span class="tx">VOLLEY MANAGER</span></div>
   ${NAV_GROUPS.map(([g,ks])=>`<div class="ngh tx">${g}</div>${ks.map(item).join('')}`).join('')}
   <div class="navgap"></div>
   <div class="nfoot">${item('zapis')}<button class="nav small ${ui.tab==='test'?'on':''}" onclick="ui.navOpen=false;go('test')" title="Test silnika"><span class="ic">${ico('test')}</span><span class="tx">Test silnika</span></button></div>
  </aside>${ui.navOpen?'<div class="navshade" onclick="ui.navOpen=false;render()"></div>':''}`;}
// ---- pasek górny ----
function myLineupPlayers(){const t=myTeam();const lu=SAVE.lineup||{};return Object.values(lu).map(id=>t.players.find(p=>p.id===id)).filter(Boolean);}
function phaseName(s){return !s?'':s.phase==='spar'?'Sparingi':s.phase==='liga'?'Liga':s.phase==='po'?'Play-off':s.phase==='off'?'Przerwa':'Koniec sezonu';}
function actLabel(){if(liveMatch())return 'WRÓĆ DO MECZU';const e=nextEvent();const c=myNext();if(e&&e.d<=today()&&c)return 'GRAJ MECZ';return 'DALEJ';}
function topBar(){const t=myTeam();const s=S();const d=today();
  return `<div class="topbar">
   <button class="burger" onclick="ui.navOpen=!ui.navOpen;render()" aria-label="Menu">☰</button>
   <div class="tclub" onclick="go('home')"><span class="tcr">${teamCrest(SAVE.team,36)}</span><span class="tcn"><b>${esc(t.name)}</b><small>${s?'Liga · '+sLabel(s.n):''}</small></span></div>
   <div class="tpage">${esc((NAV_L[ui.tab]||'').toUpperCase())}</div>
   <div class="tsearch">${ico('search',16)}<input id="psq" placeholder="Szukaj zawodnika…" value="${esc(ui.q||'')}" oninput="ui.q=this.value;searchDrop()" onfocus="searchDrop()" autocomplete="off"><kbd>Ctrl + K</kbd><div id="psd" class="psd"></div></div>
   <span class="sp"></span>
   <div class="tdate"><span class="lab">${s?'Sezon '+sLabel(s.n)+' · '+esc(phaseName(s)):''}</span><b>${DOW[dow(d)].replace(/^./,c=>c.toUpperCase())}, ${fmtDMY(d)}</b></div>
   <button class="tbtn" onclick="nextDay()" title="Przejdź do następnego dnia">NASTĘPNY DZIEŃ</button>
   <button class="tplay" onclick="nextAction()">${ico('play',15)} ${actLabel()}</button>
  </div>`;}
function searchDrop(){const el=document.getElementById('psd');if(!el)return;const q=(ui.q||'').trim().toLowerCase();if(q.length<2){el.innerHTML='';el.classList.remove('on');return;}
  const res=W().players.filter(p=>(p.first+' '+p.last).toLowerCase().includes(q)).sort((a,b)=>(b.tm===SAVE.team)-(a.tm===SAVE.team)||rating(b)-rating(a)).slice(0,8);
  el.innerHTML=res.length?res.map(p=>`<button onclick="ui.q='';openPop('${p.id}')">${pFace(p,24)}<span><b>${esc(p.first)} ${esc(p.last)}</b><small>${POS_SHORT[p.pos]} · ${p.age} l. · ${p.tm>=0?esc(TEAMS[p.tm].short)+(p.jr?' U20':''):'wolny'}</small></span><em>${rating(p)}</em></button>`).join(''):'<div class="small mut" style="padding:8px">Brak zawodników.</div>';el.classList.add('on');}
// pasek kontekstu pod górnym paskiem: rozgrywki, następny rywal, stan drużyny
function ctxBar(){if(ui.tab==='mecz'&&liveMatch())return '';const t=myTeam();const s=S();const ps=t.players;
  const mor=Math.round(ps.reduce((a,p)=>a+(p.mor==null?60:p.mor),0)/Math.max(1,ps.length));
  const chem=chemPct(chemOf(myLineupPlayers(),t.idx));const conf=SAVE.board?Math.round(SAVE.board.conf):60;
  const okLu=validLineup(t,SAVE.lineup)&&!myLineupPlayers().some(p=>p.inj);
  let pos='—';if(s&&(s.phase==='liga'||s.phase==='po'||s.phase==='end')){const tb=leagueTable();pos=(tb.findIndex(x=>x.i===SAVE.team)+1)+'.';}
  const c=s?myNext():null;const e=nextEvent();const op=c?(c.h===SAVE.team?c.a:c.h):null;
  const comp=!s?'':s.phase==='spar'?`Sparing ${s.spar.res.length+1}/${N_SPAR}`:s.phase==='liga'?`Liga · ${s.round+1}. kolejka`:s.phase==='po'?'Play-off':phaseName(s);
  const st=(l,v,col,go)=>`<div class="cst" ${go?`onclick="go('${go}')"`:''}><span>${l}</span><b style="${col?'color:'+col:''}">${v}</b></div>`;
  const pc=v=>v>=70?'var(--good)':v>=45?'var(--acc)':'var(--bad)';
  return `<div class="ctx"><div class="cpair"><span class="clab">Rozgrywki</span><b>${esc(comp)}</b></div>
   ${op!=null?`<div class="cpair"><span class="clab">Następny rywal</span><span class="ccr" onclick="openTeam(${op})">${teamCrest(op,22)}</span><b>${esc(TEAMS[op].name)}</b><span class="mut">${e?fmtMid(e.d)+(e.t?', '+e.t:''):''}</span></div>`:''}
   <span class="sp"></span>${st('Morale',mor+'%',pc(mor))}${st('Zgranie',chem+'%',pc(chem),'sklad')}${st('Zarząd',conf+'%',pc(conf),'trener')}${st('Skład',okLu?'OK':'!',okLu?'var(--good)':'var(--bad)','sklad')}${st('Pozycja',pos,null,'tabela')}${st('Budżet',fmt(SAVE.fin?SAVE.fin.bal:0),null,'finanse')}</div>`;}
// ---- czas gry ----
function nextAction(){if(liveMatch()){go('mecz');return;}const s=S();if(!s||SAVE.fired){go('mecz');return;}
  const e=nextEvent();if(!e){go('mecz');return;}
  if(e.d>today()){advanceTo(e.d);save();ui.tab='home';render();return;}
  const c=myNext();if(c&&(s.phase==='spar'||s.phase==='liga'||s.phase==='po')){playNext();return;}
  go('mecz');}
function nextDay(){if(liveMatch()){go('mecz');return;}const e=nextEvent();const t=addDays(today(),1);
  if(e&&t>e.d){ui.msg='Dziś jest dzień meczowy — najpierw rozegraj mecz („Następna akcja”).';ui.tab='home';render();return;}
  advanceTo(t);save();ui.tab='home';render();}
// ---- ekran główny ----
function teamForm(i){const s=S();const out=[];
  if(i===SAVE.team&&s.spar)for(const g of s.spar.res)out.push(g);
  for(const rd of s.results||[])for(const g of rd)if(g.h===i||g.a===i)out.push(g);
  if(s.po)for(const sr of s.po.series)for(const g of sr.games)if(g.h===i||g.a===i)out.push(g);
  return out.slice(-5).map(g=>{const w=(g.h===i)===(g.sw[0]===3);return w;});}
function formDots(i){const f=teamForm(i);const pad=Array(Math.max(0,5-f.length)).fill(null);return `<div class="hdots">${pad.concat(f).map(w=>`<span class="${w==null?'n':w?'w':'l'}"></span>`).join('')}</div>`;}
function hNext(){const s=S();
  if(SAVE.fired)return `<div class="pan hnext"><div class="ttl">Następny mecz</div><div class="hvs"><b>Jesteś bez klubu</b><div class="mut">Sprawdź oferty w zakładce Trener.</div><button class="btn" onclick="go('trener')">Oferty pracy</button></div></div>`;
  if(s.phase==='off'||s.phase==='end')return `<div class="pan hnext"><div class="ttl">Następny mecz</div><div class="hvs"><b>${s.phase==='off'?'Przerwa między sezonami':'Sezon zakończony'}</b><div class="mut">${s.phase==='off'?'Okno transferowe otwarte. Kontrakty, transfery i przygotowania.':'Podsumowanie sezonu czeka w zakładce Mecz i sezon.'}</div><button class="btn" onclick="go('mecz')">Przejdź</button></div></div>`;
  const c=myNext();const e=nextEvent();
  if(!c)return `<div class="pan hnext"><div class="ttl">Następny mecz</div><div class="hvs"><b>Brak planowanych spotkań</b><div class="mut">Twoja drużyna nie gra w tej fazie.</div><button class="btn" onclick="go('mecz')">Pozostałe mecze</button></div></div>`;
  const home=c.h===SAVE.team,op=home?c.a:c.h;
  const comp=s.phase==='spar'?`Sparing ${s.spar.res.length+1}/${N_SPAR}`:s.phase==='liga'?`Liga · ${s.round+1}. kolejka`:`Play-off · ${STAGE[s.po.series.find(x=>x.id===c.sid).st]}`;
  const days=e?daysBetween(today(),e.d):0;const isDay=days<=0;
  return `<div class="pan hnext"><div class="ttl">Następny mecz</div><div class="hnx">
   <div class="hcr">${teamCrest(c.h,96)}${formDots(c.h)}</div>
   <div class="hvs"><b>${esc(TEAMS[c.h].name)} – ${esc(TEAMS[c.a].name)}</b>
    <div class="mut">${comp} · ${home?'u siebie':'na wyjeździe'}</div>
    <div class="mut">${e?fmtLong(e.d)+(e.t?' · '+e.t:''):''}</div>
    ${isDay?`<div class="hday">Dzień meczowy!</div><div class="row" style="justify-content:center;gap:8px;margin-top:8px"><button class="btn" onclick="playNext()">▶ Przejdź do meczu</button><button class="ghost" onclick="simNext()">Symuluj</button></div>`
     :`<div class="hday mut">za ${days} ${days===1?'dzień':'dni'}</div><button class="btn" style="margin-top:8px" onclick="nextAction()">⏩ Do dnia meczu</button>`}
    <div class="small mut" style="margin-top:6px">Rywal: ${tDot(op)}${esc(TEAMS[op].short)} · siła ${teamStrength(TEAMS[op])} (Twoja ${teamStrength(myTeam())})</div></div>
   <div class="hcr">${teamCrest(c.a,96)}${formDots(c.a)}</div></div></div>`;}
function hTable(){const s=S();if(!(s.phase==='liga'||s.phase==='po'||s.phase==='end'))return `<div class="pan"><div class="ttl">Tabela ligowa</div><div class="mut small">Tabela ruszy po sparingach, w pierwszej kolejce ligi.</div>${s.phase==='spar'?`<table class="htb">${TEAMS.map(t=>t).sort((a,b)=>teamStrength(b)-teamStrength(a)).slice(0,12).map((t,k)=>`<tr class="${t.idx===SAVE.team?'me':''}"><td>${k+1}.</td><td class="tl">${tDot(t.idx)}${esc(t.name)}</td><td class="mut">siła ${teamStrength(t)}</td></tr>`).join('')}</table><div class="small mut">Kolejność według siły składu.</div>`:''}</div>`;
  const tb=leagueTable();const c=myNext();const op=c?(c.h===SAVE.team?c.a:c.h):-1;
  return `<div class="pan"><div class="ttl">Tabela ligowa</div><table class="htb"><tr><th></th><th class="tl">Drużyna</th><th>M</th><th>Pkt</th><th>Z</th><th>P</th><th>Sety</th><th>+/−</th></tr>
   ${tb.map((x,k)=>`<tr class="${x.i===SAVE.team?'me':x.i===op?'op':''} ${k===7?'cut':''}"><td>${k+1}.</td><td class="tl"><button class="link tlk" onclick="openTeam(${x.i})">${tDot(x.i)}${esc(TEAMS[x.i].name)}</button></td><td>${x.m}</td><td class="pk">${x.pts}</td><td>${x.w}</td><td>${x.l}</td><td>${x.sw}:${x.sl}</td><td>${x.pw-x.pl>0?'+':''}${x.pw-x.pl}</td></tr>`).join('')}</table>
   <div class="small mut" style="margin-top:4px">Linia pod 8. miejscem: awans do play-off.</div></div>`;}
function hFixtures(){const ev=myEvents();const ds=Object.keys(ev).sort();const up=[],done=[];
  for(const d of ds)for(const e of ev[d]){(e.r?done:up).push({d,...e});}
  const kind=e=>e.kind==='spar'?'Sparing':e.kind==='liga'?`Liga, ${e.k}. kolejka`:'Play-off';
  const row=(e,res)=>{const my=res?e.r:null;let badge='';if(my){const w=(my.h===SAVE.team)===(my.sw[0]===3);const sc=my.h===SAVE.team?my.sw[0]+':'+my.sw[1]:my.sw[1]+':'+my.sw[0];badge=`<span class="hres ${w?'w':'l'}">${sc}</span>`;}
    return `<tr><td>${e.d.slice(8)}.${e.d.slice(5,7)}</td><td class="tl">${tDot(e.op)}${esc(TEAMS[e.op].name)} <span class="mut">(${e.home?'D':'W'})</span></td><td>${badge}</td><td class="mut">${kind(e)}</td></tr>`;};
  return `<div class="pan"><div class="ttl">Nadchodzące mecze</div><table class="hfx">${up.slice(0,4).map(e=>row(e,false)).join('')||'<tr><td class="mut">Brak.</td></tr>'}</table>
   <div class="ttl" style="margin-top:10px">Rozegrane mecze</div><table class="hfx">${done.slice(-4).reverse().map(e=>row(e,true)).join('')||'<tr><td class="mut">Jeszcze nic nie rozegrano.</td></tr>'}</table></div>`;}
function newsIcon(t){const m=String(t).match(/^\p{Extended_Pictographic}/u);return m?m[0]:'📰';}
function hNews(){const n=SAVE.news||[];
  const strip=t=>String(t).replace(/^\p{Extended_Pictographic}️?\s*/u,'');
  const big=n.slice(0,3),rest=n.slice(3,9);
  return `<div class="pan"><div class="ttl">Wiadomości</div>${n.length?`<div class="hnews">${big.map(x=>`<div class="hncard"><span class="d">${x.d?fmtLong(x.d).replace(/ \d{4}$/,''):''}</span><span class="ico">${newsIcon(x.t)}</span><span class="t">${esc(strip(x.t))}</span></div>`).join('')}</div>
   ${rest.map(x=>`<div class="hnl"><span>${newsIcon(x.t)}</span><span class="mut small">${x.d?fmtShort(x.d):''}</span><span class="t">${esc(strip(x.t))}</span></div>`).join('')}`:'<div class="mut small">Brak wiadomości. Tu pojawią się wyniki, kontuzje, transfery i decyzje zarządu.</div>'}</div>`;}
function hLast(){const L=SAVE.lastMatch;if(!L)return `<div class="pan"><div class="ttl">Podsumowanie ostatniego meczu</div><div class="mut small">Po pierwszym meczu zobaczysz tu wynik, MVP i najważniejsze liczby.</div></div>`;
  const w=(L.h===SAVE.team)===(L.sw[0]===3);
  return `<div class="pan"><div class="ttl">Podsumowanie ostatniego meczu</div>
   <div class="hlast"><span>${tDot(L.h)}</span><b>${esc(TEAMS[L.h].name)} – ${esc(TEAMS[L.a].name)} ${L.sw[0]}:${L.sw[1]}</b><span class="hres ${w?'w':'l'}">${w?'Wygrana':'Porażka'}</span><span class="mut small" style="margin-left:auto">${L.sets.map(x=>x[0]+':'+x[1]).join(' · ')} · ${L.d?fmtDMY(L.d):''}</span></div>
   <div class="hsum"><div><span class="lab">MVP</span><b>${esc(L.mvp||'—')}</b></div><div><span class="lab">Atak</span><b>${L.atk}%</b></div><div><span class="lab">Bloki</span><b>${L.blk}</b></div><div><span class="lab">Asy</span><b>${L.ace}</b></div><div><span class="lab">${L.home?'Widzów':'Mecz'}</span><b>${L.home?(L.att||0).toLocaleString('pl-PL'):'wyjazdowy'}</b></div></div></div>`;}
function hCalendar(){const ev=myEvents();const s=S();const tr=SAVE.training?(TRAIN_FOCUS.find(x=>x[0]===SAVE.training.focus)||[])[1]:null;const out=[];
  for(let k=0;k<5;k++){const d=addDays(today(),k);const list=[];
    for(const e of ev[d]||[]){const lab=e.kind==='spar'?'Sparing':e.kind==='liga'?'Liga':'Play-off';list.push(`<div class="hev m">${lab}: ${esc(TEAMS[e.home?SAVE.team:e.op].short)} – ${esc(TEAMS[e.home?e.op:SAVE.team].short)}${e.r?` (${e.r.sw[0]}:${e.r.sw[1]})`:''}</div>`);if(e.kind==='liga')list.push('<div class="hev">Liga juniorów</div>');}
    if(s.offDate===d)list.push('<div class="hev">Otwarcie okna transferowego</div>');
    if(!list.length)list.push(s.phase==='off'?'<div class="hev">Urlop / przygotowania</div>':(()=>{const tp=typeof todayPlanTxt==='function'?todayPlanTxt(d):null;return `<div class="hev">${tp?'Trening: '+esc(tp):'Wolne'}</div>`;})());
    out.push(`<div class="hdaycol ${k===0?'today':''}"><div class="hdh">${k===0?'Dziś':fmtShort(d)}</div>${list.join('')}</div>`);}
  return `<div class="hcal">${out.join('')}</div>`;}
function homeView(){const s=S();if(!s)return '';
  return `${ui.msg?`<div class="card msg">${ui.msg}</div>`:''}${s.phase==='off'?'':boardCard()}<div class="hgrid"><div class="hcol">${hNext()}${hTable()}${hFixtures()}</div><div class="hcol">${hLeague()}${hNews()}${hLast()}</div></div>${hCalendar()}`;}
