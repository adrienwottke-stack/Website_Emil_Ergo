/* =========================================================================
   EMIL · Standorte — stilisierte Deutschland-Punktkarte (SVG) + Pins
   Umriss stark vereinfacht; das Punktraster macht die Karte bewusst
   grafisch statt geografisch exakt.
   ========================================================================= */
import { CONFIG } from "../config.js";

/* Vereinfachter Deutschland-Umriss im 400×520-ViewBox (x rechts, y runter) */
const OUTLINE = [
  [131, 32], [178, 63], [218, 90], [281, 63], [317, 51], [348, 94],
  [346, 162], [364, 174], [370, 207], [364, 223], [380, 254], [352, 269],
  [356, 278], [301, 303], [273, 321], [281, 340], [333, 414], [301, 487],
  [269, 481], [222, 493], [190, 500], [166, 487], [127, 481], [87, 484],
  [83, 426], [52, 383], [40, 364], [28, 328], [24, 288], [28, 260],
  [22, 220], [52, 205], [64, 186], [52, 174], [71, 131], [67, 106],
  [103, 106], [123, 94], [139, 94], [127, 69], [115, 32],
];

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function initMap() {
  const svg = document.getElementById("deMap");
  const list = document.getElementById("cityList");
  if (!svg || !list) return;

  const ns = "http://www.w3.org/2000/svg";
  const frag = document.createDocumentFragment();

  // Punktraster im Umriss
  const SPACING = 13;
  const dots = document.createElementNS(ns, "g");
  for (let y = 24; y < 512; y += SPACING) {
    for (let x = 16; x < 392; x += SPACING) {
      if (pointInPolygon(x, y, OUTLINE)) {
        const c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("r", 2.1);
        c.setAttribute("class", "dot-land");
        dots.appendChild(c);
      }
    }
  }
  frag.appendChild(dots);

  // Pins + Liste
  CONFIG.locations.forEach((loc, idx) => {
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

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", loc.x + 16);
    label.setAttribute("y", loc.y + 1);
    label.textContent = loc.name;
    g.appendChild(label);

    const sub = document.createElementNS(ns, "text");
    sub.setAttribute("x", loc.x + 16);
    sub.setAttribute("y", loc.y + 15);
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
