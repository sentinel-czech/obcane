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

  /*  Vypínač pro ladění: false = žádný karusel. Vykreslí se jen první
      kandidát staticky, žádný časovač, žádné posluchače, šipky a tečky
      se schovají. Slouží k důkazu, že karusel ne/může za chování
      scrollování.                                                      */
  var KARUSEL_ZAPNUTY = true;
  var VERZE = 13;

  /*  Nastavení přichází z nastaveni.js. Kdyby soubor chyběl, web se
      zachová jako dřív — čistě volební.                                 */
  var CFG = (typeof NASTAVENI !== "undefined" && NASTAVENI) || {};
  var TITUL = {
    vote: "OBČANÉ Mirošov — volební strana číslo 1",
    common: "OBČANÉ Mirošov"
  };

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
  /*  Jeden okamžitý skok, nic víc. Důvody, proč NE plynulá animace ani
      holé hash odkazy:
        1. Animovaný scroll je přerušitelný — setrvačný dojezd touchpadu
           nebo kolečka ho zruší v půlce a stránka trčí („cukne a stojí").
        2. Firefox neudělá nic při kliku na kotvu, která už je v adrese
           (druhý klik na tutéž položku menu).
      scrollIntoView bez behavior je okamžitý a atomický — mezi kliknutím
      a doskočením není okno, ve kterém by šel přerušit. replaceState
      udrží adresu, aniž by spustil vlastní hash navigaci. Tohle NENÍ
      dřívější korekční smyčka (ta opakovaně volala scrollTo) — jediné
      volání na jedno kliknutí.                                         */
  /*  Setrvačný dojezd kolečka/touchpadu: hardware posílá scrollovací
      události ještě stovky milisekund po tom, co uživatel přestal.
      Kdo klikne na menu těsně po scrollování (typicky: odroluje zpět
      nahoru a hned kliká), skočí správně — a dojezd ho vzápětí odveze
      z cílové pozice pryč. Vypadá to pak, že klik „nescrolloval" nebo
      skočil jinam. Proto se po kliku na kotvu wheel události na 500 ms
      spolknou. Úmyslné scrollování do půl sekundy po kliknutí nezačne,
      takže o nic nepřijde; dotyk a klávesy se nepotlačují vůbec.       */
  function spolkniDojezd() {
    /*  Setrvačný dojezd před klikem do menu jde vždy NAHORU — k menu se
        scrolluje nahoru. Štít proto žere jen události nahoru (deltaY<0);
        scrollovat dolů a číst jde hned po doskoku. První pohyb dolů
        štít okamžitě ukončí: znamená, že se kolečka znovu dotkl člověk,
        dojezd je fyzicky u konce. Jinak se zvedá 250 ms po poslední
        snědené události; tvrdý strop 3 s je pojistka.                  */
    var posledni = performance.now();
    var strop = posledni + 3000;
    var hlidka = null;

    function konec() {
      window.removeEventListener("wheel", filtr);
      window.clearInterval(hlidka);
    }
    function filtr(e) {
      if (e.deltaY >= 0) { konec(); return; }   // dolů = úmysl, pustit
      var ted = performance.now();
      if (ted < strop) {
        e.preventDefault();
        posledni = ted;
      }
    }
    window.addEventListener("wheel", filtr, { passive: false });
    hlidka = window.setInterval(function () {
      var ted = performance.now();
      if (ted - posledni > 250 || ted > strop) { konec(); }
    }, 100);
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
        cil.scrollIntoView();
        if (window.history && history.replaceState) {
          history.replaceState(null, "", "#" + id);
        }
        spolkniDojezd();
      });
    });
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
  /*  Tentýž program se vypisuje na dvou místech: ve volebním režimu
      a krátce v bočním sloupci běžného režimu.                          */
  function vypisProgram() {
    if (typeof PROGRAM === "undefined") { return; }
    ["program-seznam", "program-kratce-seznam"].forEach(function (id) {
      var seznam = document.getElementById(id);
      if (!seznam) { return; }
      PROGRAM.forEach(function (bod) {
        seznam.appendChild(prvek("li", null, bod));
      });
    });
  }

  /* ------------------------------------------------- ZVOLENÍ ZÁSTUPCI - */
  function sklonujHlasy(n) {
    if (n === 1) { return n + " hlas"; }
    if (n >= 2 && n <= 4) { return n + " hlasy"; }
    return n + " hlasů";
  }

  /*  Jméno a fotka se berou z KANDIDATI podle pořadí na kandidátce —
      v nastaveni.js je jen pořadí a počet hlasů.                        */
  function vypisZvolene() {
    var seznam = document.getElementById("zvoleni-seznam");
    if (!seznam || !CFG.zvoleni || typeof KANDIDATI === "undefined") { return; }

    CFG.zvoleni.forEach(function (z) {
      var k = null;
      KANDIDATI.forEach(function (x) { if (x.poradi === z.poradi) { k = x; } });
      if (!k) { return; }

      var li = prvek("li", "zvoleny");
      var img = document.createElement("img");
      img.src = k.ctverec || ("obrazky/kandidati/" + k.fotka);
      img.alt = k.jmeno;
      img.loading = "lazy";
      img.width = 600;
      img.height = 600;
      li.appendChild(img);

      var text = prvek("div", "zvoleny-text");
      text.appendChild(prvek("span", "jmeno", k.jmeno));
      text.appendChild(prvek("span", "hlasy", sklonujHlasy(z.hlasy)));
      li.appendChild(text);
      seznam.appendChild(li);
    });
  }

  /* ------------------------------------------------------------ LUPA -- */
  /*  Zvětšení obrázků z aktualit. Nativní <dialog> — Esc a fokus řeší
      prohlížeč. Kde dialog není, obrázek se otevře v novém panelu.      */
  function otevriLupu(obrazky, kde) {
    var dialog = document.getElementById("lupa");
    var img = document.getElementById("lupa-obrazek");
    if (!dialog || !img || typeof dialog.showModal !== "function") {
      window.open(obrazky[kde], "_blank");
      return;
    }
    var vlevo = dialog.querySelector(".lupa-vlevo");
    var vpravo = dialog.querySelector(".lupa-vpravo");

    function ukaz(i) {
      var n = obrazky.length;
      kde = ((i % n) + n) % n;
      img.src = obrazky[kde];
      img.alt = "Obrázek " + (kde + 1) + " z " + n;
    }
    /*  Posluchače se přiřazují přes on…, ne addEventListener: lupa se
        otevírá opakovaně a staré posluchače by se jinak vršily.        */
    vlevo.hidden = vpravo.hidden = obrazky.length < 2;
    vlevo.onclick = function () { ukaz(kde - 1); };
    vpravo.onclick = function () { ukaz(kde + 1); };
    dialog.querySelector(".lupa-zavrit").onclick = function () { dialog.close(); };
    dialog.onclick = function (e) {
      if (e.target === dialog) { dialog.close(); }   // klik mimo obrázek
    };
    dialog.onkeydown = function (e) {
      if (obrazky.length < 2) { return; }
      if (e.key === "ArrowLeft") { ukaz(kde - 1); }
      if (e.key === "ArrowRight") { ukaz(kde + 1); }
    };

    ukaz(kde);
    dialog.showModal();
  }

  /* ------------------------------------------------------- AKTUALITY -- */
  var MESICE = ["ledna", "února", "března", "dubna", "května", "června",
                "července", "srpna", "září", "října", "listopadu", "prosince"];

  function ceskeDatum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) { return iso || ""; }
    return parseInt(m[3], 10) + ". " + MESICE[parseInt(m[2], 10) - 1] + " " + m[1];
  }

  function nahledObrazku(obrazky, i, trida) {
    var b = prvek("button", trida);
    b.type = "button";
    b.setAttribute("aria-label", "Zvětšit obrázek " + (i + 1));
    var img = document.createElement("img");
    img.src = obrazky[i];
    img.alt = "";
    img.loading = "lazy";
    b.appendChild(img);
    b.addEventListener("click", function () { otevriLupu(obrazky, i); });
    return b;
  }

  function radekAktuality(a) {
    var obrazky = (a.obrazky || []).slice(0, 5);
    var li = prvek("li", "aktualita" + (obrazky.length ? "" : " bez-obrazku"));

    if (obrazky.length) {
      li.appendChild(nahledObrazku(obrazky, 0, "aktualita-nahled"));
    }

    var telo = prvek("div", "aktualita-telo");
    telo.appendChild(prvek("p", "aktualita-datum", ceskeDatum(a.datum)));
    telo.appendChild(prvek("h3", null, a.nadpis));

    /*  Text je jeden blok s white-space: pre-line (odstavce = prázdné
        řádky v datech). Jeden blok proto, že line-clamp přes několik
        <p> počítá řádky nespolehlivě.                                   */
    var text = prvek("div", "aktualita-text", a.text);
    telo.appendChild(text);

    var vice = prvek("button", "aktualita-vice", "více");
    vice.type = "button";
    vice.hidden = true;                       // odkryje zmerAktuality()
    vice.setAttribute("aria-expanded", "false");
    vice.addEventListener("click", function () {
      var otevrit = !li.classList.contains("rozbaleno");
      li.classList.toggle("rozbaleno", otevrit);
      vice.textContent = otevrit ? "méně" : "více";
      vice.setAttribute("aria-expanded", otevrit ? "true" : "false");
    });
    telo.appendChild(vice);

    if (obrazky.length > 1) {
      var pruh = prvek("div", "aktualita-dalsi");
      for (var i = 1; i < obrazky.length; i++) {
        pruh.appendChild(nahledObrazku(obrazky, i, "aktualita-mini"));
      }
      telo.appendChild(pruh);
    }
    li.appendChild(telo);

    if (a.pdf) {
      var pdf = prvek("a", "aktualita-pdf", "PDF ke stažení");
      pdf.href = a.pdf;
      pdf.setAttribute("download", "");
      li.appendChild(pdf);
    }
    return li;
  }

  /*  Tlačítko „více" má smysl jen u textu, který se do náhledu nevešel.
      To jde změřit až na viditelném prvku — proto se měří znovu při
      přepnutí do běžného režimu a při změně šířky okna.                 */
  function zmerAktuality() {
    var radky = document.querySelectorAll("#aktuality-seznam .aktualita");
    Array.prototype.forEach.call(radky, function (li) {
      if (li.classList.contains("rozbaleno")) { return; }
      var text = li.querySelector(".aktualita-text");
      var vice = li.querySelector(".aktualita-vice");
      if (!text || !vice || !text.clientHeight) { return; }
      vice.hidden = text.scrollHeight <= text.clientHeight + 1;
    });
  }

  function vypisAktuality() {
    var seznam = document.getElementById("aktuality-seznam");
    var nav = document.getElementById("aktuality-strankovani");
    if (!seznam) { return; }
    var vse = (typeof AKTUALITY !== "undefined" && AKTUALITY) || [];

    seznam.style.setProperty("--radku", CFG.RADKU_NAHLEDU || 4);
    if (!vse.length) {
      seznam.appendChild(prvek("li", "aktualita-nic", "Zatím tu nic není."));
      return;
    }

    var naStranku = Math.max(1, CFG.AKTUALIT_NA_STRANKU || 15);
    var stran = Math.ceil(vse.length / naStranku);
    var strana = 0;

    function tlacitko(text, cil, popis) {
      var b = prvek("button", null, text);
      b.type = "button";
      if (popis) { b.setAttribute("aria-label", popis); }
      if (cil < 0 || cil >= stran) {
        b.disabled = true;
      } else if (cil === strana) {
        b.setAttribute("aria-current", "page");
      }
      b.addEventListener("click", function () {
        strana = cil;
        vykresli();
        document.getElementById("obcanum").scrollIntoView();
      });
      return b;
    }

    function vykresli() {
      seznam.textContent = "";
      vse.slice(strana * naStranku, (strana + 1) * naStranku)
         .forEach(function (a) { seznam.appendChild(radekAktuality(a)); });

      if (nav) {
        nav.textContent = "";
        nav.hidden = stran < 2;
        if (stran > 1) {
          nav.appendChild(tlacitko("‹ Novější", strana - 1, "Novější aktuality"));
          for (var i = 0; i < stran; i++) {
            nav.appendChild(tlacitko(String(i + 1), i, "Stránka " + (i + 1)));
          }
          nav.appendChild(tlacitko("Starší ›", strana + 1, "Starší aktuality"));
        }
      }
      zmerAktuality();
    }

    vykresli();
    window.addEventListener("resize", zmerAktuality);
  }

  /* --------------------------------------------------------- REŽIMY --- */
  /*  nastaveni.js říká, které režimy jsou zapnuté. Aktivní režim dostane
      třídu na <body> (rezim-vote / rezim-common) a styl podle ní ukáže
      prvky jen-vote / jen-common. Záložky jsou vidět jen při dvou
      zapnutých režimech; vote je první a je i výchozí.                  */
  function rezimy(priAktivaci) {
    var R = CFG.rezimy || { vote: true, common: false };
    var zapnute = [];
    if (R.vote) { zapnute.push("vote"); }
    if (R.common) { zapnute.push("common"); }
    if (!zapnute.length) { zapnute = ["vote"]; }   // prázdný web nikdy

    var HASH = { vote: "#volby", common: "#aktualne" };
    var zalozky = document.getElementById("rezimy");
    var aktivni = null;

    /*  Režim z adresy: buď přímo #volby / #aktualne, nebo kotva sekce,
        která do některého režimu patří (odkaz na #kandidatka apod.).    */
    function zAdresy() {
      var h = window.location.hash;
      if (h === HASH.vote) { return "vote"; }
      if (h === HASH.common) { return "common"; }
      if (h.length > 1) {
        var el = document.getElementById(h.slice(1));
        var obal = el && el.closest && el.closest("[data-rezim-obsah]");
        if (obal) { return obal.getAttribute("data-rezim-obsah"); }
      }
      return null;
    }

    function nastav(r) {
      if (zapnute.indexOf(r) < 0) { r = zapnute[0]; }
      if (r === aktivni) { return; }
      aktivni = r;
      document.body.classList.toggle("rezim-vote", r === "vote");
      document.body.classList.toggle("rezim-common", r === "common");
      document.title = TITUL[r];
      if (zalozky) {
        Array.prototype.forEach.call(zalozky.querySelectorAll("a"), function (a) {
          if (a.getAttribute("data-rezim") === r) {
            a.setAttribute("aria-current", "page");
          } else {
            a.removeAttribute("aria-current");
          }
        });
      }
      priAktivaci(r);
    }

    if (zalozky) {
      zalozky.hidden = zapnute.length < 2;
      Array.prototype.forEach.call(zalozky.querySelectorAll("a"), function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          var r = a.getAttribute("data-rezim");
          nastav(r);
          if (window.history && history.replaceState) {
            history.replaceState(null, "", HASH[r]);
          }
          window.scrollTo(0, 0);
        });
      });
    }

    window.addEventListener("hashchange", function () {
      var r = zAdresy();
      if (r) { nastav(r); }
    });

    nastav(zAdresy() || zapnute[0]);
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
    console.log("[web] verze " + VERZE
                + ", karusel " + (KARUSEL_ZAPNUTY ? "zapnut" : "vypnut"));
    kotvy();

    /*  Karusel se spouští až při první aktivaci volebního režimu —
        na skrytém webu nemá jeho časovač co dělat.                      */
    var karuselBezi = false;
    function spustKarusel() {
      if (karuselBezi || typeof KANDIDATI === "undefined") { return; }
      karuselBezi = true;
      if (KARUSEL_ZAPNUTY) {
        Karusel("karusel", "karusel-pas", "karusel-tecky", KANDIDATI,
                snimekKandidata, function (k) { return k.jmeno; });
      } else {
        /* statický náhradník: jen první kandidát, žádný časovač */
        var li = prvek("li", "snimek");
        snimekKandidata(li, KANDIDATI[0]);
        document.getElementById("karusel-pas").appendChild(li);
        Array.prototype.forEach.call(
          document.querySelectorAll(".karusel-sip, #karusel-tecky"),
          function (e) { e.style.display = "none"; });
      }
    }

    vypisProgram();
    vypisHodnoceni();
    vypisKandidatku();
    vypisMaterialy();
    vypisZvolene();
    vypisAktuality();

    rezimy(function (rezim) {
      if (rezim === "vote") { spustKarusel(); }
      if (rezim === "common") { zmerAktuality(); }
    });

    /*  Odkaz přímo na sekci (např. …/#kandidatka): prohlížeč zkoušel
        odrolovat dřív, než skript režim odkryl, takže cíl ještě neměl
        žádnou výšku. Jeden skok navíc to srovná.                        */
    if (window.location.hash.length > 1) {
      var cil = document.getElementById(window.location.hash.slice(1));
      if (cil) { cil.scrollIntoView(); }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
