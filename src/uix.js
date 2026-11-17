// ================= WYGLĄD: motyw w stylu FM, przestawiane menu boczne, ekran startowy =================
const APPV='__APPV__';
// ---- motyw ----
function uiPref(k,d){try{const v=localStorage.getItem('vm_'+k);return v==null?d:v;}catch(e){return d;}}
function uiPrefSet(k,v){try{localStorage.setItem('vm_'+k,v);}catch(e){}}
function themeApply(){const t=uiPref('theme','fm');document.body.classList.toggle('th-fm',t==='fm');}
function themeSet(t){uiPrefSet('theme',t);themeApply();render();}
themeApply();
// ---- menu boczne: własna kolejność (przeciągnij i upuść albo strzałki w ustawieniach) ----
function navGroups(){let c=null;try{c=JSON.parse(uiPref('nav',null));}catch(e){}if(!Array.isArray(c))return NAV_GROUPS.map(([g,ks])=>[g,ks.slice()]);
  const known=new Set(NAV_GROUPS.flatMap(x=>x[1]));const used=new Set();const out=NAV_GROUPS.map(([g])=>{const cg=c.find(x=>x[0]===g);const ks=(cg?cg[1]:[]).filter(k=>known.has(k)&&!used.has(k));ks.forEach(k=>used.add(k));return [g,ks];});
  NAV_GROUPS.forEach(([g,ks],i)=>ks.forEach(k=>{if(!used.has(k)){out[i][1].push(k);used.add(k);}}));return out;}
function navSave(G){uiPrefSet('nav',JSON.stringify(G));}
function navMove(k,toG,beforeK){const G=navGroups();for(const g of G)g[1]=g[1].filter(x=>x!==k);const tg=G.find(x=>x[0]===toG)||G[0];const i=beforeK?tg[1].indexOf(beforeK):-1;if(i<0)tg[1].push(k);else tg[1].splice(i,0,k);navSave(G);render();}
function navStep(k,d){const G=navGroups();const flat=G.flatMap(([g,ks])=>ks.map(x=>[g,x]));const i=flat.findIndex(x=>x[1]===k);const j=i+d;if(i<0||j<0||j>=flat.length)return;
  const [gi,ki]=flat[i],[gj,kj]=flat[j];if(gi===gj){const ks=G.find(x=>x[0]===gi)[1];const a=ks.indexOf(ki),b=ks.indexOf(kj);ks[a]=kj;ks[b]=ki;}else{G.find(x=>x[0]===gi)[1]=G.find(x=>x[0]===gi)[1].filter(x=>x!==ki);const tg=G.find(x=>x[0]===gj)[1];const b=tg.indexOf(kj);tg.splice(d>0?b+1:b,0,ki);}navSave(G);render();}
function navReset(){try{localStorage.removeItem('vm_nav');}catch(e){}render();}
let NAV_DRAG=null;
function navDS(e,k){NAV_DRAG=k;try{e.dataTransfer.setData('text/plain',k);e.dataTransfer.effectAllowed='move';}catch(x){}}
function navDO(e){e.preventDefault();const t=e.currentTarget;t.classList.add('ndrop');}
function navDL(e){e.currentTarget.classList.remove('ndrop');}
function navDrop(e,g,k){e.preventDefault();e.currentTarget.classList.remove('ndrop');const d=NAV_DRAG;NAV_DRAG=null;if(!d||d===k)return;navMove(d,g,k);}
sideNav=function(){const mini=ui.tab==='mecz'&&liveMatch();const newsN=typeof unreadN==='function'?unreadN():0;const dr=!mini;
  const item=(k,g)=>`<button class="nav ${ui.tab===k?'on':''}" ${dr&&g?`draggable="true" ondragstart="navDS(event,'${k}')" ondragover="navDO(event)" ondragleave="navDL(event)" ondrop="navDrop(event,'${g}','${k}')"`:''} onclick="ui.navOpen=false;go('${k}')" title="${NAV_L[k]}${dr&&g?' — przeciągnij, żeby zmienić kolejność':''}"><span class="ic">${ico(k)}</span><span class="tx">${NAV_L[k]}</span>${k==='poczta'&&newsN?`<span class="nbad">${newsN}</span>`:''}${k==='rozmowy'&&typeof rozN==='function'&&rozN()?`<span class="nbad">${rozN()}</span>`:''}${k==='osiagniecia'&&typeof achFreshN==='function'&&achFreshN()?`<span class="nbad">${achFreshN()}</span>`:''}</button>`;
  return `<aside class="side ${mini?'mini':''} ${ui.navOpen?'open':''}">
   <div class="sbrand" onclick="ui.start=true;render()" style="cursor:pointer" title="Menu główne"><span class="sbm">${ico('mecz',20)}</span><span class="tx">VOLLEY MANAGER</span></div>
   ${navGroups().map(([g,ks])=>`<div class="ngh tx" ${dr?`ondragover="navDO(event)" ondragleave="navDL(event)" ondrop="navDrop(event,'${g}',null)"`:''}>${g}</div>${ks.map(k=>item(k,g)).join('')}`).join('')}
   <div class="navgap"></div>
   <div class="nfoot">${item('zapis')}<button class="nav small ${ui.tab==='test'?'on':''}" onclick="ui.navOpen=false;go('test')" title="Test silnika"><span class="ic">${ico('test')}</span><span class="tx">Test silnika</span></button></div>
  </aside>${ui.navOpen?'<div class="navshade" onclick="ui.navOpen=false;render()"></div>':''}`;};
// ---- karta ustawień wyglądu (w Zapis gry / Ustawienia) ----
function looksCard(){const th=uiPref('theme','fm');const G=navGroups();
  return `<div class="card"><h2>Wygląd</h2><div class="row wrap" style="gap:10px;align-items:center"><span>Motyw:</span><div class="seg"><button class="${th==='fm'?'on':''}" onclick="themeSet('fm')">Grafit (jak FM)</button><button class="${th!=='fm'?'on':''}" onclick="themeSet('classic')">Klasyczny (złoty)</button></div></div>
   <details style="margin-top:10px"><summary>Kolejność menu bocznego</summary><p class="small mut">Na komputerze możesz po prostu przeciągać pozycje w menu po lewej. Tutaj — strzałkami (działa też na telefonie).</p>
   ${G.map(([g,ks])=>`<div class="small mut" style="margin-top:6px">${g}</div>${ks.map(k=>`<div class="res row small" style="gap:6px"><span>${NAV_L[k]}</span><span class="sp"></span><button class="ghost sm" onclick="navStep('${k}',-1)">▲</button><button class="ghost sm" onclick="navStep('${k}',1)">▼</button></div>`).join('')}`).join('')}
   <button class="ghost sm" style="margin-top:8px" onclick="navReset()">Przywróć domyślną kolejność</button></details></div>`;}
{const _sv=saveView;saveView=function(){return `<div class="card row wrap" style="gap:8px;align-items:center"><span>Ustawienia i zapis gry</span><span class="sp"></span><button class="ghost" onclick="ui.start=true;render()">⏏ Menu główne</button></div>`+looksCard()+_sv.apply(this,arguments);};}
// ================= EKRAN STARTOWY =================
const CHANGES=[['v143','Własny klub: sam wybierasz charakter i plan, kibice wpływają na frekwencję i sponsorów'],['v142','Ekran startowy, motyw grafitowy jak w FM, przestawiane menu'],['v141','Strategia klubu: cele zarządu, plan pięcioletni, kibice'],['v140','Finanse: wykresy, kredyt bankowy, licencja ligowa, prognoza'],['v139','Trening: indywidualny, mentoring, odpoczynek, reżimy, trenerzy'],['v138','Wyższe limity sztabu, skauci osobno, własny klub bez limitu'],['v137','Dźwięki meczu i powiadomień, wersja na Windows'],['v136','Zapisy w IndexedDB, delegowanie transferów']];
ui.start=true;
function smHasSave(){return SAVE.team!=null&&!!SAVE.coach;}
function smCont(){ui.start=false;ui.sm=null;render();}
function smNew(){if(smHasSave()&&ui.confirm!=='smnew'){ui.confirm='smnew';render();return;}ui.confirm=null;clearTimeout(timer);SAVE={};resetTeams();ui.match=null;save();ui.start=false;ui.sm=null;ui.tab='home';render();}
function smLoad(i){const o=slotInfo(i);if(!o)return;loadObj(o);ui.start=false;ui.sm=null;ui.tab='home';render();}
function smImport(){importCode();if(SAVE.team!=null&&SAVE.coach&&!/nieprawidłowy/.test(ui.msg||'')){ui.start=false;ui.sm=null;}render();}
function smQuit(){if(location.protocol==='app:'){window.close();return;}ui.start=false;render();}
function smBg(){const c=SAVE.coach;const col=SAVE.team!=null?TEAMS[SAVE.team].color:'#3b82f6';
  // hala: trybuny, boisko w perspektywie, siatka; po lewej trener
  return `<svg class="smbg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="smG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1e24"/><stop offset=".55" stop-color="#2a2d33"/><stop offset="1" stop-color="#3a352f"/></linearGradient>
   <radialGradient id="smL" cx=".5" cy="0" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
   <rect width="1600" height="900" fill="url(#smG)"/>${Array.from({length:7},(_,r)=>`<rect x="0" y="${120+r*38}" width="1600" height="30" fill="${r%2?'#2b2f37':'#262a31'}"/>`).join('')}
   ${Array.from({length:120},(_,i)=>`<circle cx="${(i*137)%1600}" cy="${130+((i*53)%7)*38}" r="7" fill="${i%5?'#3a404b':col}" opacity=".8"/>`).join('')}
   <polygon points="150,900 1450,900 1150,520 450,520" fill="#c97b3d"/><polygon points="250,900 1350,900 1100,560 500,560" fill="#e09450"/>
   <polyline points="250,900 500,560 1100,560 1350,900" fill="none" stroke="#fff" stroke-width="4" opacity=".85"/><line x1="800" y1="560" x2="800" y2="900" stroke="#fff" stroke-width="3" opacity=".7"/>
   <line x1="380" y1="730" x2="1220" y2="730" stroke="#fff" stroke-width="3" opacity=".6"/><rect x="430" y="470" width="740" height="70" fill="none" stroke="#e5e7eb" stroke-width="3" opacity=".9"/>
   ${Array.from({length:37},(_,i)=>`<line x1="${430+i*20}" y1="470" x2="${430+i*20}" y2="540" stroke="#e5e7eb" stroke-width="1" opacity=".35"/>`).join('')}<line x1="430" y1="470" x2="430" y2="720" stroke="#ddd" stroke-width="6"/><line x1="1170" y1="470" x2="1170" y2="720" stroke="#ddd" stroke-width="6"/>
   <rect width="1600" height="900" fill="url(#smL)"/></svg>
   <div class="smcoach">${c?coachFace(c,300):typeof faceSvg==='function'?faceSvg('menu',{size:300,kind:'coach',color:col}):''}</div>`;}
function startMenuView(){const has=smHasSave();const s=has&&S()?S():null;const sm=ui.sm;
  const last=has?`<button class="smlast" onclick="smCont()"><span class="smcr">${teamCrest(SAVE.team,54)}</span><span><b>OSTATNIA</b><small>Kontynuuj: ${esc(TEAMS[SAVE.team].name)}${s?` · sezon ${sLabel(s.n)}`:''} · ${fmtDMY(today())}</small></span></button>`:'';
  let inner;
  if(sm==='load'){inner=`<div class="smsub"><b>WCZYTAJ GRĘ</b>${[1,2,3].map(i=>{const o=slotInfo(i);return `<div class="smslot"><span><b>Slot ${i}</b><small>${descSave(o)}</small></span>${o?`<button class="smbtn sm" onclick="smLoad(${i})">Wczytaj</button>`:''}</div>`;}).join('')}
     <div class="small mut" style="margin:10px 0 4px">Albo wklej kod zapisu:</div><textarea id="imp" rows="3" style="width:100%"></textarea><button class="smbtn sm" onclick="smImport()">Wczytaj z kodu</button>${ui.msg?`<div class="small" style="margin-top:6px">${esc(ui.msg)}</div>`:''}
     <button class="smlink" onclick="ui.sm=null;render()">← Wróć</button></div>`;}
  else if(sm==='set'){inner=`<div class="smsub smset">${typeof sndCard==='function'?sndCard():''}${looksCard()}<button class="smlink" onclick="ui.sm=null;render()">← Wróć</button></div>`;}
  else if(sm==='help'){inner=`<div class="smsub"><b>INSTRUKCJA</b><div class="small" style="line-height:1.6;margin-top:6px">• Prowadzisz klub siatkarski jako trener: ustalasz skład, taktykę i trening, a mecze oglądasz na żywo albo symulujesz.<br>• <b>Dalej</b> (prawy górny róg) przesuwa czas do następnego wydarzenia.<br>• Poczta i Rozmowy to sprawy od zawodników, zarządu, mediów i agentów.<br>• Klub → Sztab: zatrudniasz pracowników i przekazujesz im obowiązki.<br>• Klub → Strategia klubu: czego oczekuje zarząd.<br>• Finanse: budżety, kredyt i licencja ligowa.<br>• Gra zapisuje się sama; dodatkowe sloty i kod zapisu w „Zapis gry”.<br>• Menu po lewej możesz przestawiać, przeciągając pozycje.</div>
     ${has?`<button class="smbtn sm" onclick="smCont();setTimeout(()=>{if(typeof tutReset==='function')tutReset();},50)">Pokaż samouczek w grze</button>`:''}<button class="smlink" onclick="ui.sm=null;render()">← Wróć</button></div>`;}
  else if(sm==='news'){inner=`<div class="smsub"><b>CO NOWEGO</b>${CHANGES.map(([v,t])=>`<div class="smslot"><span><b>${v}</b><small>${esc(t)}</small></span></div>`).join('')}<button class="smlink" onclick="ui.sm=null;render()">← Wróć</button></div>`;}
  else inner=`${last}
    <button class="smbig" onclick="smNew()">${ui.confirm==='smnew'?'NA PEWNO? OBECNA KARIERA ZOSTANIE ZASTĄPIONA':'ROZPOCZNIJ NOWĄ GRĘ'}</button>${ui.confirm==='smnew'?`<div class="small mut" style="margin:-4px 0 8px">Jeśli chcesz ją zachować, najpierw zapisz ją w slocie (Ustawienia i zapis gry). <button class="smlink" onclick="ui.confirm=null;render()">Anuluj</button></div>`:''}
    <button class="smbig" onclick="ui.sm='load';ui.msg=null;render()">WCZYTAJ GRĘ</button>
    <div class="smsep"></div>
    <div class="row" style="gap:8px"><button class="smbtn sm" onclick="sndInit&&sndInit();ui.sm='set';render()">Ustawienia</button><button class="smbtn sm" onclick="ui.sm='help';render()">Instrukcja</button></div>`;
  return `<div class="smwrap">${smBg()}<div class="smpanel"><div class="smlogo"><span>VOLLEY</span><span>MANAGER</span><i>2026</i></div>
   ${sm?'':`<button class="smnews" onclick="ui.sm='news';render()">Co nowego w v${APPV} ↗</button>`}${inner}
   <div class="smfoot"><span class="mut small">v${APPV}</span>${location.protocol==='app:'?`<button class="smbtn sm" onclick="smQuit()">Wyjście</button>`:''}</div></div></div>`;}
{const _r=render;render=function(){if(ui.start){const app=$('#app');if(app){app.innerHTML=startMenuView();return;}}return _r.apply(this,arguments);};}

{const _go=go;go=function(){ui.start=false;return _go.apply(this,arguments);};}
