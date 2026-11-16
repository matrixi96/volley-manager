// ================= OSIĄGNIĘCIA =================
// ok. 1000 osiągnięć generowanych z rodzin (licznik + progi). Liczniki kariery w SAVE.ach.c, zdobyte w SAVE.ach.got (id -> data).
const ACH_CATS=[['mecze','🏐','Mecze'],['rywale','⚔️','Rywale'],['sezony','🏆','Sezony i trofea'],['zawodnicy','⭐','Zawodnicy'],['transfery','🔁','Transfery'],['klub','🏟️','Klub i finanse'],['trener','🎓','Trener'],['taktyka','📋','Taktyka'],['juniorzy','🌱','Juniorzy']];
const ACH_TIER=[['Brąz','#cd7f32',10],['Srebro','#c0c7d1',20],['Złoto','#e8b73a',40],['Platyna','#7dd3fc',80]];
function achPl(n,a,b,c){n=Math.abs(n);if(n===1)return a;const d=n%10,dd=n%100;return d>=2&&d<=4&&(dd<12||dd>14)?b:c;}
function achNum(n){return n>=1e6?(n/1e6).toLocaleString('pl-PL')+' mln':n.toLocaleString('pl-PL');}
function ACH_TAC(){const L=a=>a.map(x=>x[0]);return [['serve',L(SERVE_OPT),'Zagrywka'],['srvZ',L(SZ_OPT),'Strefa zagrywki'],['dist',L(DIST_OPT),'Rozegranie'],['atk',L(ATK_OPT),'Rodzaj ataku'],['adir',L(ADIR_OPT),'Kierunek ataku'],['dsys',['Diament','Rotacyjna'],'System obrony'],['mCom',['Czyta grę','W ciemno'],'Środkowy w bloku'],['p1sw',L(P1SW_OPT),'Atakujący w R1'],['blkM',L(MID_OPT),'Blok środkowego'],['blk3',L(B3_OPT),'Blok na skrzydłach'],['free',L(FREE_OPT),'Wolna piłka'],['startRot',['R1','R2','R3','R4','R5','R6'],'Ustawienie startowe']];}
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
let ACH=null;
function achDefs(){if(ACH)return ACH;const A=[];
  // fam: kategoria, klucz licznika, tytuł, opis(g), progi
  const fam=(cat,k,title,desc,th)=>th.forEach((g,i)=>A.push({id:k+'_'+g,cat,k,g,t:Math.min(3,Math.floor(i*4/th.length)),n:th.length>1?title+' '+ROMAN[i]:title,d:desc(g)}));
  const one=(cat,k,title,desc,g)=>A.push({id:k+'_'+(g||1),cat,k,g:g||1,t:2,n:title,d:desc});
  const P=(a,b,c)=>g=>`${achNum(g)} ${achPl(g,a,b,c)}`;
  // ---- MECZE ----
  fam('mecze','win','Zwycięzca',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} (wszystkie rozgrywki).`,[1,5,10,25,50,100,200,300,500,750,1000]);
  fam('mecze','played','Weteran ławki',g=>`Poprowadź drużynę w ${P('meczu','meczach','meczach')(g)}.`,[1,10,25,50,100,250,500,1000]);
  fam('mecze','wLiga','Ligowiec',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} ligowych (faza zasadnicza).`,[1,10,25,50,100,200,300,500]);
  fam('mecze','wPo','Człowiek play-off',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} w play-off.`,[1,5,10,25,50,100]);
  fam('mecze','wSpar','Sparingpartner',g=>`Wygraj ${P('sparing','sparingi','sparingów')(g)}.`,[1,5,10,25,50]);
  fam('mecze','wHome','Twierdza',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} we własnej hali.`,[1,10,25,50,100,250]);
  fam('mecze','wAway','Wyjazdowy wojownik',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} na wyjeździe.`,[1,10,25,50,100,250]);
  fam('mecze','w30','Bez straty seta',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} 3:0.`,[1,5,10,25,50,100,250]);
  fam('mecze','w32','Nerwy ze stali',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} 3:2.`,[1,5,10,25,50,100]);
  fam('mecze','w02','Powrót z zaświatów',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} po przegraniu dwóch pierwszych setów.`,[1,3,5,10,25]);
  fam('mecze','w01','Mimo słabego startu',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} po przegranym pierwszym secie.`,[1,10,25,50,100]);
  fam('mecze','streak','Seria zwycięstw',g=>`Wygraj ${g} meczów z rzędu.`,[3,5,7,10,12,15,20]);
  fam('mecze','homeRun','Niezdobyta hala',g=>`Nie przegraj u siebie ${g} meczów z rzędu.`,[5,10,15,20]);
  fam('mecze','awayRun','Na obcym terenie',g=>`Wygraj ${g} meczów wyjazdowych z rzędu.`,[3,5,8]);
  fam('mecze','run30','Miażdżąca seria',g=>`Wygraj ${g} meczów z rzędu po 3:0.`,[3,5,8]);
  fam('mecze','wStr5','Dawid kontra Goliat',g=>`Pokonaj ${P('rywala','rywali','rywali')(g)} silniejszego o min. 5 punktów siły.`,[1,5,10,25,50,100]);
  fam('mecze','wStr10','Sensacja',g=>`Pokonaj ${P('rywala','rywali','rywali')(g)} silniejszego o min. 10 punktów siły.`,[1,3,5,10,25]);
  fam('mecze','wStr15','Cud nad siatką',g=>`Pokonaj ${P('rywala','rywali','rywali')(g)} silniejszego o min. 15 punktów siły.`,[1,3,5]);
  fam('mecze','wLead','Pogromca lidera',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} z liderem tabeli.`,[1,5,10,25]);
  fam('mecze','sets','Kolekcjoner setów',g=>`Wygraj ${P('set','sety','setów')(g)}.`,[10,50,100,250,500,1000,2000,3000]);
  fam('mecze','pts','Punkt po punkcie',g=>`Zdobądź ${P('punkt','punkty','punktów')(g)} w meczach (małe punkty).`,[500,1000,2500,5000,10000,25000,50000,75000]);
  fam('mecze','ace','Bombardier',g=>`Zdobądź ${P('as','asy','asów')(g)} serwisowych.`,[10,50,100,250,500,1000,2000]);
  fam('mecze','blk','Mur',g=>`Zdobądź ${P('punkt','punkty','punktów')(g)} blokiem.`,[10,50,100,250,500,1000,2000,3000]);
  fam('mecze','kill','Artyleria',g=>`Skończ ${P('atak','ataki','ataków')(g)}.`,[100,500,1000,2500,5000,10000,20000,30000]);
  fam('mecze','dig','Obrona Częstochowy',g=>`Wykonaj ${P('obronę','obrony','obron')(g)}.`,[100,500,1000,2500,5000,10000]);
  fam('mecze','mAce','Grad asów',g=>`Zdobądź ${g} asów w jednym meczu ligi lub play-off.`,[6,9,12,15,18,20]);
  fam('mecze','mBlk','Ściana',g=>`Zdobądź ${g} punktów blokiem w jednym meczu ligi lub play-off.`,[8,10,12,15,18,20]);
  fam('mecze','mEff','Precyzja',g=>`Skończ min. ${g}% ataków w wygranym meczu.`,[50,55,60,65,70,75]);
  fam('mecze','mRec','Pewne ręce',g=>`Miej min. ${g}% pozytywnego przyjęcia w wygranym meczu.`,[60,70,80,90]);
  fam('mecze','mNoSE','Zero błędów',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} bez żadnego błędu zagrywki.`,[1,5]);
  fam('mecze','margin','Deklasacja',g=>`Wygraj seta różnicą min. ${g} punktów.`,[10,12,14,16,18,20]);
  fam('mecze','marathon','Maraton',g=>`Wygraj seta, w którym zdobędziesz min. ${g} punktów.`,[30,33,36]);
  fam('mecze','longSet','Gra na przewagi',g=>`Wygraj ${P('set','sety','setów')(g)} na przewagi (powyżej 25 punktów).`,[1,5,10]);
  fam('mecze','tight15','Pewny tie-break',g=>`Wygraj ${P('tie-break','tie-breaki','tie-breaków')(g)} różnicą min. 8 punktów.`,[1,3]);
  fam('mecze','longTb','Tie-break bez końca',g=>`Wygraj ${P('tie-break','tie-breaki','tie-breaków')(g)} na przewagi (powyżej 15 punktów).`,[1,3]);
  fam('mecze','under15','Rywal bez szans',g=>`Wygraj ${P('mecz','mecze','meczów')(g)}, w których rywal nie zdobył 15 punktów w żadnym secie.`,[1,5,10]);
  fam('mecze','att','Pełne trybuny',g=>`Zagraj u siebie przy ${achNum(g)} widzach.`,[500,1000,2000,3000,4000,5000]);
  fam('mecze','soldOut','Komplet widzów',g=>`Zagraj ${P('mecz','mecze','meczów')(g)} u siebie przy pełnej hali.`,[1,10,25]);
  fam('mecze','to','Czas!',g=>`Weź ${P('czas','czasy','czasów')(g)} na żądanie.`,[1,25,100,250]);
  for(const [l,nm] of [[0,'Ekstraligi'],[1,'1. Ligi'],[2,'2. Ligi']])fam('mecze','wLg'+l,'Zwycięstwa '+nm,g=>`Wygraj ${P('mecz','mecze','meczów')(g)} jako drużyna ${nm}.`,[1,10,25,50,100]);
  fam('mecze','days','Kalendarz trenera',g=>`Spędź w grze ${P('dzień','dni','dni')(g)}.`,[100,365,730,1825,3650]);
  for(const a of A)if(a.cat==='zawodnicy'&&/jednym meczu/.test(a.d))a.d=a.d.replace('w jednym meczu','w jednym meczu o punkty');
  // ---- RYWALE (każdy klub) ----
  for(let i=0;i<TEAM_DEFS.length;i++){const nmT=()=>TEAMS[i]?TEAMS[i].name:TEAM_DEFS[i].name,sh=()=>TEAMS[i]?TEAMS[i].short:TEAM_DEFS[i].short;
    A.push({id:'bt_'+i,cat:'rywale',k:'bt_'+i,g:1,t:0,n:'Pogromca '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj z ${nmT()}.`,tm:i});
    A.push({id:'bt30_'+i,cat:'rywale',k:'bt30_'+i,g:1,t:1,n:'Lekcja dla '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj 3:0 z ${nmT()}.`,tm:i});
    A.push({id:'btA_'+i,cat:'rywale',k:'btA_'+i,g:1,t:1,n:'Najazd na '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj z ${nmT()} w jej hali.`,tm:i});
    A.push({id:'btH_'+i,cat:'rywale',k:'btH_'+i,g:3,t:1,n:'Gospodarz dla '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj 3 razy u siebie z ${nmT()}.`,tm:i});
    A.push({id:'bt32_'+i,cat:'rywale',k:'bt32_'+i,g:1,t:1,n:'Tie-break z '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj 3:2 z ${nmT()}.`,tm:i});
    A.push({id:'bt5_'+i,cat:'rywale',k:'bt_'+i,g:5,t:2,n:'Zmora '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj 5 razy z ${nmT()}.`,tm:i});
    A.push({id:'bt10_'+i,cat:'rywale',k:'bt_'+i,g:10,t:3,n:'Właściciel '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj 10 razy z ${nmT()}.`,tm:i});
    A.push({id:'as_'+i,cat:'trener',k:'as_'+i,g:1,t:2,n:'Na ławce '+TEAM_DEFS[i].short,d:'',dn:()=>`Wygraj mecz jako trener ${nmT()}.`,tm:i});}
  // ---- SEZONY I TROFEA ----
  fam('sezony','seasons','Sezon za sezonem',g=>`Ukończ ${P('sezon','sezony','sezonów')(g)}.`,[1,2,3,5,7,10,15,20,25,30]);
  fam('sezony','champ0','Mistrz Polski',g=>g===1?'Zdobądź mistrzostwo Ekstraligi.':`Zdobądź ${g} tytuły mistrza Ekstraligi.`.replace(' 5 tytuły',' 5 tytułów').replace(' 7 tytuły',' 7 tytułów').replace(' 10 tytuły',' 10 tytułów'),[1,2,3,5,7,10]);
  fam('sezony','champ1','Mistrz 1. Ligi',g=>g===1?'Wygraj 1. Ligę.':`Wygraj 1. Ligę ${g} razy.`,[1,2,3]);
  fam('sezony','champ2','Mistrz 2. Ligi',g=>g===1?'Wygraj 2. Ligę.':`Wygraj 2. Ligę ${g} razy.`,[1,2,3]);
  fam('sezony','medal0','Na podium',g=>`Zdobądź ${P('medal','medale','medali')(g)} Ekstraligi.`,[1,3,5,10,15]);
  fam('sezony','final0','Finalista',g=>`Zagraj w ${P('finale','finałach','finałach')(g)} Ekstraligi.`,[1,3,5,10]);
  fam('sezony','poQ','Ósemka',g=>`Awansuj do play-off ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5,10,15,20]);
  fam('sezony','first','Najlepsi po sezonie',g=>`Wygraj fazę zasadniczą ${g} ${achPl(g,'raz','razy','razy')} (dowolna liga).`,[1,3,5,10]);
  fam('sezony','first0','Król fazy zasadniczej',g=>`Wygraj fazę zasadniczą Ekstraligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5]);
  fam('sezony','promo','W górę!',g=>`Awansuj ${g} ${achPl(g,'raz','razy','razy')}.`,[1,2,3,5,10]);
  fam('sezony','promo0','Do elity',g=>`Awansuj do Ekstraligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,2,3]);
  fam('sezony','promo1','Szczebel wyżej',g=>`Awansuj do 1. Ligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,2,3]);
  one('sezony','dblPromo','Rakieta w górę','Awansuj dwa sezony z rzędu.');
  fam('sezony','stay0','Beniaminek z charakterem',g=>`Utrzymaj się w Ekstralidze (miejsce 1–10) w sezonie po awansie ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3]);
  fam('sezony','goal','Słowny trener',g=>`Wykonaj cel zarządu ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5,10,15,20]);
  fam('sezony','goalRun','Konsekwencja',g=>`Wykonaj cel zarządu ${g} sezonów z rzędu.`,[3,5,10]);
  fam('sezony','goalX','Ponad oczekiwania',g=>`Skończ sezon min. 4 miejsca wyżej niż cel zarządu (${g} ${achPl(g,'raz','razy','razy')}).`,[1,3,5]);
  fam('sezony','rsW','Pewna marka',g=>`Wygraj min. ${g} z 22 meczów fazy zasadniczej.`,[15,18,20,22]);
  fam('sezony','rsPts','Punktowa maszyna',g=>`Zdobądź min. ${g} punktów w fazie zasadniczej.`,[40,50,55,60,66]);
  fam('sezony','rsPtsTot','Dorobek punktowy',g=>`Zdobądź łącznie ${achNum(g)} punktów w fazach zasadniczych.`,[100,250,500,1000]);
  one('sezony','perfPo','Perfekcyjny play-off','Zdobądź mistrzostwo ligi bez porażki w play-off.');
  one('sezony','allTitles','Pełna kolekcja','Wygraj każdą z trzech lig (2. Liga, 1. Liga i Ekstraliga).');
  one('sezony','firstSeasonTitle','Od razu na szczyt','Zdobądź mistrzostwo ligi w pierwszym sezonie w nowym klubie.');
  fam('sezony','sez0','Stały bywalec elity',g=>`Rozegraj ${P('sezon','sezony','sezonów')(g)} w Ekstralidze.`,[1,3,5,10,20]);
  fam('sezony','sez1','Zaplecze',g=>`Rozegraj ${P('sezon','sezony','sezonów')(g)} w 1. Lidze.`,[1,3,5]);
  fam('sezony','sez2','Od podstaw',g=>`Rozegraj ${P('sezon','sezony','sezonów')(g)} w 2. Lidze.`,[1,3,5]);
  one('sezony','ownPromo0','Od zera do elity','Wprowadź założony przez siebie klub do Ekstraligi.');
  one('sezony','ownChamp','Dzieło życia','Zdobądź mistrzostwo Polski z założonym przez siebie klubem.');
  one('sezony','ownChampAny','Pierwsze trofeum','Wygraj dowolną ligę z założonym przez siebie klubem.');
  fam('sezony','qf','Ćwierćfinał',g=>`Wygraj ${P('ćwierćfinał','ćwierćfinały','ćwierćfinałów')(g)} play-off.`,[1,5,10]);
  fam('sezony','sf','Półfinał',g=>`Wygraj ${P('półfinał','półfinały','półfinałów')(g)} play-off.`,[1,5,10]);
  fam('sezony','fin','Złoty mecz',g=>`Wygraj ${P('finał','finały','finałów')(g)} play-off.`,[1,3,5]);
  fam('sezony','bronze','Brązowe serce',g=>`Wygraj ${P('rywalizację','rywalizacje','rywalizacji')(g)} o 3. miejsce.`,[1,3]);
  fam('sezony','serComeback','Odwrócone losy',g=>`Wygraj ${P('rywalizację','rywalizacje','rywalizacji')(g)} play-off po przegranym pierwszym meczu.`,[1,3,5]);
  one('sezony','finSweep','Finał bez dyskusji','Wygraj finał play-off 3:0 w meczach.');
  fam('sezony','sAce','Sezon asów',g=>`Zdobądź w jednym sezonie min. ${g} asów.`,[50,100,150]);
  fam('sezony','sBlk','Sezon bloku',g=>`Zdobądź w jednym sezonie min. ${g} punktów blokiem.`,[100,150,200]);
  fam('sezony','sKill','Sezon ataku',g=>`Skończ w jednym sezonie min. ${g} ataków.`,[800,1000,1200]);
  fam('sezony','awPts','Najlepszy punktujący',g=>`Miej najlepiej punktującego zawodnika ligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5]);
  fam('sezony','awMvp','MVP sezonu',g=>`Miej MVP sezonu ligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5]);
  fam('sezony','awBlk','Król bloku',g=>`Miej najlepiej blokującego zawodnika ligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3]);
  fam('sezony','awAce','Król zagrywki',g=>`Miej najlepiej zagrywającego zawodnika ligi ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3]);
  // ---- ZAWODNICY ----
  fam('zawodnicy','best','Gwiazda w składzie',g=>`Miej w kadrze zawodnika z oceną min. ${g}.`,[70,75,80,85,88,90,92]);
  fam('zawodnicy','str','Siła zespołu',g=>`Osiągnij siłę drużyny min. ${g}.`,[60,65,70,75,80,85,88,90]);
  fam('zawodnicy','n80','Drużyna gwiazd',g=>`Miej w kadrze ${g} ${achPl(g,'zawodnika','zawodników','zawodników')} z oceną min. 80.`,[1,3,5,7,10]);
  fam('zawodnicy','n85','Galaktyczni',g=>`Miej w kadrze ${g} ${achPl(g,'zawodnika','zawodników','zawodników')} z oceną min. 85.`,[1,3,5]);
  fam('zawodnicy','loyal','Wierny klubowi',g=>`Miej zawodnika, który rozegrał w Twojej drużynie min. ${g} meczów.`,[50,100,200,300]);
  fam('zawodnicy','mvp','MVP meczu',g=>`Zbierz ${P('nagrodę','nagrody','nagród')(g)} MVP meczu dla swoich zawodników.`,[1,10,25,50,100,250]);
  fam('zawodnicy','mvpU','Wielu bohaterów',g=>`Zbierz nagrody MVP meczu dla ${g} różnych zawodników.`,[5,10,20,30]);
  fam('zawodnicy','pPts','Lider ataku',g=>`Zawodnik zdobywa w jednym meczu min. ${g} punktów.`,[15,20,25,30,35,40]);
  fam('zawodnicy','pAce','Seria z pola zagrywki',g=>`Zawodnik zdobywa w jednym meczu min. ${g} asów.`,[3,5,6,7,8,10]);
  fam('zawodnicy','pBlk','Szczelny blok',g=>`Zawodnik zdobywa w jednym meczu min. ${g} punktów blokiem.`,[4,5,6,7,8,10]);
  fam('zawodnicy','pKill','Egzekutor',g=>`Zawodnik kończy w jednym meczu min. ${g} ataków.`,[15,20,25,30,35]);
  fam('zawodnicy','pDig','Pajęczyna',g=>`Zawodnik ma w jednym meczu min. ${g} obron.`,[10,15,20,25,30]);
  fam('zawodnicy','pA','Atakujący z krwi i kości',g=>`Atakujący zdobywa w jednym meczu min. ${g} punktów.`,[20,25,30,35,40]);
  fam('zawodnicy','pP','Przyjmujący kompletny',g=>`Przyjmujący zdobywa w jednym meczu min. ${g} punktów.`,[15,20,25,30]);
  fam('zawodnicy','pS','Środek siatki',g=>`Środkowy zdobywa w jednym meczu min. ${g} punktów.`,[10,14,18,22]);
  fam('zawodnicy','pR','Rozgrywający z pazurem',g=>`Rozgrywający zdobywa w jednym meczu min. ${g} punktów.`,[5,8]);
  fam('zawodnicy','pL','Libero na medal',g=>`Libero ma w jednym meczu min. ${g} obron.`,[10,15,20,25,30]);
  fam('zawodnicy','acadLine','Wychowankowie w akcji',g=>`Wygraj ${P('mecz','mecze','meczów')(g)} z min. dwoma wychowankami w składzie.`,[1,10,25]);
  // ---- TRANSFERY ----
  fam('transfery','sign','Nowe twarze',g=>`Podpisz ${P('zawodnika','zawodników','zawodników')(g)}.`,[1,5,10,25,50,100]);
  fam('transfery','buy','Zakupy',g=>`Kup ${P('zawodnika','zawodników','zawodników')(g)} z innych klubów.`,[1,5,10,25,50]);
  fam('transfery','free','Okazja',g=>`Podpisz ${P('wolnego zawodnika','wolnych zawodników','wolnych zawodników')(g)}.`,[1,5,10,25]);
  fam('transfery','sell','Sprzedawca',g=>`Sprzedaj ${P('zawodnika','zawodników','zawodników')(g)}.`,[1,5,10,25,50]);
  fam('transfery','sellFee','Hit transferowy',g=>`Sprzedaj zawodnika za min. ${achNum(g)} zł.`,[100000,250000,500000,1000000,2000000,3000000]);
  fam('transfery','buyFee','Rekordowy zakup',g=>`Kup zawodnika za min. ${achNum(g)} zł.`,[100000,250000,500000,1000000,2000000]);
  fam('transfery','sellTot','Handlowiec',g=>`Zarób łącznie ${achNum(g)} zł na sprzedaży zawodników.`,[500000,1000000,5000000,10000000,25000000]);
  fam('transfery','renew','Przedłużenia',g=>`Przedłuż ${P('kontrakt','kontrakty','kontraktów')(g)}.`,[1,5,10,25,50]);
  fam('transfery','sellEL','Eksporter talentów',g=>`Sprzedaj ${P('zawodnika','zawodników','zawodników')(g)} do klubu Ekstraligi.`,[1,5,10]);
  fam('transfery','buyYoung','Inwestycja w przyszłość',g=>`Kup ${P('zawodnika','zawodników','zawodników')(g)} w wieku do 21 lat.`,[1,5,10]);
  one('transfery','buyUp','Przekonujące argumenty','Sprowadź zawodnika z wyższej ligi niż Twoja.');
  // ---- KLUB I FINANSE ----
  fam('klub','bal','Skarbiec',g=>`Miej na koncie ${achNum(g)} zł.`,[1000000,2000000,3000000,5000000,10000000,20000000,50000000]);
  for(const f of INFRA){const mn=f.min==null?1:f.min,mx=f.max||5;const th=[];for(let L=mn+1;L<=mx;L++)th.push(L);if(th.length)fam('klub','inf_'+f.k,f.n,g=>`Rozbuduj: ${f.n} do poziomu ${g}.`,th);}
  one('klub','infAll','Klub kompletny','Rozbuduj wszystkie obiekty do maksymalnego poziomu.');
  fam('klub','infSum','Inwestor',g=>`Osiągnij łącznie ${g} poziomów infrastruktury.`,[12,18,24,30,36]);
  fam('klub','sp','Sponsorzy',g=>`Podpisz ${P('umowę sponsorską','umowy sponsorskie','umów sponsorskich')(g)}.`,[1,5,10,25,50,100]);
  fam('klub','spAct','Pełna ścianka',g=>`Miej jednocześnie ${g} aktywnych sponsorów.`,[3,5,8,10,12]);
  one('klub','spTit','Sponsor tytularny','Podpisz umowę ze sponsorem tytularnym.');
  one('klub','spMain','Sponsor główny','Podpisz umowę ze sponsorem głównym.');
  fam('klub','staff','Sztab',g=>`Zatrudnij ${P('członka sztabu','członków sztabu','członków sztabu')(g)}.`,[1,3,5,10,25]);
  fam('klub','staffSk','Fachowcy',g=>`Miej w sztabie specjalistę z umiejętnościami min. ${g}/20.`,[10,13,15,18,20]);
  fam('klub','camp','Obóz przygotowawczy',g=>`Wyjedź na ${P('obóz','obozy','obozów')(g)} przygotowawcze.`,[1,3,5,10]);
  fam('klub','rep','Marka klubu',g=>`Osiągnij renomę klubu min. ${g}.`,[30,40,50,60,70,80,90,95]);
  fam('klub','profit','Na plusie',g=>`Zakończ ${P('sezon','sezony','sezonów')(g)} z dodatnim bilansem finansowym.`,[1,3,5,10]);
  fam('klub','prize','Premie za wyniki',g=>`Zarób łącznie ${achNum(g)} zł z nagród za miejsce.`,[1000000,5000000,10000000]);
  fam('klub','board','Zaufanie zarządu',g=>`Osiągnij zaufanie zarządu min. ${g}%.`,[80,90,100]);
  // ---- TRENER ----
  fam('trener','crep','Renoma trenera',g=>`Osiągnij reputację trenera min. ${g}.`,[30,40,50,60,70,80,90,100]);
  fam('trener','clubs','Obieżyświat',g=>`Prowadź ${g} różne kluby.`.replace('5 różne','5 różnych').replace('8 różne','8 różnych'),[2,3,5,8]);
  fam('trener','jobs','Nowe wyzwanie',g=>`Przyjmij ${P('ofertę pracy','oferty pracy','ofert pracy')(g)}.`,[1,3,5]);
  one('trener','inEL','Trener elity','Poprowadź klub w Ekstralidze.');
  fam('trener','titleClubs','Wszędzie wygrywa',g=>`Zdobądź mistrzostwo ligi z ${g} różnymi klubami.`,[2,3]);
  fam('trener','srvSub','Specjalista od zagrywki',g=>`Zrób ${P('zmianę','zmiany','zmian')(g)} na zagrywkę.`,[1,10,50]);
  fam('trener','dblSub','Podwójna zmiana',g=>`Zrób ${P('podwójną zmianę','podwójne zmiany','podwójnych zmian')(g)}.`,[1,10,50]);
  // ---- TAKTYKA (zwycięstwa z daną opcją) ----
  const tac=(k,opts,label)=>opts.forEach((o,j)=>fam('taktyka','t_'+k+'_'+j,label+': '+o,g=>`Wygraj ${P('mecz','mecze','meczów')(g)} z ustawieniem „${o}” (${label.toLowerCase()}).`,[1,10,50]));
  const L=a=>a.map(x=>x[0]);
  for(const [k,o,lab] of ACH_TAC())tac(k,o,lab);
  // ---- JUNIORZY ----
  fam('juniorzy','jrPromo','Z akademii do seniorów',g=>`Awansuj ${P('juniora','juniorów','juniorów')(g)} do pierwszej drużyny.`,[1,3,5,10,25,50]);
  fam('juniorzy','acad','Wychowanek',g=>`Wychowanek akademii osiąga ocenę min. ${g}.`,[65,70,75,80,85]);
  fam('juniorzy','acadN','Szkółka',g=>`Miej w kadrze jednocześnie ${g} wychowanków.`,[2,4,6,8]);
  fam('juniorzy','jrWin','Młode wilki',g=>`Twoi juniorzy wygrywają ${P('mecz','mecze','meczów')(g)} w lidze U20.`,[1,10,25,50,100]);
  fam('juniorzy','jrChamp','Mistrzowie juniorów',g=>`Zdobądź mistrzostwo ligi juniorów ${g} ${achPl(g,'raz','razy','razy')}.`,[1,3,5]);
  ACH=A;return A;}

// ---- stan i liczniki ----
function ACHS(){if(!SAVE.ach){SAVE.ach={c:{},got:{},since:SAVE.date||today(),fresh:[]};achBackfill();}return SAVE.ach;}
function achEv(k,n){try{const c=ACHS().c;c[k]=(c[k]||0)+(n==null?1:n);}catch(e){}}
function achMax(k,v){try{const c=ACHS().c;if(v>(c[k]||0))c[k]=v;}catch(e){}}
// stare zapisy: odtwórz liczniki sezonowe z historii
function achBackfill(){const c=SAVE.ach.c;for(const h of SAVE.history||[]){const l=h.lg||0;c.seasons=(c.seasons||0)+1;c['sez'+l]=(c['sez'+l]||0)+1;
  if(h.place===1)c['champ'+l]=(c['champ'+l]||0)+1;if(l===0&&h.place<=3)c.medal0=(c.medal0||0)+1;if(l===0&&h.place<=2)c.final0=(c.final0||0)+1;if(h.place<=8)c.poQ=(c.poQ||0)+1;
  if(h.league===1){c.first=(c.first||0)+1;if(l===0)c.first0=(c.first0||0)+1;}if(h.mv===true){c.promo=(c.promo||0)+1;}}}

// ---- po meczu użytkownika (wołane przed zapisaniem wyniku) ----
function achMatch(m,c){try{const A=ACHS(),C=A.c;const me=m.sides[0],op=m.sides[1];const won=m.winner===0;const oi=op.team.idx;const home=c.h===SAVE.team;
  C.played=(C.played||0)+1;A.apps=A.apps||{};for(const p of me.pl){const x=p.st;if(x.srv+x.rec+x.att+x.dig+x.blk>0||me.slots.some(z=>z.p&&z.p.id===p.id)){const k=p.id+'_'+SAVE.team;A.apps[k]=(A.apps[k]||0)+1;}}
  const sets=m.sets;for(const st of sets){C.pts=(C.pts||0)+st[0];if(st[0]>st[1]){C.sets=(C.sets||0)+1;if(c.kind!=='spar'){achMax('margin',st[0]-st[1]);achMax('marathon',st[0]);}if(st[0]>25)achEv('longSet');}}
  const T={kill:0,att:0,ace:0,blk:0,dig:0,rec:0,recPos:0,srvErr:0};for(const p of me.pl)for(const k in T)T[k]+=p.st[k]||0;
  C.kill=(C.kill||0)+T.kill;C.ace=(C.ace||0)+T.ace;C.blk=(C.blk||0)+T.blk;C.dig=(C.dig||0)+T.dig;const off=c.kind!=='spar';if(off){achMax('mAce',T.ace);achMax('mBlk',T.blk);}
  if(off)for(const p of me.pl){const x=p.st,pt=x.kill+x.blk+x.ace;achMax('pPts',pt);achMax('pAce',x.ace);achMax('pBlk',x.blk);achMax('pKill',x.kill);achMax('pDig',x.dig);
    if(p.pos==='A')achMax('pA',pt);if(p.pos==='P')achMax('pP',pt);if(p.pos==='S')achMax('pS',pt);if(p.pos==='R')achMax('pR',pt);if(p.pos==='L')achMax('pL',x.dig);}
  if(home&&m.att){achMax('att',m.att);if(m.cap&&m.att>=m.cap)achEv('soldOut');}
  if(won){C.win=(C.win||0)+1;if(c.kind==='liga'||c.kind==='po'||c.kind==='spar')achEv(c.kind==='liga'?'wLiga':c.kind==='po'?'wPo':'wSpar');achEv(home?'wHome':'wAway');achEv('wLg'+myLg());achEv('as_'+SAVE.team);
    const sw=m.setsWon;if(sw[1]===0)achEv('w30');if(sw[1]===2)achEv('w32');if(sets[0][0]<sets[0][1]){achEv('w01');if(sets[1]&&sets[1][0]<sets[1][1])achEv('w02');}
    const last=sets[sets.length-1];if(sets.length===5){if(last[0]-last[1]>=8)achEv('tight15');if(last[0]>15)achEv('longTb');}
    if(sets.every(st=>st[1]<15))achEv('under15');if(off){if(T.srvErr===0)achEv('mNoSE');if(T.att)achMax('mEff',Math.floor(T.kill/T.att*100));if(T.rec>=20)achMax('mRec',Math.floor(T.recPos/T.rec*100));}
    const d=teamStrength(op.team)-teamStrength(me.team);if(d>=5)achEv('wStr5');if(d>=10)achEv('wStr10');if(d>=15)achEv('wStr15');
    if(c.kind==='liga'){try{if(rankOf(oi)===1)achEv('wLead');}catch(e){}}
    achEv('bt_'+oi);if(sw[1]===0)achEv('bt30_'+oi);if(sw[1]===2)achEv('bt32_'+oi);achEv(home?'btH_'+oi:'btA_'+oi);
    C.cur=(C.cur||0)+1;achMax('streak',C.cur);if(sw[1]===0){C.cur30=(C.cur30||0)+1;achMax('run30',C.cur30);}else C.cur30=0;
    if(!home){C.curA=(C.curA||0)+1;achMax('awayRun',C.curA);}
    const tc=me.tactics||{};for(const [k] of ACH_TAC())achEv('t_'+k+'_'+((tc[k]||0)%6));
    const acad=me.slots.filter(z=>z.p&&PLAYERS[z.p.id]&&PLAYERS[z.p.id].p.acad).length;if(acad>=2)achEv('acadLine');
    const mvp=me.pl.slice().sort((a,b)=>mvpScore(b)-mvpScore(a))[0];if(mvp){achEv('mvp');A.mvpIds=A.mvpIds||[];if(!A.mvpIds.includes(mvp.id))A.mvpIds.push(mvp.id);C.mvpU=A.mvpIds.length;}}
  else{C.cur=0;C.cur30=0;if(!home)C.curA=0;}
  if(home){if(won){C.curH=(C.curH||0)+1;achMax('homeRun',C.curH);}else C.curH=0;}
}catch(e){console.error(e);}}
// po dniu play-off: rozstrzygnięte rywalizacje z naszym udziałem
function achPo(c){try{const s=S();if(!s.po||!c||!c.sid||c.kind!=='po')return;const sr=s.po.series.find(x=>x.id===c.sid);if(!sr||!seriesDone(sr)||sr.achDone)return;sr.achDone=1;
  if(seriesWinner(sr)!==SAVE.team)return;achEv({QF:'qf',SF:'sf',F:'fin',B:'bronze'}[sr.st]);
  const g0=sr.games[0];if(g0){const meH=g0.h===SAVE.team;const wonFirst=meH?g0.sw[0]===3:g0.sw[1]===3;if(!wonFirst)achEv('serComeback');}
  if(sr.st==='F'&&Math.min(sr.w[0],sr.w[1])===0)achMax('finSweep',1);}catch(e){console.error(e);}}
// po sezonie
function achSeason(prize){try{const A=ACHS(),C=A.c,s=S();const l=myLg(),place=s.final.indexOf(SAVE.team)+1;
  achEv('seasons');achEv('sez'+l);if(prize>0)achEv('prize',prize);
  if(place===1){achEv('champ'+l);A.titleClubs=A.titleClubs||[];if(!A.titleClubs.includes(SAVE.team))A.titleClubs.push(SAVE.team);C.titleClubs=A.titleClubs.length;
    if(C.champ0&&C.champ1&&C.champ2)achMax('allTitles',1);
    const lost=(s.po?s.po.series:[]).filter(x=>x.hi===SAVE.team||x.lo===SAVE.team).reduce((n,x)=>n+x.games.filter(g=>(g.h===SAVE.team)!==(g.sw[0]===3)).length,0);if(!lost)achMax('perfPo',1);
    if((SAVE.history||[]).filter(h=>h.team===SAVE.team).length===1)achMax('firstSeasonTitle',1);
    if(SAVE.ownClub&&SAVE.custom&&SAVE.custom.idx===SAVE.team){achMax('ownChampAny',1);if(l===0)achMax('ownChamp',1);}}
  if(l===0&&place<=3)achEv('medal0');if(l===0&&place<=2)achEv('final0');if(place<=8)achEv('poQ');
  const tb=leagueTable();if(tb[0]&&tb[0].i===SAVE.team){achEv('first');if(l===0)achEv('first0');}
  const me=tb.find(x=>x.i===SAVE.team);if(me){achMax('rsW',me.w);achMax('rsPts',me.pts);achEv('rsPtsTot',me.pts);}
  const mv=(s.moves||[]).find(x=>x.i===SAVE.team);const H=SAVE.history||[],prev=H[H.length-2];
  if(mv&&mv.up){achEv('promo');achEv('promo'+mv.to);if(prev&&prev.mv===true&&prev.team===SAVE.team)achMax('dblPromo',1);if(mv.to===0&&SAVE.ownClub&&SAVE.custom&&SAVE.custom.idx===SAVE.team)achMax('ownPromo0',1);}
  if(l===0&&place<=10&&prev&&prev.mv===true&&prev.team===SAVE.team&&(prev.lg===1))achEv('stay0');
  if(s.eval){if(s.eval.met){achEv('goal');C.goalCur=(C.goalCur||0)+1;achMax('goalRun',C.goalCur);if(s.eval.goal-place>=4)achEv('goalX');}else C.goalCur=0;}
  if(s.jchamp===SAVE.team)achEv('jrChamp');if(A.jrN!==s.n){A.jrBase=(A.jrBase||0)+jrWinsNow();A.jrN=s.n;C.jrWin=A.jrBase;}
  const ts=s.ts&&s.ts[SAVE.team];if(ts){achMax('sAce',ts.ace);achMax('sBlk',ts.blk);achMax('sKill',ts.kill);}
  try{const L=leaders(l);const mine=x=>x&&PLAYERS[x.id]&&PLAYERS[x.id].t&&PLAYERS[x.id].t.idx===SAVE.team;if(mine(L.pts[0]))achEv('awPts');if(mine(L.mvp[0]))achEv('awMvp');if(mine(L.blk[0]))achEv('awBlk');if(mine(L.ace[0]))achEv('awAce');}catch(e){}
  try{const sea=SAVE.fin&&SAVE.fin.sea;if(sea){const bal=Object.values(sea).reduce((a,b)=>a+b,0);if(bal>0)achEv('profit');}}catch(e){}
}catch(e){console.error(e);}}

// ---- stan klubu (wartości maksymalne) ----
function achDerive(){const C=ACHS().c;if(SAVE.team==null||!SAVE.world)return;const t=myTeam();if(!t)return;
  try{const rs=t.players.map(p=>rating(p));achMax('best',Math.max(0,...rs));achMax('str',teamStrength(t));achMax('n80',rs.filter(r=>r>=80).length);achMax('n85',rs.filter(r=>r>=85).length);
    const ap=ACHS().apps||{};achMax('loyal',Math.max(0,...t.players.map(p=>ap[p.id+'_'+SAVE.team]||0)));
    {const A=ACHS(),s=S();if(s&&s.jres&&A.jrN!==s.n){C.jrWin=(A.jrBase||0)+jrWinsNow();}}
    const ac=t.players.filter(p=>p.acad);achMax('acadN',ac.length);achMax('acad',Math.max(0,...ac.map(p=>rating(p))));
    achMax('bal',SAVE.fin?SAVE.fin.bal:0);achMax('rep',SAVE.ai[SAVE.team].rep);if(SAVE.board)achMax('board',Math.round(SAVE.board.conf));
    const inf=myInfra();let sum=0,all=true;for(const f of INFRA){const v=inf[f.k]||0;sum+=v;achMax('inf_'+f.k,v);if(v<(f.max||5))all=false;}achMax('infSum',sum);if(all)achMax('infAll',1);
    if(typeof SPN==='function'){const sp=SPN();if(sp&&sp.act){achMax('spAct',sp.act.length);if(sp.act.some(x=>x.cat==='tit'))achMax('spTit',1);if(sp.act.some(x=>x.cat==='main'))achMax('spMain',1);}}
    achMax('staffSk',Math.max(0,...Object.values(SAVE.staff||{}).filter(Boolean).map(x=>x.skill||0)));
    const co=typeof coach==='function'?coach():null;if(co){achMax('crep',co.rep||0);const cl=new Set((co.hist||[]).map(h=>h.team));cl.add(SAVE.team);achMax('clubs',cl.size);}
    if(myLg()===0)achMax('inEL',1);
    if(A_since())achMax('days',Math.max(0,Math.round((new Date(today())-new Date(A_since()))/864e5)));}catch(e){console.error(e);}}
function jrWinsNow(){const s=S();let w=0;for(const rd of (s&&s.jres)||[])for(const g of rd){if(g.h===SAVE.team&&g.sw[0]===3)w++;else if(g.a===SAVE.team&&g.sw[1]===3)w++;}return w;}
function A_since(){return SAVE.ach&&SAVE.ach.since;}

// ---- sprawdzanie i powiadomienia ----
let ACH_BUSY=false;
function achCheck(){if(ACH_BUSY||SAVE.team==null||!SAVE.world)return;ACH_BUSY=true;try{const A=ACHS();achDerive();const C=A.c,now=[];
  for(const a of achDefs()){if(A.got[a.id])continue;if((C[a.k]||0)>=a.g){A.got[a.id]=today();now.push(a);}}
  if(now.length){A.fresh=(A.fresh||[]).concat(now.map(a=>a.id)).slice(-60);
    if(now.length<=3)for(const a of now)news(`🏅 Osiągnięcie: ${a.n} — ${achDesc(a)}`);else news(`🏅 Odblokowano ${now.length} osiągnięć (m.in. ${now.slice(0,3).map(a=>a.n).join(', ')}).`);
    ui.achToast={list:now.slice(0,3),more:Math.max(0,now.length-3),t:Date.now()};}}finally{ACH_BUSY=false;}}
function achDesc(a){return a.dn?a.dn():a.d;}
function achPts(a){return ACH_TIER[a.t][2];}
function achVal(a){return Math.min(a.g,(ACHS().c[a.k]||0));}

// ---- widok ----
function achView(){const A=ACHS();achCheck();const defs=achDefs();const got=defs.filter(a=>A.got[a.id]);A.fresh=[];
  const pts=got.reduce((s,a)=>s+achPts(a),0),max=defs.reduce((s,a)=>s+achPts(a),0);
  const cat=ui.achCat||'all',flt=ui.achF||'all',q=(ui.achQ||'').toLowerCase();
  let xs=defs.filter(a=>(cat==='all'||a.cat===cat)&&(flt==='all'||(flt==='got'?A.got[a.id]:!A.got[a.id]))&&(!q||(a.n+' '+achDesc(a)).toLowerCase().includes(q)));
  if(ui.achSort==='near')xs=xs.slice().sort((a,b)=>(!!A.got[a.id]-!!A.got[b.id])||(achVal(b)/b.g-achVal(a)/a.g));
  const pg=ui.achPg||0,per=60,pages=Math.max(1,Math.ceil(xs.length/per)),cur=Math.min(pg,pages-1);const page=xs.slice(cur*per,cur*per+per);
  const near=defs.filter(a=>!A.got[a.id]&&achVal(a)>0).sort((a,b)=>achVal(b)/b.g-achVal(a)/a.g).slice(0,6);
  const card=a=>{const ok=!!A.got[a.id],v=achVal(a),pc=Math.round(v/a.g*100),tr=ACH_TIER[a.t];
    return `<div class="achc ${ok?'ok':''}" style="--tc:${tr[1]}"><div class="achi">${ok?'🏅':'🔒'}</div><div class="achb"><b>${esc(a.n)}</b><span class="small mut">${esc(achDesc(a))}</span>
      ${ok?`<span class="small good">Zdobyte ${fmtDMY(A.got[a.id])}</span>`:`<div class="achp"><i style="width:${pc}%"></i></div><span class="small mut">${achNum(v)} / ${achNum(a.g)}</span>`}</div><span class="achtier">${tr[0]} · ${tr[2]}</span></div>`;};
  const catN=k=>{const d=defs.filter(a=>a.cat===k);return `${d.filter(a=>A.got[a.id]).length}/${d.length}`;};
  return `<div class="card"><div class="row wrap" style="gap:16px;align-items:center"><div><h2 style="margin:0">Osiągnięcia</h2><div class="mut small">Liczone od ${fmtDMY(A.since)} · wszystkie są możliwe do zdobycia w karierze</div></div><span class="sp"></span>
    <div class="achsum"><b>${got.length}</b><span>/ ${defs.length} zdobytych</span></div><div class="achsum"><b>${pts}</b><span>/ ${max} pkt</span></div></div>
    <div class="achp big"><i style="width:${(got.length/defs.length*100).toFixed(1)}%"></i></div></div>
   ${near.length?`<div class="card"><h3>Najbliżej zdobycia</h3><div class="achgrid">${near.map(card).join('')}</div></div>`:''}
   <div class="card"><div class="row wrap" style="gap:6px"><button class="tabb ${cat==='all'?'on':''}" onclick="ui.achCat='all';ui.achPg=0;render()">Wszystkie</button>${ACH_CATS.map(([k,ic,n])=>`<button class="tabb ${cat===k?'on':''}" onclick="ui.achCat='${k}';ui.achPg=0;render()">${ic} ${n} <small class="mut">${catN(k)}</small></button>`).join('')}</div>
    <div class="row wrap" style="gap:8px;margin:10px 0"><select onchange="ui.achF=this.value;ui.achPg=0;render()">${[['all','Wszystkie'],['got','Zdobyte'],['no','Do zdobycia']].map(([v,n])=>`<option value="${v}" ${flt===v?'selected':''}>${n}</option>`).join('')}</select>
     <select onchange="ui.achSort=this.value;render()"><option value="">Kolejność: kategorie</option><option value="near" ${ui.achSort==='near'?'selected':''}>Kolejność: najbliżej zdobycia</option></select>
     <input placeholder="Szukaj osiągnięcia…" value="${esc(ui.achQ||'')}" onchange="ui.achQ=this.value;ui.achPg=0;render()"><span class="sp"></span><span class="small mut">${xs.length} wyników</span></div>
    <div class="achgrid">${page.map(card).join('')||'<p class="mut">Brak wyników.</p>'}</div>
    ${pages>1?`<div class="row" style="gap:8px;justify-content:center;margin-top:10px"><button class="ghost sm" onclick="ui.achPg=${Math.max(0,cur-1)};render()" ${cur===0?'disabled':''}>←</button><span class="small mut">strona ${cur+1} / ${pages}</span><button class="ghost sm" onclick="ui.achPg=${Math.min(pages-1,cur+1)};render()" ${cur>=pages-1?'disabled':''}>→</button></div>`:''}</div>`;}
function achToastHtml(){const t=ui.achToast;if(!t)return '';if(Date.now()-t.t>7000){ui.achToast=null;return '';}
  return `<div class="achtoast" onclick="ui.achToast=null;go('osiagniecia')">${t.list.map(a=>`<div><span>🏅</span><b>${esc(a.n)}</b><small>${esc(achDesc(a))}</small></div>`).join('')}${t.more?`<div class="small mut">i ${t.more} więcej…</div>`:''}</div>`;}
function achFreshN(){try{return SAVE.ach&&SAVE.ach.fresh?SAVE.ach.fresh.length:0;}catch(e){return 0;}}
