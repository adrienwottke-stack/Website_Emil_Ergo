/* Rechtsseiten: Fonts lokal + Basis-Styles, keine Animationen */
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/legal.css";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
