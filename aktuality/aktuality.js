/* =====================================================================
   OBČANÉ Mirošov — aktuality do sekce „Mirošovským občanům"
   (RUČNĚ PSANÝ soubor, ./prelozit.sh web ho nepřepisuje)

   JAK PŘIDAT AKTUALITU
   1. Založte složku  aktuality/RRRR-MM-nazev/  a dejte do ní obrázky
      (1 až 5, JPG nebo PNG) a případně PDF.
   2. Na ZAČÁTEK seznamu níž přidejte nový blok { ... }, — nejnovější
      aktualita je vždy první.
   3. V index.html zvedněte číslo ?v= u skriptů.

   Pole:
     datum    "RRRR-MM-DD" — na webu se vypíše česky
     nadpis   krátký titulek
     text     prostý text; odstavce oddělte prázdným řádkem. Na webu
              jsou vidět první čtyři řádky a zbytek po kliknutí na
              „více". Žádné HTML — vypíše se doslova.
     obrazky  seznam 0–5 cest k obrázkům; první je miniatura v řádku
     pdf      cesta k PDF ke stažení, nebo vynechat
   ===================================================================== */
var AKTUALITY = [

  {
    datum: "2026-10-11",
    nadpis: "Děkujeme!",
    text:
      "Volby jsou za námi. Udrželi jsme tři mandáty a dali jste nám " +
      "2 372 hlasů, víc než před čtyřmi lety. Bereme to jako důvěru " +
      "i jako závazek.\n\n" +
      "Gratulujeme vítězi voleb, sdružení Nezávislí kandidáti Mirošov, " +
      "k zisku osmi mandátů. Věříme, že společně dokážeme posouvat " +
      "Mirošov vpřed.",
    obrazky: ["aktuality/2026-10-podekovani/obcane-podekovani.jpg"],
    pdf: "aktuality/2026-10-podekovani/obcane-podekovani.pdf"
  }

];
