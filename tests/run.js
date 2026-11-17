// Testy silnika i sezonu. Uruchom: node tests/run.js [ziarno] [--json]
// Wymaga Playwright i Chrome. Symuluje mecze i pełny sezon, sprawdza progi realizmu.
const path=require('path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/npm-tools/node_modules/playwright'));}
const SEED=+process.argv[2]||4242,JSON_OUT=process.argv.includes('--json');
const FILE='file://'+path.resolve(__dirname,'..','index.html');
// [nazwa, min, max] — w procentach albo liczbach
const LIM={
  'atak skrzydło #':[54,61],'atak pipe #':[56,66],'atak środek #':[58,68],
  'atak skrzydło +':[44,55],'atak skrzydło −':[28,42],
  'przyjęcie idealne':[16,25],'przyjęcie pozytywne':[50,63],
  'asy (% zagrywek)':[4.5,8],'błędy zagrywki (% zagrywek)':[14,22],
  'skuteczność asekuracji po bloku':[25,45],
  'tie-breaki (% meczów)':[12,30],'punkty na set':[40,48],
};
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome'});const pg=await b.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(FILE);await pg.waitForFunction(()=>window.vmReady,null,{timeout:10000});await pg.evaluate(()=>{ui.start=false;});
  const r=await pg.evaluate((seed)=>{
    let a=seed;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    pickTeam(3);SAVE.coach={first:'J',last:'T',exp:'zaw',rep:40,attrs:{tak:12,tre:12,mlo:12,neg:12,mot:12,opa:12,det:12,aut:12},face:'c1',hist:[],trophies:[],seasons:0,dob:'1985-03-03',joined:today()};
    const out={},st={};const add=(k,hit)=>{const o=st[k]||(st[k]={n:0,h:0});o.n++;if(hit)o.h++;};
    // atak wg roli i jakości dogrania
    const orig=attackPhase;attackPhase=function(m,A,q){const L0=(m.dirStats||[]).length;const res=orig.apply(this,arguments);const ds=m.dirStats||[];const e=ds.length>L0?ds[ds.length-1]:null;
      if(e&&e.d!=='free'){const P=PLAYERS[e.id];const role=P&&P.p.pos==='S'?'środek':P&&P.p.pos==='P'&&e.w==='M'?'pipe':'skrzydło';const ql=q>=3?'#':q===2?'+':'−';add('atak '+role+' '+ql,res&&res.done&&res.winner===A);}return res;};
    const ids=lgIds(0).slice(0,8);let srv=0,ace=0,sE=0,rec=0,pos=0,perf=0,sets=0,tb=0,pts=0,matches=0,cov=0,covN=0;
    for(let i=0;i<160;i++){const m=newMatch(participant(ids[i%8],true),participant(ids[(i+3)%8],false));
      while(!m.over){const ev=stepRally(m);if(ev&&ev.seq){for(let k=0;k<ev.seq.length;k++){const s=ev.seq[k];if(s.k==='blk'){const nx=ev.seq[k+1];if(nx&&(nx.k==='floor'||nx.cov)){covN++;if(nx.cov)cov++;}}}}}
      matches++;sets+=m.sets.length;if(m.sets.length===5)tb++;for(const s of m.sets)pts+=s[0]+s[1];
      for(const sd of m.sides)for(const p of sd.pl){const t=p.st;srv+=t.srv||0;ace+=t.ace||0;sE+=t.srvErr||0;rec+=t.rec||0;pos+=t.recPos||0;perf+=t.recPerf||0;}}
    attackPhase=orig;
    for(const k in st){out[k]=+(st[k].h/st[k].n*100).toFixed(1);out['_n '+k]=st[k].n;}
    out['przyjęcie idealne']=+(perf/rec*100).toFixed(1);out['przyjęcie pozytywne']=+(pos/rec*100).toFixed(1);
    out['asy (% zagrywek)']=+(ace/srv*100).toFixed(1);out['błędy zagrywki (% zagrywek)']=+(sE/srv*100).toFixed(1);
    out['skuteczność asekuracji po bloku']=+(cov/Math.max(1,covN)*100).toFixed(1);
    out['tie-breaki (% meczów)']=+(tb/matches*100).toFixed(1);out['punkty na set']=+(pts/sets).toFixed(1);
    // pełny sezon
    const t0=Date.now();let g=0;const sErr=[];
    try{while(g++<500){const s=S();if(s.phase==='end')break;if(SAVE.fired){SAVE.fired=null;SAVE.offers=null;}const c=myNext();
      if(!c){if(s.phase==='po'){simPoAll();continue;}if(s.phase==='spar'){endSpar();if(S().phase==='liga')continue;s.phase='liga';syncDate();continue;}break;}simNext();ui.match=null;ui.view=null;}}catch(e){sErr.push(e.message);}
    const s=S();out._sezon={faza:s.phase,ms:Date.now()-t0,bledy:sErr};
    try{nextSeason();out._nowySezon='ok';}catch(e){out._nowySezon=e.message;}
    return out;},SEED);
  const fails=[];const rows=[];
  for(const k in LIM){const v=r[k],[lo,hi]=LIM[k];const ok=v!=null&&v>=lo&&v<=hi;if(!ok)fails.push(k);rows.push(`${ok?'OK   ':'BŁĄD '} ${k}: ${v}  (cel ${lo}–${hi})`);}
  if(r._sezon.faza!=='end'||r._sezon.bledy.length){fails.push('sezon');rows.push('BŁĄD  sezon: faza '+r._sezon.faza+' '+r._sezon.bledy.join('|'));}else rows.push(`OK    sezon rozegrany (${(r._sezon.ms/1000).toFixed(1)} s)`);
  if(r._nowySezon!=='ok'){fails.push('nowy sezon');rows.push('BŁĄD  przejście do nowego sezonu: '+r._nowySezon);}else rows.push('OK    przejście do nowego sezonu');
  if(errs.length){fails.push('js');rows.push('BŁĄD  błędy JS: '+errs.slice(0,3).join(' | '));}else rows.push('OK    brak błędów JS');
  if(JSON_OUT)console.log(JSON.stringify(r));else console.log(rows.join('\n'));
  console.log(fails.length?`\n${fails.length} niezaliczone`:'\nWszystko zaliczone');
  await b.close();process.exit(fails.length?1:0);
})();
