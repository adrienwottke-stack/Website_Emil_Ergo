import "@fontsource-variable/inter";
import "@fontsource-variable/archivo";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/sections.css";

import { initScroll } from "./js/scroll.js";
import { initLifeHero } from "./js/hero.js";
import { initNav } from "./js/nav.js";
import { initCalculator } from "./js/calculator.js";
import { initMap } from "./js/map.js";
import { initWhatsApp, applyConfig } from "./js/whatsapp.js";

initLifeHero();
initScroll();
initNav();
initCalculator();
initMap();
applyConfig();
initWhatsApp();

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
