// Golden Set — wersja na komputer (Electron). Gra ładuje się z protokołu app:// (moduły 3D i modele działają tak jak na stronie).
const {app,BrowserWindow,protocol,net,Menu,shell,dialog,session}=require('electron');
// linki zewnętrzne tylko do zaufanych adresów (zgłoszenia błędów i strona gry na GitHubie)
const EXT_OK=u=>{try{const x=new URL(u);return x.protocol==='https:'&&['github.com','matrixi96.github.io'].includes(x.hostname);}catch(e){return false;}};
const path=require('path');const fs=require('fs');const {pathToFileURL}=require('url');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
const ROOT=path.join(__dirname,'www');
const stFile=()=>path.join(app.getPath('userData'),'okno.json');
function loadState(){try{return JSON.parse(fs.readFileSync(stFile(),'utf8'));}catch(e){return {width:1440,height:900};}}
// tylko jedno okno gry naraz (dwa okna mogłyby nadpisywać sobie zapis)
if(!app.requestSingleInstanceLock()){app.quit();}
let win=null;
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(()=>{
  protocol.handle('app',req=>{let p=decodeURIComponent(new URL(req.url).pathname);if(!p||p==='/')p='/index.html';
    const f=path.normalize(path.join(ROOT,p));if(f!==ROOT&&!f.startsWith(ROOT+path.sep))return new Response('',{status:403});return net.fetch(pathToFileURL(f).toString());});
  // gra nie potrzebuje kamery, mikrofonu, lokalizacji, powiadomień itd. — wszystko poza schowkiem i pełnym ekranem jest odrzucane
  const PERM_OK=new Set(['clipboard-sanitized-write','fullscreen']);
  session.defaultSession.setPermissionRequestHandler((wc,perm,cb)=>cb(PERM_OK.has(perm)));
  session.defaultSession.setPermissionCheckHandler((wc,perm)=>PERM_OK.has(perm));
  Menu.setApplicationMenu(null);
  const s=loadState();
  win=new BrowserWindow({width:s.width||1440,height:s.height||900,x:s.x,y:s.y,minWidth:960,minHeight:620,backgroundColor:'#0b1220',title:'Golden Set',
    icon:path.join(ROOT,'icon-512.png'),autoHideMenuBar:true,show:false,webPreferences:{contextIsolation:true,sandbox:true,nodeIntegration:false,webSecurity:true,webviewTag:false,navigateOnDragDrop:false,spellcheck:false}});
  // gra zawsze startuje w trybie pełnoekranowym (F11 przełącza na okno i z powrotem)
  win.maximize();win.setFullScreen(true);
  win.once('ready-to-show',()=>{win.show();setTimeout(checkUpdate,4000);});
  win.setTitle('Golden Set '+app.getVersion());win.on('page-title-updated',e=>e.preventDefault());
  win.loadURL('app://gra/index.html');
  win.on('close',()=>{try{fs.writeFileSync(stFile(),JSON.stringify(Object.assign(win.getNormalBounds(),{max:win.isMaximized(),full:win.isFullScreen()})));}catch(e){}});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type!=='keyDown')return;
    if(i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault();}
    else if((i.control||i.meta)&&(i.key==='='||i.key==='+')){win.webContents.setZoomLevel(win.webContents.getZoomLevel()+0.5);e.preventDefault();}
    else if((i.control||i.meta)&&i.key==='-'){win.webContents.setZoomLevel(win.webContents.getZoomLevel()-0.5);e.preventDefault();}
    else if((i.control||i.meta)&&i.key==='0'){win.webContents.setZoomLevel(0);e.preventDefault();}});
  // linki zewnętrzne otwierają się w zwykłej przeglądarce
  win.webContents.setWindowOpenHandler(({url})=>{if(EXT_OK(url))shell.openExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('app://gra/')){e.preventDefault();if(EXT_OK(url))shell.openExternal(url);}});
  win.webContents.on('will-redirect',(e,url)=>{if(!url.startsWith('app://gra/'))e.preventDefault();});
});
app.on('window-all-closed',()=>app.quit());
// żadnych dodatkowych okien ani osadzonych stron (webview)
app.on('web-contents-created',(e,wc)=>{wc.on('will-attach-webview',ev=>ev.preventDefault());});
// sprawdzenie nowej wersji na GitHubie (Releases → windows-latest)
async function checkUpdate(){try{const r=await net.fetch('https://api.github.com/repos/matrixi96/volley-manager/releases/tags/windows-latest',{headers:{'User-Agent':'VolleyManager'}});if(!r.ok)return;const j=await r.json();
  const m=/wersja\s+([\d.]+)/.exec(j.name||'');if(!m)return;const nv=m[1].split('.').map(Number),cv=app.getVersion().split('.').map(Number);let newer=false;for(let i=0;i<3;i++){if((nv[i]||0)>(cv[i]||0)){newer=true;break;}if((nv[i]||0)<(cv[i]||0))break;}
  if(!newer||!win)return;const a=await dialog.showMessageBox(win,{type:'info',title:'Nowa wersja gry',message:`Jest nowa wersja gry Golden Set: ${m[1]} (masz ${app.getVersion()}).`,detail:'Pobierz instalator i zainstaluj go na obecną wersję — zapis gry zostanie.',buttons:['Pobierz','Później'],defaultId:0,cancelId:1});
  if(a.response===0)shell.openExternal('https://github.com/matrixi96/volley-manager/releases/tag/windows-latest');}catch(e){}}
