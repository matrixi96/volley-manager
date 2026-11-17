// ================= DANE O RYWALACH (bieżący sezon) =================
// Po każdym meczu ze statystykami zapisujemy, jak grała każda drużyna. Odprawa przed meczem korzysta z tych liczb.
// S().sc[ti] = {m, tot, mid, pipe, w:{L4:[skos,prosta,kiwka],R2:[...]}, wa:{L4:{id:n},R2:{id:n}}, md:[prosto,w lewo,w prawo], rec:{id:[przyjęcia,pozytywne,idealne]}}
function RSC(){const s=S();return s?(s.sc||(s.sc={})):{};}
function scoutAfterMatch(m){try{if(!m||!m.sides)return;const ds=m.dirStats||[];
  m.sides.forEach((sd,i)=>{const ti=sd.team&&sd.team.idx;if(ti==null||ti<0)return;const o=RSC()[ti]||(RSC()[ti]={m:0,tot:0,mid:0,pipe:0,w:{L4:[0,0,0],R2:[0,0,0]},wa:{L4:{},R2:{}},md:[0,0,0],rec:{}});
    o.m++;for(const d of ds){if(d.i!==i||d.d==='free')continue;o.tot++;const P=PLAYERS[d.id];const pos=P?P.p.pos:'';
      if(pos==='S')o.mid++;else if(pos==='P'&&d.w==='M')o.pipe++;
      if(d.w==='L4'||d.w==='R2'){const k=d.d==='cross'?0:d.d==='line'?1:d.d==='tip'?2:-1;if(k>=0){o.w[d.w][k]++;o.wa[d.w][d.id]=(o.wa[d.w][d.id]||0)+1;}}
      else if(/^mid/.test(d.d))o.md[{midS:0,midL:1,midR:2}[d.d]]++;}
    for(const p of sd.pl){const x=p.st;if(!x||!x.rec)continue;const r=o.rec[p.id]||(o.rec[p.id]=[0,0,0]);r[0]+=x.rec;r[1]+=x.recPos||0;r[2]+=x.recPerf||0;}});}catch(e){console.error(e);}}
// dokładność zależy od analityka: liczby z błędem i ile rad dostajemy
function scAcc(){const an=typeof anaSkill==='function'?anaSkill():0;return an>=15?{err:2,lv:3}:an>=10?{err:5,lv:2}:an>=6?{err:8,lv:1}:{err:12,lv:0};}
function scNoise(seed,err){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))|0;return ((Math.abs(h)%1000)/1000*2-1)*err;}
function scPct(v,seed){const a=scAcc();return clamp(Math.round(v*100+scNoise(seed+'|'+today(),a.err)),0,100);}
function scConf(n){return n>=6?'':n>=3?' (dane z '+n+' meczów)':' (mało danych — '+n+' '+(n===1?'mecz':'mecze')+')';}
// rady oparte na danych z sezonu; zwraca null, gdy jeszcze nie ma danych o rywalu
function preTipsData(opI){const o=RSC()[opI];if(!o||!o.m)return null;const out=[];const t=myTac();const A=scAcc();const op=TEAMS[opI];const cf=scConf(o.m);
  const inT=id=>op.players.some(p=>String(p.id)===String(id)&&!(p.inj>0));const nmP=id=>{const P=PLAYERS[id];return P?P.p.last:'?';};
  // 1. przyjęcie: najsłabszy przyjmujący (nie libero) wg pozytywnego przyjęcia
  const rs=Object.entries(o.rec).filter(([id,r])=>r[0]>=Math.max(6,o.m*4)&&inT(id)&&PLAYERS[id]&&PLAYERS[id].p.pos!=='L').map(([id,r])=>[id,r[1]/r[0],r[0]]).sort((a,b)=>a[1]-b[1]);
  if(rs.length>=2&&rs[1][1]-rs[0][1]>=0.05){const [id,v,n]=rs[0];const v2=rs[1][1];
    out.push({g:'Zagrywka',t:`Zagrywaj w zawodnika: ${nmP(id)}.`,why:`W tym sezonie przyjmuje pozytywnie ${Math.round(v*100)}% zagrywek (${n} przyjęć), najmniej w drużynie — następny ma ${Math.round(v2*100)}%${cf}.`,on:String(t.tgt)===String(id),btn:'Zastosuj',act:`preSet('tgt','${id}')`,ev:{k:'tgt',id}});}
  if(A.lv>=1){
    // 2. kierunki ataku ze skrzydeł → blok
    for(const [w,key,side] of [['L4','blkR','prawej'],['R2','blkL','lewej']]){const a=o.w[w];const n=a[0]+a[1];if(n<12)continue;const c=a[0]/n;const best=c>=0.6?0:c<=0.4?2:null;
      const top=Object.entries(o.wa[w]).sort((x,y)=>y[1]-x[1])[0];const who=top?nmP(top[0]):'';
      if(best==null||(t[key]??1)===best)continue;const pc=scPct(best===0?c:1-c,w+opI);
      out.push({g:'Blok',t:`Blok „${BLK_OPT[best][0].toLowerCase()}” na ${side} stronie siatki.`,why:`Ataki rywala z ${w==='L4'?'lewego':'prawego'} skrzydła${who?' (głównie '+who+')':''} idą w ok. ${pc}% ${best===0?'po skosie':'po prostej'} (${n} ataków)${cf}.`,btn:'Zastosuj',act:`preSet('${key}',${best})`,ev:{k:key,w,dir:best===0?'cross':'line'}});}
    // 3. środek: udział i kierunek krótkiej
    const mT=o.md[0]+o.md[1]+o.md[2];const share=o.tot?o.mid/o.tot:0;
    if(mT>=10){const arr=[[0,o.md[0],'prosto'],[2,o.md[1],'skos na strefę 5'],[3,o.md[2],'skos na strefę 1']].sort((x,y)=>y[1]-x[1]);const b=arr[0];const sh=b[1]/mT;
      if(sh>=0.5&&(t.blkM??1)!==b[0])out.push({g:'Blok',t:`Blok środkowy: „${MID_OPT[b[0]][0].toLowerCase()}”.`,why:`Rywal gra środkiem ok. ${scPct(share,'mid'+opI)}% piłek, a krótkie kończy głównie ${b[2]} (ok. ${scPct(sh,'md'+opI)}%)${cf}.`,btn:'Zastosuj',act:`preSet('blkM',${b[0]})`,ev:{k:'blkM'}});}
    // 4. kiwki
    if(A.lv>=2){const tp=o.w.L4[2]+o.w.R2[2],wn=o.w.L4[0]+o.w.L4[1]+o.w.R2[0]+o.w.R2[1]+tp;if(wn>=20&&tp/wn>=0.12&&!(t.tipL||t.tipR))out.push({g:'Obrona',t:'Włącz asekurację kiwki na skrzydłach.',why:`Rywal kiwa ok. ${scPct(tp/wn,'tip'+opI)}% ataków ze skrzydeł — więcej niż typowe 8%${cf}.`,btn:'Zastosuj',act:`preSet('tipL',1);preSet('tipR',1)`});}
    // 5. pipe
    if(A.lv>=2&&o.tot>=30&&o.pipe/o.tot>=0.12)out.push({g:'Rywal',t:`Rywal często gra pipe (ok. ${scPct(o.pipe/o.tot,'pipe'+opI)}% ataków).`,why:'Atak z drugiej linii ze strefy 6 — środkowy blokujący musi zostać na środku, a obrona w strefie 6 głębiej.'});}
  else out.push({g:'Analiza',t:'Bez dobrego analityka znamy tylko przyjęcie rywala.',why:'Analityk (Sztab) z umiejętnością 6+ policzy, w które kierunki atakuje rywal, i podpowie ustawienie bloku. 10+ dokładniej, 15+ najdokładniej.'});
  return out;}
// zapamiętanie zastosowanych rad, żeby po meczu je rozliczyć
function preRemember(ev){if(!ev)return;const c=typeof myNext==='function'?myNext():null;if(!c)return;const op=c.h===SAVE.team?c.a:c.h;const P=SAVE.preAp&&SAVE.preAp.op===op&&SAVE.preAp.d===today()?SAVE.preAp:(SAVE.preAp={op,d:today(),it:[]});
  if(!P.it.some(x=>x.k===ev.k))P.it.push(ev);save();}
// po meczu: czy rady zadziałały
function preEvaluate(m){const P=SAVE.preAp;if(!P||!m||!m.sides)return;SAVE.preAp=null;const me=m.sides.findIndex(s=>s.team.idx===SAVE.team);if(me<0)return;const op=m.sides[1-me];if(op.team.idx!==P.op)return;
  const L=[];const ds=m.dirStats||[];
  for(const e of P.it){
    if(e.k==='tgt'){const p=op.pl.find(x=>String(x.id)===String(e.id));if(p&&p.st.rec){const bad=p.st.rec-(p.st.recPos||0);L.push(`Zagrywka w ${p.last}: przyjął ${p.st.rec} zagrywek, ${bad} źle lub z błędem (${Math.round(bad/p.st.rec*100)}%).`);}else if(p)L.push(`Zagrywka w ${p.last}: rywal go schował — prawie nie przyjmował.`);}
    else if(e.k==='blkR'||e.k==='blkL'){const xs=ds.filter(d=>d.i!==me&&d.w===e.w&&(d.d==='cross'||d.d==='line'));if(xs.length){const inD=xs.filter(d=>d.d===e.dir).length;const kills=xs.filter(d=>d.r==='kill').length;const stop=xs.filter(d=>d.r==='blk'||d.r==='dig'||d.r==='wyb').length;
      L.push(`Blok na ${e.w==='L4'?'lewe':'prawe'} skrzydło rywala: ${xs.length} ataków, ${inD} w zamknięty kierunek; skończyli ${kills}, zatrzymaliśmy lub podbiliśmy ${stop}.`);}}
    else if(e.k==='blkM'){const xs=ds.filter(d=>d.i!==me&&/^mid/.test(d.d));if(xs.length){const k=xs.filter(d=>d.r==='kill').length;L.push(`Blok na środek: rywal zaatakował krótką ${xs.length} razy, skończył ${k} (${Math.round(k/xs.length*100)}%).`);}}
    else if(e.k==='serve'){const sv=m.sides[me].pl.reduce((a,p)=>[a[0]+(p.st.ace||0),a[1]+(p.st.srvErr||0),a[2]+(p.st.srv||0)],[0,0,0]);L.push(`Zagrywka: ${sv[0]} asów i ${sv[1]} błędów na ${sv[2]} zagrywek.`);}
    else if(e.k==='distQ'){const xs=ds.filter(d=>d.i===me&&d.d!=='free');const mid=xs.filter(d=>{const P=PLAYERS[d.id];return P&&P.p.pos==='S';});if(mid.length){const k=mid.filter(d=>d.r==='kill').length;L.push(`Gra środkiem: ${mid.length} ataków środkowych, skończonych ${k} (${Math.round(k/mid.length*100)}%).`);}}}
  if(!L.length)return;const from=typeof asyName==='function'?asyName():'Asystent';const won=m.winner===me;
  sendMail({cat:'mecz',from,t:'Rozliczenie odprawy',s:L[0].slice(0,90),b:{type:'text',x:`Jak zadziałały rady z odprawy przed meczem (${won?'wygrana':'porażka'} ${m.sets.filter(s=>s[me]>s[1-me]).length}:${m.sets.filter(s=>s[me]<s[1-me]).length}):\n\n• `+L.join('\n• ')},act:0});}
