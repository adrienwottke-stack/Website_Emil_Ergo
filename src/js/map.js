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
    g.setAttribute("class", "pin" + (loc.soon ? " pin--soon" : "") + (loc.primary ? " pin--primary" : ""));
    g.setAttribute("data-city", idx);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", `${loc.name} — ${loc.sub}`);

    // Puls nur auf der Home Base — 10+ pulsierende Pins wären unruhig
    if (loc.primary) {
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
    core.setAttribute("r", loc.primary ? 9 : loc.soon ? 7 : 6);
    core.setAttribute("class", "core");
    g.appendChild(core);

    // Label-Position: rechts (Standard), links nahe am Kartenrand, zentriert
    // über/unter dem Pin (above/below) oder frei via labelDx/labelDy.
    // Sichtbar sind Labels nur für primary/soon — der Rest erscheint on Hover.
    const flip = loc.x > 300;
    let anchor, lx, ly, sy;
    if (loc.above) {
      anchor = "middle"; lx = loc.x; ly = loc.y - 24; sy = loc.y - 10;
    } else if (loc.below) {
      anchor = "middle"; lx = loc.x; ly = loc.y + 22; sy = loc.y + 36;
    } else if (loc.labelDx != null || loc.labelDy != null) {
      const dx = loc.labelDx ?? 16;
      anchor = dx < 0 ? "end" : "start"; lx = loc.x + dx; ly = loc.y + (loc.labelDy ?? 1); sy = ly + 14;
    } else {
      anchor = flip ? "end" : "start"; lx = flip ? loc.x - 16 : loc.x + 16; ly = loc.y + 1; sy = ly + 14;
    }

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

  // Hover-Sync Karte ↔ Liste (beide Richtungen)
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
  list.querySelectorAll("li").forEach((li) => {
    const pin = svg.querySelector(`.pin[data-city="${li.dataset.city}"]`);
    if (!pin) return;
    li.addEventListener("mouseenter", () => pin.classList.add("is-active"));
    li.addEventListener("mouseleave", () => pin.classList.remove("is-active"));
  });
}
