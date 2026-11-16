// ===== Budżety klubu: transferowy, płacowy, operacyjny + dyrektor finansowy =====
// Budżet ustalany na sezon z prognozy przychodów. Dyrektor finansowy dzieli pieniądze, dokładniej prognozuje i pilnuje wydatków.
const BUD_DEF={wg:0.64,op:0.2,tr:0.16};
function finSk(){return SAVE.staff&&SAVE.staff.fin?SAVE.staff.fin.skill:0;}
function finName(){const s=SAVE.staff&&SAVE.staff.fin;return s?`${s.first} ${s.last}`:null;}
// prognoza rocznych przychodów (sponsorzy, TV, dzień meczowy, sklep, karnety)
// sponsorzy: podpisane umowy albo (gdy są wolne miejsca) typowa wartość ofert, które klub może podpisać
function spPotential(){try{const sl=spSlots();const q=spQuality();let t=0;for(const [k,,sh] of SP_CAT){const act=SPN().act.filter(c=>c.cat===k);const sig=act.reduce((a,c)=>a+c.m,0);const free=Math.max(0,sl[k]-act.length);t+=sig+free*SP_BASE*sh*q*LG_ECO[myLg()]*0.85;}return t*12;}catch(e){return sponsorAmt();}}
function revForecast(){try{const md=matchday(1,null,null,true);const kh=ECO().karS&&ECO().karS.season===S().n?ECO().karS.inc:0;
  return Math.max(sponsorAmt(),spPotential())+tvRound()*nRounds()+md.tot*Math.ceil(nRounds()/2)+shopIncome(myInfra().sklep)*12+kh;}catch(e){return 3000000;}}
// bez dyrektora zarząd planuje ostrożnie (85% prognozy); dobry dyrektor do 100%
function budAcc(){const fs=finSk();return fs?0.9+fs/20*0.1:0.85;}
function budSplit(){return Object.assign({},BUD_DEF,SAVE.budSplit||{});}
function budPlan(){const s=S();const rev=revForecast()*budAcc();const reserve=Math.max(0,(SAVE.fin?SAVE.fin.bal:0)-300000);const pool=rev+reserve*0.6;const sp=budSplit();
  const old=SAVE.bud&&SAVE.bud.n===s.n?SAVE.bud:null;
  const bs=budSplitAmt(pool,sp,reserve);
  SAVE.bud={n:s.n,pool:round5k(pool),res:reserve,wg:bs.wg,op:bs.op,tr:bs.tr,trUsed:old?old.trUsed:0,opUsed:old?old.opUsed:0,trAdd:old?old.trAdd:0,extra:old?old.extra:0,warn:{}};
  return SAVE.bud;}
function BUD(){if(SAVE.team==null||!S())return null;if(SAVE.staffPool)for(const rl of ['fin','soc'])if(!SAVE.staffPool.some(x=>x.role===rl))for(let i=0;i<3;i++){const s=genStaff(rl,5+R()*14);s.wage=staffWage(s.skill);SAVE.staffPool.push(s);}if(!SAVE.bud||SAVE.bud.n!==S().n){const had=!!SAVE.bud;budPlan();if(had)budSeasonMail(true);}return SAVE.bud;}
function wageBill(){return payroll()+staffPay();}
function budLeft(){const b=BUD();if(!b)return {tr:0,wg:0,op:0};return {tr:b.tr+(b.trAdd||0)+(b.extra||0)-b.trUsed,wg:b.wg-wageBill(),op:b.op-b.opUsed-maintenance()*12};}
// księgowanie: money() przekazuje tu każdy ruch
function budBook(amt,cat){const b=SAVE.team!=null&&S()?BUD():null;if(!b)return;
  if(cat==='Transfery'||cat==='Odprawy'){if(amt<0)b.trUsed+=-amt;else b.trAdd=(b.trAdd||0)+amt*0.5;}// połowa wpływów ze sprzedaży wraca do budżetu transferowego
  if(cat==='Infrastruktura'||cat==='Obóz'||cat==='Marketing')if(amt<0)b.opUsed+=-amt;}
// opis wpływu decyzji na budżety: d={tr,wg,op} (wydatek dodatni)
function budImpact(d,note){const b=BUD();if(!b)return '';const L=budLeft();const rows=[];
  const one=(k,lab,tot,used,dv)=>{const after=used+dv;const left=tot-after;const pct=Math.min(130,Math.round(after/Math.max(1,tot)*100));
    rows.push(`<div class="bimp ${left<0?'over':pct>90?'warn':''}"><span>${lab}</span><span class="bbar"><i style="width:${Math.min(100,pct)}%"></i></span><b>${fmt(used)} → ${fmt(after)}</b><small>${left<0?`przekroczony o ${fmt(-left)}`:`zostaje ${fmt(left)}`}</small></div>`);};
  if(d.tr)one('tr','Budżet transferowy',b.tr+(b.trAdd||0)+(b.extra||0),b.trUsed,d.tr);
  if(d.wg)one('wg','Budżet płacowy (rocznie)',b.wg,wageBill(),d.wg);
  if(d.op)one('op','Budżet operacyjny',b.op,b.opUsed+maintenance()*12,d.op);
  if(!rows.length&&!note)return '';
  return `<div class="bimpw"><div class="bimph">💼 Wpływ na budżety${finName()?` <small class="mut">· ${esc(finName())}</small>`:''}</div>${rows.join('')}${note?`<div class="small mut">${note}</div>`:''}</div>`;}
// czy wydatek mieści się w budżecie; transfery i inwestycje są blokowane, pensje tylko ostrzegają
function budCan(kind,amt){const L=budLeft();if(kind==='tr'&&amt>L.tr)return `Brak środków w budżecie transferowym (zostało ${fmt(Math.max(0,L.tr))}). Możesz poprosić zarząd o dodatkowe pieniądze w Finanse → Budżety.`;
  if(kind==='op'&&amt>L.op)return `Brak środków w budżecie operacyjnym (zostało ${fmt(Math.max(0,L.op))}). Zmień podział budżetów w Finanse → Budżety.`;return null;}
function budWageOver(dw){const L=budLeft();if(dw>0&&dw>L.wg){if(SAVE.board){SAVE.board.conf=Math.max(0,SAVE.board.conf-3);}news(`💼 Pensje przekroczyły budżet płacowy o ${fmt(dw-Math.max(0,L.wg))} — zarząd jest niezadowolony.`);}}
// prośba do zarządu: +25% budżetu transferowego, raz na sezon, kosztem zaufania
function budAsk(){const b=BUD();if(!b||b.extra)return;const add=round5k(Math.max(150000,b.tr*0.25));if(SAVE.fin.bal-add<-500000)return tradeMsg(false,'Zarząd odmawia: klub nie ma pieniędzy na dodatkowe transfery.');
  b.extra=add;if(SAVE.board)SAVE.board.conf=Math.max(0,SAVE.board.conf-6);news(`🏦 Zarząd dołożył ${fmt(add)} do budżetu transferowego, ale oczekuje wyników.`);save();render();}
// zarząd nie planuje pensji poniżej obecnych zobowiązań ani utrzymania poniżej kosztów obiektów — reszta dzielona według proporcji
function budSplitAmt(pool,sp,res){const wb=wageBill(),mn=maintenance()*12;let wg=Math.max(pool*sp.wg,wb+Math.max(150000,wb*0.04));let op=Math.max(pool*sp.op,mn+50000);let tr=pool-wg-op;
  if(tr<pool*sp.tr){const rest=Math.max(0,pool-wg);const k=sp.op+sp.tr;op=Math.max(mn+50000,rest*sp.op/k);tr=Math.max(0,rest-op);}
  tr=Math.max(tr,(res||0)*0.25);// część oszczędności zawsze można przeznaczyć na transfery
  return {wg:round5k(wg),op:round5k(op),tr:round5k(Math.max(0,tr))};}
function budSetSplit(k,v){const sp=budSplit();v=clamp(+v/100,0.05,0.85);sp[k]=v;const rest=['wg','op','tr'].filter(x=>x!==k);const sum=rest.reduce((a,x)=>a+sp[x],0);const free=1-v;
  for(const x of rest)sp[x]=sum>0?sp[x]/sum*free:free/2;SAVE.budSplit=sp;const b=BUD();if(b){const bs=budSplitAmt(b.pool,sp,b.res);b.wg=bs.wg;b.op=bs.op;b.tr=bs.tr;}save();render();}
// raport dyrektora co miesiąc: ostrzega, gdy budżet się kończy
function budMonthly(){const b=BUD();if(!b)return;const L=budLeft();const fs=finSk();const msg=[];
  const chk=(k,lab,tot,left)=>{if(left<tot*0.1&&!b.warn[k]){b.warn[k]=1;msg.push(`${lab}: ${left<0?`przekroczony o ${fmt(-left)}`:`zostało tylko ${fmt(left)}`}.`);}};
  chk('tr','Budżet transferowy',b.tr+(b.trAdd||0)+(b.extra||0),L.tr);chk('wg','Budżet płacowy',b.wg,L.wg);chk('op','Budżet operacyjny',b.op,L.op);
  if(msg.length&&typeof sendMail==='function')sendMail({cat:'fin',from:fs?`${finName()} (dyrektor finansowy)`:'Zarząd klubu',t:'Budżety: uwaga',s:msg[0],b:{type:'text',x:msg.join(' ')}});}
function budSeasonMail(noRe){const b=noRe?SAVE.bud:budPlan();if(typeof sendMail!=='function')return;const fs=finSk();
  sendMail({cat:'fin',from:fs?`${finName()} (dyrektor finansowy)`:'Zarząd klubu',t:`Budżety na sezon: transfery ${fmtShort2(b.tr)}, pensje ${fmtShort2(b.wg)}`,
    s:'Plan finansowy na nowy sezon',b:{type:'text',x:`Prognoza przychodów ${fmt(round5k(revForecast()))}${fs?'':' (bez dyrektora finansowego zarząd liczy ostrożnie: 85% prognozy)'}. Transfery ${fmt(b.tr)}, pensje ${fmt(b.wg)} rocznie, funkcjonowanie klubu ${fmt(b.op)}. Podział zmienisz w Finanse → Budżety.`}});}
function fmtShort2(v){return v>=1e6?(Math.round(v/1e5)/10).toString().replace('.',',')+' mln zł':Math.round(v/1000)+' tys. zł';}
// widok Finanse → Budżety
function budgetCard(){const b=BUD();if(!b)return '';const L=budLeft();const sp=budSplit();const fs=finSk();
  const bar=(lab,tot,used,desc)=>{const pct=Math.round(used/Math.max(1,tot)*100);return `<div class="bud"><div class="row"><b>${lab}</b><span class="sp"></span><span class="${used>tot?'bad':''}">${fmt(used)} / ${fmt(tot)}</span></div><div class="bbar big"><i class="${pct>100?'over':pct>90?'warn':''}" style="width:${Math.min(100,pct)}%"></i></div><div class="small mut">${desc} · ${used>tot?`<span class="bad">przekroczony o ${fmt(used-tot)}</span>`:`zostaje ${fmt(tot-used)}`}</div></div>`;};
  const trTot=b.tr+(b.trAdd||0)+(b.extra||0);
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Budżety na sezon ${S().n}</h2><span class="sp"></span><span class="small mut">${fs?`Dyrektor finansowy: <b>${esc(finName())}</b> (${fs}/20) · planuje ${Math.round(budAcc()*100)}% prognozy`:'Brak dyrektora finansowego: zarząd planuje ostrożnie (85% prognozy). Zatrudnisz go w zakładce Sztab.'}</span></div>
   <div class="small mut" style="margin:4px 0 10px">Do podziału: <b>${fmt(b.pool)}</b> (prognoza przychodów + część oszczędności).</div>
   ${bar('Transferowy',trTot,b.trUsed,`odstępne i premie za podpis${b.trAdd?` · +${fmt(b.trAdd)} ze sprzedaży`:''}${b.extra?` · +${fmt(b.extra)} od zarządu`:''}`)}
   ${bar('Płacowy (rocznie)',b.wg,wageBill(),'pensje zawodników i sztabu')}
   ${bar('Operacyjny',b.op,b.opUsed+maintenance()*12,'utrzymanie obiektów, budowy, obóz')}
   <div class="budsp"><b>Podział budżetu</b>${[['wg','Pensje'],['tr','Transfery'],['op','Funkcjonowanie']].map(([k,l])=>`<label>${l} <b>${Math.round(sp[k]*100)}%</b><input type="range" min="5" max="85" value="${Math.round(sp[k]*100)}" onchange="budSetSplit('${k}',this.value)"></label>`).join('')}</div>
   <div class="row" style="gap:8px;margin-top:8px">${b.extra?'<span class="small mut">Zarząd dołożył już pieniądze w tym sezonie.</span>':`<button class="ghost sm" onclick="budAsk()">🏦 Poproś zarząd o +${fmt(round5k(Math.max(150000,b.tr*0.25)))} na transfery</button><span class="small mut">zaufanie zarządu −6</span>`}</div></div>`;}
// sponsor podpisany w trakcie sezonu: jego raty do końca sezonu (czerwiec) zasilają budżety według podziału
function spMonthsLeft(mo){const d=SAVE._now||today();const y=+d.slice(0,4),m=+d.slice(5,7);const end=m<=6?6-m:18-m;return Math.max(0,Math.min(mo,end+1));}
// budżet zakładał typową umowę na każdym wolnym miejscu; podpis zmienia budżety o różnicę między umową a tym założeniem
function spExp(cat){const c=SP_CAT.find(x=>x[0]===cat);return c?SP_BASE*c[2]*spQuality()*LG_ECO[myLg()]*0.85:0;}
function spBudDelta(cat,m,mo){return (m*spMonthsLeft(mo)-spExp(cat)*spMonthsLeft(12))*budAcc();}
function spBudAdd(m,mo,cat){const b=BUD();if(!b)return;const add=spBudDelta(cat,m,mo);const sp=budSplit();b.pool+=round5k(add);b.wg+=round5k(add*sp.wg);b.op+=round5k(add*sp.op);b.tr=Math.max(0,b.tr+round5k(add*sp.tr));}
function spBudTxt(m,mo,cat){const sp=budSplit();const add=spBudDelta(cat,m,mo);const sg=v=>(v>=0?'+':'−')+fmt(Math.abs(round5k(v)));
  return `<span class="${add>=0?'good':'bad'}">${sg(add)}</span> <span class="mut">względem planu</span><br><span class="mut">transfery ${sg(add*sp.tr)} · pensje ${sg(add*sp.wg)}</span>`;}
// ===== Kluby komputera: te same zasady — przychody, budżety (transferowy, płacowy, operacyjny), dyrektor finansowy, social media =====
const AI_REV_LG=[5200000,2400000,1150000,2900000,950000,6200000,2100000,5900000,1500000];
function aiStaffSk(ti,k){const a=SAVE.ai[ti];if(!a.st)a.st={};if(a.st[k]==null)a.st[k]=R()<0.25+a.rep/200?Math.round(clamp(aiStaff(ti)+(R()*6-3),3,18)):0;return a.st[k];}
function aiFol(ti){const a=SAVE.ai[ti];if(a.fol==null){const lm=SOC_LG_REF[lgOf(ti)]/25000;a.fol=Math.round((3000+a.rep*a.rep*6)*lm*(0.85+R()*0.3));a.sty=['pro','luz','kib'][Math.floor(R()*3)];}return a.fol;}
function folRatio(ti){return ti===SAVE.team&&SAVE.soc?socRatio():aiFol(ti)/(SOC_LG_REF[lgOf(ti)]||5000);}
function aiRev(ti){const a=SAVE.ai[ti];const inf=infraOf(ti);const r=folRatio(ti);
  return (AI_REV_LG[lgOf(ti)]||AI_REV_LG[2])*(0.6+a.rep/100*0.8)*(1+0.05*((inf.hala||1)-1)+0.04*((inf.sied||1)-1))*(1+clamp((r-1)*0.06,-0.04,0.08));}
function aiLgAvgRev(lg){const t=TEAMS.filter(x=>lgOf(x.idx)===lg&&x.idx!==SAVE.team);return t.length?t.reduce((s,x)=>s+aiRev(x.idx),0)/t.length:AI_REV_LG[lg];}
// budżety na sezon: płacowy jako limit pensji, transferowy jako pula na zakupy, operacyjny na obiekty
function aiBudgets(){const avg={};for(const t of TEAMS){const ti=t.idx;if(ti===SAVE.team)continue;const a=SAVE.ai[ti];const lg=lgOf(ti);if(avg[lg]==null)avg[lg]=aiLgAvgRev(lg);
  const fs=aiStaffSk(ti,'fin');const acc=(fs?0.9+fs/20*0.1:0.85)/0.93;let rel=clamp(aiRev(ti)/avg[lg],0.75,1.2);if(FIX_DYN)rel=1+(rel-1)*0.5;
  a.wg=round5k((WAGE_CAP[lg]||WAGE_CAP[2])*rel*acc);
  a.bud=round5k(a.bud*0.35+(150000+a.rep*12000+R()*250000)*rel*acc);
  a.op=round5k(aiRev(ti)*0.18*acc);}}
// co miesiąc: obserwujący klubów komputera rosną z renomą, specjalistą i stylem; czasem kryzys
function aiSocMonthly(){for(const t of TEAMS){const ti=t.idx;if(ti===SAVE.team)continue;const a=SAVE.ai[ti];aiFol(ti);const sk=aiStaffSk(ti,'soc');const st=SOC_STY[a.sty]||SOC_STY.pro;
  let g=0.004*(a.rep/50)+(R()-0.45)*0.012;g=g>0?g*st[2]*(sk?0.6+sk/20*0.8:0.35):g*(sk?1-sk/20*0.4:1);
  if(R()<0.02*st[1]*(sk?1-sk/25:1))g-=0.02+R()*0.03;// kryzys
  a.fol=Math.max(200,Math.round(a.fol*(1+g)));if(folRatio(ti)>1.4&&R()<0.3)a.rep=Math.min(100,a.rep+1);}}
function aiSocResult(ti,won,sweep){if(ti===SAVE.team||!SAVE.ai[ti])return;const a=SAVE.ai[ti];aiFol(ti);const sk=aiStaffSk(ti,'soc');const st=SOC_STY[a.sty]||SOC_STY.pro;
  let g=won?0.008+(sweep?0.004:0):-(0.005+(sweep?0.004:0));g=g>0?g*st[2]*(sk?0.6+sk/20*0.8:0.35):g*(sk?1-sk/20*0.4:1);a.fol=Math.max(200,Math.round(a.fol*(1+g)));}

function nRounds(){const s=S();return s&&s.rounds?s.rounds.length:22;}
