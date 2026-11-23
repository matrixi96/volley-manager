// ================= MENU, KTÓRE ROŚNIE RAZEM Z GRACZEM =================
// Nowy gracz zaczyna z 8 zakładkami, a kolejne odblokowują się po pierwszym meczu, tygodniu, w oknie
// transferowym, przy naborze do akademii i po miesiącu. Każde odblokowanie to krótka wiadomość w poczcie.
// SAVE.navMode: undefined/'all' = pełne menu (stare zapisy i „Znam takie gry”), 'new' = menu rośnie
// (wybór „Jestem nowy” w kreatorze trenera przy nowej grze). SAVE.navUn = {zakładka:1} — zakładki już odblokowane.
const NAV_BASE=['home','poczta','mecz','sklad','taktyka','trening','tabela','finanse'];
const NAV_STEPS=[
 ['m1',['kalendarz','staty','rozmowy'],'Po pierwszym meczu','Terminarz pokazuje wszystkie mecze sezonu, Statystyki — kto gra najlepiej w lidze, a w Rozmowach odpowiadasz na sprawy zawodników.'],
 ['w1',['sztab','sponsorzy','klub'],'Pierwszy tydzień za Tobą','W Sztabie zatrudniasz trenerów i skautów oraz przekazujesz im obowiązki. W Sponsorach podpisujesz umowy, a w Infrastrukturze rozbudowujesz halę i ośrodek treningowy.'],
 ['tr',['skauting','transfery'],'Okno transferowe','Skauting pozwala poznać zawodników z innych klubów, a w Transferach kupujesz, sprzedajesz i wypożyczasz zawodników.'],
 ['jr',['juniorzy'],'Nabór do akademii','W Juniorach oceniasz kandydatów z naboru, rozwijasz młodzież i promujesz ją do pierwszej drużyny.'],
 ['mo',['dane','social','strategia','trener','kadra','historia','osiagniecia'],'Miesiąc w klubie','W menu pojawiają się Centrum danych, Social media, Strategia klubu, rozwój Trenera, Reprezentacja, Historia i Osiągnięcia.'],
];
function navGrow(){return SAVE&&SAVE.team!=null&&SAVE.navMode==='new';}
function navUn(){return SAVE.navUn||(SAVE.navUn={});}
function navVisible(k){if(!navGrow())return true;return NAV_BASE.includes(k)||!!navUn()[k];}
function navDays(){try{return daysBetween(SAVE.ctrlFrom||(SAVE.coach&&SAVE.coach.joined)||GAME_START,today());}catch(e){return 0;}}
function navStepDone(st){return st[1].every(k=>navUn()[k]);}
function navUnlock(id,quiet){if(!navGrow())return;const st=NAV_STEPS.find(x=>x[0]===id);if(!st||navStepDone(st))return;
  const U=navUn();st[1].forEach(k=>U[k]=1);
  if(!quiet&&typeof sendMail==='function'){const nm=st[1].map(k=>NAV_L[k]).join(', ');
    sendMail({cat:'klub',from:typeof asyName==='function'?asyName():'Asystent',t:(st[1].length>1?'Nowe zakładki: ':'Nowa zakładka: ')+nm,s:st[3].slice(0,90),b:{type:'text',x:st[2]+'. '+st[3]+(id==='mo'&&!navUn().juniorzy?' Zakładka Juniorzy dojdzie w maju, przy naborze do akademii.':'')+' Nowe pozycje znajdziesz w menu po lewej.'},ic:'🧭'});}
  if(NAV_STEPS.every(navStepDone))SAVE.navMode='all';}
function navCheck(d){if(!navGrow())return;const n=navDays();
  if(n>=7)navUnlock('w1');
  if((typeof windowOpen==='function'&&windowOpen()&&n>=3)||n>=60)navUnlock('tr');
  const mo=+String(d||today()).slice(5,7);if(mo===5||mo===6)navUnlock('jr');
  if(n>=30)navUnlock('mo');}
function navChoose(m){if(m==='new'){SAVE.navMode='new';SAVE.navUn={};
    try{const D=DL();['contr','infra','jr'].forEach(k=>D.on[k]=1);}catch(e){}navCheck(today());}
  else SAVE.navMode='all';save();render();}
function navShowAll(v){if(SAVE.team==null)return;v=+v;if(v)SAVE.navMode='all';else{SAVE.navMode='new';navCheck(today());}save();render();}
// menu boczne pokazuje tylko odblokowane zakładki (lista do zmiany kolejności w ustawieniach — wszystkie)
let NAV_FILT=false;
{const _ng=navGroups;navGroups=function(){const G=_ng.apply(this,arguments);if(!NAV_FILT||!navGrow())return G;return G.map(([g,ks])=>[g,ks.filter(navVisible)]).filter(([g,ks])=>ks.length);};}
{const _sn=sideNav;sideNav=function(){NAV_FILT=true;try{return _sn.apply(this,arguments);}finally{NAV_FILT=false;}};}
// zakładka otwarta z linku (np. z wiadomości) zostaje w menu
{const _go=go;go=function(tab){try{if(navGrow()&&!navVisible(tab)&&NAV_L[tab]&&tab!=='zapis'&&tab!=='test')navUn()[tab]=1;}catch(e){}return _go.apply(this,arguments);};}
// nowa kariera: tryb menu wybrany w kreatorze trenera (ui.ccNav: 'new' domyślnie albo 'all')
function navStart(){try{if(SAVE.team!=null&&SAVE.navMode==null){SAVE.navMode='all';navChoose(ui.ccNav||'new');}}catch(e){console.error(e);}ui.ccNav=null;}
pickTeam=(f=>function(){const r=f.apply(this,arguments);navStart();return r;})(pickTeam);
if(typeof foundClub==='function')foundClub=(f=>function(){const r=f.apply(this,arguments);navStart();return r;})(foundClub);
// odblokowania: codziennie i po pierwszym meczu
{const _md=mailDaily;mailDaily=function(d){const r=_md.apply(this,arguments);try{navCheck(d);}catch(e){console.error(e);}return r;};}
{const _mm=mailMatch;mailMatch=function(m,c){const r=_mm.apply(this,arguments);try{if(navGrow())navUnlock('m1');}catch(e){console.error(e);}return r;};}
// wybór w kreatorze trenera (nowa gra)
function navPick(m){ui.ccNav=m;render();}
function navPickBlock(){const m=ui.ccNav||'new';
  return `<div class="card" style="border:1px solid var(--acc);margin-top:14px"><h3 style="margin-top:0">${_t('Czy grałeś już w gry menedżerskie?')}</h3>
  <p class="small mut">${_t('Gra ma dużo zakładek. Jeśli grasz w menedżera pierwszy raz, zacznij od podstaw — kolejne zakładki pojawią się same, a asystent napisze, do czego służą.')}</p>
  <div class="opts"><button class="opt ${m==='new'?'on':''}" onclick="navPick('new')"><b>🌱 ${_t('Jestem nowy')}</b><small>${_t('Na start 8 zakładek, kolejne odblokowują się w trakcie gry. Sztab sam zajmie się kontraktami, rozbudową obiektów i juniorami.')}</small></button>
   <button class="opt ${m==='all'?'on':''}" onclick="navPick('all')"><b>🎓 ${_t('Znam takie gry')}</b><small>${_t('Od razu całe menu, wszystkie decyzje należą do Ciebie.')}</small></button></div>
  <p class="small mut" style="margin-top:6px">${_t('Zmienisz to w każdej chwili w Ustawieniach → Ogólne.')}</p></div>`;}
{const _cv=coachCreateView;coachCreateView=function(){let h=_cv.apply(this,arguments);try{const d=ccDraft();if(SAVE.team!=null||d.step!==1)return h;
  const mk='<div class="row wrap" style="margin-top:14px"><h3 style="margin:0">';const i=h.indexOf(mk);if(i>=0)h=h.slice(0,i)+navPickBlock()+h.slice(i);}catch(e){console.error(e);}return h;};}
// przełącznik w Ustawieniach → Ogólne
{const _sg=setGeneral;setGeneral=function(){let h=_sg.apply(this,arguments);try{if(SAVE.team==null)return h;const all=!navGrow();
  const row=setRow(_t('Zakładki w menu'),setSeg("navShowAll(#)",[['1',_t('Wszystkie')],['0',_t('Odblokowywane stopniowo')]],all?'1':'0'),_t('Stopniowo: nowe zakładki pojawiają się w miarę gry, z wiadomością od asystenta.'));
  const i=h.indexOf('</h2>');if(i>=0)h=h.slice(0,i+5)+row+h.slice(i+5);}catch(e){console.error(e);}return h;};}
