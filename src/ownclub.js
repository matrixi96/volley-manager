// ================= WŁASNY KLUB =================
const OWN_COLORS=['#0ea5e9','#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#ca8a04','#16a34a','#0d9488','#475569','#111827','#be123c'];
function cleanName(s){return String(s==null?'':s).replace(/[<>&"'`]/g,'').slice(0,40);}
function applyCustom(){const c=SAVE.custom;if(!c)return;const t=TEAMS[c.idx];if(!t)return;c.name=cleanName(c.name);c.short=cleanName(c.short).slice(0,4);c.city=cleanName(c.city);if(!/^#[0-9a-fA-F]{3,8}$/.test(c.color||''))c.color='#2563eb';t.name=c.name;t.short=c.short;t.color=c.color;t.city=c.city;}
const CREST_SHAPES={
  shield:'M50 4 L92 16 L88 62 Q82 92 50 106 Q18 92 12 62 L8 16Z',
  round:'M50 7 A48 48 0 1 1 49.9 7Z',
  heater:'M10 8 H90 V50 Q90 88 50 106 Q10 88 10 50Z',
  french:'M10 8 H90 V70 Q90 92 70 98 Q56 100 50 106 Q44 100 30 98 Q10 92 10 70Z',
  hex:'M50 4 L92 28 L92 80 L50 106 L8 80 L8 28Z',
  badge:'M20 6 H80 Q94 6 94 20 V88 Q94 102 80 102 H20 Q6 102 6 88 V20 Q6 6 20 6Z',
  pennant:'M8 6 H92 V64 L50 106 L8 64Z',
  oval:'M50 4 C80 4 94 30 94 55 C94 82 76 106 50 106 C24 106 6 82 6 55 C6 30 20 4 50 4Z'};
const CRESTS=[
  ['shield','plain','ball'],['round','plain','star'],['heater','vstripes','ball'],['french','sash','crown'],['hex','plain','bolt'],
  ['badge','band','star'],['pennant','chevron','ball'],['oval','split','tower'],['shield','quarter','crown'],['round','hoops','ball'],
  ['heater','plain','flame'],['hex','sash','star'],['badge','plain','anchor'],['french','split','mount'],['shield','chevron','sun'],
  ['oval','plain','wings'],['pennant','vstripes','star'],['round','band','laurel'],['heater','quarter','bolt'],['hex','chevron','tower']];
// herby klubów ligowych (indeks = indeks klubu): kształt, wzór, drugi kolor, godło, rok założenia, opcjonalnie kolor pola
const CLUB_CRESTS=[
  {sh:'shield',pt:'band',c2:'#fff',em:'ball',yr:1946},
  {sh:'shield',pt:'band',c2:'#fff',em:'falcon',yr:1952},
  {sh:'heater',pt:'split',c2:'#fff',em:'bolt',yr:1928},
  {sh:'badge',pt:'vstripes',c2:'#1f2937',em:'hammers',yr:1957},
  {sh:'french',pt:'plain',c2:'#fff',em:'griffin',yr:1945,bg:'#7f1d1d'},
  {sh:'shield',pt:'quarter',c2:'#0f766e',em:'goat',yr:1949},
  {sh:'hex',pt:'band',c2:'#fff',em:'ship',yr:1961},
  {sh:'oval',pt:'plain',c2:'#fff',em:'eagle',yr:1972},
  {sh:'round',pt:'split',c2:'#fff',em:'swirl',yr:1955},
  {sh:'heater',pt:'hoops',c2:'#334155',em:'cormorant',yr:1966},
  {sh:'pennant',pt:'vstripes',c2:'#7f1d1d',em:'rocket',yr:1958},
  {sh:'badge',pt:'plain',c2:'#fff',em:'gem',yr:1950,bg:'#1e3a8a'},
  {sh:'shield',pt:'plain',c2:'#fff',em:'spark',yr:1990},
  {sh:'hex',pt:'split',c2:'#fff',em:'bolt',yr:1984},
  {sh:'round',pt:'plain',c2:'#fff',em:'wave',yr:1979},
  {sh:'french',pt:'plain',c2:'#fff',em:'torch',yr:1971,bg:'#1f2937'},
  {sh:'heater',pt:'plain',c2:'#fff',em:'eagle',yr:1968},
  {sh:'badge',pt:'band',c2:'#fff',em:'castle',yr:1975},
  {sh:'oval',pt:'plain',c2:'#fff',em:'comet',yr:1993},
  {sh:'shield',pt:'quarter',c2:'#14532d',em:'crown',yr:1962},
  {sh:'round',pt:'plain',c2:'#fff',em:'aurora',yr:1988,bg:'#0f172a'},
  {sh:'pennant',pt:'plain',c2:'#fff',em:'peaks',yr:1977},
  {sh:'hex',pt:'plain',c2:'#fff',em:'gem',yr:1985,bg:'#1e3a8a'},
  {sh:'heater',pt:'plain',c2:'#fff',em:'oak',yr:1981,bg:'#78350f'},
  {sh:'shield',pt:'vstripes',c2:'#111827',em:'helmet',yr:1995},
  {sh:'french',pt:'plain',c2:'#fff',em:'flame',yr:1992,bg:'#111827'},
  {sh:'round',pt:'hoops',c2:'#075985',em:'wind',yr:1998},
  {sh:'badge',pt:'split',c2:'#fff',em:'arrow',yr:2001},
  {sh:'heater',pt:'band',c2:'#fff',em:'hawk',yr:1989},
  {sh:'oval',pt:'band',c2:'#fff',em:'gull',yr:2003},
  {sh:'round',pt:'plain',c2:'#fff',em:'rainbow',yr:1997,bg:'#1e293b'},
  {sh:'hex',pt:'plain',c2:'#fff',em:'rock',yr:1987},
  {sh:'shield',pt:'split',c2:'#fff',em:'lynx',yr:2005},
  {sh:'pennant',pt:'split',c2:'#fff',em:'star',yr:1999},
  {sh:'round',pt:'plain',c2:'#fff',em:'beaver',yr:2008},
  {sh:'french',pt:'band',c2:'#fff',em:'owl',yr:2002}];
let CREST_UID=0;
function shadeHex(hex,f){const n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(v=>Math.round(Math.min(255,v*f))).join(',')})`;}
function crestEmblem(e,col){const W='#fff',st=`stroke="#0007" stroke-width="1.5" paint-order="stroke"`;
  switch(e){
  case 'ball':return `<circle cx="50" cy="40" r="15" fill="${W}" ${st}/><path d="M37 34 Q50 41 63 34 M36 46 Q50 39 64 46 M50 25 Q43 40 50 55" stroke="${col}" stroke-width="2.4" fill="none"/>`;
  case 'star':return `<path d="M50 22 L55 35 L69 35 L58 44 L62 58 L50 50 L38 58 L42 44 L31 35 L45 35Z" fill="${W}" ${st}/>`;
  case 'crown':return `<path d="M32 50 L30 28 L40 38 L50 24 L60 38 L70 28 L68 50Z" fill="#facc15" ${st}/><rect x="32" y="50" width="36" height="6" rx="2" fill="#facc15" ${st}/>`;
  case 'bolt':return `<path d="M55 20 L38 44 L49 44 L44 62 L63 36 L52 36Z" fill="#facc15" ${st}/>`;
  case 'tower':return `<path d="M36 58 V32 H40 V27 H45 V32 H48 V27 H52 V32 H55 V27 H60 V32 H64 V58Z" fill="${W}" ${st}/><path d="M46 58 V48 Q50 43 54 48 V58Z" fill="${col}"/>`;
  case 'flame':return `<path d="M50 20 Q62 34 58 44 Q66 40 64 32 Q74 46 66 56 Q58 64 50 62 Q38 62 35 52 Q32 42 42 34 Q42 42 46 44 Q42 30 50 20Z" fill="#f97316" ${st}/><path d="M50 40 Q57 48 54 55 Q50 59 46 55 Q44 49 50 40Z" fill="#fde047"/>`;
  case 'anchor':return `<g fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="25" r="4"/><path d="M50 29 V58 M40 37 H60 M34 48 Q36 60 50 60 Q64 60 66 48"/></g>`;
  case 'mount':return `<path d="M28 58 L42 34 L50 46 L58 30 L74 58Z" fill="${W}" ${st}/><path d="M58 30 L52 41 L56 40 L60 44 L63 37Z" fill="${col}" opacity=".5"/>`;
  case 'sun':return `<circle cx="50" cy="40" r="10" fill="#fde047" ${st}/>`+Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<line x1="${50+Math.cos(a)*13}" y1="${40+Math.sin(a)*13}" x2="${50+Math.cos(a)*19}" y2="${40+Math.sin(a)*19}" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>`;}).join('');
  case 'wings':return `<path d="M50 44 Q34 26 18 30 Q28 34 26 38 Q34 38 34 42 Q42 42 50 50Z M50 44 Q66 26 82 30 Q72 34 74 38 Q66 38 66 42 Q58 42 50 50Z" fill="${W}" ${st}/><circle cx="50" cy="44" r="8" fill="${W}" ${st}/><path d="M44 42 Q50 45 56 42 M50 36 Q47 44 50 52" stroke="${col}" stroke-width="1.6" fill="none"/>`;
  case 'laurel':return `<path d="M30 56 Q24 38 36 24 M70 56 Q76 38 64 24" fill="none" stroke="#facc15" stroke-width="3"/>`+[0,1,2,3].map(i=>`<ellipse cx="${31-i*0.5}" cy="${50-i*8}" rx="4" ry="2" fill="#facc15" transform="rotate(-50 ${31-i*0.5} ${50-i*8})"/><ellipse cx="${69+i*0.5}" cy="${50-i*8}" rx="4" ry="2" fill="#facc15" transform="rotate(50 ${69+i*0.5} ${50-i*8})"/>`).join('')+crestEmblem('ball',col);
  // ---- godła klubów ligowych ----
  case 'falcon':return `<path d="M50 50 C44 40 32 33 15 33 C24 37 28 41 31 45 C38 45 44 47 50 56 C56 47 62 45 69 45 C72 41 76 37 85 33 C68 33 56 40 50 50Z" fill="${W}" ${st}/><path d="M45 38 Q50 27 56 34 L61 35 L56 38 Q54 46 50 50 Q46 45 45 38Z" fill="${W}" ${st}/><circle cx="53" cy="34" r="1.6" fill="${col}"/>`;
  case 'eagle':return `<path d="M47 40 C40 28 28 21 15 21 L19 27 L16 31 L22 34 L19 39 L27 41 L25 46 L35 45 C39 47 43 49 47 52Z M53 40 C60 28 72 21 85 21 L81 27 L84 31 L78 34 L81 39 L73 41 L75 46 L65 45 C61 47 57 49 53 52Z" fill="${W}" ${st}/><path d="M44 38 Q50 33 56 38 L56 54 L61 63 H39 L44 54Z" fill="${W}" ${st}/><path d="M45 31 Q49 22 56 25 L63 28 L56 31 Q54 35 50 37 Q46 35 45 31Z" fill="${W}" ${st}/><path d="M43 26 L45 19 L48 23 L50 17 L52 23 L55 19 L57 26Z" fill="#facc15" ${st}/><circle cx="53" cy="28" r="1.4" fill="${col}"/>`;
  case 'gull':return `<path d="M16 40 Q32 26 50 44 Q68 26 84 40 Q68 34 54 48 Q50 52 46 48 Q32 34 16 40Z" fill="${W}" ${st}/><path d="M24 52 Q36 46 46 54 Q56 46 66 52" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  case 'cormorant':return `<path d="M44 60 Q34 48 40 36 Q44 28 52 26 Q60 24 64 28 L72 30 L64 32 Q58 32 56 38 Q54 46 60 52 Q66 58 64 62 Q54 58 44 60Z" fill="${W}" ${st}/><path d="M36 44 Q24 40 18 46 Q28 46 32 50 Q34 54 40 54Z" fill="${W}" ${st}/><circle cx="58" cy="29" r="1.6" fill="${col}"/>`;
  case 'griffin':return `<path d="M46 40 Q32 22 18 20 Q25 27 23 31 Q30 31 30 35 Q36 35 38 42Z" fill="#facc15" ${st}/><path d="M40 64 Q37 50 44 42 Q40 34 44 26 Q50 18 58 22 L69 22 L60 28 Q60 34 56 38 Q62 40 64 46 L73 40 L71 48 L65 54 Q61 59 61 64Z" fill="#facc15" ${st}/><path d="M50 22 L47 13 L54 20Z" fill="#facc15" ${st}/><circle cx="56" cy="26" r="1.8" fill="${col}"/><path d="M45 52 Q50 56 56 52" stroke="${col}" stroke-width="1.5" fill="none" opacity=".6"/>`;
  case 'hawk':return `<path d="M50 62 L44 54 Q38 44 30 40 Q22 36 18 26 Q30 30 38 36 Q40 28 46 26 Q54 22 60 26 L66 30 L60 32 Q62 38 60 42 Q70 34 82 26 Q78 36 70 42 Q62 46 56 54Z" fill="${W}" ${st}/><circle cx="54" cy="29" r="1.6" fill="${col}"/>`;
  case 'owl':return `<path d="M34 30 L40 36 Q50 32 60 36 L66 30 L66 42 Q70 56 50 64 Q30 56 34 42Z" fill="${W}" ${st}/><circle cx="43" cy="43" r="6.5" fill="${col}"/><circle cx="57" cy="43" r="6.5" fill="${col}"/><circle cx="43" cy="43" r="2.6" fill="#facc15"/><circle cx="57" cy="43" r="2.6" fill="#facc15"/><path d="M48 50 L50 55 L52 50Z" fill="#f59e0b"/>`;
  case 'lynx':return `<path d="M32 22 L40 38 Q50 34 60 38 L68 22 L66 44 Q66 60 50 64 Q34 60 34 44Z" fill="${W}" ${st}/><path d="M32 22 L31 15 M68 22 L69 15" stroke="${W}" stroke-width="2.5" stroke-linecap="round"/><path d="M41 46 L46 48 M59 46 L54 48" stroke="${col}" stroke-width="3" stroke-linecap="round"/><path d="M47 54 L50 57 L53 54Z" fill="${col}"/><path d="M36 54 L28 52 M36 57 L29 58 M64 54 L72 52 M64 57 L71 58" stroke="${col}" stroke-width="1.2"/>`;
  case 'goat':return `<path d="M40 30 Q30 16 18 22 Q28 22 32 32 M60 30 Q70 16 82 22 Q72 22 68 32" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/><path d="M38 30 Q50 26 62 30 Q64 44 56 56 Q54 64 50 66 Q46 64 44 56 Q36 44 38 30Z" fill="${W}" ${st}/><circle cx="44" cy="40" r="2" fill="${col}"/><circle cx="56" cy="40" r="2" fill="${col}"/><path d="M47 60 Q50 70 53 60" fill="${W}" ${st}/>`;
  case 'beaver':return `<ellipse cx="50" cy="42" rx="16" ry="15" fill="${W}" ${st}/><circle cx="37" cy="30" r="4" fill="${W}" ${st}/><circle cx="63" cy="30" r="4" fill="${W}" ${st}/><circle cx="44" cy="38" r="2" fill="${col}"/><circle cx="56" cy="38" r="2" fill="${col}"/><ellipse cx="50" cy="46" rx="4" ry="3" fill="${col}"/><rect x="46.5" y="50" width="3.2" height="6" fill="#fde68a" stroke="#0006" stroke-width=".6"/><rect x="50.3" y="50" width="3.2" height="6" fill="#fde68a" stroke="#0006" stroke-width=".6"/>`;
  case 'hammers':return `<g ${st} fill="${W}"><g transform="rotate(-38 50 42)"><rect x="47.5" y="24" width="5" height="38" rx="1.5"/><rect x="39" y="20" width="22" height="10" rx="2"/></g><g transform="rotate(38 50 42)"><rect x="47.5" y="24" width="5" height="38" rx="1.5"/><rect x="39" y="20" width="22" height="10" rx="2"/></g></g>`;
  case 'ship':return `<path d="M24 50 H76 L68 60 H32Z" fill="${W}" ${st}/><path d="M24 50 Q20 42 26 38 Q28 44 30 50Z M76 50 Q80 42 74 38 Q72 44 70 50Z" fill="${W}" ${st}/><path d="M50 20 V50" stroke="${W}" stroke-width="2.5"/><path d="M36 24 H64 Q66 36 64 46 H36 Q34 36 36 24Z" fill="${W}" ${st}/><path d="M36 30 H64 M36 38 H64" stroke="${col}" stroke-width="3"/>`;
  case 'swirl':return `<path d="M50 40 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 0 1 8 -8 a12 12 0 0 1 12 12 a16 16 0 0 1 -16 16 a20 20 0 0 1 -20 -20" fill="none" stroke="${W}" stroke-width="4.5" stroke-linecap="round" ${st}/>`;
  case 'wind':return `<g fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"><path d="M22 32 H58 Q66 32 66 25 Q66 19 60 19 Q55 19 55 24"/><path d="M18 42 H70 Q78 42 78 50 Q78 57 71 57 Q65 57 65 52"/><path d="M26 52 H50"/></g>`;
  case 'rocket':return `<path d="M50 16 Q62 26 60 48 H40 Q38 26 50 16Z" fill="${W}" ${st}/><circle cx="50" cy="32" r="4.5" fill="${col}" stroke="#fff" stroke-width="1.5"/><path d="M40 40 L32 52 L40 50Z M60 40 L68 52 L60 50Z" fill="${W}" ${st}/><path d="M43 50 Q50 66 57 50Z" fill="#f97316"/><path d="M46 50 Q50 60 54 50Z" fill="#fde047"/>`;
  case 'gem':return `<path d="M36 26 H64 L74 38 L50 64 L26 38Z" fill="#f59e0b" ${st}/><path d="M26 38 H74 M36 26 L44 38 L50 64 L56 38 L64 26 M44 38 L50 26 L56 38" fill="none" stroke="#fde68a" stroke-width="1.5"/>`;
  case 'wave':return `<g fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"><path d="M20 34 Q28 26 36 34 T52 34 T68 34 T84 34"/><path d="M20 46 Q28 38 36 46 T52 46 T68 46 T84 46"/><path d="M20 58 Q28 50 36 58 T52 58 T68 58 T84 58" opacity=".7"/></g>`;
  case 'torch':return `<path d="M44 46 H56 L53 66 H47Z" fill="${W}" ${st}/><rect x="42" y="42" width="16" height="5" rx="1.5" fill="#facc15" ${st}/><path d="M50 14 Q60 26 57 34 Q62 32 61 26 Q68 36 62 42 H38 Q32 34 40 26 Q40 32 44 34 Q42 24 50 14Z" fill="#f97316" ${st}/><path d="M50 26 Q55 33 53 40 H47 Q45 33 50 26Z" fill="#fde047"/>`;
  case 'comet':return `<path d="M60 26 Q40 30 20 54 Q36 40 54 36 Q34 48 26 62 Q44 46 62 40Z" fill="${W}" opacity=".85"/><circle cx="62" cy="32" r="9" fill="#fde047" ${st}/>`;
  case 'oak':return `<path d="M50 62 V30 M50 30 Q38 32 36 24 Q30 26 32 18 Q40 14 46 20 Q50 12 54 20 Q60 14 68 18 Q70 26 64 24 Q62 32 50 30" fill="#4ade80" ${st}/><path d="M50 62 V28" stroke="#14532d" stroke-width="2"/><ellipse cx="42" cy="52" rx="5" ry="6.5" fill="#b45309" ${st}/><path d="M37 47 Q42 43 47 47Z" fill="#78350f"/><ellipse cx="58" cy="52" rx="5" ry="6.5" fill="#b45309" ${st}/><path d="M53 47 Q58 43 63 47Z" fill="#78350f"/>`;
  case 'helmet':return `<path d="M34 54 Q30 26 50 22 Q70 26 66 54 L60 62 V48 Q56 44 52 46 V62 H48 V46 Q44 44 40 48 V62Z" fill="#facc15" ${st}/><path d="M50 22 Q44 10 30 14 Q42 16 46 24Z" fill="#dc2626" ${st}/><path d="M42 36 Q50 32 58 36" stroke="#0008" stroke-width="2" fill="none"/>`;
  case 'arrow':return `<g transform="rotate(-35 50 42)"><path d="M18 42 H74" stroke="${W}" stroke-width="5" stroke-linecap="round"/><path d="M84 42 L68 32 L71 42 L68 52Z" fill="${W}" ${st}/><path d="M18 42 L12 34 M26 42 L20 34 M18 42 L12 50 M26 42 L20 50" stroke="${W}" stroke-width="3" stroke-linecap="round"/></g>`;
  case 'rainbow':return ['#ef4444','#f59e0b','#facc15','#22c55e','#3b82f6'].map((c,i)=>`<path d="M${22+i*5} 58 A${28-i*5} ${28-i*5} 0 0 1 ${78-i*5} 58" fill="none" stroke="${c}" stroke-width="5"/>`).join('');
  case 'spark':return `<path d="M50 16 L55 37 L76 42 L55 47 L50 68 L45 47 L24 42 L45 37Z" fill="#fde047" ${st}/><path d="M50 30 L52 40 L62 42 L52 44 L50 54 L48 44 L38 42 L48 40Z" fill="#fff"/>`;
  case 'aurora':return `<g fill="none" stroke-width="5" stroke-linecap="round"><path d="M20 52 Q34 24 50 40 Q66 56 80 26" stroke="#4ade80"/><path d="M20 44 Q34 18 50 32 Q66 46 80 18" stroke="#a78bfa" opacity=".85"/></g><circle cx="30" cy="22" r="1.6" fill="#fff"/><circle cx="68" cy="50" r="1.6" fill="#fff"/><circle cx="58" cy="18" r="1.2" fill="#fff"/>`;
  case 'peaks':return `<path d="M20 60 L38 30 L48 44 L58 24 L80 60Z" fill="${W}" ${st}/><path d="M58 24 L52 35 L57 34 L61 39 L64 31Z M38 30 L34 37 L38 36 L41 39Z" fill="${col}" opacity=".45"/><path d="M24 22 Q34 18 44 22 M60 16 Q68 13 76 16" stroke="${W}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  case 'rock':return `<path d="M24 60 L30 38 L42 28 L60 30 L74 42 L76 60Z" fill="#a8a29e" ${st}/><path d="M42 28 L46 44 L30 38 M46 44 L60 30 M46 44 L58 60 M46 44 L74 42" fill="none" stroke="#57534e" stroke-width="1.6"/>`;
  case 'shieldball':return `<path d="M30 22 H70 V40 Q70 56 50 64 Q30 56 30 40Z" fill="${W}" ${st}/>`+`<g transform="translate(0 2) scale(.8) translate(12.5 1)">${crestEmblem('ball',col)}</g>`;
  case 'castle':return `<path d="M28 60 V34 H34 V28 H40 V34 H46 V24 H54 V34 H60 V28 H66 V34 H72 V60Z" fill="${W}" ${st}/><path d="M45 60 V50 Q50 44 55 50 V60Z" fill="${col}"/><rect x="34" y="40" width="5" height="7" fill="${col}"/><rect x="61" y="40" width="5" height="7" fill="${col}"/>`;
  case 'crossball':return `<g stroke="${W}" stroke-width="3" stroke-linecap="round"><path d="M28 20 L72 64 M72 20 L28 64" opacity=".9"/></g>`+crestEmblem('ball',col);
  default:return '';}}
function crestSvg(name,short,color,size,design){size=size||64;const obj=design&&typeof design==='object';const d=obj?[design.sh,design.pt,design.em]:CRESTS[(design||0)%CRESTS.length];const [shape,pat,emb]=d;const path=CREST_SHAPES[shape];
  const id='cr'+(++CREST_UID);const dk=shadeHex(color,0.55),W=obj&&design.c2?design.c2:'#fff';const small=size<26;
  if(obj&&design.bg)color=design.bg;
  let bg=`<rect width="100" height="110" fill="${color}"/>`;
  if(pat==='vstripes')bg=`<rect width="100" height="110" fill="${W}"/>`+[14,38,62,86].map(x=>`<rect x="${x-7}" width="14" height="110" fill="${color}"/>`).join('');
  if(pat==='sash')bg+=`<path d="M-10 20 L20 -10 L110 80 L80 110Z" fill="${W}" opacity=".9"/>`;
  if(pat==='split')bg+=`<rect x="50" width="50" height="110" fill="${dk}"/>`;
  if(pat==='chevron')bg+=`<path d="M0 66 L50 40 L100 66 L100 82 L50 56 L0 82Z" fill="${W}"/>`;
  if(pat==='band')bg+=`<rect y="66" width="100" height="22" fill="${dk}"/>`;
  if(pat==='quarter')bg=`<rect width="100" height="110" fill="${color}"/><rect x="50" width="50" height="55" fill="${W}"/><rect y="55" width="50" height="55" fill="${W}"/>`;
  if(pat==='hoops')bg=`<rect width="100" height="110" fill="${color}"/>`+[18,40,62,84].map(y=>`<rect y="${y}" width="100" height="10" fill="${W}" opacity=".85"/>`).join('');
  const txt=esc((short||'').slice(0,4));const yr=obj&&design.yr&&!small?design.yr:'';
  // mały herb (tabele, listy): bez napisu, godło większe i wyśrodkowane
  const em=small?`<g transform="translate(50 52) scale(1.25) translate(-50 -42)">${crestEmblem(emb,color)}</g>`:crestEmblem(emb,color);
  return `<svg viewBox="0 0 100 110" width="${size}" height="${Math.round(size*1.1)}" class="crest"><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs>
  <g clip-path="url(#${id})">${bg}</g><path d="${path}" fill="none" stroke="#fff" stroke-width="${small?6:4}"/>${small?'':`<path d="${path}" fill="none" stroke="${dk}" stroke-width="1.2" transform="translate(50 55) scale(.9) translate(-50 -55)" opacity=".7"/>`}
  ${em}${small?'':`<text x="50" y="${shape==='pennant'?74:84}" text-anchor="middle" font-size="${txt.length>3?16:19}" font-weight="900" fill="#fff" stroke="#000a" stroke-width="3" paint-order="stroke" font-family="Arial Black,Arial,sans-serif">${txt}</text>`}${yr&&shape!=='pennant'?`<text x="50" y="97" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff" opacity=".9" font-family="Arial,sans-serif">${yr}</text>`:''}</svg>`;}
function ocDraft(){const weakest=lgTeams(2).sort((a,b)=>teamStrength(a)-teamStrength(b))[0].idx;
  if(!ui.oc)ui.oc={name:'',short:'',city:'',color:OWN_COLORS[0],star:'A',replace:weakest,crest:0};return ui.oc;}
function autoShort(n){const w=n.trim().split(/\s+/).filter(Boolean);if(!w.length)return '';if(w.length===1)return w[0].slice(0,3).toUpperCase();return w.map(x=>x[0]).join('').slice(0,4).toUpperCase();}
function ownClubView(){const o=ocDraft();const c=ui.pendingCoach;
  const avg=leagueAvg(2);
  return `<div class="card"><div class="row wrap">${coachFace(c,56)}<div><h2 style="margin:0">Załóż nowy klub</h2><div class="mut small">Trener: ${esc(c.first)} ${esc(c.last)}</div></div><span class="sp"></span><button class="ghost" onclick="ui.cc.step=2;render()">← Wróć do listy klubów</button></div>
  ${ui.ocErr?`<div class="tmsg no">${esc(ui.ocErr)}</div>`:''}
  <div class="oc"><div class="ocprev">${crestSvg(o.name,o.short||autoShort(o.name)||'???',o.color,120,o.crest)}<b>${esc(o.name||'Nazwa klubu')}</b><span class="mut small">${esc(o.city||'Miasto')}</span></div>
  <div><div class="row wrap"><label class="lu"><span>Nazwa klubu</span><input id="ocn" value="${esc(o.name)}" maxlength="28" placeholder="np. Iskra Łódź" oninput="ui.oc.name=this.value;if(!ui.oc.shortTouched){ui.oc.short=autoShort(this.value);document.getElementById('ocs').value=ui.oc.short;}"></label>
  <label class="lu"><span>Skrót (3–4 litery)</span><input id="ocs" value="${esc(o.short)}" maxlength="4" style="min-width:90px;width:90px;text-transform:uppercase" oninput="ui.oc.short=this.value.toUpperCase();ui.oc.shortTouched=true"></label>
  <label class="lu"><span>Miasto</span><input id="occ" value="${esc(o.city)}" maxlength="24" oninput="ui.oc.city=this.value"></label></div>
  <h3>Herb klubu</h3><div class="crestgrid">${CRESTS.map((_,i)=>`<button class="crestopt ${o.crest===i?'on':''}" onclick="ui.oc.crest=${i};render()" title="Herb ${i+1}">${crestSvg(o.name,o.short||autoShort(o.name)||'KS',o.color,46,i)}</button>`).join('')}</div>
  <h3>Barwy klubu</h3><div class="swatches">${OWN_COLORS.map(col=>`<button class="sw ${o.color===col?'on':''}" style="background:${col}" onclick="ui.oc.color='${col}';render()" title="${col}"></button>`).join('')}</div>
  <h3>Charakter klubu</h3><div class="opts">${Object.entries(typeof VIS_PROF!=='undefined'?VIS_PROF:{}).map(([k,v])=>`<button class="opt ${(o.prof||'lokal')===k?'on':''}" onclick="ui.oc.prof='${k}';render()"><b>${v[0]}</b><small>${v[1]}</small></button>`).join('')}</div>
  <h3>Pozycja gwiazdy zespołu</h3><div class="opts">${['R','A','P','S','L'].map(p=>`<button class="opt ${o.star===p?'on':''}" onclick="ui.oc.star='${p}';render()"><b>${POS_NAMES[p]}</b></button>`).join('')}</div>
  <h3>Który klub wycofa się z 2. Ligi?</h3><p class="small mut">Nowy klub zaczyna w najniższej lidze (2. Liga). Ma ona 12 miejsc, więc Twój klub zajmie miejsce jednego z obecnych. Awans do 1. Ligi dają dwa miejsca w finale play-off.</p>
  <select onchange="ui.oc.replace=+this.value">${lgTeams(2).sort((a,b)=>teamStrength(a)-teamStrength(b)).map(t=>`<option value="${t.idx}" ${o.replace===t.idx?'selected':''}>${esc(t.name)} (siła ${teamStrength(t)})</option>`).join('')}</select></div></div>
  <div class="card ocinfo"><b>Start od zera — co dostaniesz:</b><ul class="small">
   <li>start w <b>2. Lidze</b> (najniższej)</li>
   <li>13 młodych zawodników (20–21 lat, świeżo po juniorach), ocena ok. ${avg-OC_YOUNG} przy średniej 2. Ligi ${avg}, ale z dużym potencjałem</li>
   <li>⭐ 1 gwiazdę (${POS_NAMES[o.star]}), ocena ok. ${avg+OC_STAR}</li>
   <li>nową drużynę juniorów U20</li>
   <li>wszystkie obiekty na poziomie 1, mały sztab (3 słabych specjalistów)</li>
   <li>budżet od inwestora: ${fmt(OC_BUDGET)}, renoma 15/100</li>
   <li>jesteś założycielem, więc zarząd Cię nie zwolni</li></ul></div>
  <div class="row"><span class="sp"></span><button class="btn" onclick="foundClub()">🏗️ Załóż klub i zacznij grę</button></div></div>`;}
const OC_YOUNG=-1,OC_STAR=12,OC_BUDGET=800000;
function leagueAvg(l){const ps=(l==null?TEAMS:lgTeams(l)).flatMap(t=>t.players);return Math.round(ps.reduce((s,p)=>s+rating(p),0)/ps.length);}
function genTarget(pos,target,age){let best=null;for(let i=0;i<10;i++){const p=genPlayer(pos,target/5-2.5,age);const d=Math.abs(rating(p)-target);if(!best||d<best.d)best={p,d};if(d<=1)break;}return best.p;}
function foundClub(){const o=ocDraft();const c=ui.pendingCoach;
  o.name=(($('#ocn')||{}).value||o.name).trim();o.city=(($('#occ')||{}).value||o.city).trim();o.short=((($('#ocs')||{}).value||o.short||autoShort(o.name)).trim()).toUpperCase();
  if(o.name.length<3){ui.ocErr='Podaj nazwę klubu (min. 3 znaki).';render();return;}
  if(o.short.length<2){ui.ocErr='Skrót klubu: 2–4 litery.';render();return;}
  if(TEAMS.some(t=>t.idx!==o.replace&&t.name.toLowerCase()===o.name.toLowerCase())){ui.ocErr='Taki klub już istnieje.';render();return;}
  ui.ocErr=null;const ti=o.replace;const oldName=TEAMS[ti].name;
  SAVE={team:ti,tactics:{serve:1,dist:0},date:GAME_START};
  initWorld();
  const avg=leagueAvg(2);
  // nowa kadra
  W().players=W().players.filter(p=>p.tm!==ti);
  SAVE.custom={idx:ti,name:o.name,short:o.short,color:o.color,city:o.city||'',replaced:oldName,crest:o.crest||0};applyCustom();
  const plan=['R','R','A','A','P','P','P','P','S','S','S','S','L','L'];const si=plan.indexOf(o.star);plan.splice(si,1);
  const squad=[];
  const star=genTarget(o.star,avg+OC_STAR,26+Math.floor(R()*4));squad.push(star);star.star=true;
  for(const pos of plan){const p=genTarget(pos,avg-OC_YOUNG+Math.round(nz()*3),20+(R()<0.35?1:0));squad.push(p);}
  for(const p of squad){p.tm=ti;p.jr=false;p.inj=0;p.xp={};p.base=snap(p);p.wage=wageDemand(p);
    if(p.star){p.pot=rating(p)+2;p.wage=round5k(p.wage*1.1);p.ce=2;}else{p.pot=Math.min(92,rating(p)+14+Math.round(R()*8));p.ce=3;}
    assignNum(p,ti);W().players.push(p);}
  SAVE.ai[ti].rep=15;SAVE.ai[ti].infra=Object.fromEntries(INFRA.map(f=>[f.k,1]));SAVE.ai[ti].bud=0;
  for(let i=0;i<12;i++)W().players.push(genJunior(ti,16+(i%4),JR_PLAN[i]));
  SAVE.staff={};for(const [r] of STAFF_ROLES)SAVE.staff[r]=null;
  for(const r of ['asy','fiz','jr']){const s=genStaff(r,5+R()*3);s.wage=staffWage(s.skill);SAVE.staff[r]=s;}
  refreshStaffPool();
  SAVE.fin={bal:OC_BUDGET,log:[],sea:{},prev:null};
  SAVE.ownClub=true;syncTeams();
  SAVE.lineup=autoLineup(TEAMS[ti]);SAVE.coach=c;c.joined=GAME_START;c.founder=ti;
  newSeason(1,'off');initBoard(true);
  news(`🏗️ Powstaje nowy klub: ${o.name}${o.city?' ('+o.city+')':''}! Zaczyna w 2. Lidze, zajmując miejsce ${oldName}. Pierwszym trenerem zostaje ${c.first} ${c.last}.`);
  news(`⭐ Gwiazda zespołu: ${star.first} ${star.last} (${POS_NAMES[star.pos]}, ${star.age} l., ocena ${rating(star)}).`);
  ui.cc=null;ui.pendingCoach=null;ui.oc=null;ui.tab='home';syncDate();save();render();}
function foundCard(){return `<button class="teamcard foundcard" onclick="ui.cc.step=3;render()"><b>🏗️ Załóż nowy klub</b><small>Własna nazwa, barwy i herb. Start w 2. Lidze, od zera: infrastruktura na poziomie 1, młodzi zawodnicy z dużym potencjałem i jedna gwiazda. Zawsze dostępny, bez wymagań co do reputacji.</small></button>`;}
