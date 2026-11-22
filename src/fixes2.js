// ================= POPRAWKI v177: skauting (charakter, pełna obserwacja), ochrona nowych zawodników, rozmowy o formie/kontrakcie,
// dynamika meczu punkt po punkcie, zmiany i czasy komputera, znaczniki załamania / gazu, skład przed każdym setem =================

// ---------- 1. raport charakteru od skauta ----------
const TR_NEG=['ner','len','kap','ind'];
function trCard(k){const t=TRAITS[k];if(!t)return '';const neg=TR_NEG.includes(k);
  return `<div class="chtr ${neg?'neg':'pos'}" style="--tc:${t[1]}"><div class="row" style="gap:8px"><b>${esc(t[0])}</b><span class="sp"></span><span class="tkp ${neg?'r':'g'}">${neg?'wada':'zaleta'}</span></div><p class="small">${esc(t[2])}</p></div>`;}
function chrVerdict(p){const neg=p.tr.filter(k=>TR_NEG.includes(k));const L=[];
  if(hasT(p,'lid'))L.push('Naturalny kandydat na kapitana — podniesie morale i zgranie zespołu.');
  if(hasT(p,'kap'))L.push('Uwaga: na ławce szybko się psuje i psuje szatnię. Bierz go tylko do podstawowego składu.');
  if(hasT(p,'ner'))L.push('W końcówkach setów i tie-breakach może zawodzić. Psycholog w sztabie pomaga.');
  if(hasT(p,'len'))L.push('Wolniej się rozwija — u młodego zawodnika to ważna wada.');
  if(hasT(p,'ind'))L.push('Bierze atak na siebie nawet ze złych piłek i obniża zgranie.');
  if(hasT(p,'amb')||hasT(p,'suk'))L.push('Oczekuje ważnej roli — w negocjacjach zaproponuj grę w podstawie.');
  if(hasT(p,'loj'))L.push('Przywiązuje się do klubu: trudniej go wyciągnąć, ale potem rzadko chce odejść.');
  if(hasT(p,'pra')||hasT(p,'pro'))L.push('Solidny charakter — dobrze pracuje na treningach.');
  if(!L.length)L.push(neg.length?'Charakter z wadami — przemyśl transfer.':'Charakter bez większych zastrzeżeń.');
  return L;}
function chrMailHtml(b){const P=PLAYERS[b.pid];if(!P)return `<p class="mtext">Zawodnik nie jest już dostępny.</p>`;const p=P.p;ensTraits(p);const wm=wantsMove(p);
  const ment=MENTAL.map(([k,n])=>{const v=p[k]||10;return `<div class="chm"><span>${n}</span><span class="kbar"><i style="width:${v*5}%;background:${v>=14?'var(--good)':v<=8?'var(--bad)':'var(--acc)'}"></i></span><b>${v}</b></div>`;}).join('');
  return `<div class="row" style="gap:12px;margin-bottom:10px">${pFace(p,56)}<div><b style="font-size:17px">${esc(p.first)} ${esc(p.last)}</b> ${natTag(p)}<div class="small mut">${pTag(p.pos)} ${POS_NAMES[p.pos]} · ${p.age} l. · ${p.tm>=0&&TEAMS[p.tm]?esc(TEAMS[p.tm].name):'wolny zawodnik'}</div></div></div>
   <p class="mtext">${esc(b.how||'Dyskretne rozpoznanie: rozmowy z trenerami, kolegami z drużyny i dziennikarzami.')}</p>
   <h4 class="chh">Cechy charakteru</h4><div class="chtrs">${p.tr.map(trCard).join('')||'<p class="small mut">Brak wyraźnych cech charakteru.</p>'}</div>
   <h4 class="chh">Cechy mentalne</h4><div class="chms">${ment}</div>
   <h4 class="chh">Ocena skauta</h4><ul class="chv">${chrVerdict(p).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
   <div class="yrow"><span>Chęć przejścia do nas</span><b class="${wm[1]}">${wm[0]}</b></div>
   <div class="mact"><button class="btn" onclick="openPop('${p.id}')">Profil zawodnika</button><button class="ghost" onclick="openCard('${p.id}')">Pełna karta</button>${knowOf(p)<100&&p.tm!==SAVE.team?`<button class="ghost" onclick="fullObserve('${p.id}')">🔍 Pełna obserwacja (wiedza ${knowOf(p)}%)</button>`:''}</div>`;}
chrReport=function(t,sc){const P=PLAYERS[t.pid];if(!P)return;const p=P.p;SX().chr[p.id]=1;addKnow(p.id,10);ensTraits(p);
  sendMail({cat:'skaut',from:`${sc.first[0]}. ${sc.last} (skaut)`,t:`Charakter: ${p.first} ${p.last}`,s:p.tr.map(k=>TRAITS[k]?TRAITS[k][0]:k).join(', ')||'bez wyraźnych cech',b:{type:'chr',pid:p.id},lab:'Charakter'});};
// ---------- 2. pełna obserwacja: wiedza 100% + charakter ----------
function fullDays(sc){return Math.round(clamp(26-sc.skill*0.8,10,22));}
function fullObserve(pid){const P=PLAYERS[pid];if(!P)return;if(SC().tasks.some(t=>t.pid===pid&&(t.type==='obs'||t.type==='full'))){ui.scMsg='Ten zawodnik jest już obserwowany.';render();return;}
  if(!isShort(pid))SC().short.push(pid);ui.card=null;ui.pop=null;newTask({type:'full',pid});}
{const _td=taskDays;taskDays=function(type,sc){return type==='full'?fullDays(sc):_td.apply(this,arguments);};}
{const _sd=scoutDay;scoutDay=function(d){if(SAVE.team!=null&&SAVE.world){const s=SX();
    for(const t of s.tasks.slice()){if(t.type!=='full')continue;const sc=allScouts().find(x=>x.id===t.sid);if(!sc)continue;
      if(!t.start){if(scoutLoad(sc)<scoutSlots(sc)){t.start=d;t.until=addDays(d,fullDays(sc));}continue;}
      const P=PLAYERS[t.pid];if(!P){s.tasks=s.tasks.filter(x=>x!==t);continue;}
      const left=Math.max(1,daysBetween(d,t.until)+1);addKnow(t.pid,(100-knowOf(P.p))/left);
      if(t.until<=d){s.tasks=s.tasks.filter(x=>x!==t);s.know[t.pid]=100;s.chr[t.pid]=1;ensTraits(P.p);obsReport(t,sc);chrReport(t,sc);}}
    // oryginalny przebieg nie zna typu 'full' — na czas jego działania odsuwamy termin, żeby go nie zakończył
    const full=s.tasks.filter(t=>t.type==='full');const keep=full.map(t=>[t,t.until,t.start]);for(const t of full){t.until='9999-12-31';if(!t.start)t.start='9999-12-31';}
    try{_sd.apply(this,arguments);}finally{for(const [t,u,st] of keep){t.until=u;t.start=st;}}}
  else _sd.apply(this,arguments);};}
// przycisk w karcie zawodnika i w podglądzie
function fullObsBtn(p,cls){if(!p||p.tm===SAVE.team||knowOf(p)>=100)return '';if(SC().tasks.some(t=>t.pid===p.id&&t.type==='full'))return `<span class="small mut">🔍 Trwa pełna obserwacja</span>`;
  return `<button class="${cls||'link small'}" onclick="fullObserve('${p.id}')" title="Skaut obserwuje zawodnika przez kilkanaście dni: poznasz dokładne atrybuty, potencjał i charakter">🔍 Pełna obserwacja</button>`;}
// ---------- poczta: nowe typy treści ----------
{const _mb=mailBodyHtml;mailBodyHtml=function(m){const b=m.b||{};if(b.type==='chr')return chrMailHtml(b);
  if(b.type==='text'&&b.x&&!b.txt)return `<p class="mtext">${esc(b.x).replace(/\n/g,'<br>')}</p>${m.cat==='skaut'&&/^Charakter: /.test(m.t||'')?chrOldBtn(m):''}`;return _mb.apply(this,arguments);};}
function chrOldBtn(m){const nm=(m.t||'').replace(/^Charakter: /,'');const p=W().players.find(x=>x.first+' '+x.last===nm);return p?`<div class="mact"><button class="btn" onclick="openPop('${p.id}')">Profil zawodnika</button></div>`:'';}

// ---------- 3. ochrona świeżo sprowadzonych zawodników ----------
function newSign(p){if(!p||p.tm!==SAVE.team)return false;const d=today();if(p.jd&&daysBetween(p.jd,d)<180)return true;
  const h=(SAVE.trh||[]).find(x=>x.id===p.id&&x.inn);return !!(h&&daysBetween(h.d,d)<180);}
{const _mp=movePlayer;movePlayer=function(p,tm){const r=_mp.apply(this,arguments);try{if(SAVE.team!=null&&tm===SAVE.team&&S())p.jd=today();}catch(e){}return r;};}
{const _fb=findBuyers;findBuyers=function(pid){const P=PLAYERS[pid];if(P&&newSign(P.p)&&!P.p.tl)return [];return _fb.apply(this,arguments);};}
{const _is=ixSuitor;ixSuitor=function(p){if(newSign(p))return null;return _is.apply(this,arguments);};}

// ---------- 4. rozmowy: forma w meczach i kontrakt ----------
function seaGrade(p){const r=(S().ps||{})[p.id];return r&&r.rn>=2?r.rs/r.rn:null;}
TALK_K.push(['fpraise','Pochwal za formę w meczach','Doceń jego grę w ostatnich meczach'],['fcrit','Skrytykuj formę w meczach','Powiedz, że w meczach gra poniżej oczekiwań'],
  ['cfut','Zapewnij o przyszłości w klubie','„Liczę na Ciebie także w kolejnych sezonach”'],['cext','Zaproponuj przedłużenie kontraktu','Rozmowa wstępna — potem negocjacje z agentem'],['cwant','Zapytaj o jego oczekiwania','Czy chce zostać i ile chciałby zarabiać']);
const TALK_G=[['tr','Trening',['praise','crit']],['fm','Forma',['fpraise','fcrit']],['mt','Mecz',['motiv']],['ct','Kontrakt',['cfut','cext','cwant']]];
Object.assign(TALK_LINES,{
  fpraise:{g:['Dzięki, trenerze! W meczach czuję się coraz pewniej.','To mnie nakręca — w następnym meczu dam jeszcze więcej.'],n:['Dzięki, choć było kilka gorszych akcji.','OK, dziękuję.'],b:['Pochwała? Przecież ostatnio gram słabo…','Nie wiem, czy to szczere, trenerze.']},
  fcrit:{g:['Wiem, w meczach zawodziłem. Poprawię to.','Ma pan rację. Wezmę się w garść przed następnym meczem.'],n:['Postaram się… choć nie było aż tak źle.','Przyjąłem.'],b:['Gram dobrze, a słyszę krytykę? To niesprawiedliwe!','Niech pan spojrzy na statystyki, trenerze.']},
  cfut:{g:['To dla mnie ważne. Chcę tu zostać na dłużej.','Dziękuję, trenerze. Dobrze się tu czuję.'],n:['Miło słyszeć. Zobaczymy, co przyniesie przyszłość.','Dobrze, dziękuję.'],b:['Słowa to jedno, a kontrakt to drugie…','Usłyszałem to już kiedyś. Wolałbym konkretów.']},
  cext:{g:['Chętnie! Niech klub rozmawia z moim agentem.','Super wiadomość — chcę zostać.'],n:['Porozmawiam z agentem. Zobaczymy, co zaproponujecie.','Rozważę to.'],b:['Na razie nie myślę o przedłużeniu.','Najpierw chcę zobaczyć, jak potoczy się sezon.']},
  cwant:{g:['Szczerze? Dobrze mi tu. Liczę na uczciwą podwyżkę.'],n:['Myślę o swojej przyszłości. Dużo zależy od roli i pieniędzy.'],b:['Rozglądam się. Chcę grać o wyższe cele.']}});
{const _ts=talkScore;talkScore=function(p,k,t){if(!['fpraise','fcrit','cfut','cext','cwant'].includes(k))return _ts.apply(this,arguments);
  const tk=TALK_T[t][1];const g=seaGrade(p),fm=fmOf(p);let q=0;const why=[];const n=S().n;
  if(k==='fpraise'){const good=(g!=null&&g>=7)||fm>=70,ok=(g!=null&&g>=6.4)||fm>=58;q=good?1.5:ok?0.8:0;why.push(good?'pochwała zasłużona':ok?'gra solidnie':'pochwała na wyrost');if(hasT(p,'amb')||hasT(p,'suk'))q+=0.3;if(!ok&&hasT(p,'len'))q-=0.5;if(t===2)q-=0.3;}
  else if(k==='fcrit'){const bad=(g!=null&&g<6)||fm<45,meh=(g!=null&&g<6.5)||fm<58;q=bad?0.8:meh?-0.2:-1.7;why.push(bad?'krytyka uzasadniona':meh?'gra przeciętnie':'krytyka niesprawiedliwa');
    if(hasT(p,'pro')||hasT(p,'zde'))q+=0.5;if(hasT(p,'kap')){q-=1;why.push('kapryśny źle znosi krytykę');}if(hasT(p,'ner')){q-=0.5;if(t===2)q-=0.6;}if(q<0&&t===0)q*=0.5;}
  else if(k==='cfut'){const end=p.ce!=null&&p.ce<=n;q=end?1.1:0.6;why.push(end?'kontrakt kończy się po sezonie — doceni deklarację':'ma ważny kontrakt');if(hasT(p,'loj'))q+=0.4;if(hasT(p,'amb')&&ROLE_I[roleOf(p)]>=2){q-=0.6;why.push('chce większej roli');}if(p.tl){q=-1.2;why.push('jest na liście transferowej — nie uwierzy');}}
  else if(k==='cext'){const yrs=(p.ce||n)-n;const sat=p.tm>=0&&TEAMS[p.tm]?pSat(p,TEAMS[p.tm]).v:60;q=(yrs<=0?1.2:yrs===1?0.6:-0.3)+(sat-55)/40;why.push(yrs<=0?'kontrakt kończy się po sezonie':yrs===1?'jeszcze rok kontraktu':'ma długi kontrakt');if(hasT(p,'loj'))q+=0.4;if(hasT(p,'sta'))q-=0.2;if(p.wantOut===n){q-=1.2;why.push('myśli o odejściu');}}
  else{q=0.4;why.push('rozmowa informacyjna');}
  q=clamp(q*(q>0?tk:(t===0?0.8:tk)),-2,2);return {q,r:g,why};};}
{const _td=talkDo;talkDo=function(pid,k,t){if(!['fpraise','fcrit','cfut','cext','cwant'].includes(k))return _td.apply(this,arguments);
  const P=PLAYERS[pid];if(!P)return;const p=P.p;if(talkLeft(p))return;const sc=talkScore(p,k,t);const q=sc.q;
  const out=q>=0.5?'g':q>-0.3?'n':'b';const lines=TALK_LINES[k][out];const line=lines[Math.floor(R()*lines.length)];const m0=p.mor==null?60:p.mor,f0=fmOf(p);const fx=[];
  if(k==='cwant'){const wd=wageDemand(p);const sat=pSat(p,TEAMS[p.tm]).v;fx.push(`oczekuje ok. ${fmtShort2(wd)}/rok (teraz ${fmtShort2(p.wage)})`);fx.push(sat>=60?'chce zostać w klubie':sat>=42?'waha się, czy zostać':'rozgląda się za innym klubem');addMor(p,1);}
  else{addMor(p,q*(k==='fcrit'?6:6));formAdd(p,(k==='fpraise'||k==='fcrit')?q*1.8:q*0.6);}
  if(k==='fcrit'&&q>0){p.tkB=Math.round(q*0.005*1000)/1000;p.tkBd=nextEvent()?nextEvent().d:today();fx.push('lepsza gra w najbliższym meczu');}
  if(k==='fpraise'&&out==='g'&&hasT(p,'len')){fx.push('może się trochę rozluźnić');}
  if(k==='cfut'){relAdd(p,q>0?3:-2);if(q>0&&p.ce!=null&&p.ce<=S().n){ixPromise(p,'kontrakt',30,{ce:p.ce});fx.push('obietnica: nowa oferta kontraktu w ciągu 30 dni');}}
  if(k==='cext'){if(q>0){fx.push('gotowy do rozmów — otwórz negocjacje');p.negOk=today();}else fx.push('na razie nie chce rozmawiać o przedłużeniu');}
  if(out==='b'&&hasT(p,'kap')){p.unh=(p.unh||0)+1;fx.push('psuje atmosferę w szatni');}
  p.talkD=today();const res={pid,k,t,line,out,m0,m1:p.mor,f0,f1:fmOf(p),fx,why:sc.why,neg:k==='cext'&&q>0};ui.talkRes=res;
  sendMail({cat:'druz',from:`${p.first} ${p.last}`,t:`Rozmowa: ${TALK_K.find(x=>x[0]===k)[1].toLowerCase()} (${p.last})`,s:`„${line}”`,b:{type:'talk',res},ic:'💬'});save();render();};}
talkModal=function(){const P=PLAYERS[ui.talk];if(!P){ui.talk=null;return '';}const p=P.p;ensTraits(p);const r=wkRating(p);const g=seaGrade(p);const left=talkLeft(p);const res=ui.talkRes;
  const head=`<div class="row" style="gap:12px"><span>${pFace(p,60)}</span><div><h2 style="margin:0">${esc(p.first)} ${esc(p.last)}</h2><div class="small mut">${pTag(p.pos)} ${p.age} l. · charakter: ${p.tr.map(k=>TRAITS[k][0].toLowerCase()).join(', ')}</div></div><span class="sp"></span><button class="ghost" onclick="ui.talk=null;ui.talkRes=null;render()">✕</button></div>
   <div class="tkkv"><div><span>Trening (7 dni)</span><b class="${r==null?'mut':scCls(r)}">${r==null?'–':fx1(r)}</b></div><div><span>Mecze (śr. ocena)</span><b class="${g==null?'mut':scCls(g)}">${g==null?'–':fx1(g)}</b></div><div><span>Morale</span><b>${morLabel(p.mor==null?60:p.mor)}</b></div><div><span>Forma</span><b>${Math.round(fmOf(p))}</b></div><div><span>Kontrakt</span><b>${p.ce==null?'–':p.ce<=S().n?'kończy się po sezonie':'jeszcze '+(p.ce-S().n)+' sez.'}</b></div></div>`;
  let body;
  if(res&&res.pid===p.id){body=`<div class="tklab">Odpowiedź zawodnika</div><div class="tkbub ${res.out}">„${esc(res.line)}”</div><div class="tklab">Skutek</div>${talkFx(res)}
     ${res.why.length?`<p class="small mut" style="margin-top:8px">Asystent: ${res.why.join(', ')}.</p>`:''}<div class="row" style="margin-top:12px;gap:8px">${res.neg?`<button class="btn" onclick="ui.talk=null;ui.talkRes=null;negOpen('${p.id}','renew')">💼 Przejdź do negocjacji</button>`:''}<button class="${res.neg?'ghost':'btn'}" onclick="ui.talk=null;ui.talkRes=null;render()">Zamknij</button></div>`;}
  else if(left){body=`<p class="mut" style="margin-top:14px">Rozmawiałeś z nim niedawno (${fmtShort(p.talkD)}). Kolejna rozmowa możliwa za ${left} ${left===1?'dzień':'dni'}.</p>`;}
  else{const grp=TALK_G.find(x=>x[2].includes(ui.talkK))||TALK_G[0];
    body=`<div class="tklab">Temat rozmowy</div><div class="tktone tkgrp">${TALK_G.map(([gk,gn,ks])=>`<button class="${grp[0]===gk?'on':''}" onclick="ui.talkK='${ks[0]}';render()">${gn}</button>`).join('')}</div>
    <div class="tklab">Co chcesz powiedzieć?</div>${TALK_K.filter(x=>grp[2].includes(x[0])).map(([k,n,d])=>{const s=talkScore(p,k,ui.talkT);const [pl,c]=talkPred(s.q);return `<button class="tkopt ${ui.talkK===k?'on':''}" onclick="ui.talkK='${k}';render()"><span><b>${n}</b><small>${d}</small></span>${k==='cwant'?'':`<span class="tkp ${c}">reakcja: ${pl}</span>`}</button>`;}).join('')}
    ${ui.talkK==='cwant'?'':`<div class="tklab">Ton</div><div class="tktone">${TALK_T.map(([n],i)=>`<button class="${ui.talkT===i?'on':''}" onclick="ui.talkT=${i};render()">${n}</button>`).join('')}</div>`}
    <div class="row" style="gap:8px;margin-top:12px"><button class="btn" onclick="talkDo('${p.id}',ui.talkK,ui.talkT)">Porozmawiaj</button><span class="small mut">Z jednym zawodnikiem możesz rozmawiać raz na ${TALK_CD} dni.</span></div>`;}
  return `<div class="modal" onclick="if(event.target===this){ui.talk=null;ui.talkRes=null;render()}"><div class="mcard tkcard">${head}${body}</div></div>`;};
{const _tf=talkFx;talkFx=function(r){return _tf(r).replace(/<span class="tkp g">(oczekuje|chce zostać|waha|rozgląda)/g,(a,b)=>`<span class="tkp ${b==='rozgląda'?'r':b==='waha'?'y':'g'}">${b}`);};}

// ---------- 5. dynamika meczu: każdy punkt z jego rodzajem ----------
const PT_KIND={kill:['A','Atak'],blockout:['A','Atak'],block:['B','Blok'],ace:['S','As serwisowy']};
function ptKind(t){return PT_KIND[t]||['E','Błąd rywala'];}
fmMomentum=function(m){const h=m.hist||[];const kc=kitColors(m);const sets=[...new Set(h.map(x=>x[0]))];
  const cnt=[{A:0,B:0,S:0,E:0},{A:0,B:0,S:0,E:0}];
  const rows=sets.map(sn=>{const pts=h.filter(x=>x[0]===sn);let prev=[0,0];
    const cells=pts.map(x=>{const w=x[3]!=null?x[3]:(x[1]>prev[0]?0:1);prev=[x[1],x[2]];const k=ptKind(x[4]);if(x[4]!=null)cnt[w][k[0]]++;
      const col=kc[w],ink=lum(col)>0.6?'#111':'#fff';const lab=x[4]!=null?k[0]:'';const ol=lum(col)<0.18?'box-shadow:inset 0 0 0 1px #aab2bf;':'';
      return `<span class="dmc ${w?'b':'t'}" title="${x[1]}:${x[2]} — ${esc(m.sides[w].team.short)}${x[4]!=null?': '+k[1]:''}"><i style="background:${col};color:${ink};${ol}">${lab}</i></span>`;}).join('');
    const last=pts[pts.length-1];return `<div class="dmset"><span class="dmsn">Set ${sn}<b>${last?last[1]+':'+last[2]:''}</b></span><div class="dmrow">${cells}</div></div>`;}).join('');
  const leg=i=>`<span class="dmleg"><i style="background:${kc[i]};${lum(kc[i])<0.18?'box-shadow:inset 0 0 0 1px #aab2bf':''}"></i>${esc(m.sides[i].team.short)}: atak ${cnt[i].A} · blok ${cnt[i].B} · as ${cnt[i].S} · błędy rywala ${cnt[i].E}</span>`;
  return `<div class="card fmw"><div class="fmh"><b>Dynamika meczu</b><span class="small mut">każdy punkt: A atak · B blok · S as · E błąd rywala</span></div>
   ${rows||'<p class="small mut">Czeka na pierwszy punkt.</p>'}${h.length?`<div class="dmlegs">${leg(0)}${leg(1)}</div>`:''}</div>`;};

// ---------- 7. komputer robi zmiany i bierze czasy, gdy zawodnikom nie idzie ----------
function setStat(p,m){const k='_s'+m.setNo;const st=p.st;const b=p[k]||(p[k]={att:st.att,kill:st.kill,attErr:st.attErr,blocked:st.blocked,srvErr:st.srvErr,recErr:st.recErr,rec:st.rec});
  return {att:st.att-b.att,kill:st.kill-b.kill,err:(st.attErr-b.attErr)+(st.blocked-b.blocked)+(st.srvErr-b.srvErr)+(st.recErr-b.recErr),rec:st.rec-b.rec,recErr:st.recErr-b.recErr};}
{const _ai=aiTurn;aiTurn=function(m,i){const msgs=_ai.apply(this,arguments)||[];try{const s=m.sides[i];
  const isUser=typeof SAVE!=='undefined'&&SAVE&&SAVE.team!=null&&s.team.idx===SAVE.team;if(isUser||m.over)return msgs;
  const lead=m.score[1-i]-m.score[i];const mx=Math.max(...m.score);
  // czas, gdy rywal ucieka w secie (wcześniej tylko po serii punktów)
  if(s.to>0&&!msgs.some(x=>/^Czas/.test(x))&&lead>=4&&mx>=10&&(s._toAt||-9)<m.rallies-6&&R()<0.4){callTimeout(m,i);s._toAt=m.rallies;msgs.push(`Czas dla ${s.team.name}: trener szuka sposobu na rywala.`);}
  // zmiana zawodnika, któremu nie idzie w secie
  const ps=s._ps||(s._ps={});if(s.subs>0&&(ps[m.setNo]||0)<2&&Math.max(...m.score)>=6){
    for(let k=0;k<6;k++){const sl=s.slots[k];if((s.srvSub&&s.srvSub.si===k)||(s.dbl&&(k===s.dbl.rI||k===s.dbl.aI)))continue;const p=sl.p;if(sl.role==='R'&&R()<0.6)continue;if(p['_in'+m.setNo])continue;
      const st=setStat(p,m);const bad=st.err>=3||(st.att>=5&&st.kill/st.att<0.3)||(st.rec>=4&&st.recErr>=2)||(MENT&&(p.cf||0)<=-1.2);if(!bad)continue;
      const c=benchOf(s).filter(x=>x.pos===sl.role&&!(x.inj>0)&&x.en>70).sort((a,b)=>rating(b)-rating(a))[0];
      if(c&&rating(c)>=rating(p)-12&&R()<0.25){if(substitute(m,i,k,c.id)){ps[m.setNo]=(ps[m.setNo]||0)+1;c['_s'+m.setNo]=null;c['_in'+m.setNo]=1;msgs.push(`Zmiana w ${s.team.name}: ${nm(c)} za ${nm(p)} (słabo mu szło w tym secie).`);break;}}}}
  }catch(e){console.error(e);}return msgs;};}

// ---------- 8. załamany / w gazie — wyraźne oznaczenia ----------
function cfState(p){if(typeof MENT==='undefined'||!MENT||!p)return 0;const c=p.cf||0;return c<=-1?-1:c>=1?1:0;}
function cfBadge(p){const s=cfState(p);return s<0?'<span class="cfb dn" title="Załamany po błędach: gra wyraźnie słabiej. Pomoże czas z przemową „Uspokój” albo zmiana.">▼ ZAŁAMANY</span>':s>0?'<span class="cfb up" title="W gazie: gra pewniej i skuteczniej">▲ W GAZIE</span>':'';}

// ---------- 9. skład przed każdym setem ----------
function setLuPanel(m){const s=m.sides[0];if(!s||m.over)return '';const used=new Set(s.slots.map(x=>x.p.id));if(s.libero)used.add(s.libero.id);
  const all=s.pl.filter(p=>!(p.inj>0));const opt=(cur,ex)=>all.filter(p=>p.id===cur||!used.has(p.id)).map(p=>`<option value="${p.id}" ${p.id===cur?'selected':''}>${esc(shortN(p))} (${POS_SHORT[p.pos]} ${rating(p)} · ${Math.round(p.en)}%)${cfState(p)<0?' ▼':cfState(p)>0?' ▲':''}</option>`).join('');
  const row=(k)=>{const sl=s.slots[k];return `<label class="slu"><span>${pTag(sl.role)}</span><select onchange="setLuSet(${k},this.value)">${opt(sl.p.id)}</select></label>`;};
  const st0=m._lu0;const same=st0&&s.slots.every((x,k)=>x.p.id===st0[k])&&(!s.libero||s.libero.id===m._lb0);
  return `<div class="setlu"><div class="row wrap" style="gap:8px;align-items:center"><b>Skład na ${m.setNo}. seta</b><span class="small mut">zmiany w przerwie nie zużywają limitu zmian</span><span class="sp"></span>
    <label class="small">Start w ustawieniu <select onchange="setLuRot(+this.value)">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${((s.tactics.startRot||0)%6)===n?'selected':''}>R${n+1}</option>`).join('')}</select></label>
    ${st0&&!same?`<button class="ghost sm" onclick="setLuReset()">↺ Skład z początku meczu</button>`:''}</div>
   <div class="slugrid">${[0,1,2,3,4,5].map(row).join('')}${s.libero?`<label class="slu"><span>${pTag('L')}</span><select onchange="setLuLib(this.value)">${opt(s.libero.id)}</select></label>`:''}</div>
   ${ui.setLuMsg?`<p class="small bad">${esc(ui.setLuMsg)}</p>`:''}</div>`;}
function setLuSet(k,pid){const m=ui.match;const s=m.sides[0];const p=s.pl.find(x=>x.id===pid);if(!p)return;const old=s.slots[k].p;if(old.id===pid)return;
  if(typeof sideForOK==='function'&&!sideForOK(s,old,p)){ui.setLuMsg='Limit obcokrajowców: obcokrajowiec może wejść tylko za obcokrajowca.';render();return;}
  const j=s.slots.findIndex(x=>x.p.id===pid);if(j>=0)s.slots[j].p=old;else if(s.libero&&s.libero.id===pid)s.libero=old;s.slots[k].p=p;p['_s'+m.setNo]=null;ui.setLuMsg=null;persistLive();render();}
function setLuLib(pid){const m=ui.match;const s=m.sides[0];const p=s.pl.find(x=>x.id===pid);if(!p)return;if(typeof sideForOK==='function'&&!sideForOK(s,s.libero,p)){ui.setLuMsg='Limit obcokrajowców: obcokrajowiec może wejść tylko za obcokrajowca.';render();return;}s.libero=p;ui.setLuMsg=null;persistLive();render();}
function setLuRot(n){const m=ui.match;const s=m.sides[0];s.tactics.startRot=n;s.rot=baseRot(s.tactics);persistLive();render();}
function setLuReset(){const m=ui.match;const s=m.sides[0];if(!m._lu0)return;m._lu0.forEach((id,k)=>{const p=s.pl.find(x=>x.id===id);if(p&&!(p.inj>0))s.slots[k].p=p;});
  if(m._lb0){const l=s.pl.find(x=>x.id===m._lb0);if(l)s.libero=l;}ui.setLuMsg=null;persistLive();render();}
{const _sr=stepRally;stepRally=function(m){if(!m._lu0&&m.sides&&m.sides[0]){m._lu0=m.sides[0].slots.map(x=>x.p.id);m._lb0=m.sides[0].libero?m.sides[0].libero.id:null;}return _sr.apply(this,arguments);};}
