/* =====================================================================
   OBČANÉ Mirošov — chování webu

   Bez frameworku a bez sestavování. Data přicházejí z data/kandidati.js,
   které generuje nastroje/web-podklady.py z kandidati.tex, hodnoceni.tex
   a program.tex — proto se tady nic z toho neopisuje.

   Data se načítají <script>em, ne fetchem: fetch by na file:// spadl
   na CORS a stránka by nešla otevřít lokálním dvojklikem.
   ===================================================================== */
(function () {
  "use strict";

  var POSUN_MS = 3000;   // jak dlouho stojí snímek karuselu

  /* prvek s textem — bez innerHTML, ať se do stránky nedá propašovat
     značkování z dat */
  function prvek(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) { e.className = trida; }
    if (text !== undefined) { e.textContent = String(text == null ? "" : text); }
    return e;
  }

  /* ==================================================== KARUSEL ======== */
  /*  Obecný karusel: dostane id prvků a pole snímků. Dřív byl napsaný
      napevno pro materiály ke stažení; teď v něm jezdí kandidáti
      a materiály jsou obyčejné dlaždice.                                */
  function Karusel(idBoxu, idPasu, idTecek, polozky, vyrobSnimek, popisek) {
    var box = document.getElementById(idBoxu);
    var pas = document.getElementById(idPasu);
    var tecky = document.getElementById(idTecek);
    if (!box || !pas || !polozky || !polozky.length) { return null; }

    var kde = 0;
    var timer = null;
    var klid = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    polozky.forEach(function (p, i) {
      var li = prvek("li", "snimek");
      li.setAttribute("role", "tabpanel");
      li.setAttribute("aria-label",
        (i + 1) + " z " + polozky.length + ": " + popisek(p));
      vyrobSnimek(li, p, i);
      pas.appendChild(li);

      var b = prvek("button", "tecka");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", popisek(p));
      b.addEventListener("click", function () { jdiNa(i); stop(); });
      tecky.appendChild(b);
    });

    function jdiNa(i) {
      var n = polozky.length;
      /* dokola: za posledním se pokračuje prvním */
      kde = ((i % n) + n) % n;
      pas.style.transform = "translateX(" + (-kde * 100) + "%)";

      for (var j = 0; j < tecky.children.length; j++) {
        tecky.children[j].setAttribute("aria-selected", j === kde ? "true" : "false");
      }
      /* Snímky mimo obraz se schovají před čtečkou i před tabulátorem,
         jinak by se tabem dalo odejít na neviditelný prvek. */
      for (var k = 0; k < pas.children.length; k++) {
        var mimo = k !== kde;
        pas.children[k].setAttribute("aria-hidden", mimo ? "true" : "false");
        var ohnisko = pas.children[k].querySelectorAll("a, button");
        for (var m = 0; m < ohnisko.length; m++) {
          ohnisko[m].tabIndex = mimo ? -1 : 0;
        }
      }
    }

    function start() {
      if (klid || timer || polozky.length < 2) { return; }
      timer = window.setInterval(function () { jdiNa(kde + 1); }, POSUN_MS);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    box.querySelector(".karusel-vlevo")
       .addEventListener("click", function () { jdiNa(kde - 1); stop(); });
    box.querySelector(".karusel-vpravo")
       .addEventListener("click", function () { jdiNa(kde + 1); stop(); });

    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { jdiNa(kde - 1); stop(); }
      if (e.key === "ArrowRight") { jdiNa(kde + 1); stop(); }
    });

    /* Samočinný posun se zastaví, jakmile s karuselem někdo pracuje —
       ať pod rukama neuteče snímek, který si člověk zrovna čte. */
    box.addEventListener("mouseenter", stop);
    box.addEventListener("focusin", stop);
    box.addEventListener("mouseleave", start);
    /* Na skrytém panelu nemá cenu přepínat. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    var x0 = null;
    box.addEventListener("touchstart", function (e) {
      stop();
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) { return; }
      var d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 45) { jdiNa(kde + (d < 0 ? 1 : -1)); }
      x0 = null;
    }, { passive: true });

    jdiNa(0);
    start();
    return { jdiNa: jdiNa };
  }

  /* ------------------------------------------------- KOTVY V MENU ----- */
  /*  První kliknutí do menu občas „propadlo": stránka se ještě dosazuje
      (doléhají obrázky, doběhne vykreslení seznamů) a cílová sekce se
      pod odkazem posune. Prohlížeč skočí na polohu platnou v okamžiku
      kliknutí a skončí jinde. Změřeno přes DevTools protokol: na
      mobilních datech byla odchylka -1416 px ještě půl sekundy po
      načtení; po sekundě už je nula.

      Řešíme to tím, že scroll řídíme sami a dokud se sazba usazuje,
      polohu cíle přepočítáváme. Jakmile ale člověk sám zaroluje,
      přestaneme — jinak bychom mu stránku pod rukama trhali.           */
  /*  Jen jedna korekce naráz. Dvě rychlá kliknutí po sobě by jinak
      spustila dvě hlídací smyčky, každou na jiný cíl, a přetahovaly by
      se o polohu stránky.                                              */
  var zrusPredchozi = null;

  function najedNa(cil) {
    if (zrusPredchozi) { zrusPredchozi(); }
    var klid = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var chovani = klid ? "auto" : "smooth";

    var kde = function () {
      return Math.round(cil.getBoundingClientRect().top + window.pageYOffset);
    };
    var cilPx = kde();
    window.scrollTo({ top: cilPx, behavior: chovani });
    if (window.history && history.replaceState) {
      history.replaceState(null, "", "#" + cil.id);
    }

    /*  Jak dlouho hlídat: dokud se stránka načítá, plus chvíli po tom.
        Pevných pár vteřin nestačí — na pomalé lince (měřeno 25 kB/s)
        se obrázky dolévaly ještě po třech vteřinách a cíl se pod námi
        pořád posouval. Strop je pojistka, aby to neběželo donekonečna. */
    var konec = Date.now() + 12000;
    if (document.readyState !== "complete") {
      window.addEventListener("load", function () {
        konec = Math.min(konec, Date.now() + 1200);
      });
    } else {
      konec = Date.now() + 1200;
    }

    var timer = window.setInterval(function () {
      var nove = kde();
      if (Math.abs(nove - cilPx) > 2) {
        cilPx = nove;
        window.scrollTo({ top: cilPx, behavior: chovani });
      }
      if (Date.now() > konec) { prestat(); }
    }, 120);

    function prestat() {
      window.clearInterval(timer);
      window.removeEventListener("wheel", prestat);
      window.removeEventListener("touchstart", prestat);
      window.removeEventListener("keydown", prestat);
      if (zrusPredchozi === prestat) { zrusPredchozi = null; }
    }
    zrusPredchozi = prestat;
    window.addEventListener("wheel", prestat, { passive: true });
    window.addEventListener("touchstart", prestat, { passive: true });
    window.addEventListener("keydown", prestat);
  }

  function kotvy() {
    var odkazy = document.querySelectorAll('a[href^="#"]');
    Array.prototype.forEach.call(odkazy, function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!id) { return; }
      a.addEventListener("click", function (e) {
        var cil = document.getElementById(id);
        if (!cil) { return; }
        e.preventDefault();
        najedNa(cil);
      });
    });
    /*  Totéž platí pro adresu s kotvou zvenčí (obcane.online/#program) —
        prohlížeč skočí dřív, než je co měřit.                          */
    if (location.hash.length > 1) {
      var cil = document.getElementById(location.hash.slice(1));
      if (cil) { najedNa(cil); }
    }
  }

  /* -------------------------------------------------- HERO: KANDIDÁTI - */
  function snimekKandidata(li, k) {
    /*  Obal je zatím <div>. Až budou profily, stačí z něj udělat <a> —
        struktura i vzhled zůstanou.                                     */
    var obal = prvek("div", "snimek-osoba");

    var ramFoto = prvek("div", "osoba-foto");
    var img = document.createElement("img");
    img.src = k.portret || k.ctverec;
    img.alt = k.jmeno;
    img.width = 500;
    img.height = k.portret ? 625 : 500;
    ramFoto.appendChild(img);
    ramFoto.appendChild(prvek("span", "osoba-poradi", k.poradi));
    obal.appendChild(ramFoto);

    var text = prvek("div", "osoba-text");
    text.appendChild(prvek("p", "osoba-jmeno", k.jmeno));
    text.appendChild(prvek("p", "osoba-povolani", k.povolani + ", " + k.vek + " let"));
    text.appendChild(prvek("div", "osoba-linka"));
    text.appendChild(prvek("p", "osoba-poradi-text", k.poradi + ". na kandidátce"));
    obal.appendChild(text);

    li.appendChild(obal);
  }

  /* ------------------------------------------------------- MATERIÁLY -- */
  function vypisMaterialy() {
    var seznam = document.getElementById("materialy-seznam");
    if (!seznam || typeof MATERIALY === "undefined") { return; }

    MATERIALY.forEach(function (m) {
      var li = prvek("li", "material");

      var a = document.createElement("a");
      a.className = "material-odkaz";
      a.href = m.soubor;
      a.setAttribute("download", "");

      var img = document.createElement("img");
      img.src = m.nahled;
      img.alt = "Náhled: " + m.nazev;
      img.loading = "lazy";
      /*  Rozměry i tady: bez nich prohlížeč místo pro obrázek nerezervuje
          a stránka se při doléhání náhledů prodlužuje.                  */
      img.width = 900;
      img.height = 1200;
      a.appendChild(img);

      var telo = prvek("div", "material-telo");
      telo.appendChild(prvek("h3", null, m.nazev));
      telo.appendChild(prvek("p", null, m.popis));
      telo.appendChild(prvek("span", "material-stahnout",
                             "Stáhnout PDF (" + m.velikost + ")"));
      a.appendChild(telo);

      li.appendChild(a);
      seznam.appendChild(li);
    });
  }

  /* ------------------------------------------------------- HODNOCENÍ -- */
  function vypisHodnoceni() {
    var seznam = document.getElementById("hodnoceni-seznam");
    if (!seznam || typeof HODNOCENI === "undefined") { return; }

    HODNOCENI.forEach(function (b) {
      var li = document.createElement("li");
      li.appendChild(prvek("h3", null, b.nazev));
      li.appendChild(prvek("span", "procento", "splněno z " + b.procento + " %"));
      if (b.popis) { li.appendChild(prvek("p", "popis", b.popis)); }
      seznam.appendChild(li);
    });
  }

  /* --------------------------------------------------------- PROGRAM -- */
  function vypisProgram() {
    var seznam = document.getElementById("program-seznam");
    if (!seznam || typeof PROGRAM === "undefined") { return; }
    PROGRAM.forEach(function (bod) {
      seznam.appendChild(prvek("li", null, bod));
    });
  }

  /* ------------------------------------------------------ KANDIDÁTKA -- */
  function vypisKandidatku() {
    var seznam = document.getElementById("kandidatka-seznam");
    if (!seznam || typeof KANDIDATI === "undefined") { return; }

    KANDIDATI.forEach(function (k) {
      var li = prvek("li", "kandidat");
      var fig = document.createElement("figure");

      var obal = prvek("div", "kandidat-foto");
      var img = document.createElement("img");
      img.src = k.ctverec || ("obrazky/kandidati/" + k.fotka);
      img.alt = k.jmeno;
      img.loading = "lazy";
      img.width = 600;
      img.height = 600;
      obal.appendChild(img);
      obal.appendChild(prvek("span", "kandidat-poradi", k.poradi));
      fig.appendChild(obal);

      var popis = document.createElement("figcaption");
      popis.appendChild(prvek("span", "jmeno", k.jmeno));
      popis.appendChild(prvek("span", "povolani", k.povolani + ", " + k.vek + " let"));
      fig.appendChild(popis);

      li.appendChild(fig);
      seznam.appendChild(li);
    });
  }

  function start() {
    kotvy();
    if (typeof KANDIDATI !== "undefined") {
      Karusel("karusel", "karusel-pas", "karusel-tecky", KANDIDATI,
              snimekKandidata, function (k) { return k.jmeno; });
    }
    vypisProgram();
    vypisHodnoceni();
    vypisKandidatku();
    vypisMaterialy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
