// Volley Manager — wersja na komputer (Electron). Gra ładuje się z protokołu app:// (moduły 3D i modele działają tak jak na stronie).
const {app,BrowserWindow,protocol,net,Menu,shell}=require('electron');
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
    const f=path.normalize(path.join(ROOT,p));if(!f.startsWith(ROOT))return new Response('',{status:403});return net.fetch(pathToFileURL(f).toString());});
  Menu.setApplicationMenu(null);
  const s=loadState();
  win=new BrowserWindow({width:s.width||1440,height:s.height||900,x:s.x,y:s.y,minWidth:960,minHeight:620,backgroundColor:'#0b1220',title:'Volley Manager',
    icon:path.join(ROOT,'icon-512.png'),autoHideMenuBar:true,show:false,webPreferences:{contextIsolation:true,sandbox:true,spellcheck:false}});
  if(s.max)win.maximize();if(s.full)win.setFullScreen(true);
  win.once('ready-to-show',()=>win.show());
  win.loadURL('app://gra/index.html');
  win.on('close',()=>{try{fs.writeFileSync(stFile(),JSON.stringify(Object.assign(win.getNormalBounds(),{max:win.isMaximized(),full:win.isFullScreen()})));}catch(e){}});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type!=='keyDown')return;
    if(i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault();}
    else if(i.key==='Escape'&&win.isFullScreen()){win.setFullScreen(false);}
    else if((i.control||i.meta)&&(i.key==='='||i.key==='+')){win.webContents.setZoomLevel(win.webContents.getZoomLevel()+0.5);e.preventDefault();}
    else if((i.control||i.meta)&&i.key==='-'){win.webContents.setZoomLevel(win.webContents.getZoomLevel()-0.5);e.preventDefault();}
    else if((i.control||i.meta)&&i.key==='0'){win.webContents.setZoomLevel(0);e.preventDefault();}});
  // linki zewnętrzne otwierają się w zwykłej przeglądarce
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/i.test(url))shell.openExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('app://')){e.preventDefault();if(/^https?:/i.test(url))shell.openExternal(url);}});
});
app.on('window-all-closed',()=>app.quit());
