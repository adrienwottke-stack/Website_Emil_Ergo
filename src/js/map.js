/* =========================================================================
   EMIL · Standorte — Deutschland-Karte mit echten Bundesländer-Grenzen,
   Ost-Region hervorgehoben, Pins aus CONFIG (Lon/Lat, auto-projiziert).
   ========================================================================= */
import { CONFIG } from "../config.js";
import { STATES, project } from "./de-states.js";

export function initMap() {
  const svg = document.getElementById("deMap");
  const list = document.getElementById("cityList");
  if (!svg || !list) return;

  const ns = "http://www.w3.org/2000/svg";
  const frag = document.createDocumentFragment();

  // Bundesländer — unsere Region (Osten) trägt Gold
  const lands = document.createElementNS(ns, "g");
  STATES.forEach((st) => {
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", st.d);
    p.setAttribute("class", "land" + (st.east ? " land--east" : ""));
    const t = document.createElementNS(ns, "title");
    t.textContent = st.name;
    p.appendChild(t);
    lands.appendChild(p);
  });
  frag.appendChild(lands);

  // Pins + Liste
  CONFIG.locations.forEach((rawLoc, idx) => {
    const loc = { ...rawLoc, ...project(rawLoc.lon, rawLoc.lat) };
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", "pin" + (loc.soon ? " pin--soon" : ""));
    g.setAttribute("data-city", idx);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", `${loc.name} — ${loc.sub}`);

    if (!loc.soon) {
      const pulse = document.createElementNS(ns, "circle");
      pulse.setAttribute("cx", loc.x);
      pulse.setAttribute("cy", loc.y);
      pulse.setAttribute("r", 12);
      pulse.setAttribute("class", "pulse");
      g.appendChild(pulse);
    }
    const core = document.createElementNS(ns, "circle");
    core.setAttribute("cx", loc.x);
    core.setAttribute("cy", loc.y);
    core.setAttribute("r", loc.soon ? 7 : 8);
    core.setAttribute("class", "core");
    g.appendChild(core);

    // Labels rechts vom Pin; nahe am rechten Rand links; optional zentriert
    // über dem Pin (above) für dichte Ecken wie Sachsen
    const flip = loc.x > 270;
    const lx = loc.above ? loc.x : flip ? loc.x - 16 : loc.x + 16;
    const anchor = loc.above ? "middle" : flip ? "end" : "start";
    const ly = loc.above ? loc.y - 24 : loc.y + 1;
    const sy = loc.above ? loc.y - 10 : loc.y + 15;

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", lx);
    label.setAttribute("y", ly);
    label.setAttribute("text-anchor", anchor);
    label.textContent = loc.name;
    g.appendChild(label);

    const sub = document.createElementNS(ns, "text");
    sub.setAttribute("x", lx);
    sub.setAttribute("y", sy);
    sub.setAttribute("text-anchor", anchor);
    sub.setAttribute("class", "sub");
    sub.textContent = loc.sub;
    g.appendChild(sub);

    frag.appendChild(g);

    // Listeneintrag
    const li = document.createElement("li");
    li.dataset.city = idx;
    li.innerHTML = `<span class="pinico${loc.soon ? " pinico--soon" : ""}"></span><span><b>${loc.name}</b><br><span>${loc.sub}</span></span>`;
    list.appendChild(li);
  });

  svg.appendChild(frag);

  // Hover-Sync Karte ↔ Liste
  const sync = (idx, on) => {
    list.querySelectorAll("li").forEach((li) => li.classList.toggle("is-active", on && li.dataset.city === String(idx)));
  };
  svg.querySelectorAll(".pin").forEach((pin) => {
    const idx = pin.dataset.city;
    pin.addEventListener("mouseenter", () => sync(idx, true));
    pin.addEventListener("mouseleave", () => sync(idx, false));
    pin.addEventListener("focus", () => sync(idx, true));
    pin.addEventListener("blur", () => sync(idx, false));
  });
}
