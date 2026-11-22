// ================= JUNIORZY (układ jak w FM): Widok ogólny · Widok ogólny: Juniorzy · Wypożyczenia =================
if(typeof SUBT!=='undefined')delete SUBT.juniorzy;
// --- historia ocen (wykres postępów): zapis co miesiąc ---
function yTracked(){if(SAVE.team==null||!SAVE.world)return [];return W().players.filter(p=>(p.tm===SAVE.team&&(p.jr||p.age<=21))||(p.loan&&p.loan.from===SAVE.team));}
function yRh(p){if(!p.rh||!p.rh.length){const b=baseRating(p),r=rating(p);p.rh=b!==r?[b,r]:[r];}return p.rh;}
function ySnap(){for(const p of yTracked()){const h=yRh(p);h.push(rating(p));p.rh=h.slice(-12);}}
function ySpark(p){const h=yRh(p).concat(rating(p)===yRh(p).slice(-1)[0]?[]:[rating(p)]);const W0=62,H0=20;if(h.length<2)return `<svg width="${W0}" height="${H0}"><line x1="2" y1="${H0/2}" x2="${W0-2}" y2="${H0/2}" stroke="#facc15" stroke-width="1.5" opacity=".5"/></svg>`;
  const lo=Math.min(...h)-1,hi=Math.max(...h)+1;const pts=h.map((v,i)=>[2+i*(W0-4)/(h.length-1),H0-2-(v-lo)/(hi-lo)*(H0-4)]);
  return `<svg width="${W0}" height="${H0}" class="yspk"><polyline points="${pts.map(q=>q.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#facc15" stroke-width="1.5"/>${pts.map(q=>`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="1.6" fill="#facc15"/>`).join('')}</svg>`;}
// --- oceny ---
function yGr(v){return v==null?'<span class="ygr na">–</span>':`<span class="ygr ${v>=7?'hi':v<6?'lo':''}">${v.toFixed(2).replace('.',',')}</span>`;}
function yMatchGr(p){if(p.jr){const r=(S().jps||{})[p.id];return r&&r.rn?r.rs/r.rn:null;}const L=p.loan&&p.loan.st;if(L&&L.m)return L.gs/L.m;const r=(S().ps||{})[p.id];return r&&r.rn?r.rs/r.rn:null;}
function yMatches(p){if(p.jr){const r=(S().jps||{})[p.id];return r?r.m:0;}const L=p.loan&&p.loan.st;if(L)return L.m;const r=(S().ps||{})[p.id];return r?r.m:0;}
function yTrainGr(p){const inf=myInfra();const sk=staffSkill('jr');const mk=monKey();let h=0;for(const c of p.id+mk)h=(h*31+c.charCodeAt(0))>>>0;
  const v=5.9+(sk-10)*0.07+(inf.akad-2)*0.18+(hasT(p,'pra')?0.45:0)+(hasT(p,'amb')?0.25:0)-(hasT(p,'len')?0.6:0)+((h%100)/100-0.5)*0.9+Math.min(0.5,Math.max(0,(rating(p)-yRh(p)[0])*0.08));
  return Math.max(4.5,Math.min(9.3,v));}
// gwiazdki jak w FM: względem poziomu Twojej pierwszej drużyny (3★ = przeciętny zawodnik pierwszej szóstki)
function yRef(){const k=today();if(yRef.k!==k){yRef.k=k;yRef.v=teamStrength(myTeam());}return yRef.v;}
function yStarN(v){return Math.max(0.5,Math.min(5,Math.round((3+(v-yRef())/5)*2)/2));}
function yStarsH(n,cls){const f=Math.floor(n),h=n-f>=0.5;return `<span class="ystars ${cls||''}" title="${String(n).replace('.',',')} / 5">${'★'.repeat(f)}${h?'<i>★</i>':''}<span class="mut">${'★'.repeat(5-f-(h?1:0))}</span></span>`;}
function ySkStars(p){return yStarsH(yStarN(rating(p)));}
function yPotStars(p){if(p.tm!==SAVE.team&&!(p.loan&&p.loan.from===SAVE.team))return potStars(p);return yStarsH(yStarN(p.pot||rating(p)),'pot');}
// --- opinie trenera juniorów i rekomendacje ---
function yLike(p){const pot=p.pot||rating(p);const pool=TEAMS.filter(t=>t&&lgOf(t.idx)===myLg()).flatMap(t=>t.players).filter(x=>x.pos===p.pos&&x.id!==p.id);if(!pool.length)return null;
  const mine=pool.filter(x=>x.tm===SAVE.team&&Math.abs(rating(x)-pot)<=2).sort((a,b)=>rating(b)-rating(a))[0];if(mine)return mine;
  return pool.slice().sort((a,b)=>Math.abs(rating(a)-pot)-Math.abs(rating(b)-pot))[0];}
function yWorst(p){const xs=myTeam().players.filter(x=>x.pos===p.pos&&!onLoan(x)).sort((a,b)=>rating(a)-rating(b));return xs[0]||null;}
function yRec(p){const r=rating(p),ps=yStarN(p.pot||r);const w=yWorst(p);
  if(w&&r>=rating(w)-1&&myTeam().players.length<SQUAD_MAX)return {k:'up',t:`Gotowy na pierwszą drużynę — już teraz gra na poziomie ${esc(w.first[0])}. ${esc(w.last)} (${rating(w)}).`,b:'Awansuj'};
  if(!w&&myTeam().players.length<SQUAD_MAX&&r>=teamStrength(myTeam())-12)return {k:'up',t:'Nie masz nikogo na tej pozycji w pierwszej drużynie — warto go awansować.',b:'Awansuj'};
  if(p.age>=18&&ps>=3&&yMatches(p)<6)return {k:'loan',t:'Powinien pójść na wypożyczenie do klubu seniorskiego — będzie tam grał regularnie i szybciej się rozwinie.',b:'Wypożycz'};
  if(p.age>=20)return {k:'age',t:'Skończył 20 lat — musi awansować albo odejść w oknie transferowym.',b:'Awansuj'};
  return null;}
function yOpinion(p){const ps=yStarN(p.pot||rating(p));const R0=yRec(p);if(R0&&R0.k!=='loan')return R0.t;
  if(ps<=1.5)return 'Ma za mały potencjał, by grać w pierwszej drużynie.';if(ps<=2.5)return 'Może zostać zmiennikiem w pierwszej drużynie.';const x=yLike(p);const base=ps>=4?'Może stać się klasowym zawodnikiem':'Może stać się solidnym zawodnikiem';
  return x?`${base}, potencjalnie równie dobrym co ${esc(x.first[0])}. ${esc(x.last)}${x.tm!==SAVE.team?` (${esc(TEAMS[x.tm].short)})`:''}.`:base+'.';}
function yAct(pid,k){if(k==='up'||k==='age')return promote(pid);if(k==='loan'){ui.jrTab='w';ui.yFocus=pid;render();return;}}
// --- akademia ---
function yAcadStars(){return Math.max(1,Math.min(5,Math.round(myInfra().akad*0.55+staffSkill('jr')/7)));}
function yIntake(){const inf=myInfra();const sk=staffSkill('jr');const k=2+Math.floor(inf.akad/2)+(sk>=15?1:0);const q=inf.akad*0.4+(sk-10)*0.06;
  return {k,q:q>=2?'Doskonały':q>=1.3?'Dobry':q>=0.6?'Przeciętny':'Słaby',stars:q>=2?5:q>=1.3?4:q>=0.6?3:2};}
function yMood(js){if(!js.length)return 'Brak juniorów';const g=js.reduce((a,p)=>a+(rating(p)-yRh(p)[0]),0)/js.length;const pl=js.filter(p=>yMatches(p)>0).length/js.length;
  const v=g*0.8+pl*2;return v>=2.5?'Bardzo dobra':v>=1.2?'Dobra':v>=0.4?'Przeciętna':'Słaba';}
const yPosO={R:0,A:1,P:2,S:3,L:4};
function yJs(){return juniorsOf(SAVE.team).slice().sort((a,b)=>yPosO[a.pos]-yPosO[b.pos]||rating(b)-rating(a));}
function yFace(p,sub){return `<span class="fcell">${pFace(p,30)}<span><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button>${p.inj?' 🚑':''}<br><small class="mut">${p.age}-letni ${POS_NAMES[p.pos].toLowerCase()}${sub||''}</small></span></span>`;}
// --- panele ---
function yU20Fix(){const s=S();const R0=(s.jres||[]).length;const out=[];const ti=SAVE.team;
  for(let i=Math.max(0,R0-3);i<R0;i++){const g=(s.jres[i]||[]).find(x=>x.h===ti||x.a===ti);if(!g)continue;const home=g.h===ti;const op=home?g.a:g.h;const my=home?g.sw[0]:g.sw[1],th=home?g.sw[1]:g.sw[0];
    out.push(`<div class="yfx"><span class="mut">${s.rdates&&s.rdates[i]?fmtDMY(s.rdates[i]).slice(0,5):''}</span>${tDot(op)}<span class="ln">${home?'':'@ '}${tName(op)}</span><b class="${my>th?'good':'bad'}">${my}:${th}</b></div>`);}
  for(let i=R0;i<Math.min(R0+3,(s.rounds||[]).length);i++){const f=s.rounds[i].find(x=>x[0]===ti||x[1]===ti);if(!f)continue;const home=f[0]===ti;const op=home?f[1]:f[0];
    out.push(`<div class="yfx"><span class="mut">${s.rdates&&s.rdates[i]?fmtDMY(s.rdates[i]).slice(0,5):''}</span>${tDot(op)}<span class="ln">${home?'':'@ '}${tName(op)}</span><span class="mut">—</span></div>`);}
  return `<div class="pan"><div class="ttl">U20: terminarz meczów</div>${out.join('')||'<p class="small mut">Liga juniorów rusza razem z fazą zasadniczą seniorów.</p>'}</div>`;}
function yU20Lg(){const s=S();const tb=tableFrom(s.jres||[]);const i=tb.findIndex(x=>x.i===SAVE.team);const me=tb[i];
  return `<div class="pan"><div class="ttl">U20: rozgrywki</div>${me&&me.m?`<div class="ybig">${i+1}. miejsce</div><div class="small mut">${me.pts} pkt · ${me.w} zw. / ${me.l} por.</div><div class="small" style="margin-top:6px">Lider: ${tDot(tb[0].i)}${tName(tb[0].i)} U20 (${tb[0].pts} pkt)</div>`:'<div class="small">Liga juniorów U20</div><p class="small mut">Jeszcze bez rozegranych kolejek.</p>'}
   ${s.jchamp!=null?`<div class="small">🏆 Mistrz: <b>${tName(s.jchamp)} U20</b></div>`:''}<button class="link small" style="margin-top:6px" onclick="ui.tabSel='jr';go('tabela')">Pełna tabela →</button></div>`;}
function yAcad(){const inf=myInfra();const st=SAVE.staff.jr;const n=yAcadStars();
  return `<div class="pan"><div class="ttl">Akademia</div><div class="yrow"><span>Obiekty akademii</span><b>${'★'.repeat(inf.akad)}<span class="mut">${'★'.repeat(Math.max(0,5-inf.akad))}</span></b></div>
   <div class="yrow"><span>Trener juniorów</span><b>${st?st.skill+'/20':'<span class="bad">brak</span>'}</b></div><div class="yrow"><span>Szkolenie młodzieży</span><b class="stars">${'★'.repeat(n)}<span class="mut">${'★'.repeat(5-n)}</span></b></div>
   <button class="link small" style="margin-top:6px" onclick="go('klub')">Rozbuduj akademię →</button></div>`;}
function yIntakeP(){const I=yIntake();return `<div class="pan"><div class="ttl">Kandydaci na juniorów</div><div class="ybig">🔍 ${I.q} nabór <span class="stars">${'★'.repeat(I.stars)}</span></div>
  <p class="small mut">Następny nabór po zakończeniu sezonu: ok. ${I.k} zawodników. Lepsze obiekty akademii i lepszy trener juniorów to zdolniejszy rocznik.</p></div>`;}
function yLoansP(){const out=myLoansOut();return `<div class="pan"><div class="ttl">Wypożyczenia</div><div class="ybig">Zawodników: ${out.length}</div>
  ${out.slice(0,3).map(p=>`<div class="yfx"><span class="ln">${esc(p.first[0])}. ${esc(p.last)}</span><small class="mut">${esc(TEAMS[p.tm].short)}</small>${yGr(yMatchGr(p))}</div>`).join('')}
  <button class="link small" style="margin-top:6px" onclick="ui.jrTab='w';render()">Szczegóły →</button></div>`;}
function ySide(js){const avg=js.length?js.reduce((a,p)=>a+p.age,0)/js.length:0;const key=js.slice().sort((a,b)=>(b.pot||0)-(a.pot||0)).slice(0,4);
  return `<div class="pan ysd"><div class="ttl">${esc(myTeam().short)} U20</div><div class="row"><div class="ybig">Juniorzy: ${js.length}</div><span class="sp"></span><small class="mut">Średnia wieku<br><b>${avg.toFixed(1).replace('.',',')} l.</b></small></div>
   <h4>Kluczowi juniorzy</h4>${key.map(p=>`<div class="ykey">${pFace(p,32)}<span class="ln"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. ${esc(p.last)}</button><br><small class="mut">${POS_NAMES[p.pos]}</small></span>${yPotStars(p)}</div>`).join('')||'<p class="small mut">Brak juniorów.</p>'}</div>`;}
// --- widoki ---
function yOverview(){const js=yJs();const cands=js.map(p=>({p,r:yRec(p)})).filter(x=>x.r).sort((a,b)=>(a.r.k==='up'?0:1)-(b.r.k==='up'?0:1)||rating(b.p)-rating(a.p)).slice(0,5);
  const tbl=`<div class="tw"><table class="ytb"><thead><tr><th class="l">Nazwisko</th><th>Postępy</th><th>Poz</th><th>M</th><th>Ocena</th><th>Umiejętności</th><th>Potencjał</th><th class="l">Ocena trenera juniorów</th><th></th></tr></thead><tbody>
   ${cands.map(({p,r})=>`<tr><td class="l">${yFace(p)}</td><td>${ySpark(p)}</td><td>${pTag(p.pos)}</td><td>${yMatches(p)}</td><td>${yGr(yMatchGr(p))}</td><td>${ySkStars(p)}</td><td>${yPotStars(p)}</td><td class="l small yop">${r.t}</td><td><button class="yok" title="${r.b}" onclick="yAct('${p.id}','${r.k}')">✓ ${r.b}</button></td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="ygrid"><div class="ymain"><div class="card"><h2>Kandydaci do pierwszego zespołu</h2>${cands.length?tbl:'<p class="mut">Trener juniorów nie ma teraz nikogo do polecenia. Zajrzyj w zakładkę „Widok ogólny: Juniorzy”, żeby zobaczyć cały rocznik.</p>'}</div>
   <div class="ytiles">${yU20Fix()}${yU20Lg()}${yAcad()}${yIntakeP()}${yLoansP()}</div></div>${ySide(js)}</div>`;}
function yList(){const all=yJs();const f=ui.jrF||'';const js=all.filter(p=>!f||p.pos===f);const sk=SAVE.staff.jr;
  const best=all.slice().sort((a,b)=>(rating(b)-yRh(b)[0])-(rating(a)-yRh(a)[0]))[0];
  return `<div class="ygrid"><div class="ymain"><div class="card"><div class="row wrap"><h2 style="margin:0">U20: rozwój zespołu</h2><span class="sp"></span><select onchange="ui.jrF=this.value;render()"><option value="">Filtr: wszystkie pozycje</option>${['R','A','P','S','L'].map(k=>`<option value="${k}" ${f===k?'selected':''}>${POS_NAMES[k]}</option>`).join('')}</select></div>
   <p class="small mut">Juniorzy grają w lidze U20 w tych samych kolejkach co seniorzy i rozwijają się szybciej niż dorośli. Po skończeniu 20 lat junior musi awansować albo odejść. Ocena treningu zależy od trenera juniorów, obiektów akademii i charakteru zawodnika; ocena meczowa to średnia z meczów U20 (skala 1–10).</p>
   <div class="tw"><table class="ytb"><thead><tr><th class="l">Nazwisko</th><th>Postępy</th><th>Poz</th><th>M</th><th>Pkt</th><th>Trening</th><th>Ocena</th><th>Umiejętności</th><th>Potencjał</th><th class="l">Ocena trenera juniorów</th><th title="✓ — wykonaj radę trenera juniorów · ⬆️ — awans"></th></tr></thead><tbody>
   ${js.map(p=>{const st=(S().jps||{})[p.id];const R0=yRec(p);return `<tr><td class="l">${yFace(p,p.age>=20?' · <span class="tag">20+</span>':'')}</td><td>${ySpark(p)}</td><td>${pTag(p.pos)}</td><td>${st?st.m:0}</td><td>${st?st.pts:0}</td><td>${yGr(yTrainGr(p))}</td><td>${yGr(yMatchGr(p))}</td><td>${ySkStars(p)}</td><td>${yPotStars(p)}</td><td class="l small yop">${yOpinion(p)}</td>
     <td>${R0?`<button class="yok" title="${R0.b} — rada trenera juniorów" onclick="yAct('${p.id}','${R0.k}')">✓</button>`:`<button class="ghost sm" title="Awansuj do pierwszej drużyny" onclick="promote('${p.id}')">⬆️</button>`}</td></tr>`;}).join('')||`<tr><td colspan="11" class="mut">Brak juniorów${f?' na tej pozycji':''}.</td></tr>`}</tbody></table></div></div>
   <div class="ytiles">${yU20Fix()}
    <div class="pan"><div class="ttl">U20: trening</div><div class="yrow"><span>Tempo rozwoju</span><b>${Math.round(clubMods(SAVE.team).jr*100)}% normy</b></div><div class="yrow"><span>Najszybszy postęp</span><b>${best&&rating(best)>yRh(best)[0]?`${esc(best.last)} (+${rating(best)-yRh(best)[0]})`:'—'}</b></div><p class="small mut">Juniorzy trenują z trenerem juniorów — nie biorą udziału w treningu pierwszej drużyny.</p></div>
    <div class="pan"><div class="ttl">Dynamika młodzieży</div><div class="ybig">${yMood(all)}</div><div class="small mut">Atmosfera w U20 — rośnie, gdy juniorzy grają i robią postępy.</div><div class="yrow" style="margin-top:6px"><span>Szkolenie młodzieży</span><b class="stars">${'★'.repeat(yAcadStars())}</b></div></div>
    <div class="pan"><div class="ttl">Sztab (U20)</div>${sk?`<div class="ykey">${sFace(sk,32)}<span class="ln"><b>${esc(sk.first)} ${esc(sk.last)}</b><br><small class="mut">Trener juniorów · ${sk.skill}/20</small></span></div>`:'<p class="small bad">Nie masz trenera juniorów — rozwój młodzieży jest wolniejszy.</p>'}<button class="link small" onclick="go('sztab')">Sztab →</button></div></div>
   ${juniorLeaders()}</div>
   <div class="pan ysd"><div class="ttl">${esc(myTeam().short)} U20</div><table class="ysq"><thead><tr><th class="l">Nazwisko</th><th>Poz</th><th>Oc.</th></tr></thead><tbody>${all.map(p=>`<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. ${esc(p.last)}</button></td><td>${pTag(p.pos)}</td><td>${rating(p)}</td></tr>`).join('')}</tbody></table></div></div>`;}
// --- wypożyczenia ---
function yLoanRep(p){const L=p.loan;const st=L.st||{m:0,gs:0};const d=rating(p)-(L.r0||rating(p));const t=TEAMS[p.tm];const role=isStarter(p)?'Podstawowy':'Rezerwowy';
  const g=st.m?st.gs/st.m:null;const rep=!st.m?'Jeszcze nie zagrał — trener tamtego klubu na razie na niego nie stawia.':g>=7?'Wyróżnia się w nowym klubie.':g>=6.2?'Gra solidnie.':'Ma trudności — gra słabiej od kolegów.';
  return {role,d,g,m:st.m,rep:rep+(d>0?` Rozwój od wypożyczenia: +${d}.`:'')};}
function yLoanRow(p){const R0=yLoanRep(p);return `<tr><td class="l">${yFace(p,p.loan.jr?' · junior':'')}</td><td>${ySpark(p)}</td><td class="l">${tDot(p.tm)}${tName(p.tm)} <small class="mut">${LG_SHORT[lgOf(p.tm)]}</small></td><td>${R0.role}</td><td>${R0.m}</td><td>${yGr(R0.g)}</td><td class="${R0.d>0?'good':''}">${R0.d>0?'+'+R0.d:'–'}</td><td class="l small yop">${R0.rep}</td></tr>`;}
function yCands(){const t=myTeam();const jr=juniorsOf(SAVE.team).filter(p=>p.age>=18&&!p.inj);const sr=t.players.filter(p=>p.age<=21&&!onLoan(p)&&!isStarter(p)&&(plShare(p)==null||plShare(p)<0.3));
  const all=jr.concat(sr);const f=ui.yFocus;all.sort((a,b)=>(b.id===f)-(a.id===f)||(b.pot||0)-(a.pot||0));return all.slice(0,8);}
function yLoans(){const out=myLoansOut();const inn=myTeam().players.filter(p=>p.loan&&p.loan.from!==SAVE.team);const o=windowOpen();
  const cands=yCands();
  return `<div class="card"><h2>Nasi zawodnicy na wypożyczeniu</h2>${out.length?`<div class="tw"><table class="ytb"><thead><tr><th class="l">Zawodnik</th><th>Postępy</th><th class="l">Klub</th><th>Rola</th><th>M</th><th>Ocena</th><th>Rozwój</th><th class="l">Raport</th></tr></thead><tbody>${out.map(yLoanRow).join('')}</tbody></table></div>`:'<p class="mut">Nie masz teraz zawodników na wypożyczeniu.</p>'}
   <p class="small mut">Wypożyczenie trwa do końca sezonu. Trener juniorów raz w miesiącu przysyła raport. Junior wraca do akademii, zawodnik z kadry — do pierwszej drużyny.</p></div>
   ${inn.length?`<div class="card"><h2>Wypożyczeni do nas</h2>${inn.map(p=>`<div class="res row">${yFace(p)}<span class="sp"></span><small class="mut">z ${tName(p.loan.from)} · ${yMatches(p)} meczów</small></div>`).join('')}</div>`:''}
   <div class="card"><h2>Do rozważenia</h2><p class="small mut">Juniorzy w wieku 18–19 lat i młodzi zawodnicy z kadry, którzy mało grają. W klubie seniorskim będą grać regularnie i szybciej się rozwiną.</p>
   ${!o?'<p class="small">Wypożyczać można tylko w oknie transferowym (przerwa między sezonami i okres przygotowawczy).</p>':''}
   ${cands.map(p=>{const L=o?yTakers(p).slice(0,3):[];return `<div class="ycand ${p.id===ui.yFocus?'on':''}"><div class="row">${yFace(p,p.jr?' · junior':' · '+(plShare(p)==null?'jeszcze nie grał':'gra '+Math.round(plShare(p)*100)+'% czasu'))}<span class="sp"></span><span>${ySkStars(p)} ${yPotStars(p)}</span></div>
     ${o?(L.length?L.map(x=>`<div class="row small" style="gap:8px;margin:4px 0 0 40px">${tDot(x.ti)} <b>${tName(x.ti)}</b> <small class="mut">${LG_SHORT[lgOf(x.ti)]}${x.starter?' · w podstawie':' · rezerwowy'}</small><span class="sp"></span>${p.jr?`<button class="${ui.confirm==='jl'+p.id+x.ti?'btn':'ghost'} sm" onclick="jrLoanOut('${p.id}',${x.ti})">${ui.confirm==='jl'+p.id+x.ti?'Potwierdź':'Wypożycz'}</button>`:`<small>${x.share===1?'płacą całą pensję':'pensja po połowie'}${x.fee?` · +${fmt(x.fee)}`:''}</small><button class="${ui.confirm==='lo'+x.ti?'btn':'ghost'} sm" onclick="loanOut('${p.id}',${x.ti},${x.share},${x.fee})">${ui.confirm==='lo'+x.ti?'Potwierdź':'Wypożycz'}</button>`}</div>`).join(''):'<p class="small mut" style="margin:4px 0 0 40px">Żaden klub nie jest teraz zainteresowany.</p>'):''}</div>`;}).join('')||'<p class="mut">Nikogo nie warto teraz wypożyczać.</p>'}</div>`;}
function yTakers(p){if(!p.jr)return loanTakers(p);const r=rating(p);const c=tmCountry(SAVE.team);
  return TEAMS.filter(t=>t&&t.idx!==SAVE.team&&!isYT(t.idx)&&tmCountry(t.idx)===c&&t.players.length<17).map(t=>{const rs=t.players.filter(x=>x.pos===p.pos).map(x=>rating(x)).sort((a,b)=>b-a);
    const need=rs.length<POS_STD[p.pos]||r>=(rs[rs.length-1]||0)-4;if(!need)return null;return {ti:t.idx,share:1,fee:0,starter:r>=(rs[0]||0)-1,dp:rs.filter(x=>x>r).length};}).filter(Boolean)
   .sort((a,b)=>(b.starter-a.starter)||(a.dp-b.dp)||(LG_LV[lgOf(a.ti)]-LG_LV[lgOf(b.ti)])||(SAVE.ai[b.ti].rep-SAVE.ai[a.ti].rep)).slice(0,5);}
// wypożyczenie juniora: gra w klubie seniorskim, nie dostaje pensji, wraca do akademii
function jrLoanOut(pid,ti){const p=PLAYERS[pid]&&PLAYERS[pid].p||W().players.find(x=>x.id===pid);if(!p)return;if(!windowOpen())return tradeMsg(false,'Wypożyczać można tylko w oknie transferowym.');if(p.age<18)return tradeMsg(false,'Junior jest za młody na wypożyczenie (min. 18 lat).');
  if(ui.confirm!=='jl'+pid+ti){ui.confirm='jl'+pid+ti;render();return;}ui.confirm=null;
  p.jr=false;p.wage=0;const ps0=(S().ps||{})[p.id];p.loan={from:SAVE.team,share:1,n:S().n,fee:0,jn0:p.jn,jr:1,r0:rating(p),st:{m:0,gs:0},pm:ps0?ps0.m:0,prs:ps0?ps0.rs||0:0,prn:ps0?ps0.rn||0:0};movePlayer(p,ti);syncTeams();ui.yFocus=null;
  news(`🔁 Junior ${p.first} ${p.last} wypożyczony do ${TEAMS[ti].name} do końca sezonu — będzie grał w seniorach.`);tradeMsg(true,`${p.last} wypożyczony do ${TEAMS[ti].name}.`);save();render();}
{const _lo=loanOutAct;loanOutAct=function(p){if(!p.jr)return _lo.apply(this,arguments);if(p.tm!==SAVE.team||p.age<18)return '';const o=windowOpen();const L=o?yTakers(p):[];
  return `<div class="act"><h4>🔁 Wypożyczenie juniora</h4><p class="small mut">Junior zagra do końca sezonu w klubie seniorskim i wróci do akademii. Regularna gra wśród dorosłych przyspiesza rozwój.</p>${!o?'<p class="small mut">Wypożyczać można tylko w oknie transferowym.</p>':!L.length?'<p class="small mut">Żaden klub nie jest teraz zainteresowany.</p>':L.map(x=>`<div class="row" style="gap:8px;margin:4px 0">${tDot(x.ti)} <b>${tName(x.ti)}</b> <small class="mut">${LG_SHORT[lgOf(x.ti)]}${x.starter?' · w podstawie':' · rezerwowy'}</small><span class="sp"></span><button class="${ui.confirm==='jl'+p.id+x.ti?'btn':'ghost'} sm" onclick="jrLoanOut('${p.id}',${x.ti})">${ui.confirm==='jl'+p.id+x.ti?'Potwierdź':'Wypożycz'}</button></div>`).join('')}</div>`;};}
{const _lo2=loanOut;loanOut=function(pid){const r=_lo2.apply(this,arguments);try{const p=PLAYERS[pid]&&PLAYERS[pid].p;if(p&&p.loan&&p.loan.from===SAVE.team&&p.loan.r0==null){const ps0=(S().ps||{})[p.id];Object.assign(p.loan,{r0:rating(p),st:{m:0,gs:0},pm:ps0?ps0.m:0,prs:ps0?ps0.rs||0:0,prn:ps0?ps0.rn||0:0});}}catch(e){console.error(e);}return r;};}
{const _lr=loansReturn;loansReturn=function(){const back=W().players.filter(p=>p.loan&&p.loan.jr&&p.loan.from===SAVE.team);const r=_lr.apply(this,arguments);
  for(const p of back)if(p.tm===SAVE.team){p.jr=true;p.wage=0;}if(back.length)syncTeams();return r;};}
// mecze wypożyczonych: w naszej lidze — prawdziwe statystyki; w innych — gra, gdy jest w składzie klubu (szacunek oceny)
{const _rt=roundTick;roundTick=function(kind){const pre=new Set(ROUND_PLAYED);const r=_rt.apply(this,arguments);try{if((kind==='liga'||kind==='po')&&SAVE.team!=null){
  for(const p of myLoansOut()){const L=p.loan;if(L.r0==null)L.r0=rating(p);const st=L.st||(L.st={m:0,gs:0});const t=TEAMS[p.tm];if(!t||p.inj)continue;
    let played=false,g=null;const ps=(S().ps||{})[p.id];
    if(lgOf(p.tm)===myLg()){const m=ps?ps.m:0;if(L.pm==null){L.pm=m;L.prs=ps?ps.rs||0:0;L.prn=ps?ps.rn||0:0;continue;}
      if(m>L.pm){played=true;const dn=(ps.rn||0)-L.prn;if(dn>0)g=((ps.rs||0)-L.prs)/dn;L.pm=m;L.prs=ps.rs||0;L.prn=ps.rn||0;}}
    else played=pre.has(p.id)||isStarter(p)||R()<0.35;
    if(!played)continue;if(g==null)g=6.3+(rating(p)-teamStrength(t))/12+(R()-0.5)*1.3;
    st.m++;st.gs+=Math.max(4.5,Math.min(9.3,g));develop(p,'bal',1,true,clubMods(SAVE.team),!!L.jr,1.1);}}}catch(e){console.error(e);}return r;};}
// co miesiąc: wykres postępów + raport o wypożyczonych od trenera juniorów
// treningi w akademiach (wcześniej juniorzy rozwijali się tylko po meczach i praktycznie stali w miejscu)
function yTrainMonth(d){const m=+d.slice(5,7);if(m===7)return;const MD={};for(const p of W().players){if(!p.jr||p.tm<0||p.inj)continue;const md=MD[p.tm]||(MD[p.tm]=clubMods(p.tm));for(let i=0;i<4;i++)develop(p,'bal',1,false,md,true,1.6);}}
{const _mn=monthly;monthly=function(d){const r=_mn.apply(this,arguments);try{if(SAVE.team!=null&&SAVE.world){yTrainMonth(d);ySnap();const out=myLoansOut();const m=+d.slice(5,7);
  if(out.length&&(m>=10||m<=4)){const sk=SAVE.staff.jr;const from=sk?`${sk.first} ${sk.last} (trener juniorów)`:'Akademia klubu';
    const txt=out.map(p=>{const R0=yLoanRep(p);return `${p.first} ${p.last} (${TEAMS[p.tm].name}): ${R0.m} meczów${R0.g!=null?', średnia ocena '+R0.g.toFixed(2).replace('.',','):''}. ${R0.rep}`;}).join('\n');
    sendMail({cat:'klub',from,t:'Raport z wypożyczeń',s:`${out.length} zawodników na wypożyczeniu`,b:{type:'text',txt}});}}}catch(e){console.error(e);}return r;};}
// --- główny widok ---
juniorsView=function(){const tab=ui.jrTab||'o';const T=[['o','Widok ogólny'],['j','Widok ogólny: Juniorzy'],['w','Wypożyczenia']];
  let body='';try{body=tab==='j'?yList():tab==='w'?yLoans():yOverview();}catch(e){console.error(e);body=`<div class="card bad">Błąd widoku juniorów: ${esc(String(e))}</div>`;}
  return `${ui.tmsg?`<div class="card tmsg ${ui.tmsg.ok?'ok':'no'}">${esc(ui.tmsg.t)}</div>`:''}<div class="subtabs">${T.map(([k,l])=>`<button class="${k===tab?'on':''}" onclick="ui.jrTab='${k}';ui.confirm=null;render()">${l}</button>`).join('')}</div>${body}`;};
