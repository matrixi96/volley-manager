# 🏐 Volley Manager

Manager siatkówki na PC i telefon, działający offline.

**Zagraj:** https://matrixi96.github.io/volley-manager/

## Co jest w grze
- Fikcyjna polska liga, 12 drużyn: 7 sparingów, 22 kolejki (mecz i rewanż), play-off dla czołowej ósemki.
- Mecz liczony akcja po akcji (zagrywka, przyjęcie, rozegranie, atak, blok, obrona) z animacją 2D, komentarzem, czasami i zmianami.
- 17 atrybutów zawodnika: techniczne, fizyczne i mentalne.
- Trening, rozwój i starzenie się zawodników, kontuzje, juniorzy z akademii.
- Transfery, kontrakty, wolni zawodnicy, finanse klubu.
- Statystyki meczów i sezonu, liderzy, ranking drużyn.
- Zapis automatyczny, 3 sloty i kod zapisu do przenoszenia gry między urządzeniami.

## Instalacja jako aplikacja
- **Android (Chrome):** otwórz adres gry → menu ⋮ → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”.
- **iPhone (Safari):** Udostępnij → „Do ekranu początkowego”.
- **PC (Chrome / Edge):** ikona instalacji na końcu paska adresu.

Po pierwszym otwarciu gra działa bez internetu.

## Dla twórcy
Źródła są w katalogu `src/`. Po zmianach zbuduj grę: `python src/build.py` (tworzy `index.html`).
Przy większych aktualizacjach podbij nazwę cache w `sw.js` (`volley-manager-v4` → `v5`), żeby telefony szybciej pobrały nową wersję.
