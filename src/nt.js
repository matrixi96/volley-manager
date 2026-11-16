// ===== Reprezentacje narodowe i praca selekcjonera =====
// Kadra: 14 najlepszych zawodników danej narodowości (z klubów w grze i wolnych). Gdy w grze jest ich za mało, kadrę uzupełniają zawodnicy spoza gry.
// Lato przed każdym sezonem: Liga Narodów (16 najlepszych kadr) oraz Puchar Świata (lata nieparzyste, 20 kadr), Mistrzostwa Europy (lata parzyste) albo igrzyska (co 4 lata, 12 kadr).
const NT_CODES=Object.keys(NAT);const NT_EU=['PL','DE','IT','TR','FR','RS','SI','BG','NL','BE','UA','CZ','FI'];
function ntIdx(c){return -100-NT_CODES.indexOf(c);}function ntCode(ti){return NT_CODES[-100-ti];}function isNT(ti){return ti<=-100;}
const NT_COL={PL:'#dc2626',DE:'#111827',IT:'#2563eb',TR:'#e11d48',BR:'#eab308',FR:'#1d4ed8',RS:'#b91c1c',US:'#1e3a8a',AR:'#38bdf8',CU:'#1e40af',SI:'#16a34a',BG:'#15803d',NL:'#f97316',BE:'#facc15',CA:'#ef4444',JP:'#f43f5e',IR:'#16a34a',UA:'#facc15',CZ:'#2563eb',FI:'#0ea5e9'};
function ntPool(c){return W().players.filter(p=>pNat(p)===c&&(!p.jr||p.age>=18)&&!p.retired);}
function ntAuto(c){const pool=ntPool(c).filter(p=>!p.inj).sort((a,b)=>rating(b)-rating(a));const need={R:2,A:2,P:4,S:4,L:2};const out=[];
  for(const pos of Object.keys(need)){for(const p of pool.filter(x=>x.pos===pos).slice(0,need[pos]))out.push(p.id);}
  for(const p of pool)if(out.length<14&&!out.includes(p.id))out.push(p.id);return out;}
// zawodnicy spoza gry uzupełniają słabe kadry (stali, zapisani w SAVE)
const NT_BASE={BR:78,FR:79,RS:77,US:77,IR:74,JP:75,CU:75,AR:75,SI:76,BG:74,CA:74,UA:73,NL:73,BE:73,CZ:71,FI:70,PL:79,IT:79,DE:73,TR:74};
function ntVirt(c,n){SAVE.ntV=SAVE.ntV||{};const V=SAVE.ntV[c]=SAVE.ntV[c]||[];const base=NT_BASE[c]||70;
  const pos=['R','A','P','P','S','S','L','R','A','P','P','S','S','L'];while(V.length<n){const k=V.length;const p=genAt(pos[k%14],base-3+R()*5,23+Math.floor(R()*8));let f,l,g=0;do{[f,l]=natName(c);}while(g++<20&&V.some(v=>v.last===l));Object.assign(p,{id:'ntv'+c+k,first:f,last:l,nat:c,tm:-50,wage:0,num:k+1});ensTraits(p);V.push(p);}return V.slice(0,n);}
function ntSquad(c){const T=SAVE.ntT&&SAVE.ntT.call&&SAVE.ntT.call[c];const ids=T||ntAuto(c);const pl=ids.map(id=>PLAYERS[id]&&PLAYERS[id].p).filter(Boolean);if(pl.length<12)pl.push(...ntVirt(c,14-pl.length));return pl;}
function ntTeam(c){return {idx:ntIdx(c),name:natN(c),short:c,color:NT_COL[c]||'#64748b',players:ntSquad(c),nt:c};}
function ntRegister(){for(const c of NT_CODES){const t=ntTeam(c);TEAMS[t.idx]=t;if(SAVE.ai)SAVE.ai[t.idx]={rep:70,bud:0};if(SAVE.lg)SAVE.lg[t.idx]=undefined;}}
function anyTeam(ti){if(isNT(ti)&&!TEAMS[ti])ntRegister();return TEAMS[ti];}
function ntStr(c){const t=ntTeam(c);const lu=autoLineup(t);return lineupStrength(t,lu);}
function ntRank(){return NT_CODES.map(c=>({c,s:ntStr(c)})).sort((a,b)=>b.s-a.s);}
function ntPart(c,mine){const t=anyTeam(ntIdx(c));t.players=ntSquad(c);const lu=autoLineup(t);const cx=mine?coachMatchX():{};
  return {team:t,lineup:lu,tactics:mine?Object.assign({},myTac()):aiStyle(t,lu),home:false,x:{hb:0,fat:1,sb:(cx.sb||0),cap:null,momMul:cx.momMul,prB:cx.prB,trB:cx.trB}};}
// ---- turnieje ----
function ntYear(){return seasonYear(S().n);}// lato przed sezonem n
function ntComps(Y){const L=[{k:'vnl',n:'Liga Narodów',teams:16,groups:2,adv:4}];
  if(Y%4===0)L.push({k:'oly',n:'Igrzyska olimpijskie',teams:12,groups:2,adv:4});else if(Y%2===1)L.push({k:'wc',n:'Puchar Świata',teams:20,groups:4,adv:2});else L.push({k:'eu',n:'Mistrzostwa Europy',teams:12,groups:2,adv:4,eu:1});return L;}
function ntInit(){const s=S();if(!s||s.nt||s.phase!=='off')return;ntRegister();const Y=ntYear();const rk=ntRank();const comps=ntComps(Y);
  SAVE.ntT={call:{}};const me=SAVE.ntJob&&SAVE.ntJob.c;for(const c of NT_CODES)SAVE.ntT.call[c]=(me===c&&SAVE.ntCall&&SAVE.ntCall.length>=12)?SAVE.ntCall.slice():ntAuto(c);ntRegister();
  s.nt={Y,comps:comps.map((cp,ci)=>{const pool=rk.filter(x=>!cp.eu||NT_EU.includes(x.c)).slice(0,cp.teams).map(x=>x.c);const G=[...Array(cp.groups)].map(()=>[]);pool.forEach((c,i)=>{const r=Math.floor(i/cp.groups);G[r%2?cp.groups-1-i%cp.groups:i%cp.groups].push(c);});
    const start=ci===0?`${Y}-06-06`:`${Y}-07-24`;const gm=[];G.forEach((g,gi)=>{const F=makeFixtures(g.length);F.forEach((rd,ri)=>rd.forEach(([a,b])=>gm.push({st:'G',g:gi,h:g[a],a:g[b],d:addDays(start,ri*(ci===0?4:2)),res:null})));});
    const last=gm.reduce((m,x)=>x.d>m?x.d:m,start);return {k:cp.k,n:cp.n,adv:cp.adv,groups:G,gm,ko:[],koD:[addDays(last,4),addDays(last,6),addDays(last,7)],champ:null,medals:null};})};
  const my=SAVE.ntJob;if(my)news(`🎌 Lato z kadrą ${natN(my.c)}: ${s.nt.comps.map(x=>x.n).join(' i ')}. Powołania ustawisz w zakładce Reprezentacja.`);}
function ntTable(cp,g){const T={};for(const c of cp.groups[g])T[c]={c,w:0,l:0,pts:0,sw:0,sl:0};
  for(const x of cp.gm)if(x.g===g&&x.res){const r=x.res;const hw=r.sw[0]>r.sw[1];const H=T[x.h],A=T[x.a];H.sw+=r.sw[0];H.sl+=r.sw[1];A.sw+=r.sw[1];A.sl+=r.sw[0];const W=hw?H:A,L=hw?A:H;W.w++;L.l++;const five=Math.min(r.sw[0],r.sw[1])===2;W.pts+=five?2:3;if(five)L.pts+=1;}
  return Object.values(T).sort((a,b)=>b.w-a.w||b.pts-a.pts||(b.sw/(b.sl||0.5))-(a.sw/(a.sl||0.5)));}
function ntSim(h,a){const m=newMatch(ntPart(h),ntPart(a));for(const sd of m.sides)sd.chem=Math.max(sd.chem||0,0.6);while(!m.over){aiTurn(m,0);aiTurn(m,1);stepRally(m);}const r=resultOf(m,ntIdx(h),ntIdx(a));r.h=h;r.a=a;ntInj(m);for(const sd of m.sides)for(const cp of sd.pl){const P=PLAYERS[cp.id];if(P&&cp.st&&cp.st.att+cp.st.rec+cp.st.srv>0){P.p.ntCaps=(P.p.ntCaps||0)+1;}}return r;}
function myNT(){return SAVE.ntJob?SAVE.ntJob.c:null;}
function ntMine(){const s=S();if(!s||!s.nt)return [];const me=myNT();if(!me)return [];const out=[];s.nt.comps.forEach((cp,ci)=>{cp.gm.concat(cp.ko).forEach((x,mi)=>{if(!x.res&&x.h&&(x.h===me||x.a===me)){if(!TEAMS[-100])ntRegister();out.push({d:x.d,ctx:{kind:'nt',ci,mi,h:ntIdx(x.h===me?x.a:x.h),a:ntIdx(me),neutral:true,st:x.st}});}});});return out.sort((a,b)=>a.d<b.d?-1:1);}
function ntTick(d){const s=S();if(!s||!s.nt)return;const me=myNT();for(const cp of s.nt.comps){for(const x of cp.gm.concat(cp.ko))if(!x.res&&x.h&&x.d<=d&&x.h!==me&&x.a!==me)x.res=ntSim(x.h,x.a);ntStage(cp);}}
function ntStage(cp){const gDone=cp.gm.every(x=>x.res);if(!gDone)return;const W=x=>x.res.sw[0]>x.res.sw[1]?x.h:x.a,L=x=>x.res.sw[0]>x.res.sw[1]?x.a:x.h;
  if(!cp.ko.length){const T=cp.groups.map((g,i)=>ntTable(cp,i).map(r=>r.c));let pr;if(cp.groups.length===2)pr=[[T[0][0],T[1][3]],[T[1][1],T[0][2]],[T[1][0],T[0][3]],[T[0][1],T[1][2]]];else pr=[[T[0][0],T[1][1]],[T[2][0],T[3][1]],[T[1][0],T[0][1]],[T[3][0],T[2][1]]];
    cp.ko=pr.map(([h,a])=>({st:'QF',h,a,d:cp.koD[0],res:null}));ntNews(cp,'QF');return;}
  const qf=cp.ko.filter(x=>x.st==='QF');if(qf.every(x=>x.res)&&!cp.ko.some(x=>x.st==='SF')){cp.ko.push({st:'SF',h:W(qf[0]),a:W(qf[1]),d:cp.koD[1],res:null},{st:'SF',h:W(qf[2]),a:W(qf[3]),d:cp.koD[1],res:null});ntNews(cp,'SF');return;}
  const sf=cp.ko.filter(x=>x.st==='SF');if(sf.length&&sf.every(x=>x.res)&&!cp.ko.some(x=>x.st==='F')){cp.ko.push({st:'B',h:L(sf[0]),a:L(sf[1]),d:cp.koD[2],res:null},{st:'F',h:W(sf[0]),a:W(sf[1]),d:cp.koD[2],res:null});return;}
  const f=cp.ko.find(x=>x.st==='F'),b=cp.ko.find(x=>x.st==='B');if(f&&f.res&&b&&b.res&&!cp.champ){cp.champ=W(f);cp.medals=[W(f),L(f),W(b)];ntDone(cp);}}
function ntNews(cp,st){const me=myNT();if(!me)return;const x=cp.ko.find(y=>y.h===me||y.a===me);if(st==='QF'&&!x)news(`🎌 ${cp.n}: ${natN(me)} odpada w fazie grupowej.`);}
function ntDone(cp){const me=myNT();const M=cp.medals;news(`🏅 ${cp.n} ${ntYear()}: 🥇 ${natN(M[0])}, 🥈 ${natN(M[1])}, 🥉 ${natN(M[2])}.`);
  // medaliści: rośnie wartość i renoma; zawodnicy grający dostają +morale
  M.forEach((c,k)=>{for(const p of ntSquad(c)){if(!PLAYERS[p.id])continue;p.mor=clamp((p.mor||60)+(3-k)*2,5,100);}});
  if(me){const co=coach();const pl=M.indexOf(me);const exp=ntExpect(me,cp);const gain=pl===0?(cp.k==='vnl'?4:8):pl>0?(cp.k==='vnl'?2:4):0;const rk=ntPlace(cp,me);const d=gain+(rk<=exp?1:-2);
    if(co){co.rep=clamp(co.rep+d,0,100);if(pl>=0)co.trophies.push(`${['🥇','🥈','🥉'][pl]} ${cp.n} ${ntYear()} (reprezentacja ${natN(me)})`);}
    SAVE.ntJob.res=(SAVE.ntJob.res||[]).concat([{n:cp.n,Y:ntYear(),pl:rk,exp}]);news(`🎌 ${cp.n}: kadra ${natN(me)} kończy na ${rk}. miejscu (oczekiwania federacji: ${exp<=1?'złoto':exp<=3?'medal':'top '+exp}). Reputacja ${d>=0?'+':''}${d}.`);
    const bad=(SAVE.ntJob.res||[]).slice(-2).filter(r=>r.pl>r.exp+2).length;if(bad>=2){news(`🎌 Federacja ${natN(me)} rozwiązuje umowę z selekcjonerem po słabych wynikach.`);SAVE.ntJob=null;}}}
function ntPlace(cp,c){if(cp.medals&&cp.medals.indexOf(c)>=0)return cp.medals.indexOf(c)+1;const b=cp.ko.find(x=>x.st==='B');if(b&&(b.h===c||b.a===c))return 4;if(cp.ko.some(x=>x.st==='QF'&&(x.h===c||x.a===c)))return 5;const g=cp.groups.findIndex(g=>g.includes(c));const pos=g>=0?ntTable(cp,g).findIndex(r=>r.c===c):9;return 9+pos;}
function ntExpect(c,cp){const pool=cp.groups.flat();const r=pool.map(x=>({x,s:ntStr(x)})).sort((a,b)=>b.s-a.s).findIndex(o=>o.x===c)+1;return r<=1?1:r<=3?3:r<=8?8:12;}
function ntMyResult(c,res){const s=S();const cp=s.nt.comps[c.ci];const L=cp.gm.concat(cp.ko);const x=L[c.mi];if(!x)return;const same=x.h===ntCode(res.h);x.res={h:x.h,a:x.a,sets:same?res.sets:res.sets.map(z=>[z[1],z[0]]),sw:same?res.sw:[res.sw[1],res.sw[0]],d:res.d};ntTick(today());}
function ntFinishAll(){const s=S();if(!s||!s.nt)return;const keep=SAVE.ntJob;SAVE.ntJob=keep?Object.assign({},keep,{c:'__'}):null;try{for(let g=0;g<6;g++)ntTick('9999-12-31');}finally{SAVE.ntJob=keep;}for(const cp of s.nt.comps)if(cp.champ&&keep&&!(keep.res||[]).some(r=>r.n===cp.n&&r.Y===ntYear()))ntDone(cp);}
// ---- oferty pracy ----
function ntOffers(){const co=coach();if(!co)return [];const rk=ntRank();return rk.map((x,i)=>({c:x.c,s:x.s,req:Math.round(clamp(78-i*3.2,18,80))})).filter(o=>o.c!==myNT());}
function ntTake(c){if(!windowOpen()&&S().phase!=='off')return tradeMsg(false,'Pracę z kadrą można zmienić tylko między sezonami.');const o=ntOffers().find(x=>x.c===c);if(!o||coach().rep<o.req)return tradeMsg(false,'Ta federacja nie zatrudni trenera z tak niską reputacją.');
  SAVE.ntJob={c,since:S().n,res:[]};SAVE.ntCall=null;news(`🎌 Zostajesz selekcjonerem reprezentacji ${natN(c)} (obok pracy w klubie).`);save();render();}
function ntQuit(){if(!SAVE.ntJob)return;news(`🎌 Rezygnujesz z prowadzenia reprezentacji ${natN(SAVE.ntJob.c)}.`);SAVE.ntJob=null;save();render();}
function ntToggleCall(id){const c=myNT();if(!c)return;if(S().nt&&S().nt.comps.some(cp=>cp.gm.some(x=>x.res)))return tradeMsg(false,'Turniej już trwa — powołania są zamknięte.');SAVE.ntCall=SAVE.ntCall||ntAuto(c);const i=SAVE.ntCall.indexOf(id);if(i>=0)SAVE.ntCall.splice(i,1);else if(SAVE.ntCall.length<14)SAVE.ntCall.push(id);
  if(SAVE.ntT&&SAVE.ntT.call)SAVE.ntT.call[c]=SAVE.ntCall.slice();save();render();}
function ntAutoCall(){const c=myNT();if(!c)return;SAVE.ntCall=ntAuto(c);if(SAVE.ntT&&SAVE.ntT.call)SAVE.ntT.call[c]=SAVE.ntCall.slice();save();render();}
// ---- widok ----
function ntView(){const s=S();const me=myNT();const co=coach();const nm=c=>`${natFl(c)} ${c===me?'<b>':''}${natN(c)}${c===me?'</b>':''}`;
  const job=me?`<div class="card"><div class="row wrap"><h2 style="margin:0">${natFl(me)} Selekcjoner reprezentacji ${natN(me)}</h2><span class="sp"></span><button class="ghost sm" onclick="ntQuit()">Zrezygnuj</button></div><p class="small mut">Prowadzisz kadrę latem, obok pracy w klubie. Federacja ocenia wyniki względem siły kadry; dwa słabe turnieje z rzędu oznaczają zwolnienie. Medale podnoszą Twoją reputację.</p>${(SAVE.ntJob.res||[]).length?`<div class="small">${SAVE.ntJob.res.slice(-6).map(r=>`${r.n} ${r.Y}: <b>${r.pl}. miejsce</b> <span class="mut">(cel: ${r.exp<=1?'złoto':r.exp<=3?'medal':'top '+r.exp})</span>`).join(' · ')}</div>`:''}</div>`
   :`<div class="card"><h2>Praca selekcjonera</h2><p class="small mut">Możesz prowadzić reprezentację obok klubu. Silniejsze kadry wymagają wyższej reputacji (Twoja: <b>${co?co.rep:0}</b>). Pracę zmienia się między sezonami.</p>${ntOffers().slice(0,20).map(o=>`<div class="res row">${nm(o.c)} <small class="mut" style="margin-left:8px">siła kadry ${o.s} · wymagana reputacja ${o.req}</small><span class="sp"></span>${co&&co.rep>=o.req?`<button class="ghost sm" onclick="ntTake('${o.c}')">Przyjmij</button>`:'<small class="mut">🔒</small>'}</div>`).join('')}</div>`;
  let call='';if(me){const ids=SAVE.ntCall||(SAVE.ntT&&SAVE.ntT.call&&SAVE.ntT.call[me])||ntAuto(me);const pool=ntPool(me).sort((a,b)=>rating(b)-rating(a)).slice(0,30);
    call=`<div class="card"><div class="row wrap"><h2 style="margin:0">Powołania (${ids.length}/14)</h2><span class="sp"></span><button class="ghost sm" onclick="ntAutoCall()">Wybierz automatycznie</button></div><p class="small mut">Kliknij zawodnika, żeby go powołać albo skreślić. Powołania zamykają się z pierwszym meczem turnieju. Grający w kadrze wracają do klubów z ryzykiem kontuzji, ale i z większą pewnością siebie po sukcesach.</p>
     <div class="ntcall">${pool.map(p=>`<button class="ntp ${ids.includes(p.id)?'on':''}" onclick="ntToggleCall('${p.id}')"><b>${esc(p.last)}</b> <small>${POS_SHORT[p.pos]} · ${rating(p)} · ${p.age} l.</small><small class="mut">${p.tm>=0?esc(TEAMS[p.tm].short):'wolny'}${p.inj?' · 🚑':''}</small></button>`).join('')}</div></div>`;}
  const comps=s.nt?s.nt.comps.map(cp=>`<div class="card"><h2>${cp.n} ${s.nt.Y}${cp.champ?` <small>· 🥇 ${natN(cp.medals[0])} · 🥈 ${natN(cp.medals[1])} · 🥉 ${natN(cp.medals[2])}</small>`:''}</h2><div class="eugs">${cp.groups.map((g,k)=>`<div class="eug"><h3>Grupa ${'ABCD'[k]}</h3><table class="tbl small"><tr><th></th><th>Kadra</th><th>W</th><th>P</th><th>Pkt</th></tr>${ntTable(cp,k).map((r,j)=>`<tr class="${r.c===me?'me':''}"><td>${j+1}</td><td class="l">${nm(r.c)}</td><td>${r.w}</td><td>${r.l}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>`).join('')}</div>
     ${cp.ko.length?`<h3>Faza pucharowa</h3>${cp.ko.map(x=>`<div class="cupt ${x.h===me||x.a===me?'mine':''}"><span>${{QF:'Ćwierćfinał',SF:'Półfinał',B:'O brąz',F:'Finał'}[x.st]}: ${nm(x.h)}</span><b>${x.res?x.res.sw.join(':'):fmtDMY(x.d)}</b><span>${nm(x.a)}</span></div>`).join('')}`:''}</div>`).join(''):'<div class="card"><p class="mut">Turnieje reprezentacji odbywają się latem (czerwiec–sierpień), w przerwie między sezonami.</p></div>';
  const rk=ntRank();return job+call+comps+`<div class="card"><h2>Ranking siły kadr</h2>${rk.map((x,i)=>`<div class="res row"><span style="width:26px">${i+1}.</span>${nm(x.c)}<span class="sp"></span><b>${x.s}</b></div>`).join('')}</div>`;}

// kontuzje w kadrze (przenoszą się do klubu)
function ntInj(m){for(const sd of m.sides)for(const cp of sd.pl){const x=cp.st;if(!x||x.srv+x.rec+x.att+x.dig+x.blk===0)continue;const P=PLAYERS[cp.id];if(!P)continue;const p=P.p;if(p.inj)continue;
  if(R()<0.008*(1.3-p.kon/20*0.6)*(hasT(p,'odp')?0.65:1)){const days=7+Math.floor(R()*R()*35);p.inj=days;p.injUntil=addDays(today(),days);p.injN=injName(days);p.injD=days;if(p.tm===SAVE.team)news(`🚑 ${p.first} ${p.last} doznał kontuzji na zgrupowaniu reprezentacji ${natN(pNat(p))} — przerwa ok. ${days} dni.`);}}}
