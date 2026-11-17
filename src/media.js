// ================= MEDIA: KONFERENCJE PRZED I PO MECZU, PLOTKI, RELACJE Z MEDIAMI =================
// SAVE.md = {rel:0–100 relacje z mediami, pre:{key,qs}, post:{key,qs,res}, boast:numer sezonu (zapowiedź mistrzostwa), log:[]}
function MD(){return SAVE.md||(SAVE.md={rel:50,pre:null,post:null,boast:null,log:[]});}
function mdRel(d){const M=MD();M.rel=Math.round(clamp(M.rel+d,0,100));}
function mdFol(f){const s=typeof SOC==='function'?SOC():null;if(s)s.fol=Math.max(100,Math.round(s.fol*(1+f)));}
function mdKey(c){return c?`${c.kind}|${c.h}|${c.a}|${c.sid||''}`:'';}
function mdOpp(c){return c.h===SAVE.team?c.a:c.h;}
function mdMatchDate(){const e=nextEvent();return e?e.d:today();}
const tmN2=i=>TEAMS[i]?TEAMS[i].name:'rywal';
// wynik serii ostatnich meczów ligowych
function mdForm(){const s=S();const L=[];for(const rd of (s.results||[]).slice().reverse()){const g=rd.find(x=>x.h===SAVE.team||x.a===SAVE.team);if(!g)continue;const me=g.h===SAVE.team;L.push((me?g.sw[0]:g.sw[1])>(me?g.sw[1]:g.sw[0])?1:0);if(L.length>=4)break;}return L;}
// ---- pytania ----
// każde pytanie: {k, t:tekst, o:[[klucz, odpowiedź, skutek(q)->opis]]}
function mdQRival(op){const fav=teamStrength(myTeam())>=teamStrength(TEAMS[op])+2;return {k:'rywal',t:`Jak ocenia pan drużynę ${tmN2(op)} przed meczem?`,o:[
  ['szac','Szanujemy rywala, czeka nas trudny mecz.',q=>{mdRel(1);return 'Spokojny przekaz. Bez wpływu na rywala.';}],
  ['fav',fav?'Jesteśmy faworytem i zamierzamy to pokazać.':'Stać nas na zwycięstwo z każdym.',q=>{for(const p of myTeam().players)addMor(p,2);for(const p of TEAMS[op].players)addMor(p,2);mdRel(1);return 'Twoi zawodnicy +2 morale, ale rywal też się zmobilizował.';}],
  ['ostro','Nie boimy się nikogo — rozjedziemy ich.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'ner')?-1:3);for(const p of TEAMS[op].players)addMor(p,5);mdRel(3);mdFol(0.01);return 'Nagłówki gwarantowane (+relacje z mediami). Drużyna nakręcona, ale rywal mocno zmotywowany.';}],
  ['nic','Skupiamy się na sobie.',q=>{mdRel(-1);return 'Dziennikarze rozczarowani wymijającą odpowiedzią.';}]]};}
function mdQForm(L){const lost=L.filter(x=>!x).length;return {k:'forma',t:`Przegraliście ${lost} z ostatnich ${L.length} meczów. Czy pana posada jest zagrożona?`,o:[
  ['wiara','Wierzę w tę drużynę. Wyniki przyjdą.',q=>{for(const p of myTeam().players)addMor(p,2);mdRel(1);return 'Zawodnicy docenili wsparcie (+2 morale).';}],
  ['budz','Zawodnicy muszą się obudzić.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')||hasT(p,'sta')?1:-3);bAdd(1);mdRel(2);return 'Zarząd docenił stanowczość, ale część szatni poczuła się wskazana palcem.';}],
  ['posada','To pytanie do zarządu.',q=>{bAdd(-2);mdRel(1);return 'Zarząd nie był zadowolony z tej odpowiedzi.';}],
  ['nic','Nie komentuję.',q=>{mdRel(-2);return 'Media to zapamiętają.';}]]};}
function mdQPlayer(p,good){return {k:'gracz',pid:p.id,t:good?`${p.first} ${p.last} jest w świetnej formie. Co pan o nim powie?`:`${p.first} ${p.last} zawodzi w ostatnich meczach. Co się dzieje?`,o:good?[
  ['chwal','To nasz kluczowy zawodnik, gra fantastycznie.',q=>{addMor(p,4);relAdd(p,3);p.tkB=0.006;p.tkBd=mdMatchDate();return `${p.last} +4 morale i lepsza gra w najbliższym meczu.`;}],
  ['zesp','Siatkówka to gra zespołowa.',q=>{for(const x of myTeam().players)addMor(x,1);if(hasT(p,'amb'))addMor(p,-2);return 'Drużyna +1 morale. Ambitny zawodnik liczył na więcej.';}],
  ['wiecej','Stać go na jeszcze więcej.',q=>{if(hasT(p,'pro')||hasT(p,'suk')){addMor(p,2);return `${p.last} odebrał to jako motywację.`;}addMor(p,-2);return `${p.last} oczekiwał pochwały.`;}]]:[
  ['wspar','Ma moje pełne zaufanie.',q=>{addMor(p,5);relAdd(p,4);return `${p.last} +5 morale — docenił wsparcie.`;}],
  ['kryt','Oczekuję od niego dużo więcej.',q=>{if(hasT(p,'pro')||hasT(p,'sta')){addMor(p,1);return `${p.last} przyjął krytykę po męsku.`;}addMor(p,-6);relAdd(p,-8);return `${p.last} poczuł się publicznie upokorzony (−6 morale, gorsza relacja).`;}],
  ['nic','Nie oceniam zawodników publicznie.',q=>{mdRel(-1);return 'Dziennikarze nie dostali historii.';}]]};}
function mdQRumor(p){return {k:'plotka',pid:p.id,t:`Mówi się, że ${p.first} ${p.last} może odejść. Czy jest na sprzedaż?`,o:[
  ['nie','Nie jest na sprzedaż.',q=>{if(p.tl){mdRel(-4);addMor(p,-2);return 'Wpadka: zawodnik jest na liście transferowej. Media to wytknęły (−relacje).';}addMor(p,3);relAdd(p,3);return `${p.last} docenił deklarację (+3 morale).`;}],
  ['cena','Każdy ma swoją cenę.',q=>{if(hasT(p,'amb')||hasT(p,'suk')){addMor(p,1);return `${p.last} nie ma nic przeciwko.`;}addMor(p,-4);relAdd(p,-5);mdRel(2);return `${p.last} poczuł się na sprzedaż (−4 morale).`;}],
  ['nic','Nie komentuję plotek.',q=>{mdRel(-1);return 'Plotka żyje dalej.';}]]};}
function mdQGoal(){return {k:'cel',t:'Jaki cel stawia pan drużynie w tym sezonie?',o:[
  ['mistrz','Gramy o mistrzostwo.',q=>{bAdd(3);MD().boast=S().n;for(const p of myTeam().players)if(hasT(p,'suk')||hasT(p,'amb'))addMor(p,3);mdRel(3);mdFol(0.02);return 'Zarząd i ambitni zawodnicy zachwyceni. Jeśli nie wyjdzie, media to przypomną.';}],
  ['plan',`Realny cel: ${goalTxt(S().goal||goalFor(SAVE.team),lgOf(SAVE.team))}.`,q=>{mdRel(1);return 'Rozsądna deklaracja.';}],
  ['krok','Krok po kroku, mecz po meczu.',q=>{mdRel(-1);return 'Asekuracyjna odpowiedź.';}]]};}
function mdQWin(m,me){const st=m.sides[me].pl.slice().sort((a,b)=>(b.st.kill+b.st.blk+b.st.ace)-(a.st.kill+a.st.blk+a.st.ace))[0];const P=st&&PLAYERS[st.id]&&PLAYERS[st.id].p;
  return {k:'wygr',t:'Co zadecydowało o zwycięstwie?',o:[
  ['druz','Cała drużyna zagrała świetnie.',q=>{for(const p of myTeam().players)addMor(p,2);return 'Drużyna +2 morale.';}],
  ...(P?[['mvp',`Fantastyczny mecz ${P.last}.`,q=>{addMor(P,5);relAdd(P,3);for(const p of myTeam().players)if(p!==P&&hasT(p,'amb'))addMor(p,-1);return `${P.last} +5 morale.`;}]]:[]),
  ['popr','Wygraliśmy, ale jest dużo do poprawy.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')?1:-1);bAdd(1);return 'Profesjonaliści docenili, reszta liczyła na pochwałę.';}]]};}
function mdQLoss(m,me){return {k:'przegr',t:'Co poszło nie tak?',o:[
  ['ja','Biorę to na siebie.',q=>{for(const p of myTeam().players){addMor(p,1);relAdd(p,1);}mdRel(1);return 'Zawodnicy docenili, że ich chronisz.';}],
  ['zaw','Zawodnicy nie zrealizowali planu.',q=>{for(const p of myTeam().players)addMor(p,hasT(p,'pro')?0:-3);bAdd(1);return 'Zarząd docenił szczerość, ale szatnia jest urażona (−3 morale).';}],
  ['sedz','Sędziowie mieli duży wpływ na wynik.',q=>{mdRel(-2);if(R()<0.35){money(-10000,'Kara za wypowiedź');finLog('Kara dyscyplinarna za krytykę sędziów',-10000);return 'Liga ukarała klub grzywną 10 tys. zł za krytykę sędziów.';}for(const p of myTeam().players)addMor(p,1);return 'Kibice po Twojej stronie, media sceptyczne.';}],
  ['nic','Nie ma o czym mówić, analizujemy.',q=>{mdRel(-1);return 'Krótko i bez emocji.';}]]};}
// ---- konferencja przed meczem ----
function mdPreFor(c){const M=MD();const key=mdKey(c);if(M.pre&&M.pre.key===key)return M.pre;if(!c||c.kind==='spar'||c.kind==='nt')return null;
  const op=mdOpp(c);const qs=[];const t=myTeam();const L=mdForm();const s=S();const rec=M.recent||(M.recent=[]);const fresh=q=>!rec.includes(q.k+(q.pid||''));
  const cand=[];if(L.length>=3&&L.filter(x=>!x).length>=2)cand.push(mdQForm(L));
  if(s.phase==='liga'&&s.round<=2&&M.goalAsked!==s.n)cand.push(mdQGoal());
  const stars=t.players.filter(p=>!p.jr&&!p.inj).sort((a,b)=>rating(b)-rating(a)).slice(0,6);const fm=p=>typeof fmOf==='function'?fmOf(p):60;
  const hot=stars.find(p=>fm(p)>=72),cold=stars.find(p=>fm(p)<=45);if(hot)cand.push(mdQPlayer(hot,true));if(cold)cand.push(mdQPlayer(cold,false));
  const rum=stars.find(p=>p.tl||(SAVE.ix&&SAVE.ix.q.some(q=>q.pid===p.id&&q.k==='oferta'))||(p.wantOut===s.n));if(rum)cand.push(mdQRumor(rum));
  const pool=cand.filter(fresh).sort(()=>R()-0.5);if(R()<0.7||pool.length<2)qs.push(mdQRival(op));for(const q of pool){if(qs.length>=2)break;qs.push(q);}if(!qs.length)qs.push(mdQRival(op));
  for(const q of qs){rec.push(q.k+(q.pid||''));}M.recent=rec.slice(-5);
  M.pre={key,qs:qs.map(q=>({k:q.k,pid:q.pid,ans:null,res:null})),op};return M.pre;}
function mdBuildQ(x,ctx){const M=MD();const t=myTeam();const p=x.pid!=null&&PLAYERS[x.pid]?PLAYERS[x.pid].p:null;
  if(x.k==='rywal')return mdQRival(ctx.op);if(x.k==='forma')return mdQForm(mdForm());if(x.k==='cel')return mdQGoal();if(x.k==='gracz'&&p)return mdQPlayer(p,(typeof fmOf==='function'?fmOf(p):60)>=60);if(x.k==='plotka'&&p)return mdQRumor(p);
  if(x.k==='wygr'||x.k==='przegr'){const m=ctx.m;return x.k==='wygr'?mdQWin(m,ctx.me):mdQLoss(m,ctx.me);}return null;}
function mdAnsPre(i,opt){const M=MD();const P=M.pre;if(!P)return;const x=P.qs[i];if(!x||x.ans)return;const q=mdBuildQ(x,{op:P.op});if(!q)return;const o=q.o.find(a=>a[0]===opt);if(!o)return;
  x.ans=opt;x.res=o[2](q);if(x.k==='cel')M.goalAsked=S().n;M.log.unshift({d:today(),t:q.t,a:o[1],r:x.res});M.log=M.log.slice(0,30);save();render();}
function mdSkipPre(){const M=MD();const P=M.pre;if(!P)return;for(const x of P.qs)if(!x.ans){x.ans='_asy';x.res='Odpowiedział asystent — bez większych skutków.';}mdRel(-1);save();render();}
function mdPreCard(c){const P=mdPreFor(c);if(!P)return '';const done=P.qs.every(x=>x.ans);
  return `<div class="card"><h2>Konferencja przed meczem${tipQ('Twoje słowa wpływają na morale zawodników, motywację rywala, zarząd i relacje z mediami. Możesz wysłać asystenta — wtedy nic się nie wydarzy, poza lekkim spadkiem relacji z mediami.')}</h2>
   ${P.qs.map((x,i)=>{const q=mdBuildQ(x,{op:P.op});if(!q)return '';return `<div style="margin:10px 0"><b>🎤 ${esc(q.t)}</b>${x.ans?`<div class="small" style="margin-top:4px">${x.ans==='_asy'?'':'Twoja odpowiedź: „'+esc((q.o.find(a=>a[0]===x.ans)||['',''])[1])+'” — '}<span class="mut">${esc(x.res||'')}</span></div>`:`<div class="row wrap" style="gap:6px;margin-top:6px">${q.o.map(o=>`<button class="ghost sm" onclick="mdAnsPre(${i},'${o[0]}')">${esc(o[1])}</button>`).join('')}</div>`}</div>`;}).join('')}
   ${done?'':`<button class="ghost sm" onclick="mdSkipPre()">Wyślij asystenta</button>`}<div class="small mut" style="margin-top:6px">Relacje z mediami: ${MD().rel}/100</div></div>`;}
// ---- konferencja po meczu (wywołanie z finishMatch) ----
function mdAfterMatch(m,c){try{if(!c||c.kind==='spar'||c.kind==='nt'||!m||!m.sides)return;const me=m.sides.findIndex(s=>s.team.idx===SAVE.team);if(me<0)return;const M=MD();
  if(M.post&&M.post.qs.some(x=>!x.ans)){mdRel(-1);}
  const won=m.winner===me;const op=m.sides[1-me].team.idx;const sc=`${m.sets.filter(s=>s[me]>s[1-me]).length}:${m.sets.filter(s=>s[me]<s[1-me]).length}`;
  M.post={key:today()+op,op,won,sc,me,qs:[{k:won?'wygr':'przegr',ans:null}],m:{sides:m.sides.map(sd=>({team:{idx:sd.team.idx},pl:sd.pl.map(p=>({id:p.id,st:{kill:p.st.kill,blk:p.st.blk,ace:p.st.ace}}))}))}};
  M.pre=null;}catch(e){console.error(e);}}
function mdAnsPost(i,opt){const M=MD();const P=M.post;if(!P)return;const x=P.qs[i];if(!x||x.ans)return;const q=mdBuildQ(x,{m:P.m,me:P.me});if(!q)return;const o=q.o.find(a=>a[0]===opt);if(!o)return;
  x.ans=opt;x.res=o[2](q);M.log.unshift({d:today(),t:q.t,a:o[1],r:x.res});M.log=M.log.slice(0,30);save();render();}
function mdPostPending(){const P=SAVE.md&&SAVE.md.post;return P&&P.qs.some(x=>!x.ans)?1:0;}
// zapowiedź mistrzostwa rozliczana na koniec sezonu (z seasonEvaluation przez hook)
function mdSeasonEnd(place){const M=MD();if(M.boast!==S().n)return;if(place===1){mdRel(6);news('🎤 Zapowiadałeś mistrzostwo i dotrzymałeś słowa. Media są pod wrażeniem.');}else{mdRel(-5);bAdd(-5);news(`🎤 Zapowiadałeś mistrzostwo, a skończyło się na ${place}. miejscu. Media i zarząd to wypominają.`);}}
// raz w miesiącu: relacje z mediami działają na zarząd i kibiców
function mdMonthly(){if(SAVE.team==null||!SAVE.md)return;const r=SAVE.md.rel;if(r>=70){bAdd(1);mdFol(0.01);}else if(r<=30){bAdd(-1);mdFol(-0.01);}}
function mdView(){const M=MD();const c=myNext();const P=M.post;
  const post=P?`<div class="card"><h2>Konferencja po meczu z ${esc(tmN2(P.op))} (${P.won?'wygrana':'porażka'} ${P.sc})</h2>${P.qs.map((x,i)=>{const q=mdBuildQ(x,{m:P.m,me:P.me});if(!q)return '';return `<div style="margin:10px 0"><b>🎤 ${esc(q.t)}</b>${x.ans?`<div class="small" style="margin-top:4px">Twoja odpowiedź: „${esc((q.o.find(a=>a[0]===x.ans)||['',''])[1])}” — <span class="mut">${esc(x.res||'')}</span></div>`:`<div class="row wrap" style="gap:6px;margin-top:6px">${q.o.map(o=>`<button class="ghost sm" onclick="mdAnsPost(${i},'${o[0]}')">${esc(o[1])}</button>`).join('')}</div><div class="small mut">Bez odpowiedzi do następnego meczu: lekki spadek relacji z mediami.</div>`}</div>`;}).join('')}</div>`:'';
  return `<div class="card"><h2>Relacje z mediami${tipQ('Powyżej 70: co miesiąc lekko rośnie zaufanie zarządu i liczba fanów. Poniżej 30: odwrotnie. Rosną przy ciekawych odpowiedziach, spadają przy unikaniu pytań i wpadkach.')}</h2>
    <div class="row"><div class="conf"><i style="width:${M.rel}%;background:${M.rel>=60?'var(--good)':M.rel>=35?'#eab308':'var(--bad)'}"></i></div><b style="margin-left:8px">${M.rel}/100</b></div>${M.boast===S().n?'<div class="small" style="margin-top:6px">📌 Zapowiedziałeś walkę o mistrzostwo — media rozliczą to po sezonie.</div>':''}</div>
   ${post}${c&&c.kind!=='spar'&&c.kind!=='nt'?mdPreCard(c):''}
   ${M.log.length?`<div class="card"><h2>Ostatnie wypowiedzi</h2>${M.log.slice(0,8).map(l=>`<div class="small" style="margin:6px 0"><span class="mut">${fmtShort(l.d)}</span> 🎤 ${esc(l.t)}<br>„${esc(l.a)}” — <span class="mut">${esc(l.r)}</span></div>`).join('')}</div>`:''}`;}

ROZ_TABS.push(['media','Media',()=>mdPostPending()]);
