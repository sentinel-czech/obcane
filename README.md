# OBČANÉ Mirošov — web

Statický web sdružení OBČANÉ Mirošov. Má dva režimy: volební web
(volby do zastupitelstva města 9. a 10. října 2026) a běžný web mezi
volbami s aktualitami pro občany.

## Nasazení

Žádné sestavování. Zapněte v repozitáři **Settings → Pages → Source:
Deploy from a branch**, větev `main`, složka `/ (root)`. Web běží.

Doména je `obcane.online`. Řídí ji soubor `CNAME` v kořeni repozitáře —
GitHub podle něj pozná, na jaké adrese se má web tvářit. **Nemažte ho**,
jinak se web vrátí na `sentinel-czech.github.io/obcane/` a doména přestane
fungovat. V DNS u Forpsi na to navazuje:

| Hostname | Typ | Hodnota |
|---|---|---|
| `obcane.online` | A | 185.199.108.153 |
| `obcane.online` | A | 185.199.109.153 |
| `obcane.online` | A | 185.199.110.153 |
| `obcane.online` | A | 185.199.111.153 |
| `www.obcane.online` | CNAME | `sentinel-czech.github.io` |

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
| `skript.js` | režimy, karusel, aktuality a vypsání seznamů z dat |
| `nastaveni.js` | **ručně** — režimy webu, stránkování aktualit, zvolení zastupitelé |
| `aktuality/aktuality.js` | **ručně** — aktuality do sekce „Mirošovským občanům" |
| `aktuality/RRRR-MM-nazev/` | **ručně** — obrázky a PDF k jedné aktualitě |
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

Ručně psané jsou `index.html`, `styl.css`, `skript.js`, `nastaveni.js`,
složka `aktuality/` a tento soubor. `./prelozit.sh web` na ně nesahá.

## Režimy webu

V `nastaveni.js` jsou dva přepínače:

```js
rezimy: { vote: false, common: true }
```

- **`vote`** — volební web: karusel kandidátů, program, vysvědčení,
  kandidátka, materiály ke stažení, výzva k hlasu.
- **`common`** — běžný web: aktuality „Mirošovským občanům", zvolení
  zástupci s počtem hlasů a krátký program.

Je-li zapnutý jen jeden, web ukazuje jen ten a žádné záložky nejsou
vidět. Jsou-li zapnuté oba, objeví se nahoře záložky *Volby 2026*
a *Aktuálně*; volební je první a výchozí. Kontakty jsou společné.

Před dalšími volbami tedy stačí nastavit `vote: true` (a přepsat volební
texty v `index.html` — číslo strany, termín, popisek záložky).

Tamtéž: `AKTUALIT_NA_STRANKU` (stránkování, výchozí 15),
`RADKU_NAHLEDU` (kolik řádků textu je vidět před „více", výchozí 4)
a `zvoleni` — pořadí na kandidátce a počet hlasů; jméno a fotka se
dohledají v `data/kandidati.js`.

## Jak přidat aktualitu

1. Založte složku `aktuality/RRRR-MM-nazev/` a dejte do ní obrázky
   (1 až 5) a případně PDF.
2. V `aktuality/aktuality.js` přidejte **na začátek** seznamu blok:

   ```js
   {
     datum: "2026-11-05",
     nadpis: "Titulek",
     text: "První odstavec.\n\nDruhý odstavec.",
     obrazky: ["aktuality/2026-11-nazev/foto.jpg"],
     pdf: "aktuality/2026-11-nazev/dokument.pdf"
   },
   ```

   `obrazky` i `pdf` jsou nepovinné. První obrázek je miniatura v řádku,
   kliknutím se zvětší. Text je prostý — HTML se vypíše doslova.
3. V `index.html` zvedněte číslo `?v=` u skriptů (a `VERZE`
   v `skript.js`), jinak návštěvníci uvidí starou verzi ještě deset minut.

## Co ještě chybí

Plné znění programu na období 2026–2030. Zatím je na webu jen devět
bodů převzatých z materiálu do časopisu.
