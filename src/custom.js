// ================= STRÓJ TRENERA I WŁASNY HERB KLUBU =================
// ---- stroje trenera (rysowane w faceSvg dla kind:'coach') ----
const COACH_OUTFITS=[['suit','Garnitur z krawatem'],['suitopen','Garnitur bez krawata'],['track','Dres klubowy'],['polo','Koszulka polo'],['turtle','Golf i marynarka']];
function coachOutfitSvg(k,col,U,shirt,dark){const suit='M8 100 Q12 78 32 74 L50 84 L68 74 Q88 78 92 100Z';const sh=`<path d="${suit}" fill="url(#j${U})"/>`;
  if(k==='suitopen')return {body:`<path d="${suit}" fill="#1e3a5f"/>${sh}<path d="M40 75 L50 90 L60 75 L50 80Z" fill="#f8fafc"/><path d="M44 76 L50 84 L56 76" fill="none" stroke="#cbd5e1" stroke-width="1"/><path d="M32 74 L44 96 M68 74 L56 96" stroke="#0005" stroke-width="1.2"/>`,neck:''};
  if(k==='track'){const d=dark(col);return {body:`<path d="${shirt}" fill="${col}"/><path d="${shirt}" fill="url(#j${U})"/><path d="M50 79 L50 100" stroke="#e5e7eb" stroke-width="1.6"/><path d="M14 86 L30 76 M86 86 L70 76" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/><path d="M38 72 Q50 79 62 72 L61 77 Q50 83 39 77Z" fill="${d}"/>`,neck:`<path d="M39 70 Q50 75 61 70 L61 76 Q50 81 39 76Z" fill="${d}"/><path d="M50 74 L50 80" stroke="#e5e7eb" stroke-width="1.4"/>`};}
  if(k==='polo'){const d=dark(col);return {body:`<path d="${shirt}" fill="${col}"/><path d="${shirt}" fill="url(#j${U})"/><path d="M50 79 L50 90" stroke="${d}" stroke-width="1.2"/><circle cx="50" cy="83" r="0.9" fill="#fff"/><circle cx="50" cy="87" r="0.9" fill="#fff"/>`,neck:`<path d="M37 72 L50 80 L44 85 L35 76Z" fill="${col}" stroke="${d}" stroke-width=".8"/><path d="M63 72 L50 80 L56 85 L65 76Z" fill="${col}" stroke="${d}" stroke-width=".8"/>`};}
  if(k==='turtle')return {body:`<path d="${suit}" fill="#4b5563"/>${sh}<path d="M40 74 L50 96 L60 74 L50 80Z" fill="#111827"/><path d="M32 74 L44 96 M68 74 L56 96" stroke="#0006" stroke-width="1.2"/>`,neck:`<path d="M40 66 Q50 69 60 66 L61 78 Q50 82 39 78Z" fill="#111827"/><path d="M40 70 Q50 73 60 70 M40 74 Q50 77 60 74" fill="none" stroke="#374151" stroke-width=".8"/>`};
  return {body:'',neck:''};}
function outfitPicker(cur,face,age,col,fn,look){return `<div class="row wrap" style="gap:8px">${COACH_OUTFITS.map(([k,n])=>`<button class="outfit ${(cur||'suit')===k?'on':''}" onclick="${fn}('${k}')" title="${_t(n)}">${faceSvg(face,{size:64,age,color:col,kind:'coach',outfit:k,look})}<small>${_t(n)}</small></button>`).join('')}</div>`;}
// kreator trenera: wybór stroju pod twarzą
function ccOutfit(k){ccDraft().outfit=k;render();}
{const _cv=coachCreateView;coachCreateView=function(){let h=_cv.apply(this,arguments);try{const d=ccDraft();if(d.step!==1)return h;
  const mk='<h3>Doświadczenie</h3>';const i=h.indexOf(mk);if(i>=0)h=h.slice(0,i)+`<h3>${_t('Wygląd trenera')}</h3>`+faceEditor(d.face,d.look,d.age,'#ffb020',d.outfit,'ccLook')+`<h3>${_t('Strój trenera')}</h3>`+outfitPicker(d.outfit,d.face,d.age,'#ffb020','ccOutfit',d.look)+h.slice(i);}catch(e){console.error(e);}return h;};}
// zakładka Trener: zmiana stroju w każdej chwili
function coachOutfitSet(k){const c=coach();if(!c)return;c.outfit=k;save();render();}
{const _co=coachView;coachView=function(){const h=_co.apply(this,arguments);try{const c=coach();if(!c)return h;
  const card=`<div class="card"><h2>${_t('Strój trenera')}</h2><p class="small mut">${_t('Tak będziesz wyglądać przy linii boiska, w menu i na konferencjach. Strój klubowy przyjmuje barwy prowadzonej drużyny.')}</p>${outfitPicker(c.outfit,c.face,coachAge(c),SAVE.team!=null?TEAMS[SAVE.team].color:'#ffb020','coachOutfitSet',c.look)}</div>`;
  const fcard=`<div class="card"><h2>${_t('Wygląd trenera')}</h2><p class="small mut">${_t('Ułóż twarz sam: karnacja, fryzura, zarost, oczy, nos i usta.')}</p>${faceEditor(c.face,c.look,coachAge(c),SAVE.team!=null?TEAMS[SAVE.team].color:'#ffb020',c.outfit,'coachLook')}</div>`;
  const i=h.indexOf('<div class="card"><h2>Atrybuty trenera</h2>');return i>=0?h.slice(0,i)+fcard+card+h.slice(i):h+fcard+card;}catch(e){console.error(e);return h;}};}

// ---- własny herb klubu ----
// projekt herbu: {sh,pt,em,c2,bg,yr} — ten sam format co herby klubów ligowych (crestSvg obsługuje obiekt)
const CREST_PATTERNS=[['plain','Gładki'],['vstripes','Pasy pionowe'],['hoops','Pasy poziome'],['sash','Szarfa'],['split','Dwie połowy'],['quarter','Szachownica'],['chevron','Krokiew'],['band','Pas u dołu']];
const CREST_EMBLEMS=['ball','star','crown','bolt','flame','sun','wings','eagle','falcon','hawk','owl','gull','cormorant','griffin','lynx','goat','beaver','tower','castle','anchor','ship','mount','peaks','oak','laurel','torch','helmet','hammers','rocket','comet','spark','gem','wave','wind','swirl','arrow','rainbow','aurora','rock','shieldball','crossball'];
const CREST_C1=['#0ea5e9','#2563eb','#1e3a8a','#0f1b33','#7c3aed','#db2777','#be123c','#dc2626','#ea580c','#ca8a04','#16a34a','#065f46','#0d9488','#475569','#111827','#f5f5f4'];
const CREST_C2=['#ffffff','#111827','#facc15','#0f1b33','#dc2626','#16a34a','#2563eb','#9ca3af'];
function crestOf(i){const t=TEAMS[i];if(!t)return null;if(SAVE.crestOv&&SAVE.crestOv[i])return SAVE.crestOv[i];if(SAVE.custom&&SAVE.custom.idx===i)return SAVE.custom.crest;return CLUB_CRESTS[i]||(i*7+3)%20;}
function crestObj(d,color){if(d&&typeof d==='object')return Object.assign({c2:'#ffffff',bg:color},d,{bg:d.bg||color});const p=CRESTS[(d||0)%CRESTS.length];return {sh:p[0],pt:p[1],em:p[2],c2:'#ffffff',bg:color};}
{const _tc=teamCrest;teamCrest=function(i,size){try{if(SAVE.crestOv&&SAVE.crestOv[i]){const t=TEAMS[i];return crestSvg(t.name,t.short,t.color,size,SAVE.crestOv[i]);}}catch(e){}return _tc.apply(this,arguments);};}
function crestEditor(d,name,short,fn,compact){
  const sw=(f,list,cur)=>`<div class="row wrap" style="gap:5px">${list.map(c=>`<button class="cswatch ${cur===c?'on':''}" style="background:${c}" onclick="${fn}('${f}','${c}')" aria-label="${c}"></button>`).join('')}</div>`;
  const opt=(f,v,inner,on,title)=>`<button class="crestopt ${on?'on':''}" onclick="${fn}('${f}','${v}')" title="${esc(title||'')}">${inner}</button>`;
  const pv=o=>crestSvg(name,short,d.bg,40,Object.assign({},d,o));
  return `<div class="crested">${compact?'':`<div class="crestprev">${crestSvg(name,short,d.bg,150,d)}</div>`}<div class="crestform">
   <div class="klab">${_t('Kształt')}</div><div class="crestgrid">${Object.keys(CREST_SHAPES).map(k=>opt('sh',k,pv({sh:k}),d.sh===k,k)).join('')}</div>
   <div class="klab">${_t('Wzór')}</div><div class="crestgrid">${CREST_PATTERNS.map(([k,n])=>opt('pt',k,pv({pt:k}),d.pt===k,_t(n))).join('')}</div>
   <div class="klab">${_t('Godło')}</div><div class="crestgrid">${CREST_EMBLEMS.map(k=>opt('em',k,pv({em:k,pt:'plain'}),d.em===k,k)).join('')}</div>
   ${compact?'':`<div class="klab">${_t('Kolor główny')}</div>${sw('bg',CREST_C1,d.bg)}`}
   <div class="klab">${_t('Kolor dodatkowy')}</div>${sw('c2',CREST_C2,d.c2)}
   <div class="klab">${_t('Rok założenia (opcjonalnie)')}</div><input type="number" min="1850" max="2100" value="${d.yr||''}" style="width:110px" onchange="${fn}('yr',this.value)">
  </div></div>`;}
function crestFix(d,f,v){if(f==='yr'){const y=parseInt(v,10);if(y>=1850&&y<=2100)d.yr=y;else delete d.yr;}else d[f]=v;return d;}
// zakładka Klub → Herb (prowadzony klub)
function myCrestCh(f,v){SAVE.crestOv=SAVE.crestOv||{};const i=SAVE.team;if(!SAVE.crestOv[i])SAVE.crestOv[i]=crestObj(crestOf(i),TEAMS[i].color);crestFix(SAVE.crestOv[i],f,v);save();render();}
function myCrestReset(){if(SAVE.crestOv)delete SAVE.crestOv[SAVE.team];save();render();}
function clubCrestCard(){if(SAVE.team==null)return '';const i=SAVE.team,t=TEAMS[i];const d=crestObj(crestOf(i),t.color);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">${_t('Herb klubu')}</h2><span class="sp"></span>${SAVE.crestOv&&SAVE.crestOv[i]?`<button class="ghost sm" onclick="myCrestReset()">${_t('Przywróć oryginalny')}</button>`:''}</div>
   <p class="small mut">${_t('Zaprojektuj własny herb: kształt, wzór, godło i kolory. Herb pojawi się w tabelach, terminarzu, meczach i wiadomościach.')}</p>${crestEditor(d,t.name,t.short,'myCrestCh')}</div>`;}
{const _cv=clubView;clubView=function(){return _cv.apply(this,arguments)+clubCrestCard();};}
if(typeof SUBT!=='undefined'&&SUBT.klub)SUBT.klub.push(['hb','Herb',/Herb klubu/i]);
// kreator nowego klubu: własny herb zamiast samych gotowych wzorów
function ocCrestCh(f,v){const o=ocDraft();if(!o.crest||typeof o.crest!=='object')o.crest=crestObj(o.crest,o.color);crestFix(o.crest,f,v);render();}
{const _ov=ownClubView;ownClubView=function(){{const o0=ocDraft();if(o0.crest&&typeof o0.crest==='object')o0.crest.bg=o0.color;} // kolor główny herbu = barwy klubu
  let h=_ov.apply(this,arguments);try{const o=ocDraft();
  const d=crestObj(o.crest,o.color);const own=o.crest&&typeof o.crest==='object';
  const ed=`<div class="crestown"><div class="klab" style="margin-top:10px">${_t('Albo zaprojektuj własny herb')}${own?` <span class="tag">${_t('własny projekt')}</span>`:''}</div>
    <p class="small mut" style="margin:2px 0 6px">${_t('Zacznij od dowolnego gotowego wzoru i zmieniaj kształt, wzór, godło i kolor dodatkowy. Kolor główny to barwy klubu wybrane niżej.')}</p>
    ${crestEditor(d,o.name,o.short||autoShort(o.name)||'KS','ocCrestCh',true)}</div>`;
  const mk='<h3>Barwy klubu</h3>';const i=h.indexOf(mk);if(i>=0)h=h.slice(0,i)+ed+h.slice(i);
  h=h.replace('<h3>Herb klubu</h3><div class="crestgrid">',`<h3>Herb klubu</h3><div class="klab">${_t('Gotowy wzór')}</div><div class="crestgrid">`);}catch(e){console.error(e);}return h;};}
// gotowy wzór w kreatorze ustawia indeks — wtedy własny projekt znika (zostaje wybrany wzór)

// ---- kapitał założycielski: nowy klub dostaje 250 tys. zł na transfery w pierwszym sezonie ----
// (także zapisy, w których klub założono przed tą zmianą — jeśli to wciąż pierwszy sezon kariery)
const OC_CAPITAL=250000;
function ocCapital(){if(SAVE.team==null||!SAVE.custom||SAVE.custom.idx!==SAVE.team||SAVE.ocCap||!S())return;if(SAVE.coach&&SAVE.coach.seasons)return;
  const b=BUD();if(!b)return;SAVE.ocCap=S().n;b.trAdd=(b.trAdd||0)+OC_CAPITAL;money(OC_CAPITAL,'Sponsor');finLog('Kapitał założycielski od założycieli klubu',OC_CAPITAL);
  sendMail({cat:'fin',from:'Zarząd klubu',t:'Kapitał założycielski: 250 tys. zł na transfery',s:'Założyciele klubu przekazali pieniądze na wzmocnienie składu',act:0,b:{type:'text',x:'Założyciele klubu przekazali na start 250 tys. zł. Cała kwota trafia do budżetu transferowego na ten sezon — wykorzystaj ją na wzmocnienie młodego składu.'}});}
{const _fc=foundClub;foundClub=function(){const r=_fc.apply(this,arguments);try{ocCapital();save();}catch(e){console.error(e);}return r;};}
// jednorazowo po aktualizacji: przelicz budżety bieżącego sezonu według nowych zasad (wydane kwoty zostają)
function budMigr204(){if(SAVE.team==null||!S()||!SAVE.bud||SAVE.bud.v204)return;try{budPlan();SAVE.bud.v204=1;}catch(e){}}
{const _vb=vmBoot;vmBoot=function(){const r=_vb.apply(this,arguments);try{budMigr204();ocCapital();}catch(e){}return r;};}

// ---- przerwa między sezonami (od 1 czerwca): czas płynie dzień po dniu, przygotowania ruszają 1 sierpnia ----
function prepStart(s){s=s||S();return `${seasonYear(s.n)}-08-01`;}
{const _nd=nextDay;nextDay=function(){try{const s=S();if(s&&s.phase==='off'&&!SAVE.fired&&!liveMatch()){
    const t=addDays(today(),1);const ex=typeof extraNext==='function'?extraNext(offLimit(s)):null;
    if(ex&&ex.d<=today())return _nd.apply(this,arguments);// dziś mecz kadry/pucharu
    if(t>=prepStart(s)){ui.confirm='start';startSeasonFromOff();ui.tab='home';render();return;}// 1 sierpnia: start przygotowań
    advanceTo(t);save();ui.tab='home';render();return;}}catch(e){console.error(e);}return _nd.apply(this,arguments);};}
// start przygotowań nie wcześniej niż 1 sierpnia (okres między startem a 1 sierpnia mija dzień po dniu)
{const _so=startSeasonFromOff;startSeasonFromOff=function(){const s=S();const r=_so.apply(this,arguments);try{if(s&&s.phase==='spar'&&today()<prepStart(s)){advanceTo(prepStart(s));syncDate();save();render();}}catch(e){console.error(e);}return r;};}
// ekran główny w przerwie: co robić
{const _hv=homeView;homeView=function(){let h=_hv.apply(this,arguments);try{const s=S();if(s&&s.phase==='off'&&!SAVE.fired){const left=daysBetween(today(),prepStart(s));
  h=h.replace('<p class="mut">Brak zaplanowanych meczów w tej fazie sezonu.</p><button class="btn" onclick="nextAction()">Dalej</button>',
   `<p class="mut">${_t('Przerwa między sezonami — okno transferowe jest otwarte.')} ${left>0?_t('Przygotowania ruszają 1 sierpnia')+` (${left} ${_t('dni')}).`:''} ${_t('Umów sparingi i obóz, wzmocnij skład, a potem rozpocznij przygotowania.')}</p><div class="row wrap" style="gap:8px"><button class="btn" onclick="goPrep()">${_t('Sparingi i przygotowania')}</button><button class="ghost" onclick="go('transfery')">${_t('Transfery')}</button></div>`);}}catch(e){console.error(e);}return h;};}

// ---- kreator twarzy trenera: każdą cechę wybierasz sam (zamiast losowania) ----
function lookFull(face,look,age){const out={};faceSvg(face,{size:10,age,kind:'coach',out});return Object.assign(out,look||{});}
function faceEditor(face,look,age,col,outfit,fn){const L=lookFull(face,look,age);
  const sw=(k,arr)=>`<div class="row wrap" style="gap:6px">${arr.map((c,i)=>`<button class="fsw ${L[k]===i?'on':''}" style="background:${c}" onclick="${fn}('${k}',${i})" aria-label="${i+1}"></button>`).join('')}</div>`;
  const th=(k,n,names,vb)=>`<div class="row wrap" style="gap:6px">${Array.from({length:n},(_,i)=>`<button class="outfit fth ${L[k]===i?'on':''}" onclick="${fn}('${k}',${i})" title="${names?_t(names[i]):i+1}">${(f=>vb?f.replace('viewBox="0 0 100 100"',`viewBox="${vb}"`):f)(faceSvg(face,{size:52,age,color:col,kind:'coach',outfit,look:Object.assign({},L,{[k]:i})}))}${names?`<small>${_t(names[i])}</small>`:''}</button>`).join('')}</div>`;
  const row=(t,c)=>`<div class="fer"><b class="small">${_t(t)}</b>${c}</div>`;
  return `<div class="feditor"><div class="feprev">${faceSvg(face,{size:150,age,color:col,kind:'coach',outfit,look:L})}<button class="ghost sm" onclick="${fn}('rnd',0)">🎲 ${_t('Losuj')}</button></div><div class="fecol">
   ${row('Karnacja',sw('skin',SKINS))}${row('Kształt twarzy',th('shape',3,['Wąska','Średnia','Szeroka']))}
   ${row('Fryzura',th('hair',8,null,'12 0 76 76'))}${row('Kolor włosów',sw('hc',HAIR_PICK))}
   ${row('Zarost',th('beard',6,['Brak','Kilkudniowy','Broda','Kozia bródka','Wąsy','Pełna broda'],'18 30 64 64'))}${row('Kolor oczu',sw('ec',EYEC))}
   ${row('Nos',th('nose',3,null,'37 40 26 26'))}${row('Usta',th('mouth',4,null,'38 50 24 24'))}</div></div>`;}
function lookSet(o,k,v,age){if(k==='rnd'){o.face='c'+Math.floor(Math.random()*1e9);o.look=null;return;}
  const n={skin:SKINS.length,hc:HAIR_PICK.length,ec:EYEC.length,shape:3,hair:8,beard:6,nose:3,mouth:4}[k];v=Number(v);if(!n||!Number.isInteger(v)||v<0||v>=n)return;
  o.look=lookFull(o.face,o.look,age);o.look[k]=v;}
function ccLook(k,v){const d=ccDraft();lookSet(d,k,v,d.age);render();}
function coachLook(k,v){const c=coach();if(!c)return;lookSet(c,k,v,coachAge(c));save();render();}

// ---- natychmiastowa wiadomość o kontuzji zawodnika (oprócz cotygodniowego raportu medycznego) ----
function injMailScan(){try{if(SAVE.team==null||!SAVE.world||SAVE.fired)return;const seen=SAVE.injSeen=SAVE.injSeen||{};const t=myTeam();if(!t)return;
  const med=SAVE.staff&&SAVE.staff.med;const from=med?`${med.first[0]}. ${med.last} (fizjoterapeuta)`:'Pion medyczny';
  for(const p of t.players){if(!(p.inj>0)){delete seen[p.id];continue;}const key=p.injUntil||String(p.inj);if(seen[p.id]===key)continue;seen[p.id]=key;
    const back=p.injUntil||addDays(today(),p.inj);const days=Math.max(1,daysBetween(today(),back));
    sendMail({cat:'med',weekly:1,from,t:`Kontuzja: ${p.first} ${p.last}`,s:`${p.injN||'Uraz'} — przerwa ok. ${days} dni, powrót ok. ${fmtDMY(back)}.`,b:{type:'injnow',id:p.id,what:p.injN||'Uraz',days,back},lab:'Kontuzja',ic:'🚑'});}
}catch(e){console.error(e);}}
{const _r=render;render=function(){injMailScan();return _r.apply(this,arguments);};}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type==='injnow'){const P=PLAYERS[b.id];const p=P&&P.p;
  return `<p>Trenerze, ${p?`<b>${esc(p.first)} ${esc(p.last)}</b> (${esc(p.pos||'')})`:'zawodnik'} doznał kontuzji: <b>${esc(String(b.what).toLowerCase())}</b>.</p><p>Przewidywana przerwa: ok. <b>${Number(b.days)||'?'} dni</b>, powrót ok. <b>${esc(fmtDMY(b.back))}</b>. Do tego czasu nie może grać — sprawdź wyjściową szóstkę.</p>${p?`<div class="row wrap" style="gap:8px"><button class="btn" onclick="openPop('${esc(String(b.id))}')">${_t('Karta zawodnika')}</button><button class="ghost" onclick="go('sklad')">${_t('Skład')}</button></div>`:''}`;}return _mb.apply(this,arguments);};}

// ---- zakładka „Mecz”: tylko rozegranie meczu; planowanie sparingów i przygotowań przeniesione do Terminarza ----
function goPrep(){ui.sub=ui.sub||{};ui.sub.kalendarz='p';go('kalendarz');}
function prepHtml(){const s=S();if(!s||SAVE.fired)return '';let h='';
  if(s.phase==='off')h+=offView();
  if(s.phase==='spar'){h+=`<div class="card"><h2>Rozpoczęcie ligi</h2><p class="small mut">Sparingi służą do testowania składu i taktyki. Możesz z nich zrezygnować i od razu zacząć ligę.</p><button class="ghost" onclick="skipSpar()">Pomiń sparingi i zacznij ligę</button></div>`;}
  if(typeof sparCard==='function')h+=sparCard();
  if(s.phase==='spar'&&s.spar.res.length)h+=`<div class="card"><h2>Wyniki sparingów</h2>${s.spar.res.map((g,k)=>`<div class="res me"><span class="mut small">${fmtShort(s.sdates[k])}</span> ${resTxt(g)}</div>`).join('')}</div>`;
  return h;}
{const _cv=calView;calView=function(){const h=_cv.apply(this,arguments);try{return h+prepHtml();}catch(e){console.error(e);return h;}};}
{const _sv=seasonView;seasonView=function(){const s=S();if(!s||SAVE.fired||s.phase==='end')return _sv.apply(this,arguments);
  try{const head=ui.msg?`<div class="card msg">${ui.msg}</div>`:'';const c=myNext();let out='';
    const none=(t,sub,btn)=>`<div class="card"><h2>${t}</h2><p class="mut">${sub}</p>${btn||''}</div>`;
    const lab=c?(c.kind==='nt'?`🎌 ${s.nt.comps[c.ci].n}`:c.kind==='euro'?euroLab(c):c.kind==='cup'?cupName(myCountry()):c.kind==='spar'?`Sparing — mecz towarzyski, nie liczy się do tabeli`:c.kind==='po'?(()=>{const sr=s.po.series.find(x=>x.id===c.sid);return sr?`${STAGE[sr.st]} · mecz ${sr.games.length+1} · stan rywalizacji ${seriesScore(sr)} (gra się do ${sr.need} zwycięstw)`:'Play-off';})():s.phase==='liga'?`Kolejka ${s.round+1}/${s.rounds.length}`:'Mecz'):'';
    if(c)out=nextCard(c,lab);
    else if(s.phase==='off')out=none('Brak meczu','Przerwa między sezonami. Sparingi umówisz w Terminarzu, przygotowania ruszają 1 sierpnia.',`<button class="btn" onclick="goPrep()">Sparingi i przygotowania</button>`);
    else if(s.phase==='spar')out=none('Sparingi zakończone','Wszystkie umówione sparingi zostały rozegrane.',`<div class="row wrap" style="gap:8px"><button class="btn" onclick="endSpar();render()">Rozpocznij ligę</button><button class="ghost" onclick="goPrep()">Umów kolejny sparing</button></div>`);
    else if(s.phase==='po')out=none(s.po.series.some(x=>x.hi===SAVE.team||x.lo===SAVE.team)?'Twoja drużyna odpadła z play-off':'Twoja drużyna nie awansowała do play-off','Sezon trwa dla innych drużyn.',`<div class="row wrap"><button class="btn" onclick="simPoDay()">Rozegraj kolejny dzień</button><button class="ghost" onclick="simPoAll()">Symuluj do końca sezonu</button></div>`);
    else out=none('Brak meczu','Twoja drużyna nie ma teraz zaplanowanego meczu.');
    return head+out;}catch(e){console.error(e);return _sv.apply(this,arguments);}};}

// ---- dzień meczowy: Skład → Taktyka → przemowa przed meczem → start meczu ----
const PM_TALK=[['calm','Spokojnie, róbcie swoje','„Gramy swoje, bez nerwów.”'],['char','Pokażcie charakter!','„Chcę widzieć walkę o każdą piłkę!”'],['win','Oczekuję zwycięstwa','„Jesteśmy faworytem i musimy to udowodnić.”'],['free','Nie mamy nic do stracenia','„Presja jest po ich stronie. Bawcie się grą!”'],['trust','Wierzę w was','„Ufam każdemu z was. Dacie radę.”']];
function pmKey(c){return c?[c.kind,c.h,c.a,S().n,today()].join('|'):'';}
function pmStart(){const c=myNext();if(!c)return;ui.pm={step:1,key:pmKey(c),res:null};go('mecz');}
function pmNext(){if(!ui.pm)return;if(ui.pm.step<3)ui.pm.step++;window.scrollTo(0,0);go('mecz');}
function pmBack(){if(!ui.pm||ui.pm.step<=1||ui.pm.res)return;ui.pm.step--;go('mecz');}
// pasek kroków dnia meczowego (w zakładce Mecz)
function pmBar(){const st=ui.pm.step;const L=[_t('Skład'),_t('Taktyka'),_t('Przemowa')];const c=myNext();const op=c?TEAMS[c.h===SAVE.team?c.a:c.h]:null;
  return `<div class="card pmbar"><div><div class="pmstep">${_t('Dzień meczowy')}${op?' · '+esc(op.name):''}</div><div class="pmsteps">${L.map((l,i)=>`<span class="${i+1===st?'on':i+1<st?'done':''}">${i+1<st?'✓':i+1}. ${l}</span>`).join('<i>›</i>')}</div></div><span class="sp"></span><button class="link small" onclick="pmCancel()">${_t('Anuluj')}</button>${st>1&&!ui.pm.res?`<button class="ghost" onclick="pmBack()">← ${_t('Wstecz')}</button>`:''}${st<3?`<button class="btn" onclick="pmNext()">${st===1?_t('Zatwierdź skład'):_t('Zatwierdź taktykę')} →</button>`:''}</div>`;}
function pmCancel(){ui.pm=null;render();}
function pmFav(){try{const c=myNext();const op=c.h===SAVE.team?c.a:c.h;const d=lineupStrength(myTeam(),myLineup())-teamStrength(TEAMS[op]);return d>=4?1:d<=-4?-1:0;}catch(e){return 0;}}
function pmTalk(k){if(!ui.pm||ui.pm.res)return;const fav=pmFav();const t=myTeam();const lu=myLineup();const ids=new Set(Object.values(lu));const ps=t.players.filter(p=>ids.has(p.id));const res=[];
  const aut=SAVE.coach&&SAVE.coach.attrs?(SAVE.coach.attrs.mot||10):10;const R0=mulberry32(strSeed(ui.pm.key+k));
  for(const p of ps){const T=x=>hasT(p,x);const mor=p.mor==null?60:p.mor;let d=0;
    if(k==='calm')d=T('ner')?4:T('spo')||T('pro')?2:T('wer')||T('zde')?-1:1;
    else if(k==='char')d=T('zde')||T('amb')||T('suk')||T('wer')?4:T('ner')?-3:T('len')?-1:1;
    else if(k==='win')d=fav>0?(T('amb')||T('suk')||T('pro')?3:T('ner')?-2:1):fav<0?(T('ner')?-4:-2):(T('amb')||T('suk')?2:T('ner')?-2:0);
    else if(k==='free')d=fav<0?(T('ner')?4:3):fav>0?(T('len')?-3:-2):(T('ner')?2:0);
    else if(k==='trust')d=mor<50?4:mor<70?2:1;
    d=Math.round(d*(0.8+aut/40)+(R0()-0.5));if(d)addMor(p,d);res.push([p.id,d]);}
  ui.pm.res={k,r:res};save();render();}
const _pmPlay=playNext;
playNext=function(){if(SAVE.fired)return;const c=myNext();if(!c)return;if(ui.pm&&ui.pm.step===3&&ui.pm.res){ui.pm=null;return _pmPlay.apply(this,arguments);}pmStart();};
function pmTalkCard(){const fav=pmFav();const c=myNext();if(!c)return '';const op=TEAMS[c.h===SAVE.team?c.a:c.h];const R=ui.pm.res;
  const t=myTeam();const P=id=>t.players.find(p=>p.id===id);
  return `<div class="card pmcard"><h2 style="margin:4px 0">${_t('Przemowa przed meczem')}</h2>
   <p class="small mut">${_t('Rywal')}: <b>${esc(op.name)}</b> · ${fav>0?_t('jesteście faworytem'):fav<0?_t('rywal jest faworytem'):_t('wyrównany mecz')}. ${_t('Każdy zawodnik zareaguje inaczej — zależnie od charakteru i morale.')}</p>
   ${R?`<div class="pmres">${R.r.map(([id,d])=>{const p=P(id);return p?`<div class="pmr">${pFace(p,30)}<span>${esc(p.first[0])}. ${esc(p.last)}</span><b class="${d>0?'good':d<0?'bad':'mut'}">${d>0?'+'+d:d<0?d:'0'}</b></div>`:'';}).join('')}</div><p class="small">${_t('Powiedziałeś')}: <b>${esc(_t(PM_TALK.find(x=>x[0]===R.k)[1]))}</b></p><button class="btn" onclick="playNext()">▶ ${_t('Rozpocznij mecz')}</button>`
     :`<div class="pmopts">${PM_TALK.map(([k,n,q])=>`<button class="ghost pmopt" onclick="pmTalk('${k}')"><b>${_t(n)}</b><small>${_t(q)}</small></button>`).join('')}</div>`}
</div>`;}
{const _sv=seasonView;seasonView=function(){if(ui.pm&&!liveMatch()){if(!myNext()){ui.pm=null;return _sv.apply(this,arguments);}const st=ui.pm.step;return pmBar()+(st===1?squadView():st===2?tacticsView():pmTalkCard());}return _sv.apply(this,arguments);};}

