// ================= WŁASNY KLUB =================
const OWN_COLORS=['#0ea5e9','#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#ca8a04','#16a34a','#0d9488','#475569','#111827','#be123c'];
function applyCustom(){const c=SAVE.custom;if(!c)return;const t=TEAMS[c.idx];t.name=c.name;t.short=c.short;t.color=c.color;t.city=c.city;}
const CREST_SHAPES={
  shield:'M50 4 L92 16 L88 62 Q82 92 50 106 Q18 92 12 62 L8 16Z',
  round:'M50 7 A48 48 0 1 1 49.9 7Z',
  heater:'M10 8 H90 V50 Q90 88 50 106 Q10 88 10 50Z',
  french:'M10 8 H90 V70 Q90 92 70 98 Q56 100 50 106 Q44 100 30 98 Q10 92 10 70Z',
  hex:'M50 4 L92 28 L92 80 L50 106 L8 80 L8 28Z',
  badge:'M20 6 H80 Q94 6 94 20 V88 Q94 102 80 102 H20 Q6 102 6 88 V20 Q6 6 20 6Z',
  pennant:'M8 6 H92 V64 L50 106 L8 64Z',
  oval:'M50 4 C80 4 94 30 94 55 C94 82 76 106 50 106 C24 106 6 82 6 55 C6 30 20 4 50 4Z'};
const CRESTS=[
  ['shield','plain','ball'],['round','plain','star'],['heater','vstripes','ball'],['french','sash','crown'],['hex','plain','bolt'],
  ['badge','band','star'],['pennant','chevron','ball'],['oval','split','tower'],['shield','quarter','crown'],['round','hoops','ball'],
  ['heater','plain','flame'],['hex','sash','star'],['badge','plain','anchor'],['french','split','mount'],['shield','chevron','sun'],
  ['oval','plain','wings'],['pennant','vstripes','star'],['round','band','laurel'],['heater','quarter','bolt'],['hex','chevron','tower']];
let CREST_UID=0;
function shadeHex(hex,f){const n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(v=>Math.round(Math.min(255,v*f))).join(',')})`;}
function crestEmblem(e,col){const W='#fff',st=`stroke="#0007" stroke-width="1.5" paint-order="stroke"`;
  switch(e){
  case 'ball':return `<circle cx="50" cy="40" r="15" fill="${W}" ${st}/><path d="M37 34 Q50 41 63 34 M36 46 Q50 39 64 46 M50 25 Q43 40 50 55" stroke="${col}" stroke-width="2.4" fill="none"/>`;
  case 'star':return `<path d="M50 22 L55 35 L69 35 L58 44 L62 58 L50 50 L38 58 L42 44 L31 35 L45 35Z" fill="${W}" ${st}/>`;
  case 'crown':return `<path d="M32 50 L30 28 L40 38 L50 24 L60 38 L70 28 L68 50Z" fill="#facc15" ${st}/><rect x="32" y="50" width="36" height="6" rx="2" fill="#facc15" ${st}/>`;
  case 'bolt':return `<path d="M55 20 L38 44 L49 44 L44 62 L63 36 L52 36Z" fill="#facc15" ${st}/>`;
  case 'tower':return `<path d="M36 58 V32 H40 V27 H45 V32 H48 V27 H52 V32 H55 V27 H60 V32 H64 V58Z" fill="${W}" ${st}/><path d="M46 58 V48 Q50 43 54 48 V58Z" fill="${col}"/>`;
  case 'flame':return `<path d="M50 20 Q62 34 58 44 Q66 40 64 32 Q74 46 66 56 Q58 64 50 62 Q38 62 35 52 Q32 42 42 34 Q42 42 46 44 Q42 30 50 20Z" fill="#f97316" ${st}/><path d="M50 40 Q57 48 54 55 Q50 59 46 55 Q44 49 50 40Z" fill="#fde047"/>`;
  case 'anchor':return `<g fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="25" r="4"/><path d="M50 29 V58 M40 37 H60 M34 48 Q36 60 50 60 Q64 60 66 48"/></g>`;
  case 'mount':return `<path d="M28 58 L42 34 L50 46 L58 30 L74 58Z" fill="${W}" ${st}/><path d="M58 30 L52 41 L56 40 L60 44 L63 37Z" fill="${col}" opacity=".5"/>`;
  case 'sun':return `<circle cx="50" cy="40" r="10" fill="#fde047" ${st}/>`+Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<line x1="${50+Math.cos(a)*13}" y1="${40+Math.sin(a)*13}" x2="${50+Math.cos(a)*19}" y2="${40+Math.sin(a)*19}" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>`;}).join('');
  case 'wings':return `<path d="M50 44 Q34 26 18 30 Q28 34 26 38 Q34 38 34 42 Q42 42 50 50Z M50 44 Q66 26 82 30 Q72 34 74 38 Q66 38 66 42 Q58 42 50 50Z" fill="${W}" ${st}/><circle cx="50" cy="44" r="8" fill="${W}" ${st}/><path d="M44 42 Q50 45 56 42 M50 36 Q47 44 50 52" stroke="${col}" stroke-width="1.6" fill="none"/>`;
  case 'laurel':return `<path d="M30 56 Q24 38 36 24 M70 56 Q76 38 64 24" fill="none" stroke="#facc15" stroke-width="3"/>`+[0,1,2,3].map(i=>`<ellipse cx="${31-i*0.5}" cy="${50-i*8}" rx="4" ry="2" fill="#facc15" transform="rotate(-50 ${31-i*0.5} ${50-i*8})"/><ellipse cx="${69+i*0.5}" cy="${50-i*8}" rx="4" ry="2" fill="#facc15" transform="rotate(50 ${69+i*0.5} ${50-i*8})"/>`).join('')+crestEmblem('ball',col);
  default:return '';}}
function crestSvg(name,short,color,size,design){size=size||64;const d=CRESTS[(design||0)%CRESTS.length];const [shape,pat,emb]=d;const path=CREST_SHAPES[shape];
  const id='cr'+(++CREST_UID);const dk=shadeHex(color,0.55),W='#fff';
  let bg=`<rect width="100" height="110" fill="${color}"/>`;
  if(pat==='vstripes')bg=`<rect width="100" height="110" fill="${W}"/>`+[14,38,62,86].map(x=>`<rect x="${x-7}" width="14" height="110" fill="${color}"/>`).join('');
  if(pat==='sash')bg+=`<path d="M-10 20 L20 -10 L110 80 L80 110Z" fill="${W}" opacity=".9"/>`;
  if(pat==='split')bg+=`<rect x="50" width="50" height="110" fill="${dk}"/>`;
  if(pat==='chevron')bg+=`<path d="M0 66 L50 40 L100 66 L100 82 L50 56 L0 82Z" fill="${W}"/>`;
  if(pat==='band')bg+=`<rect y="66" width="100" height="22" fill="${dk}"/>`;
  if(pat==='quarter')bg=`<rect width="100" height="110" fill="${color}"/><rect x="50" width="50" height="55" fill="${W}"/><rect y="55" width="50" height="55" fill="${W}"/>`;
  if(pat==='hoops')bg=`<rect width="100" height="110" fill="${color}"/>`+[18,40,62,84].map(y=>`<rect y="${y}" width="100" height="10" fill="${W}" opacity=".85"/>`).join('');
  const txt=esc((short||'').slice(0,4));
  return `<svg viewBox="0 0 100 110" width="${size}" height="${Math.round(size*1.1)}" class="crest"><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs>
  <g clip-path="url(#${id})">${bg}</g><path d="${path}" fill="none" stroke="${W}" stroke-width="4"/><path d="${path}" fill="none" stroke="${dk}" stroke-width="1.2" transform="translate(50 55) scale(.9) translate(-50 -55)" opacity=".7"/>
  ${crestEmblem(emb,color)}<text x="50" y="${shape==='pennant'?74:84}" text-anchor="middle" font-size="${txt.length>3?16:19}" font-weight="900" fill="${W}" stroke="#000a" stroke-width="3" paint-order="stroke" font-family="Arial Black,Arial,sans-serif">${txt}</text></svg>`;}
function ocDraft(){const weakest=TEAMS.slice().sort((a,b)=>teamStrength(a)-teamStrength(b))[0].idx;
  if(!ui.oc)ui.oc={name:'',short:'',city:'',color:OWN_COLORS[0],star:'A',replace:weakest,crest:0};return ui.oc;}
function autoShort(n){const w=n.trim().split(/\s+/).filter(Boolean);if(!w.length)return '';if(w.length===1)return w[0].slice(0,3).toUpperCase();return w.map(x=>x[0]).join('').slice(0,4).toUpperCase();}
function ownClubView(){const o=ocDraft();const c=ui.pendingCoach;
  const avg=leagueAvg();
  return `<div class="card"><div class="row wrap">${coachFace(c,56)}<div><h2 style="margin:0">Załóż nowy klub</h2><div class="mut small">Trener: ${esc(c.first)} ${esc(c.last)}</div></div><span class="sp"></span><button class="ghost" onclick="ui.cc.step=2;render()">← Wróć do listy klubów</button></div>
  ${ui.ocErr?`<div class="tmsg no">${esc(ui.ocErr)}</div>`:''}
  <div class="oc"><div class="ocprev">${crestSvg(o.name,o.short||autoShort(o.name)||'???',o.color,120,o.crest)}<b>${esc(o.name||'Nazwa klubu')}</b><span class="mut small">${esc(o.city||'Miasto')}</span></div>
  <div><div class="row wrap"><label class="lu"><span>Nazwa klubu</span><input id="ocn" value="${esc(o.name)}" maxlength="28" placeholder="np. Iskra Łódź" oninput="ui.oc.name=this.value;if(!ui.oc.shortTouched){ui.oc.short=autoShort(this.value);document.getElementById('ocs').value=ui.oc.short;}"></label>
  <label class="lu"><span>Skrót (3–4 litery)</span><input id="ocs" value="${esc(o.short)}" maxlength="4" style="min-width:90px;width:90px;text-transform:uppercase" oninput="ui.oc.short=this.value.toUpperCase();ui.oc.shortTouched=true"></label>
  <label class="lu"><span>Miasto</span><input id="occ" value="${esc(o.city)}" maxlength="24" oninput="ui.oc.city=this.value"></label></div>
  <h3>Herb klubu</h3><div class="crestgrid">${CRESTS.map((_,i)=>`<button class="crestopt ${o.crest===i?'on':''}" onclick="ui.oc.crest=${i};render()" title="Herb ${i+1}">${crestSvg(o.name,o.short||autoShort(o.name)||'KS',o.color,46,i)}</button>`).join('')}</div>
  <h3>Barwy klubu</h3><div class="swatches">${OWN_COLORS.map(col=>`<button class="sw ${o.color===col?'on':''}" style="background:${col}" onclick="ui.oc.color='${col}';render()" title="${col}"></button>`).join('')}</div>
  <h3>Pozycja gwiazdy zespołu</h3><div class="opts">${['R','A','P','S','L'].map(p=>`<button class="opt ${o.star===p?'on':''}" onclick="ui.oc.star='${p}';render()"><b>${POS_NAMES[p]}</b></button>`).join('')}</div>
  <h3>Który klub wycofa się z ligi?</h3><p class="small mut">Liga ma 12 miejsc, więc Twój klub zajmie miejsce jednego z obecnych.</p>
  <select onchange="ui.oc.replace=+this.value">${TEAMS.slice().sort((a,b)=>teamStrength(a)-teamStrength(b)).map(t=>`<option value="${t.idx}" ${o.replace===t.idx?'selected':''}>${esc(t.name)} (siła ${teamStrength(t)})</option>`).join('')}</select></div></div>
  <div class="card ocinfo"><b>Start od zera — co dostaniesz:</b><ul class="small">
   <li>13 młodych zawodników (20–21 lat, świeżo po juniorach), ocena ok. ${avg-9} przy średniej ligowej ${avg}, ale z dużym potencjałem</li>
   <li>⭐ 1 gwiazdę (${POS_NAMES[o.star]}), ocena ok. ${avg+7}</li>
   <li>nową drużynę juniorów U20</li>
   <li>wszystkie obiekty na poziomie 1, mały sztab (3 słabych specjalistów)</li>
   <li>budżet od inwestora: 1,5 mln zł, renoma 20/100</li>
   <li>jesteś założycielem, więc zarząd Cię nie zwolni</li></ul></div>
  <div class="row"><span class="sp"></span><button class="btn" onclick="foundClub()">🏗️ Załóż klub i zacznij grę</button></div></div>`;}
function leagueAvg(){const ps=TEAMS.flatMap(t=>t.players);return Math.round(ps.reduce((s,p)=>s+rating(p),0)/ps.length);}
function genTarget(pos,target,age){let best=null;for(let i=0;i<10;i++){const p=genPlayer(pos,target/5-2.5,age);const d=Math.abs(rating(p)-target);if(!best||d<best.d)best={p,d};if(d<=1)break;}return best.p;}
function foundClub(){const o=ocDraft();const c=ui.pendingCoach;
  o.name=(($('#ocn')||{}).value||o.name).trim();o.city=(($('#occ')||{}).value||o.city).trim();o.short=((($('#ocs')||{}).value||o.short||autoShort(o.name)).trim()).toUpperCase();
  if(o.name.length<3){ui.ocErr='Podaj nazwę klubu (min. 3 znaki).';render();return;}
  if(o.short.length<2){ui.ocErr='Skrót klubu: 2–4 litery.';render();return;}
  if(TEAMS.some(t=>t.idx!==o.replace&&t.name.toLowerCase()===o.name.toLowerCase())){ui.ocErr='Taki klub już jest w lidze.';render();return;}
  ui.ocErr=null;const ti=o.replace;const oldName=TEAMS[ti].name;
  SAVE={team:ti,tactics:{serve:1,dist:0},date:GAME_START};
  initWorld();
  const avg=leagueAvg();
  // nowa kadra
  W().players=W().players.filter(p=>p.tm!==ti);
  SAVE.custom={idx:ti,name:o.name,short:o.short,color:o.color,city:o.city||'',replaced:oldName,crest:o.crest||0};applyCustom();
  const plan=['R','R','A','A','P','P','P','P','S','S','S','S','L','L'];const si=plan.indexOf(o.star);plan.splice(si,1);
  const squad=[];
  const star=genTarget(o.star,avg+7,26+Math.floor(R()*4));squad.push(star);star.star=true;
  for(const pos of plan){const p=genTarget(pos,avg-9+Math.round(nz()*3),20+(R()<0.35?1:0));squad.push(p);}
  for(const p of squad){p.tm=ti;p.jr=false;p.inj=0;p.xp={};p.base=snap(p);p.wage=wageDemand(p);
    if(p.star){p.pot=rating(p)+2;p.wage=round5k(p.wage*1.1);p.ce=2;}else{p.pot=Math.min(92,rating(p)+14+Math.round(R()*8));p.ce=3;}
    assignNum(p,ti);W().players.push(p);}
  SAVE.ai[ti].rep=20;SAVE.ai[ti].infra=Object.fromEntries(INFRA.map(f=>[f.k,1]));SAVE.ai[ti].bud=0;
  for(let i=0;i<12;i++)W().players.push(genJunior(ti,16+(i%4),JR_PLAN[i]));
  SAVE.staff={};for(const [r] of STAFF_ROLES)SAVE.staff[r]=null;
  for(const r of ['asy','fiz','jr']){const s=genStaff(r,5+R()*3);s.wage=staffWage(s.skill);SAVE.staff[r]=s;}
  refreshStaffPool();
  SAVE.fin={bal:1500000,log:[],sea:{},prev:null};
  SAVE.ownClub=true;syncTeams();
  SAVE.lineup=autoLineup(TEAMS[ti]);SAVE.coach=c;c.joined=GAME_START;c.founder=ti;
  newSeason(1);initBoard(true);
  news(`🏗️ Powstaje nowy klub: ${o.name}${o.city?' ('+o.city+')':''}! Zajmuje w lidze miejsce ${oldName}. Pierwszym trenerem zostaje ${c.first} ${c.last}.`);
  news(`⭐ Gwiazda zespołu: ${star.first} ${star.last} (${POS_NAMES[star.pos]}, ${star.age} l., ocena ${rating(star)}).`);
  ui.cc=null;ui.pendingCoach=null;ui.oc=null;ui.tab='mecz';syncDate();save();render();}
function foundCard(){return `<button class="teamcard foundcard" onclick="ui.cc.step=3;render()"><b>🏗️ Załóż nowy klub</b><small>Własna nazwa, barwy i herb. Start od zera: infrastruktura na poziomie 1, młodzi zawodnicy z dużym potencjałem i jedna gwiazda. Zawsze dostępny, bez wymagań co do reputacji.</small></button>`;}
