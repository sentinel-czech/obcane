/* =====================================================================
   OBČANÉ Mirošov — chování webu

   Bez frameworku a bez sestavování. Data přicházejí z data/kandidati.js,
   které generuje nastroje/web-podklady.py z kandidati.tex
   a obcane-casopis.tex — proto se tady nic z toho neopisuje.

   Data se načítají <script>em, ne fetchem: fetch by na file:// spadl
   na CORS a stránka by nešla otevřít lokálním dvojklikem.
   ===================================================================== */
(function () {
  "use strict";

  var jenText = function (s) { return String(s == null ? "" : s); };

  /* prvek s textem — bez innerHTML, ať se do stránky nedá propašovat
     značkování z dat */
  function prvek(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) { e.className = trida; }
    if (text !== undefined) { e.textContent = jenText(text); }
    return e;
  }

  /* ------------------------------------------------------- MATERIÁLY -- */
  function vypisMaterialy() {
    var pas = document.getElementById("karusel-pas");
    var tecky = document.getElementById("karusel-tecky");
    if (!pas || typeof MATERIALY === "undefined") { return; }

    MATERIALY.forEach(function (m, i) {
      var li = prvek("li", "snimek");
      li.setAttribute("role", "tabpanel");
      li.setAttribute("aria-label", (i + 1) + " z " + MATERIALY.length + ": " + m.nazev);

      var img = prvek("img", "snimek-nahled");
      img.src = m.nahled;
      img.alt = "Náhled: " + m.nazev;
      img.loading = i === 0 ? "eager" : "lazy";
      li.appendChild(img);

      var text = prvek("div", "snimek-text");
      text.appendChild(prvek("h3", null, m.nazev));
      text.appendChild(prvek("p", null, m.popis));

      var a = prvek("a", "stahnout");
      a.href = m.soubor;
      a.setAttribute("download", "");
      a.appendChild(document.createTextNode("Stáhnout PDF "));
      a.appendChild(prvek("span", "velikost", "(" + m.velikost + ")"));
      text.appendChild(a);

      li.appendChild(text);
      pas.appendChild(li);

      var b = prvek("button", "tecka");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", m.nazev);
      b.addEventListener("click", function () { jdiNa(i); });
      tecky.appendChild(b);
    });
  }

  /* ---------------------------------------------------------- KARUSEL - */
  var kde = 0;

  function pocet() {
    var pas = document.getElementById("karusel-pas");
    return pas ? pas.children.length : 0;
  }

  function jdiNa(i) {
    var n = pocet();
    if (!n) { return; }
    kde = Math.max(0, Math.min(i, n - 1));

    var pas = document.getElementById("karusel-pas");
    pas.style.transform = "translateX(" + (-kde * 100) + "%)";

    var tecky = document.getElementById("karusel-tecky").children;
    for (var j = 0; j < tecky.length; j++) {
      tecky[j].setAttribute("aria-selected", j === kde ? "true" : "false");
    }
    /* Snímky mimo obraz se schovají před čtečkou i před tabulátorem,
       jinak by se tabem dalo odejít na neviditelné tlačítko. */
    for (var k = 0; k < pas.children.length; k++) {
      var mimo = k !== kde;
      pas.children[k].setAttribute("aria-hidden", mimo ? "true" : "false");
      var odkaz = pas.children[k].querySelector("a");
      if (odkaz) { odkaz.tabIndex = mimo ? -1 : 0; }
    }
    document.querySelector(".karusel-vlevo").disabled = kde === 0;
    document.querySelector(".karusel-vpravo").disabled = kde === n - 1;
  }

  function karusel() {
    var box = document.getElementById("karusel");
    if (!box || !pocet()) { return; }

    document.querySelector(".karusel-vlevo")
      .addEventListener("click", function () { jdiNa(kde - 1); });
    document.querySelector(".karusel-vpravo")
      .addEventListener("click", function () { jdiNa(kde + 1); });

    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { jdiNa(kde - 1); }
      if (e.key === "ArrowRight") { jdiNa(kde + 1); }
    });

    /* tažení prstem */
    var x0 = null;
    box.addEventListener("touchstart", function (e) {
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) { return; }
      var d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 45) { jdiNa(kde + (d < 0 ? 1 : -1)); }
      x0 = null;
    }, { passive: true });

    jdiNa(0);
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
      img.src = "obrazky/kandidati/" + k.fotka;
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
    vypisMaterialy();
    karusel();
    vypisHodnoceni();
    vypisProgram();
    vypisKandidatku();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
