// ================= WŁASNY KLUB =================
const OWN_COLORS=['#0ea5e9','#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#ca8a04','#16a34a','#0d9488','#475569','#111827','#be123c'];
function applyCustom(){const c=SAVE.custom;if(!c)return;const t=TEAMS[c.idx];t.name=c.name;t.short=c.short;t.color=c.color;t.city=c.city;}
function crestSvg(name,short,color,size){size=size||64;
  return `<svg viewBox="0 0 100 110" width="${size}" height="${size*1.1}" class="crest"><path d="M50 4 L92 16 L88 62 Q82 92 50 106 Q18 92 12 62 L8 16Z" fill="${color}" stroke="#fff" stroke-width="4"/><path d="M50 14 L82 23 L79 60 Q74 84 50 96 Q26 84 21 60 L18 23Z" fill="none" stroke="#ffffff66" stroke-width="2"/>
  <circle cx="50" cy="42" r="14" fill="#fff"/><path d="M38 36 Q50 42 62 36 M37 47 Q50 41 63 47 M50 28 Q44 42 50 56" stroke="${color}" stroke-width="2.2" fill="none"/>
  <text x="50" y="80" text-anchor="middle" font-size="19" font-weight="900" fill="#fff" font-family="Arial Black,Arial,sans-serif">${esc((short||'').slice(0,4))}</text></svg>`;}
function ocDraft(){const weakest=TEAMS.slice().sort((a,b)=>teamStrength(a)-teamStrength(b))[0].idx;
  if(!ui.oc)ui.oc={name:'',short:'',city:'',color:OWN_COLORS[0],star:'A',replace:weakest};return ui.oc;}
function autoShort(n){const w=n.trim().split(/\s+/).filter(Boolean);if(!w.length)return '';if(w.length===1)return w[0].slice(0,3).toUpperCase();return w.map(x=>x[0]).join('').slice(0,4).toUpperCase();}
function ownClubView(){const o=ocDraft();const c=ui.pendingCoach;
  const avg=leagueAvg();
  return `<div class="card"><div class="row wrap">${coachFace(c,56)}<div><h2 style="margin:0">Załóż nowy klub</h2><div class="mut small">Trener: ${esc(c.first)} ${esc(c.last)}</div></div><span class="sp"></span><button class="ghost" onclick="ui.cc.step=2;render()">← Wróć do listy klubów</button></div>
  ${ui.ocErr?`<div class="tmsg no">${esc(ui.ocErr)}</div>`:''}
  <div class="oc"><div class="ocprev">${crestSvg(o.name,o.short||autoShort(o.name)||'???',o.color,120)}<b>${esc(o.name||'Nazwa klubu')}</b><span class="mut small">${esc(o.city||'Miasto')}</span></div>
  <div><div class="row wrap"><label class="lu"><span>Nazwa klubu</span><input id="ocn" value="${esc(o.name)}" maxlength="28" placeholder="np. Iskra Łódź" oninput="ui.oc.name=this.value;if(!ui.oc.shortTouched){ui.oc.short=autoShort(this.value);document.getElementById('ocs').value=ui.oc.short;}"></label>
  <label class="lu"><span>Skrót (3–4 litery)</span><input id="ocs" value="${esc(o.short)}" maxlength="4" style="min-width:90px;width:90px;text-transform:uppercase" oninput="ui.oc.short=this.value.toUpperCase();ui.oc.shortTouched=true"></label>
  <label class="lu"><span>Miasto</span><input id="occ" value="${esc(o.city)}" maxlength="24" oninput="ui.oc.city=this.value"></label></div>
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
  SAVE.custom={idx:ti,name:o.name,short:o.short,color:o.color,city:o.city||'',replaced:oldName};applyCustom();
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
