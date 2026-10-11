/* =====================================================================
   OBČANÉ Mirošov — nastavení webu (RUČNĚ PSANÝ soubor)

   ./prelozit.sh web tenhle soubor nepřepisuje. Mění se tady:
     - které režimy webu jsou zapnuté,
     - kolik aktualit je na jedné stránce,
     - kdo byl zvolen a s kolika hlasy.

   Po změně zvedněte ?v= u skriptů v index.html, jinak prohlížeče
   návštěvníků ještě deset minut drží starou verzi.
   ===================================================================== */
var NASTAVENI = {

  /*  Režimy webu. Každý jde zapnout a vypnout zvlášť:
        vote   — volební web (karusel kandidátů, program, vysvědčení,
                 kandidátka, materiály). Před volbami true.
        common — běžný web mezi volbami (aktuality pro občany, zvolení
                 zástupci, krátký program).
      Jsou-li zapnuté oba, ukážou se nahoře záložky a vote je první.
      Je-li zapnutý jen jeden, záložky se nezobrazí vůbec.             */
  rezimy: {
    vote: false,
    common: true
  },

  /*  Aktuality v sekci „Mirošovským občanům".                         */
  AKTUALIT_NA_STRANKU: 15,   // po kolika položkách se stránkuje
  RADKU_NAHLEDU: 4,          // kolik řádků textu je vidět před „více"

  /*  Zvolení zastupitelé. `poradi` je pořadí na kandidátce — jméno
      a fotka se dohledají v data/kandidati.js, tady se neopisují.
      Hlasy: oficiální výsledky ČSÚ, volby do zastupitelstva města
      Mirošov 9.–10. 10. 2026 (volby.cz).                              */
  zvoleni: [
    { poradi: 1, hlasy: 263 },
    { poradi: 2, hlasy: 220 },
    { poradi: 3, hlasy: 200 }
  ]
};
