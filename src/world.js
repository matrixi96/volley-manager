// ===== Świat: kraje, ligi zagraniczne, narodowości zawodników =====
// Ligi: 0–2 Polska (Ekstraliga, 1. Liga, 2. Liga), 3–4 Niemcy, 5–6 Włochy, 7–8 Turcja. Nazwy klubów są fikcyjne.
const COUNTRIES={PL:{n:'Polska',gen:'Polski',fl:'🇵🇱',lgs:[0,1,2],cup:'Puchar Polski'},DE:{n:'Niemcy',gen:'Niemiec',fl:'🇩🇪',lgs:[3,4],cup:'Puchar Niemiec'},
  IT:{n:'Włochy',gen:'Włoch',fl:'🇮🇹',lgs:[5,6],cup:'Puchar Włoch'},TR:{n:'Turcja',gen:'Turcji',fl:'🇹🇷',lgs:[7,8],cup:'Puchar Turcji'}};
const CTRY=['PL','DE','IT','TR'];
LG_N=['Ekstraliga','1. Liga','2. Liga','Bundesliga','2. Bundesliga','SuperLega','Serie A2','Efeler Ligi','1. Lig'];
LG_SHORT=['EL','1L','2L','BL','2BL','SL','A2','EF','1LG'];
LG_ECO=[1,0.45,0.2,0.55,0.18,1.15,0.4,1.1,0.3];
LG_PRIZE=[1,0.3,0.1,0.5,0.08,1.1,0.25,1,0.15];
LG_REP=[[95,7],[50,3],[30,2],[72,4],[30,2],[98,6],[48,3],[92,6],[36,2]];
const LG_C=['PL','PL','PL','DE','DE','IT','IT','TR','TR'],LG_LV=[0,1,2,0,1,0,1,0,1];
const LG_GEN=['Ekstraligi','1. Ligi','2. Ligi','Bundesligi','2. Bundesligi','SuperLegi','Serie A2','Efeler Ligi','1. Lig'];
const LG_LOC=['Ekstralidze','1. Lidze','2. Lidze','Bundeslidze','2. Bundeslidze','SuperLedze','Serie A2','Efeler Ligi','1. Lig'];
function lgCountry(l){return LG_C[l]||'PL';}
function tmCountry(ti){return lgCountry(lgOf(ti));}
function lgUp(l){const c=COUNTRIES[lgCountry(l)].lgs;const i=c.indexOf(l);return i>0?c[i-1]:null;}
function lgDown(l){const c=COUNTRIES[lgCountry(l)].lgs;const i=c.indexOf(l);return i>=0&&i<c.length-1?c[i+1]:null;}
function lgFull(l){const c=COUNTRIES[lgCountry(l)];return `${c.fl} ${LG_N[l]}`;}
function allLgs(){return LG_N.map((_,i)=>i);}
// ---- narodowości ----
const NAT={
 PL:['Polska','🇵🇱',null,null],
 DE:['Niemcy','🇩🇪',['Lukas','Jonas','Leon','Felix','Tim','Moritz','Paul','Niklas','Jan','Florian','Tobias','Simon','Erik','Julian','Max','Christian','Linus','Johannes'],['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch','Richter','Klein','Wolf','Neumann','Schwarz','Zimmermann','Krüger','Hartmann','Lange','Brandt','Vogel','Kunstmann']],
 IT:['Włochy','🇮🇹',['Alessandro','Matteo','Lorenzo','Simone','Luca','Giovanni','Riccardo','Federico','Davide','Marco','Andrea','Fabio','Daniele','Gabriele','Tommaso','Filippo','Nicola','Yuri'],['Rossi','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Costa','Giordano','Mancini','Rizzo','Lombardi','Moretti','Barbieri','Fontana','Santoro','Gargiulo','Porro','Balaso']],
 TR:['Turcja','🇹🇷',['Mert','Emre','Burak','Can','Efe','Kaan','Arda','Yiğit','Berkay','Doğukan','Oğuzhan','Murat','Serhat','Ahmet','Mehmet','Cem','Bedirhan','Hasan'],['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Öztürk','Arslan','Doğan','Kılıç','Aslan','Çetin','Kara','Koç','Kurt','Özdemir','Şimşek','Polat','Erdoğan','Güneş','Tümer']],
 BR:['Brazylia','🇧🇷',['Lucas','Bruno','Ricardo','Leandro','Fernando','Thiago','Gustavo','Rafael','Matheus','Felipe','Douglas','Wallace','Alan','Isac','Darlan','Adriano'],['Silva','Souza','Oliveira','Santos','Pereira','Lima','Costa','Ferreira','Rodrigues','Almeida','Nascimento','Carvalho','Ribeiro','Gomes','Martins','Barbosa','Rocha','Araújo']],
 FR:['Francja','🇫🇷',['Antoine','Jean','Nicolas','Théo','Benjamin','Kévin','Yacine','Earvin','Trévor','Barthélémy','Hugo','Quentin','Mathis','Julien','Lucas','Stéphen'],['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','Faure','Clevenot','Patry','Chinenyeze']],
 RS:['Serbia','🇷🇸',['Nikola','Marko','Uroš','Aleksandar','Dražen','Srećko','Miran','Vuk','Stefan','Luka','Pavle','Nemanja','Milan','Petar','Vojin'],['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Stanković','Pavlović','Milošević','Kovačević','Todorović','Lukić','Perić','Kujundžić','Podraščanin']],
 US:['USA','🇺🇸',['Matt','Micah','Aaron','Jeff','Kyle','Taylor','Thomas','Max','David','Erik','Garrett','Jake','Brandon','Ryan','Cody','Tyler'],['Anderson','Russell','Christenson','Smith','Johnson','Jaeschke','Holt','Ensing','Shoji','Kessel','Muagututia','Williams','Brown','Davis','Miller','Wilson','Moore','Clark']],
 AR:['Argentyna','🇦🇷',['Facundo','Luciano','Agustín','Bruno','Ezequiel','Nicolás','Matías','Santiago','Joaquín','Federico','Pablo','Martín','Gonzalo','Tomás'],['González','Rodríguez','Fernández','López','Martínez','Pérez','García','Sánchez','Romero','Sosa','Torres','Álvarez','Ruiz','Díaz','Conte','Loser','Palonsky']],
 CU:['Kuba','🇨🇺',['Yoandy','Robertlandy','Wilfredo','Osniel','Javier','Miguel','Jesús','Liván','Marlon','Yonder','Roamy','Osmany','Leonel','Dariel'],['León','Simón','Melgarejo','Concepción','Herrera','Leal','Hierrezuelo','Juantorena','Pérez','Gutiérrez','Cepeda','Mesa','Alfonso','Marrero','Camejo']],
 SI:['Słowenia','🇸🇮',['Tine','Jan','Žiga','Rok','Alen','Klemen','Gregor','Matic','Uroš','Jani','Mitja','Dejan','Nik','Tilen'],['Urnaut','Kozamernik','Štern','Pajenk','Vinčić','Šket','Ropret','Gasparini','Mozič','Čebulj','Kovač','Horvat','Krajnc','Zupan','Novak']],
 BG:['Bułgaria','🇧🇬',['Aleksandar','Matey','Simeon','Cvetan','Teodor','Georgi','Nikolay','Martin','Rozalin','Valentin','Svetoslav','Dimitar','Ivan','Hristo'],['Nikolov','Kaziyski','Sokolov','Penchev','Gotsev','Atanasov','Grozdanov','Ivanov','Petrov','Georgiev','Dimitrov','Todorov','Stoyanov','Kolev','Asparuhov']],
 NL:['Holandia','🇳🇱',['Nimir','Thijs','Wessel','Maarten','Gijs','Robbert','Fabian','Twan','Luuk','Sjoerd','Bennie','Jeroen','Daan','Bram'],['Abdel-Aziz','ter Horst','Keemink','van Garderen','Jorna','Andringa','Plak','Wiltenburg','de Jong','Jansen','de Vries','van Dijk','Bakker','Visser','Smit']],
 BE:['Belgia','🇧🇪',['Sam','Hendrik','Pieter','Arno','Stijn','Seppe','Jelle','Tomas','Ferre','Wout','Lowie','Matthijs','Bram','Kevin'],['Deroo','Tuerlinckx','Rotty','Van de Velde','Coolman','Desmet','Verhees','Peeters','Janssens','Maes','Jacobs','Mertens','Willems','Claes','Goossens']],
 CA:['Kanada','🇨🇦',['Gavin','Stephen','Eric','Lucas','Arthur','Brett','Ryan','Sharone','Nicholas','Fynn','Danny','Pearson','Xander','Jordan'],['Schmitt','Maar','Loeppky','Van Berkel','Szwarc','Walsh','Sclater','Vernon-Evans','Hoag','McCarthy','Demyanenko','Eshenko','Howatson','Tremblay','Roy']],
 JP:['Japonia','🇯🇵',['Yuki','Ran','Yuji','Masahiro','Kentaro','Tomohiro','Akihiro','Taishi','Kento','Tatsunori','Masato','Shunichiro','Haku','Kenta'],['Ishikawa','Takahashi','Nishida','Sekita','Yamamoto','Onodera','Otsuka','Miyaura','Tomita','Sato','Suzuki','Tanaka','Watanabe','Ito','Nakamura']],
 IR:['Iran','🇮🇷',['Saeid','Milad','Amin','Morteza','Mohammad','Javad','Mahdi','Ali','Poriya','Amir','Esmaeil','Hossein','Reza','Arman'],['Marouf','Ebadipour','Esmaeilnezhad','Sharifi','Mousavi','Karimi','Jafari','Hazratpour','Salehi','Ahmadi','Hosseini','Rezaei','Mohammadi','Ghaemi','Fazli']],
 UA:['Ukraina','🇺🇦',['Oleh','Dmytro','Yurii','Vitalii','Tymur','Illia','Vasyl','Andrii','Maksym','Bohdan','Oleksii','Serhii','Denys','Taras'],['Plotnytskyi','Yanchuk','Semeniuk','Tupchii','Kovalenko','Bondarenko','Tkachenko','Kravchenko','Shevchenko','Melnyk','Boiko','Moroz','Lysenko','Savchenko','Rudenko']],
 CZ:['Czechy','🇨🇿',['Jan','Adam','Lukáš','Ondřej','Jakub','Patrik','Tomáš','Filip','Daniel','Michal','Martin','Vojtěch','Petr','Josef'],['Novák','Svoboda','Novotný','Dvořák','Černý','Procházka','Kučera','Veselý','Horák','Indra','Janouch','Polák','Fila','Sedlák','Mareš']],
 FI:['Finlandia','🇫🇮',['Eemi','Luka','Fedor','Joonas','Niko','Aleksi','Elias','Severi','Oskari','Jesse','Lauri','Ville','Tuomas','Mikko'],['Tervaportti','Marttila','Jukoski','Siltala','Korhonen','Virtanen','Mäkinen','Nieminen','Hämäläinen','Laine','Heikkinen','Koskinen','Järvinen','Lehtonen','Saarinen']]};
const NAT_W=[['BR',10],['FR',8],['RS',7],['US',7],['AR',5],['CU',6],['SI',4],['BG',5],['NL',4],['BE',4],['CA',4],['JP',3],['IR',3],['UA',4],['CZ',3],['FI',2],['PL',6],['IT',6],['DE',5],['TR',4]];
const NAT_HOME={PL:0.72,DE:0.5,IT:0.62,TR:0.7};
function natFl(c){return (NAT[c]||NAT.PL)[1];}
function natN(c){return (NAT[c]||NAT.PL)[0];}
function pNat(p){return p&&p.nat||'PL';}
function natPick(rnd,home){rnd=rnd||R;if(home&&rnd()<(NAT_HOME[home]||0.7))return home;const tot=NAT_W.reduce((s,x)=>s+(x[0]===home?0:x[1]),0);let x=rnd()*tot;for(const [c,w] of NAT_W){if(c===home)continue;x-=w;if(x<=0)return c;}return 'BR';}
function natName(c,rnd){rnd=rnd||R;const N=NAT[c];const F=N&&N[2]||FIRST,L=N&&N[3]||LAST;return [F[Math.floor(rnd()*F.length)],L[Math.floor(rnd()*L.length)]];}
// ---- kluby zagraniczne (fikcyjne nazwy, prawdziwe miasta) ----
(function(){const P=['#ef4444','#3b82f6','#22c55e','#eab308','#a855f7','#f97316','#06b6d4','#ec4899','#64748b','#14b8a6','#dc2626','#2563eb','#16a34a','#ca8a04','#7c3aed','#0891b2'];
 const add=(lg,list)=>list.forEach(([name,short,q],i)=>TEAM_DEFS.push({name,short,q,color:P[(i*5+lg*3)%P.length],lg}));
 add(3,[['Adler Berlin','ADB',13.8],['Möwen Lüneburg','MOL',13.4],['Zeppeline Friedrichshafen','ZEF',13.0],['Falken Düren','FAD',12.4],['Bären Giesen','BAG',12.0],['Löwen Ludwigsburg','LOL',11.7],['Panther München','PAM',12.2],['Netzfalken Königs Wusterhausen','NKW',11.2],['Hirsche Karlsruhe','HIK',10.9],['Stiere Bitterfeld','STB',10.6],['Seeadler Warnemünde','SEW',10.5],['Elbwölfe Dresden','ELD',11.0],['Füchse Frankfurt','FUF',10.8],['Haie Hamburg','HAH',10.4],['Luchse Leipzig','LUL',10.7]]);
 add(4,[['Dachse Bühl','DAC',9.8],['Kieler Störche','KST',9.6],['Hannover Hornissen','HAN',9.5],['Mainz Meteore','MAM',9.2],['Stuttgart Steinböcke','STS',9.3],['Kölner Kraniche','KOK',9.0],['Bremer Biber','BRB',8.9],['Dortmund Drachen','DOD',8.8],['Freiburg Füchsinnen','FRF',8.6],['Rostock Robben','ROR',8.5],['Essen Eisvögel','ESE',8.4],['Kassel Kometen','KAK',8.3],['Ulmer Uhus','ULU',8.1],['Würzburg Wespen','WUW',8.0]]);
 add(5,[['Grifoni Perugia','GRP',14.8],['Aquile Trento','AQT',14.6],['Leoni Civitanova','LEO',14.3],['Lupi Piacenza','LUP',14.0],['Canarini Modena','CAM',13.8],['Fulmini Milano','FUM',13.7],['Tori Monza','TOM',13.3],['Scaligeri Verona','SCV',13.4],['Falchi Cisterna','FAC',13.0],['Draghi Padova','DRP',13.1],['Gabbiani Grottazzolina','GAG',12.8],['Stambecchi Cuneo','STC',12.9]]);
 add(6,[['Leonesse Brescia','LBR',11.6],['Aironi Cantù','AIC',11.2],['Vespe Aversa','VEA',11.3],['Palio Siena','PAS',11.0],['Mosaici Ravenna','MOR',10.9],['Delfini Taranto','DET',10.8],['Elefanti Catania','ELC',10.6],['Orobici Bergamo','ORB',10.7],['Squali Pineto','SQP',10.4],['Gabbiani Fano','GAF',10.3],['Rondini Prata','ROP',10.2],['Delta Porto Viro','DPV',10.1],['Lucani Lagonegro','LUC',10.0],['Sirene Sorrento','SIS',10.0]]);
 add(7,[['Kartallar Ankara','KAA',14.3],['Aslanlar İstanbul','ASI',14.0],['Kanaryalar İstanbul','KNI',13.6],['Şahinler Ankara','SAA',13.8],['Körfez İzmir','KOI',13.0],['Kaplanlar Bursa','KAB',12.6],['Dalgalar Antalya','DAA',12.4],['Selçuklu Konya','SEK',12.2],['Erciyes Kayseri','ERK',12.1],['Fıstıklar Gaziantep','FIG',12.0],['Meteor Eskişehir','MEE',12.3],['Kalesi Afyon','KAF',11.8],['Sakarya Kurtları','SKK',11.9],['Körfez Kocaeli','KKO',12.0]]);
 add(8,[['Mersin Denizcileri','MED',11.0],['Adana Pamukları','ADP',10.8],['Samsun Kuşları','SAK',10.6],['Trabzon Fırtınası','TRF',10.7],['Denizli Horozları','DEH',10.4],['Manisa Tarzanları','MAT',10.3],['Malatya Kayısıları','MAL',10.1],['Sivas Yiğitleri','SIY',10.0],['Edirne Pehlivanları','EDP',9.9],['Bolu Dağları','BOD',9.8],['Çorum Leblebileri','COL',9.6],['Tokat Bağları','TOB',9.6],['Hatay Zeytinleri','HAZ',9.5],['Muğla Martıları','MUM',9.4]]);
})();
// stare zapisy: zawodnicy bez narodowości są Polakami (tak byli generowani)
function ensNat(){if(!SAVE.world)return;for(const p of W().players)if(!p.nat)p.nat='PL';}
// ---- ligi juniorów U20 w pozostałych krajach (juniorzy klubów najwyższej ligi; szybka symulacja wyniku) ----
function jrStr(ti){const j=W().players.filter(p=>p.tm===ti&&p.jr).map(p=>rating(p)).sort((a,b)=>b-a).slice(0,7);return j.length?j.reduce((s,x)=>s+x,0)/j.length:45;}
function jrQuick(h,a){const d=(jrStr(h)-jrStr(a)+1.5)/5;const ph=1/(1+Math.exp(-d));const sw=[0,0],sets=[];
  while(sw[0]<3&&sw[1]<3){const tb=sw[0]+sw[1]===4;const lim=tb?15:25;const hw=R()<ph;const lo=Math.max(0,Math.round(lim-2-R()*(lim*0.45)));const wpts=lo>=lim-1?lo+2:lim;sets.push(hw?[wpts,lo]:[lo,wpts]);sw[hw?0:1]++;}
  return {h,a,sets,sw};}
function jrInitOther(s){s.jo={};const my=tmCountry(SAVE.team);for(const c of CTRY){if(c===my)continue;const ids=lgIds(COUNTRIES[c].lgs[0]);if(ids.length<4)continue;
  const f=makeFixtures(ids.length).map(rd=>rd.map(([h,a])=>[ids[h],ids[a]]));s.jo[c]={ids,rounds:f.concat(f.map(rd=>rd.map(([h,a])=>[a,h]))),res:[],champ:null};}}
function jrOtherRound(r){const s=S();if(!s.jo)jrInitOther(s);for(const c in s.jo){const J=s.jo[c];if(J.res.length>r||!J.rounds[r])continue;
  J.res.push(J.rounds[r].map(([h,a])=>{ensureJuniors(h);ensureJuniors(a);return jrQuick(h,a);}));if(J.res.length===J.rounds.length)J.champ=tableFrom(J.res,J.ids)[0].i;}}
function jrOtherFinish(){const s=S();if(!s.jo)return;for(const c in s.jo){const J=s.jo[c];while(J.res.length<J.rounds.length)jrOtherRound(J.res.length);}}
