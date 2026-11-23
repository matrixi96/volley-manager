// ================= STRÓJ TRENERA I WŁASNY HERB KLUBU =================
// ---- stroje trenera (rysowane w faceSvg dla kind:'coach') ----
const COACH_OUTFITS=[['suit','Garnitur z krawatem'],['suitopen','Garnitur bez krawata'],['track','Dres klubowy'],['polo','Koszulka polo'],['turtle','Golf i marynarka']];
function coachOutfitSvg(k,col,U,shirt,dark){const suit='M8 100 Q12 78 32 74 L50 84 L68 74 Q88 78 92 100Z';const sh=`<path d="${suit}" fill="url(#j${U})"/>`;
  if(k==='suitopen')return {body:`<path d="${suit}" fill="#1e3a5f"/>${sh}<path d="M40 75 L50 90 L60 75 L50 80Z" fill="#f8fafc"/><path d="M44 76 L50 84 L56 76" fill="none" stroke="#cbd5e1" stroke-width="1"/><path d="M32 74 L44 96 M68 74 L56 96" stroke="#0005" stroke-width="1.2"/>`,neck:''};
  if(k==='track'){const d=dark(col);return {body:`<path d="${shirt}" fill="${col}"/><path d="${shirt}" fill="url(#j${U})"/><path d="M50 79 L50 100" stroke="#e5e7eb" stroke-width="1.6"/><path d="M14 86 L30 76 M86 86 L70 76" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/><path d="M38 72 Q50 79 62 72 L61 77 Q50 83 39 77Z" fill="${d}"/>`,neck:`<path d="M39 70 Q50 75 61 70 L61 76 Q50 81 39 76Z" fill="${d}"/><path d="M50 74 L50 80" stroke="#e5e7eb" stroke-width="1.4"/>`};}
  if(k==='polo'){const d=dark(col);return {body:`<path d="${shirt}" fill="${col}"/><path d="${shirt}" fill="url(#j${U})"/><path d="M50 79 L50 90" stroke="${d}" stroke-width="1.2"/><circle cx="50" cy="83" r="0.9" fill="#fff"/><circle cx="50" cy="87" r="0.9" fill="#fff"/>`,neck:`<path d="M37 72 L50 80 L44 85 L35 76Z" fill="${col}" stroke="${d}" stroke-width=".8"/><path d="M63 72 L50 80 L56 85 L65 76Z" fill="${col}" stroke="${d}" stroke-width=".8"/>`};}
  if(k==='turtle')return {body:`<path d="${suit}" fill="#4b5563"/>${sh}<path d="M40 74 L50 96 L60 74 L50 80Z" fill="#111827"/><path d="M32 74 L44 96 M68 74 L56 96" stroke="#0006" stroke-width="1.2"/>`,neck:`<path d="M40 66 Q50 69 60 66 L61 78 Q50 82 39 78Z" fill="#111827"/><path d="M40 70 Q50 73 60 70 M40 74 Q50 77 60 74" fill="none" stroke="#374151" stroke-width=".8"/>`};
  return {body:'',neck:''};}
function outfitPicker(cur,face,age,col,fn){return `<div class="row wrap" style="gap:8px">${COACH_OUTFITS.map(([k,n])=>`<button class="outfit ${(cur||'suit')===k?'on':''}" onclick="${fn}('${k}')" title="${_t(n)}">${faceSvg(face,{size:64,age,color:col,kind:'coach',outfit:k})}<small>${_t(n)}</small></button>`).join('')}</div>`;}
// kreator trenera: wybór stroju pod twarzą
function ccOutfit(k){ccDraft().outfit=k;render();}
{const _cv=coachCreateView;coachCreateView=function(){let h=_cv.apply(this,arguments);try{const d=ccDraft();if(d.step!==1)return h;
  const mk='<h3>Doświadczenie</h3>';const i=h.indexOf(mk);if(i>=0)h=h.slice(0,i)+`<h3>${_t('Strój trenera')}</h3>`+outfitPicker(d.outfit,d.face,d.age,'#ffb020','ccOutfit')+h.slice(i);}catch(e){console.error(e);}return h;};}
// zakładka Trener: zmiana stroju w każdej chwili
function coachOutfitSet(k){const c=coach();if(!c)return;c.outfit=k;save();render();}
{const _co=coachView;coachView=function(){const h=_co.apply(this,arguments);try{const c=coach();if(!c)return h;
  const card=`<div class="card"><h2>${_t('Strój trenera')}</h2><p class="small mut">${_t('Tak będziesz wyglądać przy linii boiska, w menu i na konferencjach. Strój klubowy przyjmuje barwy prowadzonej drużyny.')}</p>${outfitPicker(c.outfit,c.face,coachAge(c),SAVE.team!=null?TEAMS[SAVE.team].color:'#ffb020','coachOutfitSet')}</div>`;
  const i=h.indexOf('<div class="card"><h2>Atrybuty trenera</h2>');return i>=0?h.slice(0,i)+card+h.slice(i):h+card;}catch(e){console.error(e);return h;}};}

// ---- własny herb klubu ----
// projekt herbu: {sh,pt,em,c2,bg,yr} — ten sam format co herby klubów ligowych (crestSvg obsługuje obiekt)
const CREST_PATTERNS=[['plain','Gładki'],['vstripes','Pasy pionowe'],['hoops','Pasy poziome'],['sash','Szarfa'],['split','Dwie połowy'],['quarter','Szachownica'],['chevron','Krokiew'],['band','Pas u dołu']];
const CREST_EMBLEMS=['ball','star','crown','bolt','flame','sun','wings','eagle','falcon','hawk','owl','gull','cormorant','griffin','lynx','goat','beaver','tower','castle','anchor','ship','mount','peaks','oak','laurel','torch','helmet','hammers','rocket','comet','spark','gem','wave','wind','swirl','arrow','rainbow','aurora','rock','shieldball','crossball'];
const CREST_C1=['#0ea5e9','#2563eb','#1e3a8a','#0f1b33','#7c3aed','#db2777','#be123c','#dc2626','#ea580c','#ca8a04','#16a34a','#065f46','#0d9488','#475569','#111827','#f5f5f4'];
const CREST_C2=['#ffffff','#111827','#facc15','#0f1b33','#dc2626','#16a34a','#2563eb','#9ca3af'];
function crestOf(i){const t=TEAMS[i];if(!t)return null;if(SAVE.crestOv&&SAVE.crestOv[i])return SAVE.crestOv[i];if(SAVE.custom&&SAVE.custom.idx===i)return SAVE.custom.crest;return CLUB_CRESTS[i]||(i*7+3)%20;}
function crestObj(d,color){if(d&&typeof d==='object')return Object.assign({c2:'#ffffff',bg:color},d,{bg:d.bg||color});const p=CRESTS[(d||0)%CRESTS.length];return {sh:p[0],pt:p[1],em:p[2],c2:'#ffffff',bg:color};}
{const _tc=teamCrest;teamCrest=function(i,size){try{if(SAVE.crestOv&&SAVE.crestOv[i]){const t=TEAMS[i];return crestSvg(t.name,t.short,t.color,size,SAVE.crestOv[i]);}}catch(e){}return _tc.apply(this,arguments);};}
function crestEditor(d,name,short,fn){
  const sw=(f,list,cur)=>`<div class="row wrap" style="gap:5px">${list.map(c=>`<button class="cswatch ${cur===c?'on':''}" style="background:${c}" onclick="${fn}('${f}','${c}')" aria-label="${c}"></button>`).join('')}</div>`;
  const opt=(f,v,inner,on,title)=>`<button class="crestopt ${on?'on':''}" onclick="${fn}('${f}','${v}')" title="${esc(title||'')}">${inner}</button>`;
  const pv=o=>crestSvg(name,short,d.bg,40,Object.assign({},d,o));
  return `<div class="crested"><div class="crestprev">${crestSvg(name,short,d.bg,150,d)}</div><div class="crestform">
   <div class="klab">${_t('Kształt')}</div><div class="crestgrid">${Object.keys(CREST_SHAPES).map(k=>opt('sh',k,pv({sh:k}),d.sh===k,k)).join('')}</div>
   <div class="klab">${_t('Wzór')}</div><div class="crestgrid">${CREST_PATTERNS.map(([k,n])=>opt('pt',k,pv({pt:k}),d.pt===k,_t(n))).join('')}</div>
   <div class="klab">${_t('Godło')}</div><div class="crestgrid">${CREST_EMBLEMS.map(k=>opt('em',k,pv({em:k,pt:'plain'}),d.em===k,k)).join('')}</div>
   <div class="klab">${_t('Kolor główny')}</div>${sw('bg',CREST_C1,d.bg)}
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
{const _ov=ownClubView;ownClubView=function(){let h=_ov.apply(this,arguments);try{const o=ocDraft();const d=crestObj(o.crest,o.color);
  const ed=`<details class="crestdet" ${o.crest&&typeof o.crest==='object'?'open':''}><summary>${_t('Zaprojektuj własny herb')}</summary>${crestEditor(d,o.name,o.short||autoShort(o.name)||'KS','ocCrestCh')}</details>`;
  const mk='<h3>Charakter klubu</h3>';const i=h.indexOf(mk);if(i>=0)h=h.slice(0,i)+ed+h.slice(i);}catch(e){console.error(e);}return h;};}
// gotowy wzór w kreatorze ustawia indeks — wtedy własny projekt znika (zostaje wybrany wzór)
