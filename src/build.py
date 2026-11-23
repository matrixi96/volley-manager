"""Skleja pliki źródłowe w jeden index.html (wersja PWA w katalogu głównym repo).
Użycie: python src/build.py"""
import pathlib
src = pathlib.Path(__file__).parent
root = src.parent
parts = [(src / f).read_text(encoding='utf-8') for f in ['head.html', 'i18n.js', 'i18n_en.js', 'i18n_dom.js', 'engine.js', 'world.js', 'ui.js', 'season.js', 'manage.js', 'calendar.js', 'club.js', 'faces.js', 'tabs/trener.js', 'ownclub.js', 'matchview.js', 'tabs/mecz.js', 'people.js', 'tabs/poczta.js', 'tabs/transfery.js', 'tabs/finanse.js', 'cup.js', 'euro.js', 'dynamics.js', 'nt.js', 'tabs/staty.js', 'tacfam.js', 'achievements.js', 'tutorial.js', 'tabs/sztab.js', 'vision.js', 'sound.js', 'shell.js', 'uix.js', 'tabs/klub.js', 'fixes.js', 'tabs/trening.js', 'sparx.js', 'tabs/home.js', 'tabs/juniorzy.js', 'fixes2.js', 'mediax.js', 'guide.js', 'tabs/ustawienia.js', 'thermo.js', 'onboard.js', 'promo.js', 'money.js', 'compare.js', 'seasonx.js', 'boot.js']]
html = ''.join(parts) + '\n</script></body></html>\n'
html = html.replace('<title>Volley Manager — prototyp</title>', '''<title>Golden Set: Volleyball Club Manager</title>
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#121a2b">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Golden Set">''', 1)
html = html.replace('</body></html>', '''<script>if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>
</body></html>''', 1)
import re, base64
_ff = base64.b64encode((src / 'flags.woff2').read_bytes()).decode()
_bg = base64.b64encode((src / 'bg.jpg').read_bytes()).decode()
html = html.replace('/*BGIMG*/', "body.th-n{background:linear-gradient(rgba(9,13,19,.50),rgba(9,13,19,.80)),url(data:image/jpeg;base64,"+_bg+") center/cover fixed #0a0e14!important}")
html = html.replace('/*FLAGFONT*/', "@font-face{font-family:'Twemoji Country Flags';src:url(data:font/woff2;base64,"+_ff+") format('woff2');unicode-range:U+1F1E6-1F1FF,U+1F3F4,U+E0062-E0063,U+E0065,U+E0067,U+E006C,U+E006E,U+E0073-E0074,U+E0077,U+E007F;font-display:swap}")
_fc = (src / 'fonts.css').read_text(encoding='utf-8')
_fc = re.sub(r"url\(fonts/([^)]+)\)", lambda m: "url(data:font/woff2;base64,"+base64.b64encode((src / 'fonts' / m.group(1)).read_bytes()).decode()+")", _fc)
html = html.replace('/*FONTS*/', _fc)
_v = re.search(r"volley-manager-v(\d+)", (root / 'sw.js').read_text(encoding='utf-8'))
html = html.replace('__APPV__', _v.group(1) if _v else '0')
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html zbudowany')
