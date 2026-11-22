// ================= SAMOUCZKI ZAKŁADEK, OBCOKRAJOWCY W TRANSFERACH, KOLOR KLUBU =================
// Samouczek pokazuje się przy pierwszym wejściu do każdej zakładki („Wprowadzenie”).
// „Rozumiem” zamyka go dla tej zakładki; przycisk „?” na pasku pod nagłówkiem otwiera go ponownie.
const GUIDES={
 home:['Ekran główny','Twoje centrum dowodzenia: najbliższy mecz, forma drużyny, tabela i najważniejsze wiadomości w jednym miejscu.',
  ['Przycisk „Kontynuuj” w prawym górnym rogu przesuwa czas do następnego wydarzenia (trening, mecz, wiadomość wymagająca decyzji).',
   'Panel analizy rywala pokazuje mocne i słabe strony najbliższego przeciwnika — przyda się przy ustawianiu taktyki.',
   'Kliknij herb albo nazwę drużyny, żeby przejść do jej szczegółów.']],
 poczta:['Poczta','Tu trafiają raporty sztabu, oferty transferowe, sprawy zarządu, mediów i agentów.',
  ['Wiadomości z przyciskami wymagają Twojej decyzji — zakładka „Zadania” zbiera je w jednym miejscu.',
   'Filtruj po kategoriach (Transfery, Kontuzje, Trening…), żeby szybko znaleźć ważne rzeczy.',
   'Raporty treningu (dzienne, tygodniowe, miesięczne) możesz wyłączyć w ustawieniach poczty.']],
 rozmowy:['Rozmowy','Rozmowy indywidualne z zawodnikami i rozmowy z drużyną.',
  ['Chwal za dobrą formę, upominaj za słabą — ale uważaj na charakter zawodnika, niektórzy źle znoszą krytykę.',
   'Zawodnicy sami zgłaszają sprawy (gra w podstawie, kontrakt, transfer). Ignorowanie ich obniża morale.',
   'Odprawa przed meczem i w przerwie wpływa na nastawienie drużyny.']],
 mecz:['Mecz i sezon','Tutaj rozgrywasz mecze: oglądasz akcje na żywo albo symulujesz wynik.',
  ['W trakcie meczu możesz brać czasy, robić zmiany, zmieniać taktykę i wydawać polecenia z linii bocznej.',
   'Asystent podpowiada, co dzieje się na boisku — warto czytać jego uwagi w czasie przerw.',
   'Pamiętaj o limicie obcokrajowców: zmiana obcokrajowca może wejść tylko za obcokrajowca.']],
 kalendarz:['Terminarz','Wszystkie mecze ligowe, pucharowe i sparingi w jednym kalendarzu.',
  ['Kliknij dzień, żeby zobaczyć szczegóły meczu albo zaplanowanego wydarzenia.',
   'Możesz umawiać sparingi i obozy w wolnych terminach (przed sezonem i w przerwach).']],
 sklad:['Skład','Ustaw wyjściową szóstkę, libero i kapitana. Kolejność stref decyduje o ustawieniu startowym (R1–R6).',
  ['Przeciągnij zawodnika na boisko albo kliknij rezerwowego i zawodnika na boisku, żeby ich zamienić.',
   'Flaga przy numerze to narodowość. W lidze obowiązuje limit obcokrajowców na boisku — gra pokaże ostrzeżenie, jeśli go przekroczysz.',
   'Ocena w nawiasie dotyczy wybranej pozycji — zawodnik grający poza swoją pozycją wypada słabiej.',
   'Zakładka „Dynamika zespołu” pokazuje morale, hierarchię i grupy w szatni.']],
 taktyka:['Taktyka','Plan gry: zagrywka, rozegranie, blok i obrona.',
  ['Rozegranie możesz ustawić osobno dla idealnego i słabego przyjęcia.',
   'Zagrywaj w słabego przyjmującego rywala — analiza rywala podpowie, kto to jest.',
   'Taktykę zmienisz też w trakcie meczu, np. po przegranym secie.']],
 dane:['Centrum danych','Statystyki drużyny i zawodników, skuteczność ustawień i analiza meczów.',
  ['Sprawdź, w którym ustawieniu (R1–R6) Twoja drużyna zdobywa najwięcej punktów.',
   'Porównuj zawodników na tej samej pozycji, zanim zmienisz skład.']],
 trening:['Trening','Plan tygodnia decyduje o rozwoju umiejętności i świeżości zawodników.',
  ['Mocniejszy trening = szybszy rozwój, ale większe zmęczenie i ryzyko kontuzji. Lżejszy — odwrotnie.',
   'Każdy zawodnik może mieć indywidualny cel (np. zagrywka) i mentora wśród doświadczonych graczy.',
   'Przed meczem warto odpuścić — zmęczeni zawodnicy grają słabiej.',
   'Raport z treningu przychodzi na pocztę.']],
 juniorzy:['Juniorzy','Twoja akademia: młodzi zawodnicy, którzy mogą trafić do pierwszej drużyny.',
  ['„Widok ogólny” pokazuje kandydatów do pierwszego zespołu polecanych przez trenera juniorów — przycisk ✓ wykonuje jego radę (awans albo wypożyczenie).',
   '„Widok ogólny: Juniorzy” to cały rocznik: wykres postępów, ocena treningu, ocena meczowa z ligi U20 i opinia trenera.',
   '„Wypożyczenia” — juniorów 18–19 lat i młodych, którzy mało grają, możesz wypożyczyć do klubu seniorskiego. Co miesiąc dostaniesz raport.',
   'Co sezon pojawia się nowy rocznik — lepsza akademia i trener juniorów to zdolniejsza młodzież.']],
 skauting:['Skauting','Wyszukiwanie zawodników i raporty skautów.',
  ['Wysyłaj skautów do regionów — im lepszy skaut, tym dokładniej ocenia umiejętności i potencjał.',
   'Ciekawych zawodników dodawaj do listy obserwowanych, żeby śledzić ich rozwój.',
   'Filtruj po pozycji, wieku, lidze i narodowości.']],
 transfery:['Transfery','Rynek transferowy, oferty za Twoich zawodników, wypożyczenia i historia transferów.',
  ['Kupować i sprzedawać możesz tylko w otwartym oknie transferowym (data okna jest u góry).',
   'Zwróć uwagę na limit obcokrajowców — u góry widzisz, ilu ich masz w kadrze i ilu może grać jednocześnie.',
   'Budżet transferowy i pensji ustala zarząd — przy każdym podpisie zobaczysz, ile z niego zostanie.',
   'Transfery możesz zlecić dyrektorowi sportowemu (delegowanie).']],
 sztab:['Sztab','Asystent, trenerzy, skauci, fizjoterapeuci i dyrektorzy.',
  ['Każdy członek sztabu ma swoje mocne strony — lepszy fizjoterapeuta to krótsze kontuzje, lepszy trener szybszy rozwój.',
   'Liczba etatów zależy od poziomu klubu. Pensje sztabu obciążają budżet płac.',
   'Część zadań (transfery, sparingi, trening) możesz delegować współpracownikom.']],
 klub:['Klub','Obiekty, hala, dzień meczowy i informacje o klubie.',
  ['Rozbudowa obiektów treningowych przyspiesza rozwój, a akademii — poprawia juniorów.',
   'Większa hala to więcej kibiców i wyższe wpływy z biletów.',
   'Ceny biletów ustawiasz w zakładce „Dzień meczowy”.']],
 sponsorzy:['Sponsorzy','Umowy sponsorskie to stały przychód klubu.',
  ['Lepsze wyniki i więcej kibiców przyciągają bogatszych sponsorów.',
   'Przy każdej ofercie widzisz, ile realnie trafi do kasy w tym sezonie.']],
 social:['Social media','Wizerunek klubu w sieci i nastroje kibiców.',
  ['Posty i wypowiedzi wpływają na zainteresowanie kibiców i sponsorów.',
   'Uważaj na wypowiedzi po porażkach — media chętnie je podchwytują.']],
 finanse:['Finanse','Przychody, wydatki, budżety i prognoza.',
  ['Zarząd rezerwuje pieniądze na pensje i utrzymanie — suwakami dzielisz tylko wolną kwotę.',
   'Ujemne saldo przez dłuższy czas grozi utratą licencji i zwolnieniem.',
   'W razie potrzeby możesz wziąć pożyczkę, ale trzeba ją spłacać co miesiąc.']],
 strategia:['Strategia klubu','Wizja zarządu: cele na sezon i na kilka lat.',
  ['Realizacja celów poprawia ocenę zarządu i Twoją pozycję w klubie.',
   'Cele dotyczą wyników, finansów, młodzieży i stylu gry — sprawdzaj postęp regularnie.']],
 trener:['Trener','Twój profil: reputacja, umiejętności, historia kariery i ocena zarządu.',
  ['Reputacja rośnie z wynikami i trofeami — lepsze kluby zaczną Cię zauważać.',
   'Słaba ocena zarządu na koniec sezonu może skończyć się zwolnieniem (nie dotyczy właściciela własnego klubu).']],
 tabela:['Tabele','Tabele lig, pucharów i rozgrywek europejskich we wszystkich krajach.',
  ['Wybierz kraj i ligę z listy. Twoja liga jest oznaczona gwiazdką.',
   'Zielone i czerwone pola oznaczają awans, play-off i spadek.']],
 kadra:['Reprezentacja','Kadry narodowe i powołania Twoich zawodników.',
  ['Powołania do reprezentacji podnoszą reputację zawodnika, ale też jego zmęczenie.',
   'Z dobrą reputacją możesz zostać selekcjonerem reprezentacji.']],
 staty:['Statystyki','Liderzy lig: najlepsi atakujący, blokujący, zagrywający i przyjmujący.',
  ['Dobre miejsce do szukania kandydatów do transferu z innych lig.']],
 historia:['Historia','Mistrzowie, zdobywcy pucharów i nagrody indywidualne z poprzednich sezonów.',
  ['Tu znajdziesz też historię swojego klubu i swojej kariery.']],
 osiagniecia:['Osiągnięcia','Odznaki za sukcesy i kamienie milowe w karierze.',
  ['Każde osiągnięcie ma opis warunku — sprawdź, czego jeszcze brakuje.']],
 zapis:['Zapis i ustawienia','Zapis gry, sloty, kod zapisu, wygląd i dźwięk.',
  ['Gra zapisuje się automatycznie, ale możesz trzymać kopie w 3 slotach.',
   'Kod zapisu pozwala przenieść grę na inne urządzenie (np. z telefonu na komputer).',
   'Tu zmienisz motyw, język, kolejność menu i głośność dźwięków.']],
};
function guideSeen(){return SAVE.guide||(SAVE.guide={});}
function guidesOff(){return uiPref('guideOff','0')==='1';}
function guideOpen(t){if(SAVE.team==null)return false;const G=guideSeen();return ui.guideShow===t||(!guidesOff()&&!G[t]);}
function guideOk(t){guideSeen()[t]=1;if(ui.guideShow===t)ui.guideShow=null;save();render();}
function guideAllOff(){uiPrefSet('guideOff','1');ui.guideShow=null;save();render();}
function guideReset(){SAVE.guide={};uiPrefSet('guideOff','0');save();render();}
function guideToggle(t){ui.guideShow=ui.guideShow===t?null:t;if(ui.guideShow==null)guideSeen()[t]=1;render();}
function tabGuide(){const t=ui.tab;const g=GUIDES[t];if(!g||SAVE.team==null||!SAVE.coach)return '';
  // nie dubluj z głównym samouczkiem krok po kroku
  if(typeof tutState==='function'&&!tutState().done&&TUT.some(x=>x[0]===t)&&ui.guideShow!==t)return '';
  if(!guideOpen(t))return '';const [ti,lead,pts]=g;
  return `<div class="card tutbar guide"><div class="gdh"><span class="gdi">?</span><div><div class="gdk">${_t('Wprowadzenie')}</div><b>${_t(ti)}</b></div><span class="sp"></span><button class="ghost sm" onclick="guideAllOff()" title="${_t('Samouczki możesz włączyć ponownie w Ustawieniach')}">${_t('Nie pokazuj samouczków')}</button><button class="btn sm" onclick="guideOk('${t}')">${_t('Rozumiem')}</button></div>
   <p class="gdl">${_t(lead)}</p><ul class="gdp">${pts.map(x=>`<li>${_t(x)}</li>`).join('')}</ul></div>`;}
// przycisk „?” na pasku kontekstu (ponowne otwarcie samouczka)
function guideBtn(){const t=ui.tab;if(!GUIDES[t]||SAVE.team==null)return '';return `<button class="gdq ${ui.guideShow===t?'on':''}" onclick="guideToggle('${t}')" title="${_t('Samouczek tej zakładki')}">?</button>`;}
function guideCard(){return `<div class="card"><h2>${_t('Samouczki')}</h2><p class="small mut">${_t('Krótkie wprowadzenie pojawia się przy pierwszym wejściu do każdej zakładki. Przycisk „?” na pasku pod nagłówkiem otwiera je ponownie.')}</p><div class="row wrap" style="gap:8px"><button class="ghost" onclick="guideReset()">${_t('Pokaż samouczki od nowa')}</button>${guidesOff()?`<span class="small mut">${_t('Samouczki są wyłączone.')}</span>`:''}</div></div>`;}
{const _sv=saveView;saveView=function(){return _sv.apply(this,arguments)+guideCard();};}

// ---- transfery: obcokrajowcy w kadrze ----
function forSquadCard(){if(SAVE.team==null||!SAVE.lg)return '';const t=myTeam();const c=LG_C[SAVE.lg[t.idx]];const mx=tmMaxF(t);
  const fs=t.players.filter(p=>isForeign(p,t));const onC=luForeign(t,myLineup());
  const tag=p=>`<span class="frp" onclick="openPop('${p.id}')" title="${esc(natN(pNat(p)))}">${natFl(pNat(p))} ${esc(shortN(p))} <small>${pTag(p.pos)}</small></span>`;
  const note=mx==null?_t('W tej lidze nie ma limitu obcokrajowców.'):fs.length>=mx+2?_t('Masz już więcej obcokrajowców, niż może grać jednocześnie — kolejny zagraniczny transfer prawdopodobnie usiądzie na ławce.'):fs.length>=mx?_t('Limit na boisku jest wykorzystany — kolejny obcokrajowiec będzie konkurował o miejsce z obecnymi.'):_t('Możesz jeszcze wzmocnić skład obcokrajowcem bez kolizji z limitem.');
  const cls=mx==null?'':fs.length>=mx+2?'bad':fs.length>=mx?'warnc':'goodc';
  return `<div class="card forsq"><div class="row wrap" style="gap:18px;align-items:center"><span style="font-size:22px">🌍</span>
   <div class="fsn"><span>${_t('Obcokrajowcy w kadrze')}</span><b class="${cls}">${fs.length}</b></div>
   <div class="fsn"><span>${_t('Limit na boisku')}</span><b>${mx==null?'—':mx}</b></div>
   <div class="fsn"><span>${_t('Naraz na boisku (wyj. skład)')}</span><b>${onC}${mx==null?'':' / '+mx}</b></div>
   <div class="fsn"><span>${_t('Kraj ligi')}</span><b>${natFl(c)} ${esc(natN(c))}</b></div></div>
   <p class="small mut" style="margin:8px 0 6px">${note}</p>${fs.length?`<div class="row wrap" style="gap:6px">${fs.map(tag).join('')}</div>`:''}</div>`;}
{const _tv=transferView;transferView=function(){let h=_tv.apply(this,arguments);try{h=forSquadCard()+h;}catch(e){console.error(e);}return h;};}

// ---- render: kolor klubu na pasku, przycisk „?” ----
{const _r=render;render=function(){try{if(typeof themeClub==='function')themeClub();}catch(e){}const x=_r.apply(this,arguments);
  try{const tb=document.querySelector('main .ctx');if(tb&&!tb.querySelector('.gdq')){const b=guideBtn();if(b)tb.insertAdjacentHTML('beforeend',b);}}catch(e){}return x;};}
