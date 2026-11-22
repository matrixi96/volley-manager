// ================= SPARINGI: własny terminarz, zaproszenia, asystent =================
// s.spar.opps[k], s.sdates[k], s.spar.hm[k] (true = u siebie) — rozegrane sparingi to początek list (s.spar.res[k]).
// Nierozegrane można odwołać, nowe dodaje się przez zaproszenie (odpowiedź po 1–2 dniach) — dowolnie wiele, do 2 dni przed ligą.
function nSpar(){const s=S();return s&&s.spar&&s.spar.opps?s.spar.opps.length:N_SPAR;}
function sparHome(k){const s=S();const h=s&&s.spar&&s.spar.hm;return h&&h[k]!=null?h[k]:k%2===0;}
function sparHm(){const s=S();if(!s.spar.hm)s.spar.hm=s.spar.opps.map((o,k)=>k%2===0);return s.spar.hm;}
function sparLast(){const s=S();ensureDates(s);return addDays(s.rdates[0],-2);}
function sparFirst(){const s=S();const t=addDays(today(),1);const lp=s.spar.res.length?s.sdates[s.spar.res.length-1]:null;return lp&&lp>=t?addDays(lp,1):t;}
function sparCanPlan(){const s=S();return !!s&&(s.phase==='off'||s.phase==='spar');}
function sparTaken(d){const s=S();if(s.sdates.slice(0,nSpar()).includes(d))return 'sparing';if((s.spar.inv||[]).some(x=>x.d===d&&x.st==='wait'))return 'zaproszenie';
  try{if(typeof extraNext==='function'){const e=extraNext(d);if(e&&e.d===d)return 'mecz';}}catch(e){}return null;}
function sparFreeDays(){const out=[];const a=sparFirst(),b=sparLast();if(a>b)return out;let d=a;while(d<=b&&out.length<80){if(!sparTaken(d))out.push(d);d=addDays(d,1);}return out;}
// wstaw sparing w kolejności dat (tylko za już rozegranymi)
function sparInsert(op,d,home){const s=S();sparHm();const k0=s.spar.res.length;let k=k0;while(k<s.spar.opps.length&&s.sdates[k]<=d)k++;s.spar.opps.splice(k,0,op);s.sdates.splice(k,0,d);s.spar.hm.splice(k,0,!!home);}
function sparCancel(k){const s=S();sparHm();if(k<s.spar.res.length)return;const op=s.spar.opps[k];s.spar.opps.splice(k,1);s.sdates.splice(k,1);s.spar.hm.splice(k,1);
  news(`📋 Odwołano sparing z ${TEAMS[op].name}.`);ui.confirm=null;save();render();}
// --- zaproszenia ---
function sparAcceptP(op,home){const me=teamStrength(myTeam()),th=teamStrength(TEAMS[op]);const repM=(SAVE.ai[SAVE.team]||{}).rep||30,repT=(SAVE.ai[op]||{}).rep||30;
  let p=0.78;if(th-me>6)p-=0.25;if(th-me>12)p-=0.2;if(repT-repM>20)p-=0.15;if(lgOf(op)<myLg())p-=0.1;if(!home)p+=0.1;if(lgOf(op)>myLg())p+=0.1;
  const s=S();const n=s.spar.opps.filter(x=>x===op).length;p-=0.3*n;return clamp(p,0.05,0.95);}
function sparInvite(op,d,home,quiet){const s=S();op=+op;if(!sparCanPlan()||!TEAMS[op]||op===SAVE.team)return;if(!d||sparTaken(d)||d<sparFirst()||d>sparLast()){if(!quiet){ui.sparMsg={ok:0,t:'Ten termin jest już zajęty albo niedostępny.'};render();}return;}
  s.spar.inv=s.spar.inv||[];s.spar.nid=(s.spar.nid||0)+1;s.spar.inv.push({id:s.spar.nid,op,d,home:!!home,st:'wait',ans:addDays(today(),R()<0.6?1:2),by:quiet?'asy':'me'});
  if(!quiet){ui.sparMsg={ok:1,t:`Wysłano zaproszenie do ${TEAMS[op].name} na ${fmtDMY(d)}. Odpowiedź w ciągu 1–2 dni.`};save();render();}}
function sparInvCancel(id){const s=S();s.spar.inv=(s.spar.inv||[]).filter(x=>x.id!==id);save();render();}
function sparDaily(d){const s=S();if(!s||!s.spar||!sparCanPlan())return;const inv=s.spar.inv||[];
  for(const x of inv){if(x.st!=='wait'||x.ans>d)continue;const T=TEAMS[x.op];
    if(x.d<=d||sparTaken(x.d)==='sparing'){x.st='no';continue;}
    if(R()<sparAcceptP(x.op,x.home)){x.st='ok';sparInsert(x.op,x.d,x.home);
      sendMail({cat:'mecz',from:`Sekretariat ${T.name}`,t:`Sparing potwierdzony: ${T.short}, ${fmtShort(x.d)}`,s:`${T.name} przyjmuje zaproszenie`,b:{type:'text',txt:`Dzień dobry, chętnie zagramy sparing ${x.home?'u Państwa':'u nas'} w dniu ${fmtDMY(x.d)} o 18:00. Do zobaczenia!`}});}
    else{x.st='no';sendMail({cat:'mecz',from:`Sekretariat ${T.name}`,t:`Odmowa sparingu: ${T.short}`,s:`${T.name} nie zagra sparingu`,b:{type:'text',txt:`Dziękujemy za zaproszenie, ale w terminie ${fmtDMY(x.d)} nie możemy zagrać sparingu${teamStrength(T)-teamStrength(myTeam())>6?' — szukamy silniejszych rywali':''}.`}});}}
  s.spar.inv=inv.filter(x=>x.st==='wait'||daysBetween(x.ans,d)<=5);
  // zaproszenia od innych klubów (co kilka dni, jeśli są wolne terminy)
  if(R()<0.12){const free=sparFreeDays();if(free.length>3){const L=lgTeams(myLg()).map(t=>t.idx).concat(lgTeams(Math.min(2,myLg()+1)).map(t=>t.idx)).filter(i=>i!==SAVE.team&&!s.spar.opps.includes(i));const op=L[Math.floor(R()*L.length)];const dd=free[Math.floor(R()*Math.min(free.length,20))];
    if(op!=null&&dd){if(dlg('spar')){if(nSpar()>=10)return;sparInsert(op,dd,R()<0.5);news(`📋 Kierownik drużyny przyjął zaproszenie na sparing z ${TEAMS[op].name} (${fmtShort(dd)}).`);}
      else sendMail({cat:'mecz',from:`Sekretariat ${TEAMS[op].name}`,t:`Zaproszenie na sparing: ${TEAMS[op].short}, ${fmtShort(dd)}`,s:'Inny klub zaprasza na sparing',b:{type:'sparinv',op,d:dd,home:R()<0.5},act:1,lab:'Wymaga decyzji'});}}}
  // asystent organizuje sparingi: mniej więcej co 3–4 dni do startu ligi
  if(dlg('spar'))sparAuto();}
function sparAuto(){const s=S();const a=sparFirst(),b=sparLast();if(a>b)return;const pend=(s.spar.inv||[]).filter(x=>x.st==='wait').length;if(nSpar()+pend>=10)return;const busy=s.sdates.slice(s.spar.res.length,nSpar()).concat((s.spar.inv||[]).filter(x=>x.st==='wait').map(x=>x.d)).sort();
  let d=a;const me=teamStrength(myTeam());let sent=0;
  while(d<=b&&sent<2&&nSpar()+pend+sent<10){const near=busy.some(x=>Math.abs(daysBetween(x,d))<4);if(!near&&!sparTaken(d)){const pool=TEAMS.filter(t=>t&&t.idx!==SAVE.team&&t.idx>=0&&!isYT(t.idx)&&Math.abs(lgOf(t.idx)-myLg())<=1&&!s.spar.opps.includes(t.idx)&&!(s.spar.inv||[]).some(x=>x.op===t.idx&&x.st==='wait'))
      .sort((x,y)=>Math.abs(teamStrength(x)-me)-Math.abs(teamStrength(y)-me)).slice(0,8);const op=pool[Math.floor(R()*pool.length)];if(op){sparInvite(op.idx,d,R()<0.5,true);busy.push(d);sent++;}}d=addDays(d,1);}}
function sparInvAnswer(mid,yes){const m=mailBox().find(x=>x.id===mid);if(!m||!m.b)return;const b=m.b;m.act=0;
  if(yes){if(sparTaken(b.d)||b.d<sparFirst()||b.d>sparLast()){ui.mailMsg='Ten termin jest już zajęty — nie można przyjąć.';}else{sparInsert(b.op,b.d,b.home);news(`📋 Przyjęto zaproszenie na sparing z ${TEAMS[b.op].name} (${fmtShort(b.d)}).`);}}
  else news(`📋 Odrzucono zaproszenie na sparing od ${TEAMS[b.op].name}.`);b.done=yes?'ok':'no';save();render();}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type==='sparinv'){const T=TEAMS[b.op];return `<p>${esc(T.name)} (${esc(LG_N[lgOf(b.op)])}, siła składu ${teamStrength(T)}) zaprasza na sparing <b>${fmtDMY(b.d)}</b> o 18:00 ${b.home?'u nas':'na wyjeździe'}.</p>${b.done?`<p class="mut">${b.done==='ok'?'Przyjęte.':'Odrzucone.'}</p>`:`<div class="mact"><button class="btn" onclick="sparInvAnswer('${m.id}',true)">Przyjmij</button><button class="ghost" onclick="sparInvAnswer('${m.id}',false)">Odrzuć</button></div>`}`;}
  if(b.type==='text')return `<p>${esc(b.txt||'').replace(/\n/g,'<br>')}</p>`;return _mb.apply(this,arguments);};}
{const _md=mailDaily;mailDaily=function(d){try{sparDaily(d);}catch(e){console.error(e);}return _md.apply(this,arguments);};}
if(typeof DLG!=='undefined'&&!DLG.some(x=>x[0]==='spar'))DLG.push(['spar','Organizacja sparingów','kier','Kierownik drużyny sam zaprasza rywali o podobnej sile na sparingi przed sezonem (mniej więcej co 4 dni, łącznie do 10) i przyjmuje zaproszenia od innych klubów.']);
// --- karta planowania sparingów (Mecz i sezon, przed ligą) ---
function sparCard(){if(!sparCanPlan())return '';const s=S();ensureDates(s);sparHm();const k0=s.spar.res.length;const n=nSpar();
  const rows=[];for(let k=0;k<n;k++){const op=s.spar.opps[k];const r=s.spar.res[k];const conf=ui.confirm==='spc'+k;
    rows.push(`<tr class="${r?'':'up'}"><td class="l">${fmtShort(s.sdates[k])}</td><td class="l"><button class="link tlk" onclick="openTeam(${op})">${teamCrest(op,16)} ${esc(TEAMS[op].name)}</button> <small class="mut">${LG_SHORT[lgOf(op)]} · ${teamStrength(TEAMS[op])}</small></td><td>${sparHome(k)?'D':'W'}</td><td>${r?resTxt(r):k>=k0?`<button class="link small bad" onclick="${conf?`sparCancel(${k})`:`ui.confirm='spc${k}';render()`}">${conf?'Na pewno odwołać?':'Odwołaj'}</button>`:''}</td></tr>`);}
  const inv=(s.spar.inv||[]).filter(x=>x.st==='wait');const free=sparFreeDays();const me=teamStrength(myTeam());
  const teams=TEAMS.filter(t=>t&&t.idx>=0&&t.idx!==SAVE.team&&!isYT(t.idx)&&lgOf(t.idx)<=Math.min(myLg()+2,2)&&LG_C[lgOf(t.idx)]===LG_C[myLg()]);
  const grp={};for(const t of teams)(grp[lgOf(t.idx)]=grp[lgOf(t.idx)]||[]).push(t);
  const opts=Object.keys(grp).sort((a,b)=>a-b).map(l=>`<optgroup label="${esc(LG_N[l])}">${grp[l].sort((a,b)=>teamStrength(b)-teamStrength(a)).map(t=>`<option value="${t.idx}">${esc(t.name)} — siła ${teamStrength(t)}${Math.abs(teamStrength(t)-me)<=3?' (podobna)':''} · szansa ${Math.round(sparAcceptP(t.idx,true)*100)}%</option>`).join('')}</optgroup>`).join('');
  return `<div class="card" id="sparplan"><div class="row wrap"><h2 style="margin:0">Sparingi — terminarz i zaproszenia</h2><span class="sp"></span><label class="small row" style="gap:6px"><input type="checkbox" ${DL().on.spar?'checked':''} onchange="DL().on.spar=this.checked?1:0;save();render()"> Kierownik drużyny organizuje sparingi</label></div>
   <p class="small mut">Możesz rozegrać dowolną liczbę sparingów do ${fmtDMY(sparLast())} (2 dni przed 1. kolejką). Zaproś rywala — odpowiedź przyjdzie pocztą po 1–2 dniach. Silniejsze kluby chętniej grają u siebie i rzadziej przyjmują słabszych. Mniej niż 2 dni przerwy między meczami = więcej zmęczenia.</p>
   <div class="tw"><table class="pttb"><tr><th class="l">Data</th><th class="l">Rywal</th><th>Miejsce</th><th>Wynik</th></tr>${rows.join('')||'<tr><td colspan="4" class="mut">Brak zaplanowanych sparingów.</td></tr>'}</table></div>
   ${inv.length?`<div class="small" style="margin-top:8px"><b>Czekają na odpowiedź:</b> ${inv.map(x=>`${teamCrest(x.op,14)} ${esc(TEAMS[x.op].short)} · ${fmtShort(x.d)} ${x.home?'(D)':'(W)'}${x.by==='asy'?' · kierownik':''} <button class="link small" onclick="sparInvCancel(${x.id})">wycofaj</button>`).join(' · ')}</div>`:''}
   ${free.length?`<div class="ngform" style="margin-top:10px"><label>Termin <select id="spd">${free.map(d=>`<option value="${d}">${fmtShort(d)} (${DOW_S[new Date(d+'T12:00:00Z').getUTCDay()]})</option>`).join('')}</select></label><label>Rywal <select id="spo">${opts}</select></label><label>Gdzie <select id="sph"><option value="1">u nas</option><option value="0">na wyjeździe</option></select></label><button class="btn" onclick="sparInvite($('#spo').value,$('#spd').value,$('#sph').value==='1')">Wyślij zaproszenie</button></div>`:'<p class="small mut">Brak wolnych terminów przed ligą.</p>'}
   ${ui.sparMsg?`<div class="small ${ui.sparMsg.ok?'good':'bad'}" style="margin-top:6px">${esc(ui.sparMsg.t)}</div>`:''}</div>`;}
{const _sv=seasonView;seasonView=function(){const h=_sv.apply(this,arguments);try{const s=S();if(s&&s.phase==='off'&&!SAVE.fired)return h+sparCard();}catch(e){console.error(e);}return h;};}
