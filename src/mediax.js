// ================= MEDIA W POCZCIE I NA EKRANIE GŁÓWNYM: konferencje jako wiadomości, wypowiedzi w aktualnościach =================
MAIL_CAT.media=['Media','#c084fc'];
function mdPressFrom(){return 'Rzecznik prasowy klubu';}
// treść wiadomości: pytania z przyciskami (gdy konferencja aktualna) albo zapis odpowiedzi
function mdQList(P,ctx,fn){return P.qs.map((x,i)=>{const q=mdBuildQ(x,ctx);if(!q)return '';
  return `<div class="mdq"><b>🎤 ${esc(q.t)}</b>${x.ans?`<div class="small" style="margin-top:4px">${x.ans==='_asy'?'':'Twoja odpowiedź: „'+esc((q.o.find(a=>a[0]===x.ans)||['',''])[1])+'” — '}<span class="mut">${esc(x.res||'')}</span></div>`
    :`<div class="mdopts">${q.o.map(o=>`<button class="ghost sm" onclick="${fn}(${i},'${o[0]}')">${esc(o[1])}</button>`).join('')}</div>`}</div>`;}).join('');}
function mdMailHtml(m){const b=m.b;const M=MD();
  const P=b.w==='pre'?M.pre:M.post;const live=P&&P.key===b.key;
  if(live){const ctx=b.w==='pre'?{op:P.op}:{m:P.m,me:P.me};const done=P.qs.every(x=>x.ans);
    return `<p class="mtext">${b.w==='pre'?`Dziennikarze czekają na konferencję przed meczem z <b>${esc(tmN2(P.op))}</b>. Twoje słowa wpływają na morale zawodników, motywację rywala, zarząd i relacje z mediami.`:`Konferencja po meczu z <b>${esc(tmN2(P.op))}</b> (${P.won?'wygrana':'porażka'} ${P.sc}).`}</p>
     ${mdQList(P,ctx,b.w==='pre'?'mdAnsPre':'mdAnsPost')}
     <div class="mact">${done?'':`<button class="ghost" onclick="${b.w==='pre'?'mdSkipPre()':'mdSkipPost()'}">Wyślij asystenta</button>`}<button class="ghost" onclick="ui.ixTab='media';go('rozmowy')">Wszystkie wypowiedzi</button></div>
     <p class="small mut">Relacje z mediami: ${M.rel}/100. ${b.w==='pre'?'Bez odpowiedzi przed meczem relacje lekko spadną.':'Bez odpowiedzi do następnego meczu relacje lekko spadną.'}</p>`;}
  const L=b.done||[];
  return `<p class="mtext">${L.length?'Zapis konferencji:':'Ta konferencja już się odbyła.'}</p>${L.map(l=>`<div class="mdq"><b>🎤 ${esc(l.t)}</b><div class="small" style="margin-top:4px">${l.a?'„'+esc(l.a)+'” — ':''}<span class="mut">${esc(l.r)}</span></div></div>`).join('')}`;}
{const _mb=mailBodyHtml;mailBodyHtml=function(m){if(m.b&&m.b.type==='md')return mdMailHtml(m);return _mb.apply(this,arguments);};}
function mdTagLog(n0,w){const M=MD();const P=w==='pre'?M.pre:M.post;if(!P||!M.log||!M.log[0])return;if(M.log[0].op==null){M.log[0].op=P.op;M.log[0].w=w;}}
// zapis odpowiedzi w wiadomości + zdjęcie „Wymaga działania”
function mdSync(w){const M=MD();const P=w==='pre'?M.pre:M.post;if(!P)return;const m=mailBox().find(x=>x.b&&x.b.type==='md'&&x.b.w===w&&x.b.key===P.key);if(!m)return;
  const ctx=w==='pre'?{op:P.op}:{m:P.m,me:P.me};
  m.b.done=P.qs.filter(x=>x.ans).map(x=>{const q=mdBuildQ(x,ctx);return {t:q?q.t:'',a:x.ans==='_asy'?'':(q&&(q.o.find(a=>a[0]===x.ans)||['',''])[1])||'',r:x.res||''};});
  if(P.qs.every(x=>x.ans)){m.act=0;m.r=1;}}
{const _a=mdAnsPre;mdAnsPre=function(){const n0=(MD().log||[]).length;const r=_a.apply(this,arguments);mdTagLog(n0,'pre');mdSync('pre');save();render();return r;};}
{const _a=mdAnsPost;mdAnsPost=function(){const n0=(MD().log||[]).length;const r=_a.apply(this,arguments);mdTagLog(n0,'post');mdSync('post');save();render();return r;};}
{const _a=mdSkipPre;mdSkipPre=function(){const r=_a.apply(this,arguments);mdSync('pre');save();render();return r;};}
function mdSkipPost(){const M=MD();const P=M.post;if(!P)return;for(const x of P.qs)if(!x.ans){x.ans='_asy';x.res='Odpowiedział asystent — bez większych skutków.';}mdRel(-1);mdSync('post');save();render();}
// po meczu: wiadomość z konferencją (poprzednia, bez odpowiedzi, zostaje z zapisem)
{const _am=mdAfterMatch;mdAfterMatch=function(m,c){const M=MD();const oldPost=M.post,oldPre=M.pre;
  if(oldPost)mdSync('post');if(oldPre)mdSync('pre');
  for(const x of mailBox())if(x.b&&x.b.type==='md'&&x.act){x.act=0;}
  const r=_am.apply(this,arguments);
  try{const P=MD().post;if(P&&P!==oldPost&&SAVE.team!=null){const q=mdBuildQ(P.qs[0],{m:P.m,me:P.me});
    sendMail({cat:'media',from:mdPressFrom(),t:`Konferencja po meczu z ${tmN2(P.op)} (${P.won?'wygrana':'porażka'} ${P.sc})`,s:q?q.t:'Dziennikarze czekają na Twoje słowa.',b:{type:'md',w:'post',key:P.key},act:1,lab:'Konferencja',ic:'🎤'});}}catch(e){console.error(e);}
  return r;};}
// przed meczem: wiadomość, gdy do meczu zostały najwyżej 2 dni
{const _md=mailDaily;mailDaily=function(d){const r=_md.apply(this,arguments);try{if(SAVE.team!=null&&S()){const c=myNext();const e=nextEvent();
  if(c&&e&&c.kind!=='spar'&&c.kind!=='nt'&&daysBetween(d,e.d)<=2&&daysBetween(d,e.d)>=0){const P=mdPreFor(c);
    if(P&&!P.mailed&&P.qs.some(x=>!x.ans)){P.mailed=1;const q=mdBuildQ(P.qs[0],{op:P.op});
      sendMail({cat:'media',from:mdPressFrom(),t:`Konferencja przed meczem z ${tmN2(P.op)}`,s:q?q.t:'Dziennikarze czekają na konferencję.',b:{type:'md',w:'pre',key:P.key},act:1,lab:'Konferencja',ic:'🎤'});}}}}catch(e){console.error(e);}return r;};}
// ---- ekran główny: wypowiedzi i konferencje w aktualnościach ----
function mdFeed(){const M=MD();const add=[];
  for(const w of ['pre','post']){const P=w==='pre'?M.pre:M.post;if(!P||!P.qs.some(x=>!x.ans))continue;const m=mailBox().find(x=>x.b&&x.b.type==='md'&&x.b.w===w&&x.b.key===P.key);if(!m)continue;
    add.push({d:m.d,k:'Media',ic:'🎤',t:`${w==='pre'?'Konferencja przed meczem':'Konferencja po meczu'} z ${esc(tmN2(P.op))} — czeka na Twoje odpowiedzi`,pr:3,b:'<b class="warn">Wymaga działania</b>',go:`ui.mailSel='${m.id}';go('poczta')`});}
  const cn=(SAVE.coach&&SAVE.coach.last)?`Trener ${SAVE.coach.first?SAVE.coach.first[0]+'. ':''}${SAVE.coach.last}`:'Trener';
  for(const l of (M.log||[]).slice(0,4)){const ctx=l.op!=null&&TEAMS[l.op]?` ${l.w==='post'?'po meczu z':'przed meczem z'} ${tmN2(l.op)}`:'';
    add.push({d:l.d,pr:2,k:'Media',ic:'🎤',t:l.a?`${esc(cn)}${esc(ctx)}: „${esc(l.a)}”`:`${esc(cn)}${esc(ctx)} — w jego imieniu odpowiedział asystent`,b:`Pytanie: ${esc(l.t)} · ${esc(l.r)}`,go:"ui.ixTab='media';go('rozmowy')"});}
  return add;}
