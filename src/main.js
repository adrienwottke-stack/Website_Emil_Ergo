/* =========================================================================
   EMIL · Entry — Fonts (lokal, DSGVO), Styles, Module
   ========================================================================= */
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/archivo";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/sections.css";

import { initScroll } from "./js/scroll.js";
import { initNav } from "./js/nav.js";
import { initVideoLoop, initHero } from "./js/scrub.js";
import { initCalculator } from "./js/calculator.js";
import { initMap } from "./js/map.js";
import { initWhatsApp, applyConfig } from "./js/whatsapp.js";

initScroll();
initNav();
initHero();
initCalculator();
initMap();
initWhatsApp();
applyConfig();

/* Team- und Finale-Video laufen als leiser Loop, sobald sie sichtbar sind —
   scroll-gekoppelt froren sie beim Stehenbleiben mitten im Clip ein */
document.querySelectorAll(".team__stage[data-scrub-video], .finale__media[data-scrub-video]")
  .forEach((el) => initVideoLoop(el));

/* Intro-Video: Klick-to-Play — nichts lädt, bevor der Nutzer es will */
const introVideo = document.getElementById("introVideo");
const introPlay = document.getElementById("introPlay");
if (introVideo && introPlay) {
  introPlay.addEventListener("click", () => {
    if (!introVideo.src) introVideo.src = introVideo.dataset.src;
    introVideo.setAttribute("controls", "");
    introVideo.closest(".story-frame").classList.add("playing");
    const p = introVideo.play();
    if (p && p.catch) p.catch(() => {});
  });
}

/* Footer-Jahr */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
