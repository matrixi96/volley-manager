// ================= FINANSE: historia, wykresy, zakładki, kredyt, licencja, prognoza =================
// SAVE.fin.hist=[{m:'2026-09',bal,in:{kat:kw},out:{kat:kw}}] (zamknięte miesiące); SAVE.fin.cur — bieżący miesiąc; SAVE.fin.loan — kredyt bankowy
const MON_S=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
function monKey(d){return (d||SAVE._now||today()).slice(0,7);}
function monLab(k){const [y,m]=k.split('-');return MON_S[+m-1]+' '+y.slice(2);}
function finCur(){const f=SAVE.fin;const k=monKey();if(!f.cur)f.cur={m:k,b0:f.bal,in:{},out:{}};if(k>f.cur.m)finRoll();return f.cur;}
function finRoll(){const f=SAVE.fin;if(!f||!f.cur)return;const k=monKey();if(k<=f.cur.m)return;f.hist=f.hist||[];f.hist.push({m:f.cur.m,bal:Math.round(f.bal),in:f.cur.in,out:f.cur.out});f.hist=f.hist.slice(-120);f.cur={m:k,b0:f.bal,in:{},out:{}};}
{const _mo=money;money=function(amt,cat){if(SAVE.fin&&SAVE.team!=null&&typeof today==='function'&&SAVE.date){try{const c=finCur();const o=amt>=0?c.in:c.out;o[cat]=Math.round((o[cat]||0)+Math.abs(amt));}catch(e){}}return _mo.apply(this,arguments);};}
// ---- status finansowy ----
function finStatus(){const f=SAVE.fin;const w=Math.max(1,wageBill());const r=f.bal/w;const L=f.loan?f.loan.left:0;const net=f.bal-L;
  if(f.bal<-500000)return ['Zadłużony','bad'];if(f.bal<0)return ['Niepewny','bad'];if(net/w>1.5)return ['Bogaty','good'];if(net/w>0.75)return ['Zamożny','good'];if(net/w>0.25)return ['Stabilny',''];return ['Ostrożny','warn'];}
// ---- wykresy SVG ----
function svgArea(pts,col,h){h=h||150;const W=760,P=46;if(pts.length<2)return '<p class="mut small">Za mało danych — wykres pojawi się po pierwszych miesiącach (historia zbiera się od tej wersji gry).</p>';
  const ys=pts.map(p=>p.y);let mn=Math.min(0,...ys),mx=Math.max(...ys);if(mx===mn)mx=mn+1;const X=i=>P+i*(W-P-8)/(pts.length-1),Y=v=>8+(h-30)*(1-(v-mn)/(mx-mn));
  const line=pts.map((p,i)=>`${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');const zero=Y(0);
  const step=Math.max(1,Math.ceil(pts.length/8));const lab=pts.map((p,i)=>i%step===0||i===pts.length-1?`<text x="${X(i)}" y="${h-4}" font-size="10" fill="#8a93a6" text-anchor="middle">${p.x}</text>`:'').join('');
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:auto"><text x="0" y="14" font-size="10" fill="#8a93a6">${fmt(mx)}</text><text x="0" y="${h-26}" font-size="10" fill="#8a93a6">${fmt(mn)}</text>
   <line x1="${P}" x2="${W}" y1="${zero}" y2="${zero}" stroke="#ffffff22"/><polygon points="${X(0)},${zero} ${line} ${X(pts.length-1)},${zero}" fill="${col}" opacity=".55"/><polyline points="${line}" fill="none" stroke="${col}" stroke-width="2"/>${lab}</svg>`;}
function svgBars(pts,h){h=h||140;const W=760,P=46;if(!pts.length)return '<p class="mut small">Brak danych.</p>';const ys=pts.map(p=>p.y);const mx=Math.max(1,...ys.map(Math.abs));const bw=(W-P-8)/pts.length;const z=8+(h-30)/2;
  const step=Math.max(1,Math.ceil(pts.length/8));
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:auto"><text x="0" y="14" font-size="10" fill="#8a93a6">${fmt(mx)}</text><text x="0" y="${h-26}" font-size="10" fill="#8a93a6">−${fmt(mx)}</text><line x1="${P}" x2="${W}" y1="${z}" y2="${z}" stroke="#ffffff22"/>
   ${pts.map((p,i)=>{const hh=Math.abs(p.y)/mx*((h-30)/2);return `<rect x="${(P+i*bw+bw*0.15).toFixed(1)}" y="${(p.y>=0?z-hh:z).toFixed(1)}" width="${(bw*0.7).toFixed(1)}" height="${Math.max(0.5,hh).toFixed(1)}" fill="${p.y>=0?'#22c55e':'#ef4444'}"><title>${p.x}: ${fmt(p.y)}</title></rect>${i%step===0||i===pts.length-1?`<text x="${(P+i*bw+bw/2).toFixed(1)}" y="${h-4}" font-size="10" fill="#8a93a6" text-anchor="middle">${p.x}</text>`:''}`;}).join('')}</svg>`;}
function finMonths(){const f=SAVE.fin;finCur();const H=(f.hist||[]).slice();H.push({m:f.cur.m,bal:Math.round(f.bal),in:f.cur.in,out:f.cur.out,cur:1});return H;}
const sumO=o=>Object.values(o||{}).reduce((a,b)=>a+b,0);
// ---- prognoza ----
function finProj(){const pay=payroll(),sp=sponsorAmt();const stp=staffPay(),mnt=maintenance()*12,shp=shopIncome(myInfra().sklep)*12;const md=matchday(1,null,null,true);const kh=ECO().karS&&ECO().karS.season===S().n?ECO().karS.inc:0;const lo=SAVE.fin.loan?SAVE.fin.loan.mo*12:0;
  return {inc:sp+tvRound()*nRounds()+md.tot*Math.ceil(nRounds()/2)+shp+kh,exp:pay+stp+mnt+lo,pay,stp,mnt,lo};}
function monthsLeftSeason(){const s=S();const end=`${seasonYear(s.n)+1}-06-30`;const d=today();if(d>end)return 0;const [y1,m1]=d.split('-').map(Number),[y2,m2]=end.split('-').map(Number);return Math.max(0,(y2-y1)*12+(m2-m1)+1);}
// ---- kredyt bankowy ----
function loanRate(mo){const st=finStatus()[0];return 0.055+(st==='Ostrożny'?0.01:st==='Niepewny'?0.02:st==='Zadłużony'?0.035:0)+(mo>=48?0.01:mo>=36?0.005:0);}
function loanMax(){try{return Math.max(300000,Math.round(revForecast()*0.4/100000)*100000);}catch(e){return 1000000;}}
function annuity(P,r,n){const i=r/12;return Math.round(P*i/(1-Math.pow(1+i,-n)));}
function loanTake(){const f=SAVE.fin;if(f.loan)return;const amt=+(ui.lnA||loanMax()/2),mo=+(ui.lnM||36);if(!(amt>0))return;
  if(bConf()<35&&!SAVE.ownClub){ui.lnMsg={ok:0,t:'Zarząd nie zgodził się na kredyt — za małe zaufanie do Twojej pracy (potrzeba co najmniej 35/100).'};render();return;}
  if(finStatus()[0]==='Zadłużony'){ui.lnMsg={ok:0,t:'Bank odmówił: klub jest zbyt zadłużony.'};render();return;}
  const r=loanRate(mo);f.loan={p:amt,left:amt,r,n:mo,mo:annuity(amt,r,mo),d:today()};money(amt,'Kredyt');finLog(`Kredyt bankowy: ${fmt(amt)} na ${mo} mies. (${(r*100).toFixed(1).replace('.',',')}%)`,amt);
  if(ui.lnT){const b=BUD();if(b)b.trAdd=(b.trAdd||0)+Math.round(amt*0.8);}
  news(`🏦 Klub wziął kredyt: ${fmt(amt)} na ${mo} miesięcy, rata ${fmt(f.loan.mo)}/mies.`);ui.lnMsg={ok:1,t:`Kredyt przyznany. Rata: ${fmt(f.loan.mo)} miesięcznie przez ${mo} miesięcy.`};save();render();}
function loanRepay(){const f=SAVE.fin;const L=f.loan;if(!L)return;const c=Math.round(L.left*1.02);if(ui.confirm!=='lnr'){ui.confirm='lnr';render();return;}ui.confirm=null;
  money(-c,'Kredyt');finLog('Wcześniejsza spłata kredytu (z prowizją 2%)',-c);f.loan=null;news(`🏦 Kredyt spłacony przed terminem (${fmt(c)}).`);save();render();}
function loanMonthly(){const f=SAVE.fin;const L=f.loan;if(!L)return;const int=L.left*L.r/12;const pay=Math.min(L.mo,Math.round(L.left+int));money(-pay,'Kredyt');finLog('Rata kredytu',-pay);
  L.left=Math.max(0,Math.round(L.left+int-pay));L.n--;if(L.n<=0||L.left<=0){f.loan=null;news('🏦 Kredyt bankowy został w całości spłacony.');}}
// ---- licencja ligowa ----
function halaNeed(l){return [0,3,5,7].includes(l)?2:1;}
function finLic(){const f=SAVE.fin;const it=[];const b=BUD();
  it.push(f.bal>=0?[2,`Saldo dodatnie (${fmt(f.bal)})`]:f.bal>=-1000000?[1,`Saldo ujemne (${fmt(f.bal)}) — do startu sezonu trzeba wyjść ponad −1 mln zł`]:[0,`Dług ${fmt(f.bal)} — przekroczony limit −1 mln zł`]);
  const hn=halaNeed(myLg()),hl=myInfra().hala;it.push(hl>=hn?[2,`Hala spełnia wymogi ligi (poziom ${hl}, wymagany ${hn})`]:[1,`Hala za mała dla tej ligi (poziom ${hl}, wymagany ${hn}) — rozbuduj ją w Infrastrukturze`]);
  if(b){const r=wageBill()/Math.max(1,b.wg);it.push(r<=1.1?[2,'Pensje w granicach budżetu płacowego']:r<=1.3?[1,`Pensje przekraczają budżet o ${Math.round((r-1)*100)}%`]:[0,`Pensje przekraczają budżet o ${Math.round((r-1)*100)}% — ryzyko zaległości`]);}
  if(f.loan)it.push(f.bal>-500000?[2,'Raty kredytu spłacane terminowo']:[1,'Raty kredytu przy ujemnym saldzie — bank się niepokoi']);
  const lv=Math.min(...it.map(x=>x[0]));return {it,lv};}
function licCheckSeason(){if(SAVE.ownClub&&false)return;const L=finLic();if(L.lv>0)return;const fine=round5k(250000*(LG_ECO[myLg()]||0.5));money(-fine,'Kary');finLog('Kara za brak spełnienia wymogów licencyjnych',-fine);if(SAVE.board)SAVE.board.conf=Math.max(0,SAVE.board.conf-10);
  const b=BUD();if(b){b.extra=(b.extra||0)-Math.max(0,budLeft().tr);}
  news(`⚖️ Komisja licencyjna ukarała klub: ${fmt(fine)} kary i blokada transferów do końca okna (wymogi licencji niespełnione).`);
  if(typeof sendMail==='function')sendMail({cat:'fin',from:'Komisja licencyjna ligi',t:'Kara za niespełnienie wymogów licencji',s:`Kara ${fmt(fine)} i blokada budżetu transferowego.`,b:{type:'text',x:'Niespełnione wymogi:\n• '+L.it.filter(x=>x[0]===0).map(x=>x[1]).join('\n• ')},lab:'Finanse'});}
{const _ss=startSeasonFromOff;startSeasonFromOff=function(){const ph=S()&&S().phase;const r=_ss.apply(this,arguments);try{if(ph==='off'&&S().phase!=='off')licCheckSeason();}catch(e){console.error(e);}return r;};}
// rata kredytu, zamknięcie miesiąca w historii, ostrzeżenie licencyjne — 1. dnia miesiąca
{const _mn=monthly;monthly=function(d){try{finRoll();}catch(e){}const r=_mn.apply(this,arguments);try{loanMonthly();const L=finLic();const f=SAVE.fin;
  if(L.lv<2&&(!f.licW||daysBetween(f.licW,d)>=58)){f.licW=d;sendMail({cat:'fin',from:'Komisja licencyjna ligi',t:L.lv===0?'Licencja zagrożona!':'Uwaga na wymogi licencyjne',s:L.it.filter(x=>x[0]<2).map(x=>x[1]).join(' · ').slice(0,120),
    b:{type:'text',x:`Stan licencji na kolejny sezon:\n\n${L.it.map(x=>(x[0]===2?'✓ ':x[0]===1?'⚠ ':'✗ ')+x[1]).join('\n')}\n\nJeśli przy starcie sezonu któryś wymóg będzie czerwony, komisja nałoży karę finansową i zablokuje transfery.`},lab:'Finanse'});}}catch(e){console.error(e);}return r;};}
// ================= WIDOK =================
const FIN_TABS=[['sum','Podsumowanie'],['inc','Przychody'],['exp','Wydatki'],['wag','Płace'],['loan','Zadłużenie i kredyt'],['prog','Prognoza'],['lic','Licencja']];
function finHead(){const st=finStatus();return `<div class="card"><div class="row wrap" style="gap:12px;align-items:center"><h2 style="margin:0">Stan finansów</h2><span class="small mut">Status finansowy: <b class="${st[1]}">${st[0]}</b></span><span class="sp"></span>
  <div class="seg">${FIN_TABS.map(([k,l])=>`<button class="${(ui.finTab||'sum')===k?'on':''}" onclick="ui.finTab='${k}';render()">${l}</button>`).join('')}</div></div></div>`;}
function finSum(){const f=SAVE.fin;const H=finMonths();const c=H[H.length-1];const inc=sumO(c.in),out=sumO(c.out);const sea=Object.values(f.sea||{}).reduce((a,b)=>a+b,0);const prev=f.prev?Object.values(f.prev).reduce((a,b)=>a+b,0):null;
  const top=(o,n)=>Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).slice(0,n||6).map(([k,v])=>`<div class="res row small"><span>${esc(k)}</span><span class="sp"></span><b>${fmt(v)}</b></div>`).join('')||'<p class="mut small">Brak w tym miesiącu.</p>';
  const L=finLic();
  return `<div class="card"><div class="small mut">BILANS OGÓŁEM</div><div class="big ${f.bal<0?'bad':''}">${fmtFull(f.bal)}</div>${svgArea(H.map(h=>({x:monLab(h.m),y:h.bal})),'#ec4899')}</div>
  <div class="card"><div class="row wrap" style="gap:30px"><div><div class="small mut">ZYSK / STRATA W BIEŻĄCYM MIESIĄCU</div><div class="big ${inc-out<0?'bad':'good'}" style="font-size:22px">${inc-out>=0?'+':''}${fmt(inc-out)}</div></div>
   <div><div class="small mut">BIEŻĄCY SEZON</div><b class="${sea<0?'bad':'good'}" style="font-size:18px">${sea>=0?'+':''}${fmt(sea)}</b></div>${prev!=null?`<div><div class="small mut">POPRZEDNI SEZON</div><b class="${prev<0?'bad':'good'}" style="font-size:18px">${prev>=0?'+':''}${fmt(prev)}</b></div>`:''}</div>
   ${svgBars(H.map(h=>({x:monLab(h.m),y:sumO(h.in)-sumO(h.out)})))}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px"><div class="card"><div class="small mut">PRZYCHODY W TYM MIESIĄCU</div><b class="good" style="font-size:20px">${fmt(inc)}</b>${top(c.in)}</div>
   <div class="card"><div class="small mut">WYDATKI W TYM MIESIĄCU</div><b class="bad" style="font-size:20px">${fmt(out)}</b>${top(c.out)}</div></div>
  <div class="lic ${L.lv===2?'ok':L.lv===1?'warn':'bad'}" style="padding:12px 16px;border-radius:8px;margin:12px 0;background:${L.lv===2?'#16a34a':L.lv===1?'#ca8a04':'#b91c1c'};color:#fff"><b>Licencja na sezon ${sLabel(S().n+(S().phase==='off'?0:1))}</b><div class="small">${L.lv===2?'✓ Klub spełnia wszystkie wymogi licencyjne.':L.lv===1?'⚠ Część wymogów zagrożona — sprawdź zakładkę Licencja.':'✗ Klub nie spełnia wymogów licencji — grozi kara i blokada transferów.'}</div></div>`;}
function finCatTab(kind){const H=finMonths();const key=kind==='inc'?'in':'out';const cats={};for(const h of H)for(const k in h[key])cats[k]=(cats[k]||0)+h[key][k];
  const sel=ui.finCat&&cats[ui.finCat]!=null?ui.finCat:null;const f=SAVE.fin;
  const seaOf=(o,k)=>o&&o[k]!=null?(kind==='inc'?Math.max(0,o[k]):Math.max(0,-o[k])):0;
  const ks=Object.keys(cats).sort((a,b)=>cats[b]-cats[a]);
  return `<div class="card"><h2>${kind==='inc'?'Przychody':'Wydatki'} miesiąc po miesiącu${sel?` — ${esc(sel)}`:''}</h2>${svgArea(H.map(h=>({x:monLab(h.m),y:sel?(h[key][sel]||0):sumO(h[key])})),kind==='inc'?'#94a3b8':'#65a30d',140)}
   <div class="tw"><table><thead><tr><th class="l">Kategoria</th><th>Ten miesiąc</th><th>Bieżący sezon</th><th>Poprzedni sezon</th><th>Od początku historii</th></tr></thead><tbody>
   ${ks.map(k=>`<tr class="clickrow" onclick="ui.finCat=${sel===k?'null':`'${k}'`};render()"><td class="l">${sel===k?'▶ ':''}${esc(k)}</td><td>${fmt(H[H.length-1][key][k]||0)}</td><td>${fmt(seaOf(f.sea,k))}</td><td>${f.prev?fmt(seaOf(f.prev,k)):'—'}</td><td>${fmt(cats[k])}</td></tr>`).join('')||'<tr><td class="l mut" colspan="5">Brak danych — historia zbiera się od tej wersji gry.</td></tr>'}</tbody></table></div>
   <p class="small mut">Kliknij kategorię, żeby zobaczyć jej wykres.</p></div>
   <div class="card"><h2>Historia operacji</h2>${f.log.filter(x=>kind==='inc'?x.a>0:x.a<0).slice(0,25).map(x=>`<div class="res row"><span class="mut small">${x.d?fmtDMY(x.d):''}</span> ${esc(x.t)}<span class="sp"></span><b class="${x.a<0?'bad':'good'}">${x.a>=0?'+':''}${fmt(x.a)}</b></div>`).join('')||'<p class="mut">Brak operacji.</p>'}</div>`;}
function finWag(){const t=myTeam();const b=BUD();const ps=t.players.filter(p=>p.wage).slice().sort((a,c)=>c.wage-a.wage);const st=Object.values(SAVE.staff||{}).filter(Boolean).concat(SAVE.scouts||[]).sort((a,c)=>c.wage-a.wage);
  const tot=wageBill();const pos={};for(const p of ps)pos[p.pos]=(pos[p.pos]||0)+p.wage;const mx=Math.max(1,...Object.values(pos));
  return `<div class="card"><div class="row wrap" style="gap:30px"><div><div class="small mut">BUDŻET PŁAC</div><b style="font-size:20px">${b?fmt(b.wg):'—'}</b><small class="mut"> / rok</small></div><div><div class="small mut">OBECNE WYDATKI</div><b style="font-size:20px" class="${b&&tot>b.wg?'bad':''}">${fmt(tot)}</b><small class="mut"> (${fmt(tot/12)}/mies.)</small></div>
   <div><div class="small mut">ZAWODNICY / SZTAB</div><b>${fmt(payroll())}</b> / <b>${fmt(staffPay())}</b> <small class="mut">(${Math.round(staffPay()/Math.max(1,tot)*100)}% na sztab)</small></div></div>
   <h3>Płace według pozycji</h3>${['R','A','P','S','L'].map(k=>`<div class="row small" style="gap:8px;align-items:center;margin:3px 0"><span style="width:110px">${POS_NAMES[k]}</span><span class="trld" style="width:300px"><i style="width:${(pos[k]||0)/mx*100}%;background:#3b82f6"></i></span><b>${fmt(pos[k]||0)}</b></div>`).join('')}</div>
  <div class="card"><h2>Zawodnicy</h2><div class="tw"><table><thead><tr><th class="l">Zawodnik</th><th>Wiek</th><th>Ocena</th><th>Pensja / rok</th><th>Udział</th><th>Kontrakt do</th></tr></thead><tbody>
   ${ps.map(p=>`<tr><td class="l"><button class="link pn" onclick="openCard('${p.id}')">${esc(p.first[0])}. <b>${esc(p.last)}</b></button> <small class="mut">${pTag(p.pos)}</small></td><td>${p.age}</td><td>${rating(p)}</td><td>${fmt(p.wage)}</td><td>${Math.round(p.wage/Math.max(1,tot)*100)}%</td><td>${p.ce!=null?ceDate(p.ce):'—'}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Sztab</h2>${st.map(s=>`<div class="res row small"><span>${esc(s.first)} ${esc(s.last)} <span class="mut">· ${ROLE_N[s.role]||'skaut'} · ${s.skill}/20</span></span><span class="sp"></span><b>${fmt(s.wage)}</b></div>`).join('')||'<p class="mut">Brak sztabu.</p>'}</div>`;}
function finLoan(){const f=SAVE.fin;const L=f.loan;const mx=loanMax();const A=+(ui.lnA||Math.round(mx/2/100000)*100000),M=+(ui.lnM||36);const r=loanRate(M);
  return `<div class="card"><h2>Zadłużenie i kredyt</h2><p class="small">Saldo: <b class="${f.bal<0?'bad':''}">${fmt(f.bal)}</b>. Dopuszczalny debet to 500 tys. zł — poniżej zarząd blokuje zakupy, a poniżej −1 mln zł grozi kara licencyjna.</p>
   ${L?`<div class="card"><b>Kredyt bankowy</b><div class="small">Pozostało do spłaty: <b>${fmt(L.left)}</b> · rata <b>${fmt(L.mo)}</b>/mies. · zostało ${L.n} rat · oprocentowanie ${(L.r*100).toFixed(1).replace('.',',')}% · wzięty ${fmtDMY(L.d)}</div>
     <div class="trld" style="width:100%;margin:8px 0"><i style="width:${Math.round((1-L.left/L.p)*100)}%;background:#22c55e"></i></div>
     <button class="ghost" onclick="loanRepay()">${ui.confirm==='lnr'?`Na pewno? Zapłacisz ${fmt(Math.round(L.left*1.02))}`:'Spłać przed terminem (prowizja 2%)'}</button></div>`
   :`<h3>Weź kredyt</h3><p class="small mut">Bank pożycza do ${fmt(mx)} (ok. 40% rocznych przychodów). Kredyt wymaga zgody zarządu (zaufanie co najmniej 35/100)${SAVE.ownClub?' — jako właściciel decydujesz sam':''}. Rata jest pobierana 1. dnia każdego miesiąca.</p>
     <div class="row wrap" style="gap:10px;align-items:center"><label>Kwota <select onchange="ui.lnA=+this.value;render()">${[0.25,0.5,0.75,1].map(k=>{const v=Math.max(100000,Math.round(mx*k/100000)*100000);return `<option value="${v}" ${A===v?'selected':''}>${fmt(v)}</option>`;}).join('')}</select></label>
     <label>Okres <select onchange="ui.lnM=+this.value;render()">${[24,36,48].map(m=>`<option value="${m}" ${M===m?'selected':''}>${m} mies.</option>`).join('')}</select></label>
     <label class="row" style="gap:4px"><input type="checkbox" ${ui.lnT?'checked':''} onchange="ui.lnT=this.checked;render()"> 80% na budżet transferowy</label></div>
     <p class="small">Oprocentowanie <b>${(r*100).toFixed(1).replace('.',',')}%</b> · rata <b>${fmt(annuity(A,r,M))}</b>/mies. · łącznie oddasz <b>${fmt(annuity(A,r,M)*M)}</b></p>
     <button class="btn" onclick="loanTake()">Weź kredyt</button>`}
   ${ui.lnMsg?`<p class="small ${ui.lnMsg.ok?'good':'bad'}">${esc(ui.lnMsg.t)}</p>`:''}</div>`;}
function finProg(){const P=finProj();const f=SAVE.fin;const ml=monthsLeftSeason();const net=(P.inc-P.exp)/12;const s=S();
  const end1=f.bal+net*ml;const exp=myTeam().players.filter(p=>p.ce!=null&&p.ce<=s.n).reduce((a,p)=>a+p.wage,0);const net2=(P.inc-(P.exp-exp))/12;const end2=end1+net2*12,end3=end2+net2*12;
  const pts=[{x:'teraz',y:f.bal},{x:'koniec '+sLabel(s.n),y:end1},{x:'koniec '+sLabel(s.n+1),y:end2},{x:'koniec '+sLabel(s.n+2),y:end3}];
  return `<div class="card"><h2>Prognoza</h2><p class="small mut">Szacunek przy obecnych kontraktach, sponsorach i frekwencji — bez transferów, nagród i premii za wyniki.</p>${svgArea(pts,'#38bdf8',160)}
   <table class="cmp"><tbody><tr><td class="l">Przychody (rocznie)</td><td class="good">+${fmt(P.inc)}</td></tr><tr><td class="l">Pensje zawodników</td><td class="bad">−${fmt(P.pay)}</td></tr><tr><td class="l">Pensje sztabu</td><td class="bad">−${fmt(P.stp)}</td></tr><tr><td class="l">Utrzymanie obiektów</td><td class="bad">−${fmt(P.mnt)}</td></tr>${P.lo?`<tr><td class="l">Raty kredytu</td><td class="bad">−${fmt(P.lo)}</td></tr>`:''}
   <tr><td class="l"><b>Saldo na koniec sezonu ${sLabel(s.n)} (za ${ml} mies.)</b></td><td class="${end1<0?'bad':'good'}"><b>${fmt(end1)}</b></td></tr>
   <tr><td class="l">Saldo za rok${exp?` (po odejściu zawodników z kończącymi się kontraktami: −${fmt(exp)} pensji)`:''}</td><td class="${end2<0?'bad':''}">${fmt(end2)}</td></tr><tr><td class="l">Saldo za 2 lata</td><td class="${end3<0?'bad':''}">${fmt(end3)}</td></tr></tbody></table></div>`;}
function finLicTab(){const L=finLic();return `<div class="card"><h2>Licencja ligowa</h2><p class="small mut">Przed startem każdego sezonu komisja licencyjna sprawdza klub. Czerwony wymóg przy starcie sezonu = kara finansowa, blokada transferów do końca okna i spadek zaufania zarządu. Żółty = ostrzeżenie.</p>
  ${L.it.map(x=>`<div class="res row" style="gap:8px"><b class="${x[0]===2?'good':x[0]===1?'':'bad'}">${x[0]===2?'✓':x[0]===1?'⚠':'✗'}</b> ${esc(x[1])}</div>`).join('')}</div>`;}
{const _fv=financeView;financeView=function(){const tab=ui.finTab||'sum';const body=tab==='sum'?finSum()+_fv.apply(this,arguments).replace(/<div class="card fin">[\s\S]*?<\/div><\/div>/,''):tab==='inc'?finCatTab('inc'):tab==='exp'?finCatTab('exp'):tab==='wag'?finWag():tab==='loan'?finLoan():tab==='prog'?finProg():finLicTab();return finHead()+body;};}
