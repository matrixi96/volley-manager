// ================= ZGŁOŚ BŁĄD: przycisk na dole menu, formularz z danymi technicznymi =================
const BUG_REPO='https://github.com/matrixi96/volley-manager/issues/new';
// ostatnie błędy z gry (bez danych osobowych) — dołączane do zgłoszenia
const ERRLOG=[];
function errPush(t){try{t=String(t||'').slice(0,300);if(!t||ERRLOG.length&&ERRLOG[ERRLOG.length-1].t===t)return;ERRLOG.push({d:new Date().toISOString().slice(11,19),t});if(ERRLOG.length>15)ERRLOG.shift();}catch(e){}}
window.addEventListener('error',e=>errPush((e.message||'błąd')+(e.filename?` @${String(e.filename).split('/').pop()}:${e.lineno}`:'')));
window.addEventListener('unhandledrejection',e=>errPush('Promise: '+(e.reason&&e.reason.message||e.reason)));
{const _ce=console.error.bind(console);console.error=function(){try{errPush([...arguments].map(x=>x&&x.message?x.message+(x.stack?' | '+String(x.stack).split('\n')[1]:''):String(x)).join(' '));}catch(e){}return _ce.apply(console,arguments);};}
const BUG_KINDS=[['bug','🐞 Błąd'],['ui','🖥️ Wygląd / czytelność'],['bal','⚖️ Balans gry'],['idea','💡 Pomysł'],['inne','Inne']];
function bugTech(){const L=[];try{L.push('Wersja: '+(typeof APPV!=='undefined'?APPV:'?')+' ('+((document.querySelector('meta[name=vmv]')||{}).content||'')+')');}catch(e){}
  try{L.push('Ekran: '+(NAV_L[ui.tab]||ui.tab)+(ui.match&&!ui.match.over?' (trwa mecz)':''));}catch(e){}
  try{if(SAVE&&SAVE.team!=null){L.push(`Klub: ${TEAMS[SAVE.team].name} (${LG_SHORT[myLg()]}), sezon ${S().n}, faza ${S().phase}, data ${today()}`);}}catch(e){}
  try{L.push('Język: '+(typeof LANG!=='undefined'?LANG:'pl')+' · motyw: '+themeCur()+' · hala: '+(ui.v3d?'3D':'2D'));}catch(e){}
  try{L.push('Urządzenie: '+navigator.userAgent.replace(/\s+/g,' ').slice(0,160)+' · ekran '+screen.width+'×'+screen.height);}catch(e){}
  if(ERRLOG.length)L.push('Ostatnie błędy:\n'+ERRLOG.map(x=>`  ${x.d} ${x.t}`).join('\n'));else L.push('Ostatnie błędy: brak');
  return L.join('\n');}
function bugOpen(){ui.bug={k:'bug',t:'',d:'',tech:1};ui.navOpen=false;render();}
function bugText(){const b=ui.bug;const kind=(BUG_KINDS.find(x=>x[0]===b.k)||['',''])[1];
  return `**Rodzaj:** ${kind}\n\n**Co się stało / co proponujesz:**\n${b.d||'(brak opisu)'}\n\n**Jak to powtórzyć:**\n${b.steps||'—'}\n${b.tech?`\n---\n**Dane techniczne**\n\`\`\`\n${bugTech()}\n\`\`\``:''}`;}
function bugRead(){const g=id=>{const e=document.getElementById(id);return e?e.value:'';};const b=ui.bug;b.t=g('bugt').trim();b.d=g('bugd').trim();b.steps=g('bugs').trim();}
function bugSend(){bugRead();const b=ui.bug;if(!b.t&&!b.d){b.err='Napisz krótki tytuł albo opis.';render();return;}
  const kind=(BUG_KINDS.find(x=>x[0]===b.k)||['',''])[1].replace(/^\S+\s/,'');const title=`[${kind}] ${b.t||b.d.slice(0,60)}`;
  let body=bugText();if(body.length>6000)body=body.slice(0,6000)+'\n…';
  const url=`${BUG_REPO}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(b.k==='idea'?'enhancement':'bug')}`;
  bugKeep('github');try{window.open(url,'_blank');}catch(e){location.href=url;}b.done='Otworzyłem stronę zgłoszenia na GitHubie — sprawdź treść i kliknij „Submit new issue”. Potrzebne jest darmowe konto GitHub.';render();}
function bugCopy(){bugRead();const b=ui.bug;const txt=`${b.t}\n\n${bugText()}`;bugKeep('kopia');
  const ok=()=>{b.done='Skopiowano zgłoszenie do schowka — wklej je tam, gdzie je wysyłasz (e-mail, Discord, Messenger).';render();};
  try{navigator.clipboard.writeText(txt).then(ok,()=>{b.show=txt;render();});}catch(e){b.show=txt;render();}}
function bugKeep(how){try{const L=JSON.parse(uiPref('bugs','[]'));L.unshift({d:new Date().toISOString().slice(0,16),t:ui.bug.t||ui.bug.d.slice(0,60),how});uiPrefSet('bugs',JSON.stringify(L.slice(0,20)));}catch(e){}}
function bugModal(){const b=ui.bug;if(!b)return '';
  return `<div class="modal" onclick="if(event.target===this){ui.bug=null;render()}"><div class="mcard bugcard">
   <div class="row"><h2 style="margin:0">🐞 ${_t('Zgłoś błąd')}</h2><span class="sp"></span><button class="ghost" onclick="ui.bug=null;render()">✕</button></div>
   ${b.done?`<p class="good">${esc(b.done)}</p><div class="row" style="gap:8px"><button class="btn" onclick="ui.bug=null;render()">${_t('Zamknij')}</button></div>`:`
   <p class="small mut">${_t('Dziękujemy! Każde zgłoszenie pomaga poprawić grę. Opisz, co się stało i co robiłeś chwilę wcześniej.')}</p>
   <div class="seg" style="flex-wrap:wrap;margin:8px 0">${BUG_KINDS.map(([k,l])=>`<button class="${b.k===k?'on':''}" onclick="bugRead();ui.bug.k='${k}';render()">${l}</button>`).join('')}</div>
   <label class="bugl">${_t('Tytuł')}<input id="bugt" maxlength="90" value="${esc(b.t||'')}" placeholder="${_t('np. Mecz zatrzymał się po 2. secie')}"></label>
   <label class="bugl">${_t('Co się stało?')}<textarea id="bugd" rows="4" placeholder="${_t('Opisz problem albo pomysł')}">${esc(b.d||'')}</textarea></label>
   <label class="bugl">${_t('Jak to powtórzyć? (opcjonalnie)')}<textarea id="bugs" rows="2" placeholder="${_t('np. Poczta → raport skauta → kliknąłem „Profil”')}">${esc(b.steps||'')}</textarea></label>
   <label class="row small" style="gap:6px;margin:6px 0"><input type="checkbox" ${b.tech?'checked':''} onchange="bugRead();ui.bug.tech=this.checked?1:0;render()"> ${_t('Dołącz dane techniczne (wersja, ekran, urządzenie, ostatnie błędy)')}</label>
   ${b.tech?`<details class="small"><summary>${_t('Pokaż dane techniczne')}</summary><pre class="bugpre">${esc(bugTech())}</pre></details>`:''}
   ${b.err?`<p class="small bad">${esc(b.err)}</p>`:''}
   ${b.show?`<textarea class="code" readonly onclick="this.select()">${esc(b.show)}</textarea>`:''}
   <div class="row wrap" style="gap:8px;margin-top:10px"><button class="btn" onclick="bugSend()">${_t('Wyślij przez GitHub')}</button><button class="ghost" onclick="bugCopy()">${_t('Kopiuj zgłoszenie')}</button></div>
   <p class="small mut" style="margin-top:6px">${_t('Do zgłoszenia nie trafia Twój zapis gry ani żadne dane osobowe.')}</p>`}</div></div>`;}
// przycisk na dole menu bocznego + okno nad wszystkimi ekranami
{const _nav=sideNav;sideNav=function(){const h=_nav.apply(this,arguments);return h.replace('<div class="nfoot">',`<div class="nfoot"><button class="nav small bugbtn" onclick="bugOpen()" title="${_t('Zgłoś błąd')}"><span class="ic">🐞</span><span class="tx">${_t('Zgłoś błąd')}</span></button>`);};}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{let el=document.getElementById('bugwrap');if(ui.bug){if(!el){el=document.createElement('div');el.id='bugwrap';document.body.appendChild(el);}
  const f=document.activeElement&&document.activeElement.id;const keep=f&&/^bug[tds]$/.test(f)?[f,document.activeElement.selectionStart]:null;el.innerHTML=bugModal();if(keep){const x=document.getElementById(keep[0]);if(x){x.focus();try{x.setSelectionRange(keep[1],keep[1]);}catch(e){}}}}else if(el)el.remove();}catch(e){}return r;};}
