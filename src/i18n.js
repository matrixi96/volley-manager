// ================= JĘZYK GRY (polski / angielski) =================
// _t('Polski tekst', a0, a1…) → tłumaczenie ze słownika EN (gdy język = en), {0} {1} = wstawione wartości. Brak w słowniku = tekst polski.
var LANG=(function(){try{return localStorage.getItem('vm_lang')||'pl';}catch(e){return 'pl';}})();
const EN={
 // menu boczne
 'Przegląd':'Overview','Drużyna':'Team','Rekrutacja':'Recruitment','Klub':'Club','Świat':'World',
 'Ekran główny':'Home','Poczta':'Inbox','Rozmowy':'Conversations','Mecz i sezon':'Match & season','Terminarz':'Schedule',
 'Skład':'Squad','Taktyka':'Tactics','Centrum danych':'Data hub','Trening':'Training','Juniorzy':'Youth',
 'Skauting':'Scouting','Transfery':'Transfers','Sztab':'Staff','Infrastruktura':'Facilities','Sponsorzy':'Sponsors','Social media':'Social media',
 'Finanse':'Finances','Strategia klubu':'Club vision','Trener':'Manager','Tabela':'Tables','Reprezentacja':'National team','Statystyki':'Statistics',
 'Historia':'History','Osiągnięcia':'Achievements','Zapis gry':'Save game','Test silnika':'Engine test','Kalendarz':'Calendar',
 // górny pasek i pasek kontekstu
 'Szukaj zawodnika…':'Search player…','NASTĘPNY DZIEŃ':'NEXT DAY','Przejdź do następnego dnia':'Go to the next day','WRÓĆ DO MECZU':'BACK TO MATCH','GRAJ MECZ':'PLAY MATCH','DALEJ':'CONTINUE',
 'Sezon':'Season','Sparingi':'Friendlies','Przerwa':'Off-season','Koniec sezonu':'End of season','Play-off':'Play-offs',
 'Rozgrywki':'Competition','Następny rywal':'Next opponent','Morale':'Morale','Zgranie':'Cohesion','Zarząd':'Board','Kibice':'Fans','Pozycja':'Position','Budżet':'Balance',
 'Sparing {0}/{1}':'Friendly {0}/{1}','{0} · {1}. kolejka':'{0} · round {1}','wolny':'free agent','Brak zawodników.':'No players.',
 // pozycje
 'Rozgrywający':'Setter','Atakujący':'Opposite','Przyjmujący':'Outside hitter','Środkowy':'Middle blocker','Libero':'Libero',
 'ROZ':'SET','ATA':'OPP','PRZ':'OH','ŚRO':'MB','LIB':'LIB',
 // ligi
 '1. Liga':'1st League','2. Liga':'2nd League',
 // ekran startowy
 'OSTATNIA':'LATEST','Kontynuuj: {0}':'Continue: {0}','sezon {0}':'season {0}','ROZPOCZNIJ NOWĄ GRĘ':'START NEW GAME','NA PEWNO? OBECNA KARIERA ZOSTANIE ZASTĄPIONA':'ARE YOU SURE? YOUR CURRENT CAREER WILL BE REPLACED',
 'Jeśli chcesz ją zachować, najpierw zapisz ją w slocie (Ustawienia i zapis gry).':'To keep it, save it to a slot first (Settings & save).','Anuluj':'Cancel','WCZYTAJ GRĘ':'LOAD GAME','Ustawienia':'Settings','Instrukcja':'Guide',
 'Co nowego w v{0} ↗':'What\'s new in v{0} ↗','Wyjście':'Exit','Slot {0}':'Slot {0}','Wczytaj':'Load','Albo wklej kod zapisu:':'Or paste a save code:','Wczytaj z kodu':'Load from code','← Wróć':'← Back',
 'INSTRUKCJA':'GUIDE','CO NOWEGO':'WHAT\'S NEW','Pokaż samouczek w grze':'Show the in-game tutorial','pusty':'empty',
 'Menu główne':'Main menu','⏏ Menu główne':'⏏ Main menu','Ustawienia i zapis gry':'Settings & save game',
 // ustawienia wyglądu i języka
 'Wygląd':'Appearance','Motyw:':'Theme:','Grafit':'Graphite','Granat (kolor klubu)':'Navy (club colour)','Klasyczny (złoty)':'Classic (gold)','Kolejność menu bocznego':'Side menu order',
 'Na komputerze możesz po prostu przeciągać pozycje w menu po lewej. Tutaj — strzałkami (działa też na telefonie).':'On a computer just drag items in the left menu. Here you can use the arrows (works on phones too).',
 'Przywróć domyślną kolejność':'Restore default order','Język':'Language','Język / Language':'Language / Język',
 'Tłumaczenie na angielski jest w trakcie — część ekranów jest jeszcze po polsku.':'The English translation is in progress — some screens are still in Polish.',
 ' — przeciągnij, żeby zmienić kolejność':' — drag to reorder','VOLLEY MANAGER':'VOLLEY MANAGER','GOLDEN SET':'GOLDEN SET','VOLLEYBALL CLUB MANAGER':'VOLLEYBALL CLUB MANAGER',
 // dźwięk
 'Dźwięk':'Sound','Dźwięk włączony':'Sound on','Głośność':'Volume','Dźwięki meczu (piłka, gwizdek, kibice)':'Match sounds (ball, whistle, crowd)','Powiadomienia (nowa wiadomość)':'Notifications (new message)','▶ Posłuchaj':'▶ Listen',
 'Dźwięki są generowane w grze. Szybka symulacja meczu jest cicha.':'Sounds are generated in-game. Quick match simulation is silent.',
};
function _t(s){let r=(LANG==='en'&&EN[s]!=null)?EN[s]:s;for(let i=1;i<arguments.length;i++)r=r.split('{'+(i-1)+'}').join(arguments[i]);return r;}
function langSet(l){try{localStorage.setItem('vm_lang',l);}catch(e){}location.reload();}
function langBtns(){return `<div class="seg"><button class="${LANG==='pl'?'on':''}" onclick="langSet('pl')">🇵🇱 Polski</button><button class="${LANG==='en'?'on':''}" onclick="langSet('en')">🇬🇧 English</button></div>`;}
// stałe nazwy (pozycje, dni, miesiące, ligi) podmieniane raz przy starcie
function i18nApply(){if(LANG!=='en')return;
  for(const k in POS_NAMES)POS_NAMES[k]=_t(POS_NAMES[k]);for(const k in POS_SHORT)POS_SHORT[k]=_t(POS_SHORT[k]);
  if(typeof DOW!=='undefined')DOW.splice(0,7,'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
  if(typeof DOW_S!=='undefined')DOW_S.splice(0,7,'Sun','Mon','Tue','Wed','Thu','Fri','Sat');
  if(typeof MON_GEN!=='undefined')MON_GEN.splice(0,12,'January','February','March','April','May','June','July','August','September','October','November','December');
  if(typeof MON_NOM!=='undefined')MON_NOM.splice(0,12,'January','February','March','April','May','June','July','August','September','October','November','December');
  if(typeof MON_S!=='undefined')MON_S.splice(0,12,'jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec');
  if(typeof LG_N!=='undefined')for(let i=0;i<LG_N.length;i++)LG_N[i]=_t(LG_N[i]);
  if(typeof PHASE_NAMES!=='undefined')Object.assign(PHASE_NAMES,{off:'Transfer window',spar:'Pre-season',liga:'Regular season',po:'Play-offs',end:'End of season'});
  if(typeof NAV_L!=='undefined')for(const k in NAV_L)NAV_L[k]=_t(NAV_L[k]);
  try{document.documentElement.lang='en';}catch(e){}}
