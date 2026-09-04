# OBČANÉ Mirošov — web

Statický web volební strany OBČANÉ pro volby do zastupitelstva města
Mirošov 9. a 10. října 2026.

## Nasazení

Žádné sestavování. Zapněte v repozitáři **Settings → Pages → Source:
Deploy from a branch**, větev `main`, složka `/ (root)`. Web běží.

Soubor `.nojekyll` je tam schválně — bez něj by GitHub Pages hnal
stránku přes Jekyll a ignoroval adresáře začínající podtržítkem.

## Čím to je

Ručně psané HTML, CSS a kousek JavaScriptu. Bez frameworku, bez
sestavování, bez databáze a bez cizího CDN — písmo Ubuntu je přibalené,
takže web funguje i bez připojení k dalším serverům. Otevřít se dá
i dvojklikem z disku.

| Soubor | K čemu |
|---|---|
| `index.html` | struktura stránky |
| `styl.css` | vzhled — bílý podklad, jediný akcent je červená `#D40000` |
| `skript.js` | karusel a vypsání seznamů z dat |
| `data/kandidati.js` | **generovaný** — kandidáti, materiály, hodnocení, program |
| `obrazky/`, `soubory/`, `pisma/` | **generované** — fotky, náhledy, PDF, písmo |

## Obsah se needituje tady

`data/kandidati.js` ani nic v `obrazky/`, `soubory/` a `pisma/`
neupravujte ručně — přepíše se to. Zdrojem je sazba plakátů
v nadřazeném projektu:

- kandidáti — `kandidati.tex`
- hodnocení 2022–2026 a program 2026–2030 — `obcane-casopis.tex`
- fotky — `fotky/`
- PDF ke stažení — `obcane-a2.pdf`, `obcane-profese-a2.pdf`, `obcane-casopis.pdf`

Po změně kterékoli z nich se web přegeneruje z kořene projektu:

```bash
./prelozit.sh web
```

Ručně psané jsou jen `index.html`, `styl.css`, `skript.js` a tento soubor.

## Co ještě chybí

Plné znění programu na období 2026–2030. Zatím je na webu jen devět
bodů převzatých z materiálu do časopisu.
