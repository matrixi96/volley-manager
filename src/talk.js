// ================= ROZMOWY Z ZAWODNIKAMI (POCHWAŁA / KRYTYKA / MOTYWACJA) =================
const TALK_K=[['praise','Pochwal za trening','Doceń jego pracę na treningach'],['crit','Skrytykuj trening','Powiedz, że oczekujesz więcej'],['motiv','Zmotywuj przed meczem','„Liczę na Ciebie w najbliższym meczu”']];
const TALK_T=[['Łagodny',0.7],['Normalny',1],['Stanowczy',1.4]];
const TALK_CD=7;
function wkRating(p){const rep=(SAVE.trn&&SAVE.trn.rep)||[];const lim=addDays(today(),-7);const a=repAgg(rep.filter(x=>x.d>lim),p.id);return a.avg==null?null:Math.round(a.avg*10)/10;}
function talkLeft(p){if(!p.talkD)return 0;return Math.max(0,TALK_CD-daysBetween(p.talkD,today()));}
function nextMatchIn(){const e=nextEvent();return e?daysBetween(today(),e.d):99;}
// wynik rozmowy: q od −2 (bardzo źle) do +2 (bardzo dobrze)
function talkScore(p,k,t){const r=wkRating(p);const tk=TALK_T[t][1];let q=0;const why=[];
  if(k==='praise'){if(r==null){q=0.5;why.push('brak ocen z treningów');}else if(r>=7){q=1.6;why.push('pochwała zasłużona');}else if(r>=6.5){q=0.9;}else{q=0.2;why.push('pochwała na wyrost');}
    if(hasT(p,'amb'))q+=0.3;if(hasT(p,'kap'))q+=0.3;if(r!=null&&r<6.5&&hasT(p,'len')){q-=0.4;why.push('leniwy może się rozluźnić');}
    if(t===2)q-=0.3;}
  else if(k==='crit'){if(r==null){q=-0.8;why.push('brak powodu do krytyki');}else if(r<6.5){q=0.7;why.push('krytyka uzasadniona');}else if(r<7){q=-0.4;}else{q=-1.8;why.push('krytyka niesprawiedliwa');}
    if(hasT(p,'pro')||hasT(p,'pra'))q+=0.6;if(hasT(p,'amb'))q+=0.3;if(hasT(p,'zde'))q+=0.3;
    if(hasT(p,'kap')){q-=1;why.push('kapryśny źle znosi krytykę');}if(hasT(p,'ind'))q-=0.6;if(hasT(p,'ner')){q-=0.5;if(t===2)q-=0.6;}
    if(q<0&&t===0)q*=0.5;}
  else{const d=nextMatchIn();if(d>3){q=0.1;why.push('do meczu jeszcze daleko');}else{q=1;why.push('mecz tuż-tuż');}
    if(hasT(p,'lid')||hasT(p,'amb'))q+=0.4;if(hasT(p,'ner')){q-=t===2?1.2:0.2;if(t===2)why.push('nerwowy źle znosi presję');}if(hasT(p,'spo'))q+=0.2;}
  q=clamp(q*(q>0?tk:(t===0?0.8:tk)),-2,2);return {q,r,why};}
function talkPred(q){return q>=1.2?['bardzo dobra','g']:q>=0.5?['dobra','g']:q>-0.3?['niepewna','y']:q>-1?['zła','r']:['bardzo zła','r'];}
const TALK_LINES={
  praise:{g:['Dzięki, trenerze. Ciężko pracowałem i dobrze to słyszeć. Będę dalej dawał z siebie wszystko.','Miło, że pan to zauważył. To mnie napędza!','Dziękuję. Czuję, że idę w dobrą stronę.'],
    n:['Dzięki… choć sam wiem, że stać mnie na więcej.','OK, dziękuję.'],b:['Skoro jest tak dobrze, to chyba mogę trochę odpuścić…','Hm, pochwała? Przecież ten tydzień był przeciętny.']},
  crit:{g:['Ma pan rację, ten tydzień był słaby. Poprawię się.','Rozumiem. Od jutra pokażę, że stać mnie na więcej.','Przyjmuję to. Dzięki za szczerość.'],
    n:['Postaram się… choć nie było aż tak źle.','No dobrze, przyjąłem.'],b:['Naprawdę? Daję z siebie wszystko, a słyszę krytykę?!','To niesprawiedliwe. Niech pan spojrzy na innych.','Nie podoba mi się ten ton, trenerze.']},
  motiv:{g:['Może pan na mnie liczyć. Dam z siebie wszystko!','Jestem gotowy. Wygramy to.','Czuję się świetnie — będzie dobrze.'],
    n:['Postaram się, trenerze.','Zobaczymy, jak to pójdzie.'],b:['Nie musi mi pan tego powtarzać, czuję presję…','Trochę mnie pan zestresował, trenerze.']}};
function talkDo(pid,k,t){const P=PLAYERS[pid];if(!P)return;const p=P.p;if(talkLeft(p))return;const sc=talkScore(p,k,t);const q=sc.q;
  const out=q>=0.5?'g':q>-0.3?'n':'b';const lines=TALK_LINES[k][out];const line=lines[Math.floor(R()*lines.length)];
  const m0=p.mor==null?60:p.mor,f0=fmOf(p);const fx=[];
  addMor(p,q*7);formAdd(p,q*1.5);
  if(k==='crit'&&q>0){p.trB={v:Math.round((0.15+q*0.15)*100)/100,until:addDays(today(),14)};fx.push(`lepsze oceny treningów przez 2 tygodnie (+${fx1(p.trB.v)})`);}
  if(k==='praise'&&sc.r!=null&&sc.r<6.5&&hasT(p,'len')){p.trB={v:-0.2,until:addDays(today(),7)};fx.push('rozluźnił się: słabsze treningi przez tydzień');}
  if(k==='motiv'&&q>0){p.tkB=Math.round(q*0.006*1000)/1000;p.tkBd=nextEvent()?nextEvent().d:today();fx.push('lepsza gra w najbliższym meczu');}
  if(out==='b'&&hasT(p,'kap')){p.unh=(p.unh||0)+1;fx.push('psuje atmosferę w szatni');}
  p.talkD=today();const m1=p.mor,f1=fmOf(p);
  const res={pid,k,t,line,out,m0,m1,f0,f1,fx,why:sc.why};ui.talkRes=res;
  sendMail({cat:'druz',from:`${p.first} ${p.last}`,t:`Rozmowa: ${TALK_K.find(x=>x[0]===k)[1].toLowerCase()} (${p.last})`,s:`„${line}”`,b:{type:'talk',res},ic:'💬'});
  save();render();}
function talkOpen(pid){ui.talk=pid;ui.talkK=ui.talkK||'praise';ui.talkT=ui.talkT==null?1:ui.talkT;ui.talkRes=null;ui.pop=null;render();}
function talkFx(r){const md=Math.round(r.m1-r.m0),fd=Math.round((r.f1-r.f0)*10)/10;
  return `<div class="tkfx"><span class="tkp ${md>0?'g':md<0?'r':'y'}">Morale: ${morLabel(r.m0)} → ${morLabel(r.m1)} (${md>0?'+':''}${md})</span><span class="tkp ${fd>0?'g':fd<0?'r':'y'}">Forma ${fd>0?'+':''}${String(fd).replace('.',',')}</span>${r.fx.map(x=>`<span class="tkp ${/słabsze|psuje/.test(x)?'r':'g'}">${x}</span>`).join('')}</div>`;}
function talkModal(){const P=PLAYERS[ui.talk];if(!P){ui.talk=null;return '';}const p=P.p;ensTraits(p);const r=wkRating(p);const left=talkLeft(p);const res=ui.talkRes;
  const head=`<div class="row" style="gap:12px"><span>${pFace(p,60)}</span><div><h2 style="margin:0">${esc(p.first)} ${esc(p.last)}</h2><div class="small mut">${pTag(p.pos)} ${p.age} l. · charakter: ${p.tr.map(k=>TRAITS[k][0].toLowerCase()).join(', ')}</div></div><span class="sp"></span><button class="ghost" onclick="ui.talk=null;ui.talkRes=null;render()">✕</button></div>
   <div class="tkkv"><div><span>Trening (7 dni)</span><b class="${r==null?'mut':scCls(r)}">${r==null?'–':fx1(r)}</b></div><div><span>Morale</span><b>${morLabel(p.mor==null?60:p.mor)}</b></div><div><span>Forma</span><b>${Math.round(fmOf(p))}</b></div></div>`;
  let body;
  if(res&&res.pid===p.id){body=`<div class="tklab">Odpowiedź zawodnika</div><div class="tkbub ${res.out}">„${esc(res.line)}”</div><div class="tklab">Skutek</div>${talkFx(res)}
     ${res.why.length?`<p class="small mut" style="margin-top:8px">Asystent: ${res.why.join(', ')}.</p>`:''}<div class="row" style="margin-top:12px;gap:8px"><button class="btn" onclick="ui.talk=null;ui.talkRes=null;render()">Zamknij</button></div>`;}
  else if(left){body=`<p class="mut" style="margin-top:14px">Rozmawiałeś z nim niedawno (${fmtShort(p.talkD)}). Kolejna rozmowa możliwa za ${left} ${left===1?'dzień':'dni'}.</p>`;}
  else{body=`<div class="tklab">Co chcesz powiedzieć?</div>${TALK_K.map(([k,n,d])=>{const s=talkScore(p,k,ui.talkT);const [pl,c]=talkPred(s.q);return `<button class="tkopt ${ui.talkK===k?'on':''}" onclick="ui.talkK='${k}';render()"><span><b>${n}</b><small>${d}</small></span><span class="tkp ${c}">reakcja: ${pl}</span></button>`;}).join('')}
    <div class="tklab">Ton</div><div class="tktone">${TALK_T.map(([n],i)=>`<button class="${ui.talkT===i?'on':''}" onclick="ui.talkT=${i};render()">${n}</button>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:12px"><button class="btn" onclick="talkDo('${p.id}',ui.talkK,ui.talkT)">Porozmawiaj</button><span class="small mut">Z jednym zawodnikiem możesz rozmawiać raz na ${TALK_CD} dni.</span></div>`;}
  return `<div class="modal" onclick="if(event.target===this){ui.talk=null;ui.talkRes=null;render()}"><div class="mcard tkcard">${head}${body}</div></div>`;}
function talkMailHtml(b){const r=b.res;const P=PLAYERS[r.pid];const p=P?P.p:null;
  return `<p class="mtext">${p?esc(p.first+' '+p.last):'Zawodnik'} po rozmowie (${TALK_K.find(x=>x[0]===r.k)[1].toLowerCase()}, ton ${TALK_T[r.t][0].toLowerCase()}):</p><div class="tkbub ${r.out}">„${esc(r.line)}”</div>${talkFx(r)}${r.why.length?`<p class="small mut" style="margin-top:8px">Asystent: ${r.why.join(', ')}.</p>`:''}
   ${p?`<div class="mact"><button class="ghost" onclick="openPop('${p.id}')">Profil zawodnika</button></div>`:''}`;}
function talkBtn(pid,sm){const P=PLAYERS[pid];if(!P||P.p.tm!==SAVE.team)return '';const l=talkLeft(P.p);return `<button class="ghost ${sm?'sm':''} tkbtn" title="${l?'Kolejna rozmowa za '+l+' dni':'Porozmawiaj'}" onclick="event.stopPropagation();talkOpen('${pid}')">💬${sm?'':' Porozmawiaj'}</button>`;}
