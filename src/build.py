"""Skleja pliki źródłowe w jeden index.html (wersja PWA w katalogu głównym repo).
Użycie: python src/build.py"""
import pathlib
src = pathlib.Path(__file__).parent
root = src.parent
parts = [(src / f).read_text(encoding='utf-8') for f in ['head.html', 'engine.js', 'ui.js', 'season.js', 'manage.js', 'calendar.js', 'club.js', 'faces.js', 'coach.js', 'ownclub.js', 'matchview.js', 'livepanels.js', 'boot.js']]
html = ''.join(parts) + '\n</script></body></html>\n'
html = html.replace('<title>Volley Manager — prototyp</title>', '''<title>Volley Manager</title>
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#121a2b">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Volley Manager">''', 1)
html = html.replace('</body></html>', '''<script>if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>
</body></html>''', 1)
(root / 'index.html').write_text(html, encoding='utf-8')
print('index.html zbudowany')
