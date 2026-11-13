// ================= SZKIELET INTERFEJSU: MENU BOCZNE, PASEK KLUBU, EKRAN GŁÓWNY =================
const NAV=[['home','🏠','Ekran główny'],['mecz','🏐','Mecz i sezon'],['sklad','👥','Skład'],['taktyka','📋','Taktyka'],['trening','🏋️','Trening'],['kalendarz','📅','Terminarz'],['tabela','🏆','Tabela'],['staty','📈','Statystyki'],['transfery','🔁','Transfery'],['finanse','💰','Finanse'],['sztab','🧑‍🏫','Sztab'],['juniorzy','🌱','Juniorzy'],['klub','🏟️','Infrastruktura'],['trener','🎓','Trener']];
function teamCrest(i,size){const t=TEAMS[i];if(!t)return '';if(SAVE.custom&&SAVE.custom.idx===i)return crestSvg(t.name,t.short,t.color,size,SAVE.custom.crest);return crestSvg(t.name,t.short,t.color,size,(i*7+3)%20);}
function liveMatch(){return ui.match&&!ui.match.over;}
function sideNav(){const mini=ui.tab==='mecz'&&liveMatch();const newsN=(SAVE.news||[]).filter(x=>x.d===today()).length;
  const item=([k,ic,l])=>`<button class="nav ${ui.tab===k?'on':''}" onclick="ui.navOpen=false;go('${k}')" title="${l}"><span class="ic">${ic}</span><span class="tx">${l}</span></button>`;
  return `<aside class="side ${mini?'mini':''} ${ui.navOpen?'open':''}">
   <button class="nav act" onclick="ui.navOpen=false;nextAction()" title="Następna akcja"><span class="ic">⏩</span><span class="tx">Następna akcja</span></button>
   <button class="nav" onclick="ui.navOpen=false;nextDay()" title="Następny dzień"><span class="ic">▶</span><span class="tx">Następny dzień</span></button>
   <div class="navsep"></div>
   ${NAV.map(item).join('')}
   <div class="navgap"></div>
   <button class="nav ${ui.tab==='zapis'?'on':''}" onclick="ui.navOpen=false;go('zapis')" title="Zapis i wczytanie"><span class="ic">💾</span><span class="tx">Zapis gry</span></button>
   <button class="nav small ${ui.tab==='test'?'on':''}" onclick="ui.navOpen=false;go('test')" title="Test silnika"><span class="ic">🧪</span><span class="tx">Test silnika</span></button>
  </aside>${ui.navOpen?'<div class="navshade" onclick="ui.navOpen=false;render()"></div>':''}`;}
// ---- pasek klubu ----
function myLineupPlayers(){const t=myTeam();const lu=SAVE.lineup||{};return Object.values(lu).map(id=>t.players.find(p=>p.id===id)).filter(Boolean);}
function topBar(){const t=myTeam();const ps=t.players;const mor=Math.round(ps.reduce((s,p)=>s+(p.mor==null?60:p.mor),0)/Math.max(1,ps.length));
  const chem=chemPct(chemOf(myLineupPlayers(),t.idx));const conf=SAVE.board?Math.round(SAVE.board.conf):60;
  const lu=SAVE.lineup;const okLu=validLineup(t,lu)&&!myLineupPlayers().some(p=>p.inj);
  const s=S();let pos='—';if(s&&(s.phase==='liga'||s.phase==='po'||s.phase==='end')){const tb=leagueTable();pos=(tb.findIndex(x=>x.i===SAVE.team)+1)+'. miejsce';}
  const bar=(l,v)=>`<div class="tbr"><i style="width:${Math.max(4,v)}%;background:${v>=70?'#22c55e':v>=45?'#eab308':'#ef4444'}"></i><span>${l} ${v}%</span></div>`;
  const d=today();
  return `<div class="topbar">
   <button class="burger" onclick="ui.navOpen=!ui.navOpen;render()" aria-label="Menu">☰</button>
   <div class="tlogo">🏐 Volley<b>Manager</b></div>
   <div class="tcr" onclick="go('home')">${teamCrest(SAVE.team,40)}</div>
   <div class="tclub"><span class="lab">Klub</span><b>${esc(t.name)}</b></div>
   <div class="tbars"><span class="lab">Drużyna</span>${bar('Morale',mor)}${bar('Zgranie',chem)}${bar('Zarząd',conf)}</div>
   <div class="tcell" onclick="go('sklad')" title="${okLu?'Skład gotowy':'W składzie jest kontuzjowany zawodnik albo brakuje pozycji'}"><span class="lab">Skład</span><b style="font-size:22px;color:${okLu?'var(--good)':'var(--bad)'}">${okLu?'✔':'⚠'}</b></div>
   <div class="tcell"><span class="lab">Pozycja</span><b>${pos}</b></div>
   <div class="tcell" onclick="go('finanse')"><span class="lab">Budżet</span><b>${fmt(SAVE.fin?SAVE.fin.bal:0)}</b></div>
   <div class="tcell"><span class="lab">Data</span><b>${DOW[dow(d)]}<br>${fmtDMY(d)}</b></div>
  </div>`;}
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
    if(!list.length)list.push(s.phase==='off'?'<div class="hev">Urlop / przygotowania</div>':`<div class="hev">Trening${tr?': '+esc(tr.toLowerCase()):''}</div>`);
    out.push(`<div class="hdaycol ${k===0?'today':''}"><div class="hdh">${k===0?'Dziś':fmtShort(d)}</div>${list.join('')}</div>`);}
  return `<div class="hcal">${out.join('')}</div>`;}
function homeView(){const s=S();if(!s)return '';
  return `${ui.msg?`<div class="card msg">${ui.msg}</div>`:''}${s.phase==='off'?'':boardCard()}<div class="hgrid"><div class="hcol">${hNext()}${hTable()}${hFixtures()}</div><div class="hcol">${hLeague()}${hNews()}${hLast()}</div></div>${hCalendar()}`;}
