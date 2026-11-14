# 🏐 Volley Manager

Manager siatkówki na PC i telefon, działający offline.

**Zagraj:** https://matrixi96.github.io/volley-manager/

**Android (APK):** https://github.com/matrixi96/volley-manager/releases/tag/android-latest — pobierz `VolleyManager.apk` na telefonie i zainstaluj. Plik buduje się automatycznie (GitHub Actions, Capacitor) po każdej zmianie gry; nowa wersja instaluje się na starą i zapis zostaje. Klucz w `android/debug.keystore` służy tylko do podpisywania tej prywatnej wersji (nie do Sklepu Play).

## Co jest w grze
- Kreator trenera (imię, wiek, doświadczenie, umiejętności i cechy mentalne), reputacja, cele zarządu, zwolnienia i oferty pracy.
- Losowe twarze zawodników, juniorów i sztabu.
- Własny klub od zera: nazwa, barwy, jeden z 20 herbów; młoda kadra z potencjałem, jedna gwiazda, infrastruktura na poziomie 1.
- Prawdziwy kalendarz: daty i godziny meczów, sezony 2026/27 i kolejne, urodziny zawodników, kontrakty do 30 czerwca, pensje co miesiąc.
- Fikcyjna polska liga, 12 drużyn: 7 sparingów, 22 kolejki (mecz i rewanż), play-off dla czołowej ósemki.
- Mecz liczony akcja po akcji (zagrywka, przyjęcie, rozegranie, atak, blok, obrona) w widoku hali (trybuny wg poziomu hali i frekwencji, ruch zawodników, piłka z cieniem), z komentarzem, czasami (przemowy do zespołu) i zmianami; panele zawodników obu drużyn z kondycją, morale i statystykami na żywo.
- 17 atrybutów zawodnika: techniczne, fizyczne i mentalne.
- Trening: plan tygodnia z 3 jednostkami dziennie (zagrywka, przyjęcie, atak, blok, obrona, rozegranie, taktyka, siłownia, integracja, regeneracja, wolne) układany samodzielnie albo przez asystenta (im lepszy, tym lepszy plan); świeżość zawodników, urazy na treningu.
- Forma zawodników liczona z meczów, treningów i charakteru; rozwój i starzenie się zawodników, kontuzje.
- Taktyka ataku (mocny atak / kiwki, kierunek: skos, prosta, za blok, atak po bloku), raporty z treningów (dzień, tydzień, miesiąc), punkty po bloku, błąd ataku sprzed linii 3 m, dotknięcie siatki w bloku, okrzyki trenera w trakcie gry.
- Sztab szkoleniowy (7 ról), drużyna juniorów U20 z własną ligą, infrastruktura klubu (6 obiektów, poziomy 1–5, budowa w czasie).
- Poczta z kategoriami i etykietami: raporty meczowe, treningowe (dzienne, tygodniowe, miesięczne), skautingowe, medyczne, finansowe, sponsorskie i oferty.
- Skauting: wiedza o zawodnikach (zakresy ocen i potencjału), zadania skautów (obserwacja, przegląd rynku), raport o następnym rywalu ze skautem i analitykiem z zaleceniami do taktyki.
- Sponsorzy (tytularny, główny, techniczny, średni, mali), oferty co miesiąc, umowy 1–12 miesięcy; siedziba klubu decyduje o liczbie miejsc dla sponsorów i wielkości sztabu.
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
Przy większych aktualizacjach podbij nazwę cache w `sw.js` (np. `volley-manager-v46` → `v47`), żeby telefony szybciej pobrały nową wersję.
