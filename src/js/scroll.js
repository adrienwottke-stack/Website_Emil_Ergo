/* =========================================================================
   EMIL · Scroll-Grundlage — Lenis Smooth-Scroll + GSAP ScrollTrigger,
   Scroll-Reveals, Nav-Zustand, Anker-Navigation
   ========================================================================= */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

export { gsap, ScrollTrigger };

export let lenis = null;

/* Mobile Browser feuern beim Scrollen laufend „resize", weil die URL-Leiste
   ein- und ausfährt. Jeder Refresh würde die gepinnte Hero-Sektion neu
   vermessen und die Scrollposition verschieben — genau das Springen.
   Darum: nur bei echter Breitenänderung neu vermessen (Orientierungswechsel,
   Desktop-Resize). Höhen-only-Resizes auf Touch werden ignoriert. */
let lastW = window.innerWidth;
let lastH = window.innerHeight;
let refreshT = 0;
export function refreshOnResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const widthChanged = w !== lastW;
  const heightChanged = h !== lastH;
  lastW = w;
  lastH = h;
  if (!widthChanged && (isCoarse || !heightChanged)) return;
  clearTimeout(refreshT);
  refreshT = setTimeout(() => ScrollTrigger.refresh(), 250);
}

export function initScroll() {
  // ScrollTrigger soll ebenfalls nicht auf die URL-Leisten-Resizes reagieren
  ScrollTrigger.config({ ignoreMobileResize: true });
  window.addEventListener("resize", refreshOnResize, { passive: true });

  // Auf Touch scrollt das System selbst am saubersten — Lenis kämpft dort
  // gegen das native Momentum-Scrolling und reißt die Seite zurück.
  // Darum gar nicht erst laden (spart auf dem Handy zusätzlich den Bundle-Teil).
  if (!prefersReduced && !isCoarse) {
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    });
  }

  // Anker sanft anfahren (Lenis übernimmt, sonst nativ)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  // Nav-Zustand
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Scroll-Reveals (IntersectionObserver, nur transform/opacity)
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }
}
