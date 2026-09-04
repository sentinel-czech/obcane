// Generováno z kandidati.tex — needitovat ručně.
// Přegeneruje:  ./prelozit.sh web
const KANDIDATI = [
  {
    "poradi": 1,
    "fotka": "kandidat_01.jpg",
    "jmeno": "Tomáš Šmíd",
    "povolani": "Podnikatel ve stavebnictví",
    "vek": "35"
  },
  {
    "poradi": 2,
    "fotka": "kandidat_02.jpg",
    "jmeno": "Vladimír Vaindl",
    "povolani": "Zámečník",
    "vek": "53"
  },
  {
    "poradi": 3,
    "fotka": "kandidat_03.jpg",
    "jmeno": "Václav Šmatlák",
    "povolani": "Technolog automatizace",
    "vek": "38"
  },
  {
    "poradi": 4,
    "fotka": "kandidat_04.jpg",
    "jmeno": "Petr Čejka",
    "povolani": "Vedoucí údržby",
    "vek": "33"
  },
  {
    "poradi": 5,
    "fotka": "kandidat_05.jpg",
    "jmeno": "Petr Pidrman",
    "povolani": "Dispečer",
    "vek": "37"
  },
  {
    "poradi": 6,
    "fotka": "kandidat_06.jpg",
    "jmeno": "Lukáš Mošna",
    "povolani": "Řidič",
    "vek": "37"
  },
  {
    "poradi": 7,
    "fotka": "kandidat_07.jpg",
    "jmeno": "Ing. Michaela Majerová",
    "povolani": "Účetní",
    "vek": "32"
  },
  {
    "poradi": 8,
    "fotka": "kandidat_08.jpg",
    "jmeno": "Jiří Rybák",
    "povolani": "Řidič",
    "vek": "26"
  },
  {
    "poradi": 9,
    "fotka": "kandidat_09.jpg",
    "jmeno": "Bc. Jakub Maxa",
    "povolani": "Projektový manažer",
    "vek": "30"
  },
  {
    "poradi": 10,
    "fotka": "kandidat_10.jpg",
    "jmeno": "Michaela Bůchová",
    "povolani": "Manažerka kvality",
    "vek": "37"
  },
  {
    "poradi": 11,
    "fotka": "kandidat_11.jpg",
    "jmeno": "Bc. Dana Šnebergerová",
    "povolani": "Vrchní sestra",
    "vek": "64"
  },
  {
    "poradi": 12,
    "fotka": "kandidat_12.jpg",
    "jmeno": "Jaroslav Strnad",
    "povolani": "Cestář",
    "vek": "61"
  },
  {
    "poradi": 13,
    "fotka": "kandidat_13.jpg",
    "jmeno": "Ing. Václav Tůma",
    "povolani": "Softwarový architekt",
    "vek": "43"
  },
  {
    "poradi": 14,
    "fotka": "kandidat_14.jpg",
    "jmeno": "Veronika Lukešová",
    "povolani": "Učitelka MŠ",
    "vek": "35"
  },
  {
    "poradi": 15,
    "fotka": "kandidat_15.jpg",
    "jmeno": "Petr Pařízek",
    "povolani": "Student",
    "vek": "20"
  }
];

const MATERIALY = [
  {
    "soubor": "soubory/obcane-a2.pdf",
    "nahled": "obrazky/obcane-a2.jpg",
    "nazev": "Volební plakát",
    "popis": "Všech patnáct kandidátů, formát A2 (420 × 594 mm). Tentýž plakát je i ve zmenšeninách A3 a A4.",
    "velikost": "6.9 MB"
  },
  {
    "soubor": "soubory/obcane-profese-a2.pdf",
    "nahled": "obrazky/obcane-profese-a2.jpg",
    "nazev": "Kdo jsme",
    "popis": "Z jakých oborů kandidáti jsou a jak je tým starý. Doplňkový plakát A2.",
    "velikost": "30 kB"
  },
  {
    "soubor": "soubory/obcane-casopis.pdf",
    "nahled": "obrazky/obcane-casopis.jpg",
    "nazev": "Vysvědčení za volební období",
    "popis": "Jak jsme za čtyři roky plnili programové body a co chceme dál. Materiál 180 × 250 mm.",
    "velikost": "32 kB"
  }
];

const HODNOCENI = [
  {
    "nazev": "Rozvoj dopravní infrastruktury",
    "procento": 100,
    "popis": "Dokončen chodník v ul. Dobřívská, chodník v ul. Skořická čeká na příjem dotace, zpracovaný projekt na náměstí s chodníkem až na konec zástavby v ul. Uxova, projekt na odvodnění a komunikaci mezi spodní a horní částí Mytě, plán na rozšíření bezbariérových tras"
  },
  {
    "nazev": "Efektivní odpadové hospodářství",
    "procento": 80,
    "popis": "Třídění odpadu ve městě se povedlo výrazně navýšit. Plán svozu plastu od domu bohužel navyšovala finanční náročnost a muselo by dojít ke zdražení ceny za odpad. Kompromisem je posílením míst v kratší docházkové vzdálenosti od domu."
  },
  {
    "nazev": "Snížení energetické náročnosti městských budov",
    "procento": 100,
    "popis": "Budova zdravotního střediska dokončena a v přípravě jsou další stavby."
  },
  {
    "nazev": "Údržba zeleně",
    "procento": 80,
    "popis": "Máme vypracovaný projekt areálu v okolí sokolovny a plány pro výsadbu."
  },
  {
    "nazev": "Rozvoj městských bytů",
    "procento": 50,
    "popis": "Projekt pro bydlení je v běhu, realizaci zatím přibrzdili jiné stavby, které podléhaly dotaci. Město nakoupilo pozemky pro stavbu domů, které se nyní budou připojovat na veřejné sítě a následně proběhne prodej."
  },
  {
    "nazev": "Budování volnočasových aktivit",
    "procento": 100,
    "popis": "Projekt areálu kolem sokolovny je komplexní — herní prvky, lavičky a místa pro relaxaci. V Myti je vybudované dětské hřiště za podpory dotace. Zpřístupnili jsme dva rybníky pro sportovní rybolov a vyčistili okolí kolem Kapličky."
  },
  {
    "nazev": "Kulturní akce pro všechny věkové kategorie",
    "procento": 100,
    "popis": "Největší akcí jsou Prokopské slavnosti, které Vás baví celé čtyři roky, následuje série přednášek pro dospělé a starší, pro děti prázdninové hry a promítání, podpora spolků pro další aktivit pro děti."
  }
];

const PROGRAM = [
  "Realizace připravených projektů komunikací a chodníků",
  "Podpora modernizace školství",
  "Realizace parku u Sokolovny — zeleň, herní prvky, odpočinková místa",
  "Rozšířit nabídku kulturních a zážitkových akcí včetně pokračování Prokopských slavností",
  "Obnova veřejného osvětlení a budování nového",
  "Podpora spolků",
  "Obnova a realizace vodovodů s kanalizací",
  "Příprava městských pozemků pro bydlení a prodej",
  "Aktualizovat územní plán města"
];
