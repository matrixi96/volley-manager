// ===== Nowe charaktery + dynamika zespołu, zadowolenie, hierarchia =====
Object.assign(TRAITS,{
  loj:['Lojalny','#60a5fa','Przywiązany do klubu: przy przedłużaniu kontraktu chce ok. 8% mniej, wolniej traci humor na ławce, a po kilku sezonach w klubie podnosi zgranie.','Loj.'],
  sta:['Stanowczy','#f43f5e','Twardy w rozmowach (ok. 5% wyższe żądania), ma posłuch w szatni. Na boisku koledzy wolniej tracą pewność siebie po błędach.','Stan.'],
  odp:['Odporny','#84cc16','Rzadziej łapie kontuzje (−35%), szybciej się regeneruje i mniej traci pewność siebie po własnych błędach.','Odp.'],
  oby:['Przykładny obywatel','#14b8a6','Wzór poza boiskiem: żadnych wpadek w sieci, uspokaja szatnię i podnosi zadowolenie innych. Lubiany przez sponsorów.','Wzór'],
  suk:['Żądny sukcesu','#eab308','Gra lepiej w wielkich meczach (play-off, puchary, Europa). Traci zadowolenie, gdy drużyna gra poniżej jego ambicji.','Głodny'],
  wer:['Pełen werwy','#fb923c','Mniej się męczy w meczu i po nim, a jego punkty mocniej nakręcają drużynę.','Werwa']});
Object.assign(TR_BAD,{oby:['kap','ind'],kap:(TR_BAD.kap||[]).concat(['oby','loj']),ind:(TR_BAD.ind||[]).concat(['oby']),loj:['kap'],sta:['ner'],ner:(TR_BAD.ner||[]).concat(['sta','odp']),odp:['ner'],suk:['len'],len:(TR_BAD.len||[]).concat(['suk','wer']),wer:['len']});
Object.assign(TR_VAL,{loj:0.3,sta:0.3,odp:1,oby:0.8,suk:0.5,wer:0.8});
// nowi zawodnicy losują też nowe cechy; starzy (z zapisów) dostają je z pewną szansą, deterministycznie
const NEW_TR=['loj','sta','odp','oby','suk','wer'];
function trNewRoll(p){let h=11;for(const c of String(p.id))h=(h*131+c.charCodeAt(0))>>>0;const rnd=mulberry32(h);if(rnd()>0.42)return;
  const w={loj:1.2+(p.age>=29?0.8:0),sta:1+((p.kom||10)-10)*0.2,odp:1+((p.kon||10)-10)*0.15,oby:1,suk:1+((p.wal||10)-10)*0.2,wer:1+(p.age<25?0.6:0)};
  const ks=NEW_TR.filter(k=>!p.tr.includes(k)&&!p.tr.some(e=>(TR_BAD[e]||[]).includes(k)||(TR_BAD[k]||[]).includes(e)));if(!ks.length)return;
  let tot=ks.reduce((s,k)=>s+Math.max(0.2,w[k]),0),r=rnd()*tot;let pick=ks[0];for(const k of ks){r-=Math.max(0.2,w[k]);if(r<=0){pick=k;break;}}
  if(p.tr.length>=2)p.tr[1]=pick;else p.tr.push(pick);}
const _ensTraits=ensTraits;ensTraits=function(p){if(!p||p.tr)return p;_ensTraits(p);trNewRoll(p);p.trV=2;return p;};
function jnInit(){if(!SAVE.world||SAVE.jnV||!S())return;let h=7;for(const p of W().players){if(p.jn==null&&p.tm>=0){h=(h*1103515245+12345)>>>0;p.jn=S().n-(h%5);}}SAVE.jnV=1;}
function trMigrate(){jnInit();if(!SAVE.world||SAVE.trV>=2)return;for(const p of W().players){if(!p.tr)ensTraits(p);else if(!p.trV){trNewRoll(p);p.trV=2;}}SAVE.trV=2;}
// ---- zadowolenie zawodnika (0–100) z powodami ----
function pSat(p,t){t=t||TEAMS[p.tm];const r=[];let s=50+((p.mor==null?60:p.mor)-60)*0.5;r.push(['Morale',Math.round(((p.mor==null?60:p.mor)-60)*0.5)]);
  const lu=t.idx===SAVE.team?myLineup():autoLineup(t);const st=Object.values(lu).includes(p.id);const exp=hRank(p,t)<=7;
  let pt=st?6:exp?-10:0;if((p.unh||0)>=3)pt-=8*(hasT(p,'loj')?0.5:1);if(hasT(p,'amb')&&!st)pt-=4;r.push(['Czas gry',pt]);s+=pt;
  const fair=wageDemand(p);let wg=p.wage&&fair?clamp((p.wage/fair-1)*30,-15,10):0;r.push(['Pensja',Math.round(wg)]);s+=wg;
  let amb=0;if(hasT(p,'suk')||hasT(p,'amb')){const tb=t.idx===SAVE.team&&S()&&S().results&&S().results.length?leagueTable().map(x=>x.i):lgIds(lgOf(t.idx));const pos=tb.indexOf(t.idx)+1;const n=tb.length||12;
    if(pos>n/2)amb=hasT(p,'suk')?-12:-6;else if(pos<=2)amb=6;r.push(['Ambicje vs wyniki',amb]);s+=amb;}
  const yrs=S()?S().n-(p.jn||S().n):0;if(hasT(p,'loj')&&yrs>=2){s+=6;r.push(['Przywiązanie do klubu',6]);}
  if(p.ce!=null&&S()&&p.ce<=S().n&&!hasT(p,'loj')){s-=5;r.push(['Kończący się kontrakt',-5]);}
  if(t.players.some(x=>x!==p&&hasT(x,'oby'))){s+=3;r.push(['Wzór w szatni',3]);}
  return {v:Math.round(clamp(s,0,100)),r};}
// ---- hierarchia: wpływ w szatni ----
function hScore(p,t){const yrs=S()?Math.max(0,S().n-(p.jn||S().n)):0;let v=rating(p)*0.6+Math.min(p.age,34)*0.6+yrs*3;if(hasT(p,'lid'))v+=10;if(hasT(p,'sta'))v+=6;if(hasT(p,'oby'))v+=3;if(hasT(p,'kap')||hasT(p,'len'))v-=4;
  if(t.idx===SAVE.team&&SAVE.captain===p.id)v+=8;return v;}
function hRank(p,t){const L=t.players.filter(x=>!x.jr).slice().sort((a,b)=>hScore(b,t)-hScore(a,t));return L.indexOf(p)+1;}
const H_TIER=[['Lider szatni','👑',1],['Ważny gracz','⭐',4],['Zawodnik','🏐',10],['Margines / nowy','🔸',99]];
function hTier(p,t){const k=hRank(p,t);return H_TIER.find(x=>k<=x[2]);}
// ---- dynamika zespołu (0–100) i jej wpływ na mecze ----
function teamDyn(t){jnInit();t=t||myTeam();const P=t.players.filter(p=>!p.jr);if(!P.length)return {v:50,f:[]};const f=[];
  const w=P.map(p=>({p,s:pSat(p,t).v,w:hRank(p,t)<=4?2:1}));const sat=w.reduce((s,x)=>s+x.s*x.w,0)/w.reduce((s,x)=>s+x.w,0);f.push(['Zadowolenie (ważniejsi liczą się bardziej)',Math.round(sat-50)]);
  const lead=P.filter(p=>hasT(p,'lid')||hasT(p,'sta')).length;const lv=lead===0?-8:lead<=2?6:2;f.push([lead?`Liderzy w szatni (${lead})`:'Brak lidera w szatni',lv]);
  const bad=P.filter(p=>(hasT(p,'kap')||hasT(p,'ind'))&&pSat(p,t).v<45).length;if(bad)f.push([`Niezadowoleni trudni zawodnicy (${bad})`,-6*bad]);
  const ob=P.filter(p=>hasT(p,'oby')).length;if(ob)f.push([`Przykładni obywatele (${ob})`,Math.min(6,ob*2)]);
  const yrs=P.map(p=>S()?S().n-(p.jn||S().n):0);const stab=yrs.filter(y=>y>=2).length/P.length;f.push(['Stabilność składu',Math.round((stab-0.4)*20)]);
  const lo=P.filter(p=>hasT(p,'loj')&&(S()?S().n-(p.jn||S().n):0)>=3).length;if(lo)f.push([`Lojalni weterani klubu (${lo})`,Math.min(5,lo*2)]);
  const v=Math.round(clamp(50+f.reduce((s,x)=>s+x[1],0),0,100));return {v,f};}
function dynBonus(ti){try{const t=TEAMS[ti];if(!t||ti!==SAVE.team)return 0;const d=teamDyn(t).v;return (d-50)/50*0.008;}catch(e){return 0;}}
// ---- widok w zakładce Skład ----
function dynView(){const t=myTeam();const D=teamDyn(t);const P=t.players.filter(p=>!p.jr).slice().sort((a,b)=>hRank(a,t)-hRank(b,t));
  const col=v=>v>=70?'good':v<45?'bad':'';
  return `<div class="card"><div class="row wrap"><h2 style="margin:0">Dynamika zespołu</h2><span class="sp"></span><b class="dynv ${col(D.v)}">${D.v}/100</b></div>
   <div class="bbar big"><i class="${D.v<45?'over':D.v<60?'warn':''}" style="width:${D.v}%"></i></div>
   <p class="small mut">Dobra dynamika daje drużynie w meczach do ok. +0,8% skuteczności, zła — tyle samo odbiera. Liczy się zadowolenie (zdanie liderów waży podwójnie), liderzy, trudne charaktery i stabilność składu.</p>
   <div class="dynf">${D.f.map(([n,v])=>`<div><span>${n}</span><b class="${v>0?'good':v<0?'bad':''}">${v>0?'+':''}${v}</b></div>`).join('')}</div></div>
   <div class="card"><h2>Hierarchia i zadowolenie</h2><table class="tbl"><thead><tr><th class="l">Zawodnik</th><th class="l">Pozycja w szatni</th><th class="l">Charakter</th><th>Zadowolenie</th><th class="l">Co wpływa</th></tr></thead><tbody>
   ${P.map(p=>{const tr=hTier(p,t),S0=pSat(p,t);return `<tr><td class="l"><button class="link pn" onclick="openPop('${p.id}')">${esc(p.first)} <b>${esc(p.last)}</b></button> ${natTag(p)}</td><td class="l">${tr[1]} ${tr[0]}</td>
     <td class="l small">${(p.tr||[]).map(k=>`<span class="trt" style="--c:${TRAITS[k][1]}" title="${esc(TRAITS[k][2])}">${TRAITS[k][0]}</span>`).join(' ')}</td>
     <td><b class="${col(S0.v)}">${S0.v}</b> ${S0.v>=70?'😀':S0.v>=50?'🙂':S0.v>=35?'😐':'😠'}</td><td class="l small mut">${S0.r.filter(x=>x[1]).map(([n,v])=>`${n} <span class="${v>0?'good':'bad'}">${v>0?'+':''}${v}</span>`).join(' · ')}</td></tr>`;}).join('')}
   </tbody></table><p class="small mut">👑 Lider szatni i ⭐ ważni gracze mają największy wpływ na atmosferę: o ich zadowolenie warto dbać najbardziej. Hierarchię budują umiejętności, wiek, staż w klubie, charakter (lider, stanowczy) i opaska kapitana.</p></div>`;}
