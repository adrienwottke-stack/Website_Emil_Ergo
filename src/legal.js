import "@fontsource-variable/inter";
import "@fontsource-variable/archivo";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/legal.css";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
