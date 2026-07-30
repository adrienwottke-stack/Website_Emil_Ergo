/* =========================================================================
   EMIL · Nav — Mobile-Overlay (Burger) + Scrollspy für die Anker-Links
   ========================================================================= */
import { lenis } from "./scroll.js";

export function initNav() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("navMenu");
  if (!nav || !burger || !menu) return;

  const root = document.documentElement;
  const isOpen = () => nav.classList.contains("menu-open");

  let closeTimer = 0;
  const setOpen = (open) => {
    nav.classList.toggle("menu-open", open);
    // menu-closing hält die Ausblend-Transition am Leben (CSS animiert nur
    // über diese beiden Klassen, damit Breakpoint-Resizes nicht flackern)
    clearTimeout(closeTimer);
    if (open) {
      nav.classList.remove("menu-closing");
    } else {
      nav.classList.add("menu-closing");
      closeTimer = setTimeout(() => nav.classList.remove("menu-closing"), 460);
    }
    root.classList.toggle("nav-lock", open);
    burger.setAttribute("aria-expanded", String(open));
    if (lenis) (open ? lenis.stop() : lenis.start());
  };

  burger.addEventListener("click", () => setOpen(!isOpen()));

  // Capture-Phase: Menü schließt (und Lenis läuft wieder), bevor der
  // Anker-Handler aus scroll.js das sanfte Scrollen startet.
  menu.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("a") && isOpen()) setOpen(false);
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      burger.focus();
    }
  });

  // Scrollspy: aktiven Abschnitt markieren (greift nur auf dem One-Pager)
  const links = Array.from(menu.querySelectorAll('.nav__link[href^="#"]'));
  const byTarget = new Map();
  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) byTarget.set(target, a);
  });
  if (!byTarget.size || !("IntersectionObserver" in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("is-current"));
        const link = byTarget.get(entry.target);
        if (link) link.classList.add("is-current");
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );
  byTarget.forEach((_, target) => spy.observe(target));
}
