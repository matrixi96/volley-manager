// ===== Puchary europejskie (tylko kluby z 4 lig gry): Liga Mistrzów i Puchar CEV =====
// Liga Mistrzów: 12 drużyn (po 3 z najwyższej ligi każdego kraju), 3 grupy po 4 (mecz i rewanż), do ćwierćfinału: zwycięzcy i drugie miejsca grup + 2 najlepsze trzecie;
// ćwierćfinały mecz i rewanż (złoty set przy 1:1 w meczach), turniej finałowy czterech drużyn w maju.
// Puchar CEV: 16 drużyn (po 4 z kraju: zdobywca pucharu krajowego i kolejne drużyny z tabeli), 1/8, ćwierćfinał, półfinał i finał — mecz i rewanż ze złotym setem.
const EU_PRIZE={cl:{in:300000,win:50000,QF:200000,FF:400000,F:300000,champ:1000000},cev:{in:100000,win:25000,R8:60000,QF:100000,SF:150000,champ:400000}};
function euroWeeks(s){const out=[];for(let i=0;i<s.rdates.length-1;i++){const d=s.rdates[i];if(dow(d)!==6)continue;if(daysBetween(d,s.rdates[i+1])<7)continue;const md=d.slice(5);if((md>='12-14'&&md<='12-31')||md<='01-04')continue;out.push(d);}return out;}
function euroQual(){const lf=SAVE.lastFinal||{},cc=SAVE.lastCupCh||{};const cl=[],cev=[];
  for(const c of CTRY){const L=COUNTRIES[c].lgs[0];const mem=lgIds(L).filter(i=>!isYT(i));const prev=(lf[L]||[]).filter(i=>mem.includes(i));
    const order=prev.concat(mem.filter(i=>!prev.includes(i)).sort((a,b)=>teamStrength(TEAMS[b])-teamStrength(TEAMS[a])));
    cl.push(...order.slice(0,3));const ce=[];const cw=cc[c];if(cw!=null&&!cl.includes(cw)&&!isYT(cw))ce.push(cw);for(const i of order.slice(3))if(ce.length<4&&!ce.includes(i))ce.push(i);cev.push(...ce);}
  return {cl,cev};}
function tie2(a,b,d1,d2){return {a,b,d:[d1,d2],legs:[null,null],gs:null};}
function euroInit(s){const W=euroWeeks(s);if(W.length<6)return;const pick=(k,n)=>{const r=[];for(let j=0;j<n;j++)r.push(W[Math.min(W.length-1,Math.round((k+j)*(W.length-1)/9))]);return r;};
  const q=euroQual();const Y=seasonYear(s.n)+1;
  const tue=pick(0,8).map(d=>addDays(d,3)),thu=pick(1,8).map(d=>addDays(d,5));
  // grupy: koszyki według renomy, w grupie bez dwóch drużyn z jednego kraju, gdy się da
  const pot=q.cl.slice().sort((a,b)=>SAVE.ai[b].rep-SAVE.ai[a].rep);const G=[[],[],[]];
  for(let p=0;p<4;p++){const sl=pot.slice(p*3,p*3+3).sort(()=>R()-0.5);for(const t of sl){const opts=G.map((g,k)=>k).filter(k=>G[k].length===p);const ok=opts.filter(k=>!G[k].some(x=>tmCountry(x)===tmCountry(t)));G[(ok.length?ok:opts)[0]].push(t);}}
  const gm=[];const RR=[[0,1,2,3],[0,2,3,1],[0,3,1,2]];// kolejki: pary (a,b),(c,d)
  for(let md=0;md<6;md++){const r=RR[md%3];for(let g=0;g<3;g++){const T=G[g];let p1=[T[r[0]],T[r[1]]],p2=[T[r[2]],T[r[3]]];if(md>=3){p1=p1.reverse();p2=p2.reverse();}gm.push({md,g,h:p1[0],a:p1[1],d:tue[md],res:null},{md,g,h:p2[0],a:p2[1],d:tue[md],res:null});}}
  const cevT=q.cev.slice().sort((a,b)=>SAVE.ai[b].rep-SAVE.ai[a].rep);const r16=[];const top=cevT.slice(0,8),bot=cevT.slice(8).sort(()=>R()-0.5);
  for(let k=0;k<8;k++)if(top[k]!=null&&bot[k]!=null)r16.push(tie2(bot[k],top[k],thu[0],thu[1]));
  s.euro={cl:{teams:q.cl,groups:G,gm,qf:null,ff:null,qfD:[tue[6],tue[7]],ffD:[`${Y}-05-15`,`${Y}-05-16`],champ:null},cev:{teams:q.cev,rounds:[{st:'R8',ties:r16}],dates:thu,champ:null}};
  for(const t of q.cl.concat(q.cev))if(t===SAVE.team){const cl=q.cl.includes(t);money(cl?EU_PRIZE.cl.in:EU_PRIZE.cev.in,'Nagrody');finLog(`${cl?'Liga Mistrzów':'Puchar CEV'}: premia za udział`,cl?EU_PRIZE.cl.in:EU_PRIZE.cev.in);news(`🇪🇺 Gramy w ${cl?'Lidze Mistrzów':'Pucharze CEV'}!`);}}
// złoty set (do 15, przewaga 2): szansa według siły drużyn
function goldenSet(a,b){const d=(teamStrength(TEAMS[a])-teamStrength(TEAMS[b]))/6;const pa=1/(1+Math.exp(-d));const w=R()<pa?a:b;let hi=15,lo=7+Math.floor(R()*7);if(R()<0.25){hi=16+Math.floor(R()*3);lo=hi-2;}return {w,sc:[hi,lo]};}
function tieWinner(t){if(!t.legs[0]||!t.legs[1])return null;const w1=t.legs[0].sw[0]>t.legs[0].sw[1]?t.legs[0].h:t.legs[0].a,w2=t.legs[1].sw[0]>t.legs[1].sw[1]?t.legs[1].h:t.legs[1].a;
  if(w1===w2)return w1;if(!t.gs){const g=goldenSet(t.a,t.b);t.gs=g;}return t.gs.w;}
function tieLegCtx(t,k){return k===0?{h:t.a,a:t.b}:{h:t.b,a:t.a};}
function euroSim(h,a,neutral){const m=simMatch(participant(h,!neutral),participant(a,false));return resultOf(m,h,a);}
function clTable(g){const s=S();const C=s.euro.cl;const T={};for(const i of C.groups[g])T[i]={i,w:0,l:0,pts:0,sw:0,sl:0};
  for(const x of C.gm)if(x.g===g&&x.res){const r=x.res;const hw=r.sw[0]>r.sw[1];const H=T[x.h],A=T[x.a];H.sw+=r.sw[0];H.sl+=r.sw[1];A.sw+=r.sw[1];A.sl+=r.sw[0];
    const W=hw?H:A,L=hw?A:H;W.w++;L.l++;const five=Math.min(r.sw[0],r.sw[1])===2;W.pts+=five?2:3;if(five)L.pts+=1;}
  return Object.values(T).sort((a,b)=>b.w-a.w||b.pts-a.pts||(b.sw/(b.sl||0.5))-(a.sw/(a.sl||0.5)));}
// wszystkie mecze europejskie użytkownika czekające na rozegranie (z datą)
function euroMine(){const s=S();if(!s||!s.euro)return [];const me=SAVE.team,out=[];const E=s.euro;
  for(const x of E.cl.gm)if(!x.res&&(x.h===me||x.a===me))out.push({d:x.d,ctx:{kind:'euro',comp:'cl',st:'G',gi:E.cl.gm.indexOf(x),h:x.h,a:x.a}});
  const legs=(ties,comp,st,dates)=>ties.forEach((t,ti)=>{for(let k=0;k<2;k++){if(t.legs[k])continue;if(k===1&&!t.legs[0])continue;if(t.a!==me&&t.b!==me)continue;const c=tieLegCtx(t,k);out.push({d:t.d[k],ctx:{kind:'euro',comp,st,ti,leg:k,h:c.h,a:c.a}});break;}});
  if(E.cl.qf)legs(E.cl.qf,'cl','QF');
  if(E.cl.ff)E.cl.ff.forEach((g,gi)=>{if(!g.res&&g.h!=null&&(g.h===me||g.a===me))out.push({d:g.d,ctx:{kind:'euro',comp:'cl',st:'FF',gi,h:g.h,a:g.a,neutral:true}});});
  const cr=E.cev.rounds[E.cev.rounds.length-1];if(cr&&E.cev.champ==null)legs(cr.ties,'cev',cr.st);
  return out.sort((x,y)=>x.d<y.d?-1:1);}
// najbliższy mecz spoza ligi (puchar krajowy, puchary europejskie, później reprezentacja) przed podaną datą
function extraNext(before){const L=[];const cu=typeof myCupTie==='function'?myCupTie():null;if(cu)L.push({d:cu.d,ctx:{kind:'cup',h:cu.t.h,a:cu.t.a,neutral:cu.t.neutral,left:cu.rd.left}});
  L.push(...euroMine());if(typeof ntMine==='function')L.push(...ntMine());L.sort((x,y)=>x.d<y.d?-1:1);const e=L[0];if(!e)return null;return !before||e.d<=before?e:null;}
// codziennie: mecze innych drużyn
function euroTick(d){const s=S();if(!s||!s.euro)return;const E=s.euro,me=SAVE.team;
  for(const x of E.cl.gm)if(!x.res&&x.d<=d&&x.h!==me&&x.a!==me){x.res=euroSim(x.h,x.a);}
  if(!E.cl.qf&&E.cl.gm.every(x=>x.res))clToQF();
  const legsTick=(ties)=>{for(const t of ties)for(let k=0;k<2;k++){if(t.legs[k]||t.d[k]>d)continue;if(k===1&&!t.legs[0])break;if(t.a===me||t.b===me)break;const c=tieLegCtx(t,k);t.legs[k]=euroSim(c.h,c.a);}};
  if(E.cl.qf){legsTick(E.cl.qf);if(!E.cl.ff&&E.cl.qf.every(t=>t.legs[1]))clToFF();}
  if(E.cl.ff){for(const g of E.cl.ff)if(!g.res&&g.h!=null&&g.d<=d&&g.h!==me&&g.a!==me)g.res=euroSim(g.h,g.a,true);clFFStep();}
  if(E.cev.champ==null){const cr=E.cev.rounds[E.cev.rounds.length-1];legsTick(cr.ties);if(cr.ties.every(t=>t.legs[1]))cevNext();}}
function clToQF(){const C=S().euro.cl;const tabs=[0,1,2].map(clTable);const win=tabs.map(t=>t[0].i),sec=tabs.map(t=>t[1].i);const th=tabs.map(t=>t[2]).sort((a,b)=>b.w-a.w||b.pts-a.pts).slice(0,2).map(x=>x.i);
  const seeds=win.concat([sec.sort((a,b)=>SAVE.ai[b].rep-SAVE.ai[a].rep)[0]]);const others=sec.filter(i=>!seeds.includes(i)).concat(th).sort(()=>R()-0.5);
  C.qf=seeds.map((h,k)=>tie2(others[k],h,C.qfD[0],C.qfD[1]));
  for(const g of [0,1,2])for(const r of tabs[g])if(r.i===SAVE.team){const ok=C.qf.some(t=>t.a===r.i||t.b===r.i);news(ok?'🇪🇺 Wychodzimy z grupy Ligi Mistrzów — ćwierćfinał!':'🇪🇺 Odpadamy w fazie grupowej Ligi Mistrzów.');if(ok)euroPay('cl','QF');}}
function clToFF(){const C=S().euro.cl;const w=C.qf.map(tieWinner).sort((a,b)=>SAVE.ai[b].rep-SAVE.ai[a].rep);
  C.ff=[{st:'SF',h:w[0],a:w[3],d:C.ffD[0],res:null},{st:'SF',h:w[1],a:w[2],d:C.ffD[0],res:null},{st:'B',h:null,a:null,d:C.ffD[1],res:null},{st:'F',h:null,a:null,d:C.ffD[1],res:null}];
  if(w.includes(SAVE.team)){news('🇪🇺 Jesteśmy w turnieju finałowym Ligi Mistrzów!');euroPay('cl','FF');}
  if(C.qf.some(t=>t.a===SAVE.team||t.b===SAVE.team)&&!w.includes(SAVE.team))news('🇪🇺 Odpadamy w ćwierćfinale Ligi Mistrzów.');}
function rw(g){return g.res.sw[0]>g.res.sw[1]?g.h:g.a;}function rl(g){return g.res.sw[0]>g.res.sw[1]?g.a:g.h;}
function clFFStep(){const C=S().euro.cl;const [s1,s2,b,f]=C.ff;if(s1.res&&s2.res&&f.h==null){f.h=rw(s1);f.a=rw(s2);b.h=rl(s1);b.a=rl(s2);}
  if(f.res&&C.champ==null){C.champ=rw(f);const ch=C.champ;SAVE.ai[ch].rep=Math.min(100,SAVE.ai[ch].rep+5);news(`🏆🇪🇺 ${TEAMS[ch].name} wygrywa Ligę Mistrzów!${ch===SAVE.team?' Jesteśmy najlepsi w Europie!':''}`);
    if(rl(f)===SAVE.team)euroPay('cl','F');if(ch===SAVE.team){euroPay('cl','champ');euroTrophy('Liga Mistrzów');}}}
function cevNext(){const E=S().euro.cev;const cr=E.rounds[E.rounds.length-1];const w=cr.ties.map(tieWinner);const nx={R8:'QF',QF:'SF',SF:'F'}[cr.st];
  if(cr.ties.some(t=>t.a===SAVE.team||t.b===SAVE.team)){if(w.includes(SAVE.team)){euroPay('cev',cr.st);if(nx)news(`🇪🇺 Awans w Pucharze CEV (${nx==='F'?'finał':nx==='SF'?'półfinał':'ćwierćfinał'})!`);}else news('🇪🇺 Odpadamy z Pucharu CEV.');}
  if(!nx){E.champ=w[0];SAVE.ai[w[0]].rep=Math.min(100,SAVE.ai[w[0]].rep+3);news(`🏆🇪🇺 ${TEAMS[w[0]].name} zdobywa Puchar CEV!`);if(w[0]===SAVE.team){euroPay('cev','champ');euroTrophy('Puchar CEV');}return;}
  const k=E.rounds.length;const ties=[];const p=w.sort(()=>R()-0.5);for(let i=0;i<p.length;i+=2)ties.push(tie2(p[i],p[i+1],E.dates[k*2],E.dates[k*2+1]));E.rounds.push({st:nx,ties});}
function euroPay(comp,key){const v=EU_PRIZE[comp][key];if(!v||SAVE.team==null)return;money(v,'Nagrody');finLog(`${comp==='cl'?'Liga Mistrzów':'Puchar CEV'}: ${key==='champ'?'zwycięstwo':'awans'}`,v);}
function euroTrophy(t){const co=coach();if(co){co.trophies=co.trophies||[];co.trophies.push(`🏆 ${t} ${sLabel(S().n)} (${TEAMS[SAVE.team].name})`);}if(SAVE.board)SAVE.board.conf=Math.min(100,SAVE.board.conf+15);}
function euroMyResult(c,res){const s=S(),E=s.euro;if(!E)return;const won=(res.sw[0]>res.sw[1])===(res.h===SAVE.team);if(won)euroPay(c.comp,'win');
  if(c.comp==='cl'&&c.st==='G'){E.cl.gm[c.gi].res=res;}
  else if(c.comp==='cl'&&c.st==='QF'){E.cl.qf[c.ti].legs[c.leg]=res;}
  else if(c.comp==='cl'&&c.st==='FF'){E.cl.ff[c.gi].res=res;}
  else{const cr=E.cev.rounds[E.cev.rounds.length-1];cr.ties[c.ti].legs[c.leg]=res;}
  const t=c.ti!=null?(c.comp==='cl'?E.cl.qf[c.ti]:E.cev.rounds[E.cev.rounds.length-1].ties[c.ti]):null;
  if(t&&c.leg===1){const w=tieWinner(t);if(t.gs)news(`🇪🇺 Złoty set: ${TEAMS[t.gs.w].name} wygrywa ${t.gs.sc[0]}:${t.gs.sc[1]}${w===SAVE.team?' — awansujemy!':' — odpadamy.'}`);}
  euroTick(res.d||today());}
function euroFinishAll(){const s=S();if(!s||!s.euro)return;const me=SAVE.team;SAVE.team=-99;try{let g=0;while(g++<20){euroTick('9999-12-31');const E=s.euro;if(E.cl.champ!=null&&E.cev.champ!=null)break;}}finally{SAVE.team=me;}}
// ---- widok ----
function euroView(){const s=S();const E=s.euro;if(!E)return '<div class="card"><p class="mut">Puchary europejskie ruszą od nowego sezonu.</p></div>';const me=SAVE.team;
  const nm=i=>`${tDot(i)} ${i===me?'<b>':''}${tName(i)}${i===me?'</b>':''} <small class="mut">${natFl(tmCountry(i))}</small>`;
  const tieRow=t=>{const w=tieWinner(t);const L=t.legs.map(r=>r?`${r.h===t.a?r.sw[0]+':'+r.sw[1]:r.sw[1]+':'+r.sw[0]}`:'–').join(', ');return `<div class="cupt ${t.a===me||t.b===me?'mine':''}"><span class="${w===t.a?'b':''}">${nm(t.a)}</span><b>${L}${t.gs?`<br><small>złoty set ${t.gs.w===t.a?t.gs.sc.join(':'):t.gs.sc.slice().reverse().join(':')}</small>`:''}</b><span class="${w===t.b?'b':''}">${nm(t.b)}</span></div>`;};
  const grp=E.cl.groups.map((g,k)=>`<div class="eug"><h3>Grupa ${'ABC'[k]}</h3><table class="tbl small"><tr><th></th><th>Drużyna</th><th>W</th><th>P</th><th>Pkt</th><th>Sety</th></tr>${clTable(k).map((r,j)=>`<tr class="${r.i===me?'me':''}"><td>${j+1}</td><td class="l">${nm(r.i)}</td><td>${r.w}</td><td>${r.l}</td><td><b>${r.pts}</b></td><td>${r.sw}:${r.sl}</td></tr>`).join('')}</table></div>`).join('');
  const ff=E.cl.ff?`<h3>Turniej finałowy (${fmtDMY(E.cl.ffD[0])}–${fmtDMY(E.cl.ffD[1])})</h3>${E.cl.ff.filter(g=>g.h!=null).map(g=>`<div class="cupt ${g.h===me||g.a===me?'mine':''}"><span>${{SF:'Półfinał',B:'O 3. miejsce',F:'Finał'}[g.st]}: ${nm(g.h)}</span><b>${g.res?g.res.sw.join(':'):'–'}</b><span>${nm(g.a)}</span></div>`).join('')}`:'';
  return `<div class="card"><h2>🇪🇺 Liga Mistrzów ${E.cl.champ!=null?`<small>· 🏆 ${tName(E.cl.champ)}</small>`:''}</h2><p class="small mut">12 drużyn z najwyższych lig (po 3 z kraju). Grupy: mecz i rewanż (${E.cl.gm.length?fmtDMY(E.cl.gm[0].d)+' – '+fmtDMY(E.cl.gm[E.cl.gm.length-1].d):''}); do ćwierćfinału wchodzą zwycięzcy i drugie drużyny grup oraz 2 najlepsze z trzecich miejsc. Ćwierćfinały mecz i rewanż, przy 1:1 w meczach decyduje złoty set do 15. Na koniec turniej finałowy czterech drużyn.</p>
   <div class="eugs">${grp}</div>${E.cl.qf?`<h3>Ćwierćfinały (${fmtDMY(E.cl.qfD[0])} i ${fmtDMY(E.cl.qfD[1])})</h3>${E.cl.qf.map(tieRow).join('')}`:''}${ff}</div>
   <div class="card"><h2>🇪🇺 Puchar CEV ${E.cev.champ!=null?`<small>· 🏆 ${tName(E.cev.champ)}</small>`:''}</h2><p class="small mut">16 drużyn: zdobywcy pucharów krajowych i kolejne drużyny z tabel najwyższych lig (po 4 z kraju). Wszystkie rundy mecz i rewanż ze złotym setem.</p>
   ${E.cev.rounds.slice().reverse().map(r=>`<h3>${{R8:'1/8 finału',QF:'Ćwierćfinał',SF:'Półfinał',F:'Finał'}[r.st]} <small class="mut">· ${fmtDMY(r.ties[0].d[0])} i ${fmtDMY(r.ties[0].d[1])}</small></h3>${r.ties.map(tieRow).join('')}`).join('')}</div>`;}

function euroLab(c){return (c.comp==='cl'?'Liga Mistrzów':'Puchar CEV')+' · '+({G:'faza grupowa',QF:'ćwierćfinał',FF:'turniej finałowy',R8:'1/8 finału',SF:'półfinał',F:'finał'}[c.st]||'')+(c.leg!=null?(c.leg?' (rewanż)':' (1. mecz)'):'');}
