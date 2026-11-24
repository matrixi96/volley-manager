// ================= EKRAN GŁÓWNY „PORTAL” =================
// 4 kolumny: Skrzynka · Wiadomości + terminarz · Tabela + statystyki zawodników · widżety (rywal, dane, budżety, trening, skauting)
function ptAgo(d){const n=daysBetween(d,today());return n<=0?'dziś':n===1?'wczoraj':n<7?`${n} dni temu`:fmtShort(d);}
function ptCard(title,body,act,cls){return `<div class="card ptc ${cls||''}"><div class="pth"><span>${title}</span>${act?`<button class="link" onclick="${act[1]}">${act[0]} →</button>`:''}</div>${body}</div>`;}
// ---- kolumna 1: skrzynka ----
function ptMail(){const f=ui.ptMf||'all';let xs=mailBox();if(f==='new')xs=xs.filter(m=>!m.r);if(f==='act')xs=xs.filter(m=>m.act);xs=xs.slice(0,14);
  const nNew=mailBox().filter(m=>!m.r).length,nAct=mailBox().filter(m=>m.act).length;let last='';
  const rows=xs.map(m=>{const C=MAIL_CAT[m.cat]||MAIL_CAT.klub;const dh=m.d!==last?`<div class="ptmd">${fmtLong(m.d).replace(/ \d{4}$/,'')}</div>`:'';last=m.d;
    return dh+`<button class="ptm ${m.r?'rd':''}" onclick="ui.mailSel='${m.id}';mailOpen('${m.id}');go('poczta')"><span class="ptmf">${esc(m.from)}</span><span class="ptmc" style="--mc:${C[1]}">${C[0]}</span><span class="ptmt">${m.r?'':'<i class="mdot"></i>'}${esc(m.t)}</span><span class="ptmh">${m.tm||mailTime(m)}</span>${m.act?'<span class="ptma">Wymaga decyzji</span>':''}</button>`;}).join('');
  return ptCard('Skrzynka',`<div class="pttabs"><button class="${f==='all'?'on':''}" onclick="ui.ptMf='all';render()">Wszystkie</button><button class="${f==='new'?'on':''}" onclick="ui.ptMf='new';render()">Nowe (${nNew})</button><button class="${f==='act'?'on':''}" onclick="ui.ptMf='act';render()">Zadania (${nAct})</button></div><div class="ptml">${rows||'<p class="small mut">Brak wiadomości.</p>'}</div>`,['Poczta',"go('poczta')"],'ptmail');}
// ---- kolumna 2: wiadomości (liga, mecze, kadra, social media) ----
function ptFeed(){const out=[];const s=S();
  // ostatni mecz drużyny
  const L=SAVE.lastMatch;if(L&&L.sw){const me=L.h===SAVE.team;const w=(me?L.sw[0]:L.sw[1])>(me?L.sw[1]:L.sw[0]);
    out.push({d:L.d||today(),k:'Mecz',big:1,score:{h:L.h,a:L.a,sw:L.sw},t:`${esc(TEAMS[L.h]?TEAMS[L.h].name:'')} – ${esc(TEAMS[L.a]?TEAMS[L.a].name:'')}`,b:w?'Wygrana — drużyna idzie za ciosem.':'Porażka — trzeba wyciągnąć wnioski.',go:"go('mecz')"});}
  // reprezentacje: ostatnie wyniki turniejów
  if(s&&s.nt)for(const cp of s.nt.comps){const done=cp.gm.concat(cp.ko).filter(x=>x.res&&x.d<=today()).sort((a,b)=>a.d<b.d?1:-1).slice(0,3);
    for(const x of done)out.push({d:x.d,k:'Reprezentacja',nt:{h:x.h,a:x.a,sw:x.res.sw},t:`${cp.n}: ${esc(natN(x.h))} ${x.res.sw.join(':')} ${esc(natN(x.a))}`,go:"ui.sub=ui.sub||{};ui.sub.kadra='k';go('kadra')"});
    if(cp.champ)out.push({d:cp.koD[2],k:'Reprezentacja',ic:'🏅',champ:cp.champ,cn:cp.n,t:`${cp.n}: złoto — ${esc(natN(cp.champ))}`,go:"go('kadra')"});}
  // social media klubu
  try{const S0=SOC();if(S0)for(const p of S0.feed.slice(0,5))out.push({d:p.d,k:'Social media',ic:p.ic||'📣',t:esc(String(p.t).slice(0,120)),b:`❤ ${(p.likes||0).toLocaleString('pl-PL')}`,go:`socOpen(${p.id})`});}catch(e){}
  // wiadomości ligi / klubu
  for(const n of (SAVE.news||[]).slice(0,24)){const t=String(n.t);if(/^🏅\s*(Osiągnięcie|Odblokowano)/.test(t)||/^📞/.test(t)||(/^[✅❌]/.test(t)&&L&&L.d===n.d))continue;// osiągnięcia to nie wiadomości ze świata
    const k=/🎌|kadr|reprezent/i.test(t)?'Reprezentacja':/transfer|podpisał|sprzeda|kupi|wypożycz/i.test(t)?'Transfery':/🚑|kontuz|uraz/i.test(t)?'Medyczne':/zarząd|budżet|finans/i.test(t)?'Klub':'Liga';
    out.push({d:n.d,k,ic:newsIcon(t),t:esc(t.replace(/^\p{Extended_Pictographic}️?\s*/u,'')),go:null});}
  try{if(typeof mdFeed==='function')out.push(...mdFeed());}catch(e){console.error(e);}
  out.sort((a,b)=>(a.d<b.d?1:a.d>b.d?-1:(b.big||0)-(a.big||0)||(b.pr||0)-(a.pr||0)));
  // każda wiadomość (poza konferencjami i postami) otwiera artykuł
  if(typeof aOpen==='function'){FEED_LAST=out;out.forEach((x,i)=>{if(x.k!=='Media'&&x.k!=='Social media')x.go=`aOpen(${i})`;});}
  const big=out.find(x=>x.big||x.nt)||out[0];const rest=out.filter(x=>x!==big).slice(0,9);
  const tag=k=>`<span class="ptk ptk-${({Mecz:'m',Reprezentacja:'r','Social media':'s',Transfery:'t',Medyczne:'x',Klub:'k',Liga:'l',Media:'md'})[k]||'l'}">${k}</span>`;
  let hero='';if(big){const sc=big.score?`<div class="pthero-sc">${teamCrest(big.score.h,54)}<b>${big.score.sw[0]} – ${big.score.sw[1]}</b>${teamCrest(big.score.a,54)}</div>`:big.nt?`<div class="pthero-sc"><span class="ptfl">${natFl(big.nt.h)}</span><b>${big.nt.sw[0]} – ${big.nt.sw[1]}</b><span class="ptfl">${natFl(big.nt.a)}</span></div>`:`<div class="pthero-sc"><span class="ptfl">${big.ic||'📰'}</span></div>`;
    hero=`<button class="pthero" ${big.go?`onclick="${big.go}"`:''}>${sc}<div class="pthero-t">${big.t}</div>${big.b?`<div class="small mut">${big.b}</div>`:''}<div class="ptmeta">🕑 ${ptAgo(big.d)} ${tag(big.k)}</div></button>`;}
  const list=rest.map(x=>`<button class="ptn" ${x.go?`onclick="${x.go}"`:''}><span class="ptni">${x.nt?natFl(x.nt.h):x.ic||'📰'}</span><span><span class="ptnt">${x.t}</span><span class="ptmeta">🕑 ${ptAgo(x.d)} ${tag(x.k)}${x.b?` · ${x.b}`:''}</span></span></button>`).join('');
  return ptCard('Wiadomości ze świata',hero+`<div class="ptnl">${list}</div>`,null,'ptfeed');}
function ptFix(){const ev=myEvents();const rows=[];for(const d of Object.keys(ev).sort())for(const e of ev[d])rows.push({d,...e});
  const td=today();const pi=rows.findIndex(r=>!r.r);const from=Math.max(0,(pi<0?rows.length:pi)-3);const sl=rows.slice(from,from+12);
  const kind=e=>e.kind==='spar'?'Sparing':e.kind==='liga'?LG_SHORT[myLg()]:e.kind==='cup'?'Puchar':e.kind==='euro'?'Europa':e.kind==='po'?'Play-off':'';
  const res=e=>{if(!e.r)return `<span class="mut">${e.t||'–'}</span>`;const my=e.r.h===SAVE.team?e.r.sw[0]:e.r.sw[1],op=e.r.h===SAVE.team?e.r.sw[1]:e.r.sw[0];return `<span class="ptres ${my>op?'w':'l'}"><i></i>${my}:${op}</span>`;};
  return ptCard('Terminarz meczów',`<table class="pttb"><tr><th class="l">Data</th><th class="l">Rywal</th><th>Miejsce</th><th>Wynik</th><th>Rozgrywki</th></tr>${sl.map(e=>`<tr class="${e.d===td?'today':''}"><td class="l">${fmtShort(e.d)}</td><td class="l"><button class="link tlk" onclick="openTeam(${e.op})">${teamCrest(e.op,16)} ${esc(TEAMS[e.op].name)}</button></td><td>${e.home?'D':'W'}</td><td>${res(e)}</td><td class="mut">${kind(e)}</td></tr>`).join('')||'<tr><td colspan="5" class="mut">Brak meczów.</td></tr>'}</table>`,['Terminarz',"go('kalendarz')"]);}
// ---- kolumna 3: tabela + statystyki ----
function ptTable(){const s=S();const live=s.phase==='liga'||s.phase==='po'||s.phase==='end';const tb=live?leagueTable():lgTeams(myLg()).map(t=>({i:t.idx,m:0,w:0,l:0,pts:0,sw:0,sl:0})).sort((a,b)=>teamStrength(TEAMS[b.i])-teamStrength(TEAMS[a.i]));
  // zmiana pozycji względem poprzedniej kolejki
  let prev={};if(live&&s.results&&s.results.length>1){try{tableFrom(s.results.slice(0,-1)).forEach((x,k)=>prev[x.i]=k);}catch(e){}}
  const n=tb.length;const arrow=(i,k)=>prev[i]==null?'<i class="ptar">–</i>':prev[i]>k?'<i class="ptar up">▲</i>':prev[i]<k?'<i class="ptar dn">▼</i>':'<i class="ptar">–</i>';
  const zone=k=>k<2?'z1':k<8?'z2':k>=n-1?'z4':'';
  return ptCard(`Tabela · ${LG_N[myLg()]}`,`<table class="pttb ptlg"><tr><th>#</th><th></th><th class="l">Drużyna</th><th>M</th><th>Z</th><th>P</th><th>Sety</th><th>Pkt</th></tr>${tb.map((x,k)=>`<tr class="${x.i===SAVE.team?'me':''}"><td class="${zone(k)}">${k+1}</td><td>${live?arrow(x.i,k):''}</td><td class="l"><button class="link tlk" onclick="openTeam(${x.i})">${teamCrest(x.i,16)} ${esc(TEAMS[x.i].name)}</button></td><td>${x.m||0}</td><td>${x.w||0}</td><td>${x.l||0}</td><td class="mut">${live?`${x.sw}:${x.sl}`:'–'}</td><td><b>${live?x.pts:teamStrength(TEAMS[x.i])}</b></td></tr>`).join('')}</table>${live?'':'<p class="small mut">Przed sezonem: kolejność według siły składu.</p>'}`,['Pełna tabela',"go('tabela')"]);}
function ptLeaders(){let L;try{L=leaders();}catch(e){return '';}const P=id=>PLAYERS[id]&&PLAYERS[id].p;
  const rows=[['Najwięcej punktów',L.pts,''],['Najlepszy atak',L.eff,'%'],['Najwięcej asów',L.ace,''],['Najwięcej bloków',L.blk,''],['Najlepsze przyjęcie',L.rec,'%'],['Najwięcej obron',L.dig,''],['Najwięcej MVP',L.mvp,'']].filter(r=>r[1]&&r[1].length);
  if(!rows.length)return ptCard('Statystyki zawodników','<p class="small mut">Statystyki pojawią się po pierwszych kolejkach ligi.</p>',['Wszystkie',"go('staty')"]);
  return ptCard('Statystyki zawodników',rows.map(([lab,arr,u])=>{const x=arr[0];const p=P(x.id);if(!p)return '';return `<button class="ptst" onclick="openPop('${p.id}')"><span class="ptstl">${lab}</span><span class="ptstv">${x.v}${u}</span><span class="ptstp">${pFace(p,22)} ${esc(p.first?p.first[0]+'. ':'')}${esc(p.last)} <small class="mut">${p.tm>=0?esc(TEAMS[p.tm].short):''}</small></span></button>`;}).join(''),['Wszystkie',"go('staty')"]);}
// ---- kolumna 4: widżety ----
function ptRival(){const c=myNext();if(!c||c.h==null)return '';const op=c.h===SAVE.team?c.a:c.h;if(op==null||op<0||!TEAMS[op])return '';const T=TEAMS[op];const s=S();
  let pos='';if(s.phase==='liga'||s.phase==='po'||s.phase==='end'){const k=leagueTable().findIndex(x=>x.i===op);if(k>=0)pos=`${LG_N[lgOf(op)]}: ${k+1}. miejsce`;}
  const f=teamForm(op);let st={};try{st=aiStyle(T,autoLineup(T))||{};}catch(e){}
  const dd=daysBetween(today(),c.d||today());
  return ptCard('Raport o następnym rywalu',`<div class="ptriv">${teamCrest(op,40)}<div><b>${esc(T.name)}</b> <span class="mut small">(${c.h===SAVE.team?'D':'W'})${dd>0?` · za ${dd} dni`:dd===0?' · dziś':''}</span><div class="small mut">${pos||`siła składu ${teamStrength(T)}`}</div></div></div>
   <div class="ptrow"><span class="mut small">Forma</span><span class="hvf">${f.map(w=>`<i class="${w?'w':'l'}">${w?'W':'P'}</i>`).join('')||'<span class="small mut">brak meczów</span>'}</span></div>
   <div class="ptrow"><span class="mut small">Styl gry</span><b class="small">${st.serve===2?'mocna zagrywka':st.serve===0?'bezpieczna zagrywka':'zagrywka zrównoważona'}${st.dist!=null?` · ${['rozegranie szybkie','rozegranie zrównoważone','gra przez skrzydła'][st.dist]||''}`:''}</b></div>`,['Analiza',"go('home');setTimeout(()=>{const e=document.querySelector('.hvriv');if(e)e.scrollIntoView({behavior:'smooth'});},50)"]);}
function ptData(){const s=S();let txt='Dane pojawią się po pierwszych meczach.',tone='';try{const ts=s.ts||{};const my=ts[SAVE.team];if(my&&my.att>0){const ids=curIds();let A=0,K=0,Rc=0,RP=0;for(const i of ids){const x=ts[i];if(!x)continue;A+=x.att;K+=x.kill;Rc+=x.rec;RP+=x.recPos;}
    const myA=my.kill/my.att*100,lgA=K/Math.max(1,A)*100,myR=my.recPos/Math.max(1,my.rec)*100,lgR=RP/Math.max(1,Rc)*100;const dA=myA-lgA,dR=myR-lgR;
    tone=dA+dR>3?'good':dA+dR<-3?'bad':'';txt=`Skuteczność ataku <b>${myA.toFixed(1)}%</b> (liga ${lgA.toFixed(1)}%) · przyjęcie <b>${myR.toFixed(0)}%</b> (liga ${lgR.toFixed(0)}%). ${dA+dR>3?'Gramy wyraźnie powyżej średniej ligi.':dA+dR<-3?'Odstajemy od średniej ligi — warto poprawić atak lub przyjęcie.':'Jesteśmy w okolicach średniej ligi.'}`;}}catch(e){}
  return ptCard('Centrum danych',`<div class="ptdata ${tone}">${tone==='good'?'<span class="ptpill good">Spisuje się bardzo dobrze</span>':tone==='bad'?'<span class="ptpill bad">Poniżej oczekiwań</span>':''}<p class="small">${txt}</p></div>`,['Więcej',"go('dane')"]);}
function ptBudgets(){const b=BUD();if(!b)return '';const L=budLeft();const trTot=b.tr+(b.trAdd||0)+(b.extra||0);const wgM=Math.round(b.wg/12),useM=Math.round(wageBill()/12);
  const bar=(u,t)=>`<div class="ptbar"><i style="width:${Math.min(100,Math.round(u/Math.max(1,t)*100))}%"></i></div>`;
  return ptCard('Budżet transferowy',`<div class="ptbig ${L.tr<0?'bad':''}">${fmt(Math.max(0,L.tr))}</div><div class="small mut">wydane w tym sezonie ${fmt(b.trUsed)} z ${fmt(trTot)}</div>${bar(b.trUsed,trTot)}`,['Transfery',"go('transfery')"])
    +ptCard('Budżet płacowy',`<div class="ptbig ${useM>wgM?'bad':''}">${fmt(Math.max(0,wgM-useM))}<small> / mies.</small></div><div class="small mut">pensje ${fmt(useM)} z ${fmt(wgM)} miesięcznie</div>${bar(useM,wgM)}`,['Finanse',"go('finanse')"]);}
function ptTraining(){let md,days=[];try{md=matchDays();const d0=today();for(let i=0;i<7;i++){const d=addDays(d0,i);days.push({d,p:dayPlan(d,md),m:md.has(d)});}}catch(e){return '';}
  const ic=u=>u&&TR_UNITS[u]?(TR_UNITS[u].ic||TR_UNITS[u].n.slice(0,2)):'·';
  return ptCard('Trening',`<div class="pttr">${days.map(x=>`<div class="${x.m?'m':''} ${x.d===today()?'td':''}"><span>${DOW_S[new Date(x.d+'T12:00:00Z').getUTCDay()]}</span>${(x.p||[]).slice(0,3).map(u=>`<i title="${u&&TR_UNITS[u]?esc(TR_UNITS[u].n):'—'}">${ic(u)}</i>`).join('')}</div>`).join('')}</div>`,['Trening',"go('trening')"]);}
function ptScout(){let n=0,tasks=0;try{n=SC().short.length;tasks=SC().tasks.length;}catch(e){}
  return ptCard('Baza danych zawodników',`<div class="ptrow"><span>🌍 <b>${W().players.length.toLocaleString('pl-PL')}</b> <span class="small mut">zawodników w bazie</span></span></div><div class="ptrow"><span><b>${n}</b> <span class="small mut">obserwowanych · ${tasks} zadań skautów</span></span></div>`,['Skauting',"go('skauting')"]);}
homeView=function(){const s=S();if(!s)return '';
  return `${ui.msg?`<div class="card msg">${ui.msg}</div>`:''}${hvHero()}
   <div class="ptgrid"><div class="ptcol">${ptMail()}</div><div class="ptcol">${ptFeed()}${ptFix()}</div><div class="ptcol">${ptTable()}${ptLeaders()}</div><div class="ptcol">${ptRival()}${ptData()}${ptBudgets()}${ptTraining()}${ptScout()}</div></div>
   ${typeof hvRival==='function'?hvRival():''}`;};

// ================= PROFIL DRUŻYNY (po kliknięciu klubu) =================
function tvGames(i){const s=S();const out=[];const sameL=lgOf(i)===myLg();
  (s.results||[]).forEach((rd,k)=>{for(const g of rd)if(g.h===i||g.a===i)out.push({d:s.rdates?s.rdates[k]:null,h:g.h,a:g.a,sw:g.sw,c:LG_SHORT[lgOf(i)]});});
  if(sameL&&s.rounds){for(let k=s.round||0;k<s.rounds.length;k++){const f=s.rounds[k].find(f=>f[0]===i||f[1]===i);if(f&&!(s.results&&s.results[k]))out.push({d:s.rdates?s.rdates[k]:null,h:f[0],a:f[1],sw:null,c:LG_SHORT[lgOf(i)]});}}
  return out;}
function tvTitles(i){const H=HIST();let lg=0,cup=0,cl=0;for(const r of H.seasons){for(const k in r.lg)if(r.lg[k]&&r.lg[k][0]===i)lg++;for(const k in r.cup)if(r.cup[k]===i)cup++;if(r.cl===i||r.cev===i)cl++;}return {lg,cup,cl};}
teamModal=function(){const i=ui.teamPop;const t=TEAMS[i];if(!t){ui.teamPop=null;return '';}const s=S();const tl=lgOf(i),sameL=tl===myLg();const ai=SAVE.ai[i]||{};const inf=infraOf(i);
  const lu=autoLineup(t);const st7=LINEUP_KEYS.map(([k,l,ps])=>({k,p:t.players.find(p=>p.id===lu[k]),ps}));const live=s.phase==='liga'||s.phase==='po'||s.phase==='end';
  const oL=!sameL&&s.oth?s.oth[tl]:null;const tb=live?(sameL?leagueTable():oL&&oL.results.length?bgTable(oL):null):null;const pos=tb?tb.findIndex(x=>x.i===i)+1:0;
  const K=typeof teamKit==='function'?teamKit(i):null;const G=tvGames(i);const played=G.filter(g=>g.sw),next=G.filter(g=>!g.sw);const last=played[played.length-1],nx=next[0];
  const ps=t.players.filter(p=>!p.jr);const best=ps.slice().sort((a,b)=>rating(b)-rating(a))[0];const talent=ps.filter(p=>p.age<=22).sort((a,b)=>(b.pot||0)-(a.pot||0)||rating(b)-rating(a))[0];
  const cap=autoCaptain(st7.map(x=>x.p));const S0=s.ps||{};const stOf=p=>S0[p.id]||{};const topPts=ps.slice().sort((a,b)=>(stOf(b).pts||0)-(stOf(a).pts||0))[0];const topAce=ps.slice().sort((a,b)=>(stOf(b).ace||0)-(stOf(a).ace||0))[0];
  const T=tvTitles(i);const status=tl===0?'Zawodowy':tl===1?'Półzawodowy':'Amatorski';const nat=LG_C[tl];
  const vs=g=>{const op=g.h===i?g.a:g.h;return `${teamCrest(op,16)} ${esc(TEAMS[op]?TEAMS[op].short:'?')}`;};
  const resB=g=>{const w=(g.h===i)===(g.sw[0]>g.sw[1]);return `<span class="ptres ${w?'w':'l'}"><i></i>${g.h===i?g.sw.join(':'):g.sw[1]+':'+g.sw[0]}</span>`;};
  const head=`<div class="tvhead" style="--tc:${t.color}">${teamCrest(i,72)}<div class="tvname"><h2>${esc(t.name)}</h2><div class="small">${natFl(nat)} ${esc(natN(nat))} · ${esc(t.city||'')}</div></div>
    ${K?`<div class="tvkits">${['h','w','l'].map(k=>kitSvg(K[k],k==='l'?1:7,46)).join('')}</div>`:''}<span class="sp"></span>
    <div class="tvst"><small>Forma</small>${formDots(i)}</div><div class="tvst"><small>Status</small><b>${status}</b></div><div class="tvst"><small>Hala</small><b>${HALA_CAP[inf.hala-1].toLocaleString('pl-PL')} miejsc</b></div><div class="tvst"><small>Renoma</small><b>${ai.rep!=null?ai.rep:'—'}/100</b></div><div class="tvst"><small>Siła składu</small><b>${teamStrength(t)}</b></div>
    <button class="ghost tvx" onclick="ui.teamPop=null;render()">✕</button></div>
   <div class="tvrow2"><div><small>Pozycja w lidze</small><b>${pos?pos+'.':'—'}</b><span class="small">${esc(LG_N[tl])}</span></div>
    <div><small>Ostatni wynik</small>${last?`<b>${vs(last)} ${resB(last)}</b>`:'<b>—</b>'}</div><div><small>Następny mecz</small>${nx?`<b>${vs(nx)}</b><span class="small">${nx.d?fmtShort(nx.d):''} · ${nx.h===i?'D':'W'}</span>`:'<b>—</b>'}</div>
    <div><small>Najwięcej punktów</small>${topPts&&stOf(topPts).pts?`<b>${esc(topPts.last)}</b><span class="small">${stOf(topPts).pts} pkt</span>`:'<b>—</b>'}</div><div><small>Najwięcej asów</small>${topAce&&stOf(topAce).ace?`<b>${esc(topAce.last)}</b><span class="small">${stOf(topAce).ace} asów</span>`:'<b>—</b>'}</div><div><small>Najwyższa ocena</small>${best?`<b>${esc(best.last)}</b><span class="small">${rating(best)}</span>`:'<b>—</b>'}</div></div>`;
  const mt=G.slice(Math.max(0,played.length-5),played.length+5);
  const c1=`<div class="card ptc"><div class="pth">Mecze</div><table class="pttb">${mt.map(g=>`<tr><td class="l mut">${g.d?fmtShort(g.d):''}</td><td class="mut">${g.c}</td><td class="l">${vs(g)}</td><td>${g.h===i?'D':'W'}</td><td>${g.sw?resB(g):'–'}</td></tr>`).join('')||'<tr><td class="mut">Brak meczów w tym sezonie.</td></tr>'}</table></div>`;
  const kp=[['Kapitan',cap],['Gwiazda',best],['Talent',talent],['Najlepszy punktujący',topPts&&stOf(topPts).pts?topPts:null]].filter(x=>x[1]);
  const c2=`<div class="card ptc"><div class="pth">Kluczowe postacie</div>${kp.map(([l,p])=>`<button class="tvkp" onclick="openPop('${p.id}')">${pFace(p,34)}<span><b>${esc(p.first)} ${esc(p.last)}</b><small>${natFl(pNat(p))} ${esc(natN(pNat(p)))} · ${POS_SHORT[p.pos]} · ${rating(p)}</small></span><em>${l}</em></button>`).join('')}
    <div class="pth" style="margin-top:12px">Historia</div><div class="ptrow"><span>🏆 Mistrzostwa kraju</span><b>${T.lg}</b></div><div class="ptrow"><span>🥇 Puchary kraju</span><b>${T.cup}</b></div><div class="ptrow"><span>🌍 Puchary europejskie</span><b>${T.cl}</b></div><div class="small mut">Liczone od początku Twojej kariery.</div></div>`;
  const stars=L=>'★'.repeat(L)+'<span class="mut">'+'★'.repeat(Math.max(0,5-L))+'</span>';
  const fac=[['Hala sportowa','hala'],['Centrum treningowe','tren'],['Akademia','akad'],['Centrum medyczne','med'],['Odnowa','odn'],['Loża VIP','vip'],['Sklep kibica','sklep']].filter(([,k])=>inf[k]!=null);
  const c3=`<div class="card ptc"><div class="pth">Stan finansów</div><div class="ptrow"><span>Budżet sezonu (szac.)</span><b>${i===SAVE.team&&BUD()?fmt(BUD().pool):ai.bud?fmt(ai.bud):'—'}</b></div>${i===SAVE.team?`<div class="ptrow"><span>Saldo</span><b>${fmt(SAVE.fin.bal)}</b></div>`:''}<div class="ptrow"><span>Pensje zawodników (rocznie)</span><b>${fmt(t.players.reduce((a,p)=>a+(p.wage||0),0))}</b></div>
    <div class="pth" style="margin-top:12px">Obiekty</div>${fac.map(([n,k])=>`<div class="ptrow"><span>${n}</span><span class="tvstars">${stars(inf[k]||0)}</span></div>`).join('')}</div>`;
  const sq=ps.slice().sort((a,b)=>({R:0,A:1,P:2,S:3,L:4})[a.pos]-({R:0,A:1,P:2,S:3,L:4})[b.pos]||rating(b)-rating(a));const onLu=new Set(Object.values(lu));
  const c4=`<div class="card ptc"><div class="pth">Pierwszy zespół <span class="small mut" style="text-transform:none;margin-left:auto">${sq.length} zawodników</span></div><table class="pttb"><tr><th></th><th class="l">Zawodnik</th><th>Poz.</th><th>Wiek</th><th>Ocena</th></tr>${sq.map(p=>`<tr class="clk" onclick="openPop('${p.id}')"><td>${onLu.has(p.id)?'<span class="tvlu">6</span>':''}</td><td class="l"><span class="tvpn">${pFace(p,22)} ${esc(p.last)} ${natTag(p)}${p.inj?' 🚑':''}</span></td><td>${pTag(p.pos)}</td><td>${p.age}</td><td><b>${rating(p)}</b></td></tr>`).join('')}</table></div>`;
  const trs=(SAVE.trh||[]).filter(x=>x.o===i||(x.n&&false)).slice(0,8);
  const c5=`<div class="card ptc"><div class="pth">Podstawowy skład</div><div class="totr tvtotr">${st7.filter(x=>x.p).map(({p,ps})=>`<div onclick="openPop('${p.id}')">${pFace(p,40)}<b>${esc(p.last)}</b><small>${pTag(ps)} · ${rating(p,ps)}</small></div>`).join('')}</div>
    ${trs.length?`<div class="pth" style="margin-top:12px">Transfery z Twoim klubem</div>${trs.map(x=>`<div class="ptrow"><span>${x.inn?'➡️ do nas':'⬅️ od nas'}: <b>${esc(x.nm)}</b></span><span class="mut small">${fmtShort(x.d)} · ${x.fee?fmt(x.fee):'—'}</span></div>`).join('')}`:''}</div>`;
  return `<div class="modal tvmodal" onclick="if(event.target===this){ui.teamPop=null;render()}"><div class="tvcard">${head}<div class="tvgrid"><div>${c1}${c5}</div><div>${c2}</div><div>${c3}</div><div>${c4}</div></div></div></div>`;};
