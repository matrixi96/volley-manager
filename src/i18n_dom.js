// ================= TŁUMACZENIE EKRANU NA ANGIELSKI =================
// Gdy język = angielski, każdy tekst wstawiany na ekran przechodzi przez słownik EN_DICT:
// najpierw dokładne dopasowanie całego tekstu, potem podmiana znanych fragmentów (najdłuższe pierwsze,
// tylko na granicach słów). Wyniki są zapamiętywane. Działa też dla podpowiedzi (title, placeholder)
// i napisów rysowanych na canvasie (hala 2D, wykresy).
const I18N={idx:null,memo:new Map(),busy:false,obs:null};
const I18N_W=/[A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźżÀ-ÿ]/;
function i18nIdx(){if(I18N.idx)return I18N.idx;const m=new Map();
  for(const k in EN_DICT){const key=k.slice(0,2);let a=m.get(key);if(!a){a=[];m.set(key,a);}a.push(k);}
  for(const a of m.values())a.sort((x,y)=>y.length-x.length);return I18N.idx=m;}
function i18nUnits(s){return s.replace(/(\d),(\d)/g,'$1.$2').replace(/\bi (\d+) (more|więcej)/g,'and $1 more').replace(/\bza (\d+) (days|dni)/g,'in $1 days').replace(/(\d:\d)\s+z\s+/g,'$1 vs ').replace(/(\d[\dkM.,%]*(?:\s?zł)?)\s+z\s+(\d)/g,'$1 of $2').replace(/(\d+)\s+l\.(?=\s|$|·|,)/g,'$1 y.').replace(/(\d+)\s+lat\b\.?/g,'$1').replace(/(\d)[\s ]tys\.(?=[\s ]|$|\/|\))/g,'$1k').replace(/(\d)[\s ]mln\b/g,'$1M').replace(/(\d)[\s ]mld\b/g,'$1bn');}
function i18nStr(s){if(LANG!=='en'||!s||s.length<2)return s;let r=I18N.memo.get(s);if(r!=null)return r;
  const t=s.trim();let out;
  const ex=EN_DICT[t]!=null?EN_DICT[t]:(typeof EN!=='undefined'&&EN[t]!=null&&!/\{\d\}/.test(t)?EN[t]:null);
  let ex2=ex;if(ex2==null&&t.length>2&&t===t.toUpperCase()&&/[A-ZĄĆĘŁŃÓŚŹŻ]/.test(t)){const parts=t.split(' · ');const tr=parts.map(p=>{const c=p.charAt(0)+p.slice(1).toLowerCase();const v=EN_DICT[c]!=null?EN_DICT[c]:(typeof EN!=='undefined'&&EN[c]!=null?EN[c]:(typeof POS_NAMES!=='undefined'&&Object.keys(POS_NAMES).some(k=>POS_NAMES[k].toUpperCase()===p)?null:null));return v!=null?v.toUpperCase():p;});if(tr.join(' · ')!==t)ex2=tr.join(' · ');}
  if(ex2!=null)out=s.replace(t,ex2);
  if(ex2==null){const idx=i18nIdx();let o='',i=0;const n=s.length;
    while(i<n){const c=s.substr(i,2);const cand=idx.get(c);let hit=null;
      if(cand&&(i===0||!I18N_W.test(s[i-1])||!I18N_W.test(c[0]))){
        for(const k of cand){if(!s.startsWith(k,i))continue;const e=i+k.length;if(e<n&&I18N_W.test(s[e])&&I18N_W.test(k[k.length-1]))continue;hit=k;break;}}
      if(hit){o+=EN_DICT[hit];i+=hit.length;}else{o+=s[i];i++;}}
    out=o;}
  out=i18nUnits(out);
  if(I18N.memo.size>30000)I18N.memo.clear();I18N.memo.set(s,out);I18N.memo.set(out,out);return out;}
const I18N_TH={M:'Pld',Z:'W',P:'L'};// nagłówki tabel: mecze, zwycięstwa, porażki (bez pętli: wyniki nie są kluczami)
const I18N_ATTR=['title','placeholder','aria-label','data-tip'];
function i18nNode(root){if(!root)return;
  if(root.nodeType===3){const p=root.parentNode;if(p&&!/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)){const v=root.nodeValue,r=i18nStr(v);if(r!==v)root.nodeValue=r;}return;}
  if(root.nodeType!==1)return;if(/^(SCRIPT|STYLE|TEXTAREA)$/.test(root.nodeName))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);const list=[];let n;while((n=w.nextNode()))list.push(n);
  for(const x of list){const p=x.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)||p.isContentEditable)continue;const v=x.nodeValue;if(!v)continue;if(v.length<2){if(p.nodeName==='TH'&&I18N_TH[v])x.nodeValue=I18N_TH[v];else if(v==='P'&&p.nodeName==='I'&&p.classList.contains('l'))x.nodeValue='L';continue;}const r=i18nStr(v);if(r!==v)x.nodeValue=r;}
  const els=[root,...root.querySelectorAll('[title],[placeholder],[aria-label],[data-tip],input[type=button],input[type=submit]')];
  for(const e of els){if(!e.getAttribute)continue;for(const a of I18N_ATTR){const v=e.getAttribute(a);if(v){const r=i18nStr(v);if(r!==v)e.setAttribute(a,r);}}
    if(e.nodeName==='INPUT'&&(e.type==='button'||e.type==='submit')&&e.value){const r=i18nStr(e.value);if(r!==e.value)e.value=r;}}}
function i18nStart(){if(LANG!=='en'||I18N.obs||typeof MutationObserver==='undefined')return;
  const run=recs=>{if(I18N.busy)return;I18N.busy=true;try{for(const m of recs){if(m.type==='characterData')i18nNode(m.target);else if(m.type==='attributes')i18nNode(m.target.nodeType===1?m.target:null);else for(const a of m.addedNodes)i18nNode(a);}}catch(e){console.error(e);}finally{I18N.obs.takeRecords();I18N.busy=false;}};
  I18N.obs=new MutationObserver(run);
  I18N.obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTR});
  I18N.busy=true;try{i18nNode(document.body);document.title=i18nStr(document.title);}finally{I18N.obs.takeRecords();I18N.busy=false;}}
EN_DICT['Tłumaczenie na angielski jest w trakcie — część ekranów jest jeszcze po polsku.']='Some less common texts may still appear in Polish.';
// kwoty po angielsku: 1.36M zł, 475k zł
if(LANG==='en')fmt=function(n){n=Math.round(n);const a=Math.abs(n);let s;if(a>=1e6)s=(n/1e6).toFixed(2)+'M';else if(a>=1e3)s=Math.round(n/1e3)+'k';else s=String(n);return s+' zł';};
// napisy na canvasie
if(LANG==='en'&&typeof CanvasRenderingContext2D!=='undefined'){const P=CanvasRenderingContext2D.prototype;
  for(const f of ['fillText','strokeText']){const o=P[f];P[f]=function(t){if(typeof t==='string'&&t.length>1)arguments[0]=i18nStr(t);return o.apply(this,arguments);};}
  // measureText musi mierzyć ten sam (przetłumaczony) tekst
  {const o=P.measureText;P.measureText=function(t){return o.call(this,typeof t==='string'&&t.length>1?i18nStr(t):t);};}}
// okna dialogowe
if(LANG==='en'){for(const f of ['alert','confirm','prompt']){const o=window[f];if(typeof o==='function')window[f]=function(t){if(typeof t==='string')arguments[0]=i18nStr(t);return o.apply(window,arguments);};}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i18nStart);else i18nStart();
