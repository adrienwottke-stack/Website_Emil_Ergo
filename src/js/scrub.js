/* =========================================================================
   EMIL · Scrub-Engine
   Desktop: video.currentTime an ScrollTrigger-Progress gekoppelt (mit Lerp).
   Mobile / reduced-motion: degradiert zu Autoplay-Loop bzw. Poster.
   Video fehlt / lädt nicht: Poster bleibt sichtbar, Layout stabil.
   ========================================================================= */
import { gsap, ScrollTrigger, prefersReduced, isCoarse } from "./scroll.js";

const LERP = 0.14;

function attachSource(video) {
  if (!video.src && video.dataset.src) video.src = video.dataset.src;
}

function markReady(container, video) {
  const ready = () => container.classList.add("video-ready");
  if (video.readyState >= 2) ready();
  else video.addEventListener("loadeddata", ready, { once: true });
  video.addEventListener("error", () => {
    // Fallback: Poster bleibt, Video raus aus dem Layout
    container.classList.remove("video-ready");
    video.remove();
  });
}

/** Autoplay-Loop, startet erst wenn sichtbar (Mobile-Degradation). */
function initLoop(container, video) {
  attachSource(video);
  video.loop = true;
  video.muted = true;
  markReady(container, video);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.15 }
  );
  io.observe(container);
}

/**
 * Scrub eines Videos über einen Scroll-Bereich.
 * options: { trigger, start, end } — ScrollTrigger-Parameter.
 * Gibt den ScrollTrigger zurück (oder null bei Degradation).
 */
export function initVideoScrub(container, options = {}) {
  const video = container.querySelector(".scrub-video");
  if (!video) return null;

  if (prefersReduced) {
    // Poster reicht — keine Bewegung
    return null;
  }
  if (isCoarse) {
    initLoop(container, video);
    return null;
  }

  video.preload = "auto";
  attachSource(video);
  video.pause();
  markReady(container, video);

  let duration = 0;
  let target = 0;
  let current = 0;
  let ticking = false;

  const onMeta = () => {
    duration = Math.max(video.duration - 0.06, 0.01);
  };
  if (video.readyState >= 1) onMeta();
  else video.addEventListener("loadedmetadata", onMeta, { once: true });

  const tick = () => {
    if (!duration || !video.isConnected) return;
    current += (target - current) * LERP;
    if (Math.abs(target - current) < 0.004) {
      current = target;
      gsap.ticker.remove(tick);
      ticking = false;
    }
    // seekable prüfen — bei fehlendem Video passiert einfach nichts
    try { video.currentTime = current; } catch { /* noop */ }
  };

  const st = ScrollTrigger.create({
    trigger: options.trigger || container,
    start: options.start || "top bottom",
    end: options.end || "bottom top",
    scrub: true,
    onUpdate: (self) => {
      if (!duration) return;
      target = self.progress * duration;
      if (!ticking) {
        ticking = true;
        gsap.ticker.add(tick);
      }
    },
  });
  return st;
}

/* =========================================================================
   Hero: gerahmte Bühne → Fullbleed-Kino, Name buchstabenweise, Video-Scrub
   ========================================================================= */
export function initHero() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const pin = hero.querySelector(".hero__pin");
  const media = hero.querySelector(".hero__media");
  const wash = hero.querySelector(".hero__wash");
  const letters = hero.querySelectorAll(".hero__letter");

  if (prefersReduced) {
    hero.style.height = "auto";
    pin.style.position = "relative";
    letters.forEach((l) => { l.style.opacity = 1; l.style.transform = "none"; });
    pin.classList.add("is-cinema");
    return;
  }

  // Video-Scrub über die gesamte Hero-Strecke
  initVideoScrub(media, { trigger: hero, start: "top top", end: "bottom bottom" });

  // Ziel-Scale, damit der Rahmen den Viewport voll abdeckt
  const coverScale = () => {
    const r = media.getBoundingClientRect();
    const w = r.width / (gsap.getProperty(media, "scaleX") || 1);
    const h = r.height / (gsap.getProperty(media, "scaleY") || 1);
    return Math.max(window.innerWidth / w, window.innerHeight / h) * 1.02;
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => pin.classList.toggle("is-cinema", self.progress > 0.42),
    },
  });

  tl.fromTo(media,
    { scale: 1, borderRadius: "var(--radius-l)" },
    { scale: coverScale, borderRadius: 0, ease: "power2.inOut", duration: 0.55 }, 0);
  if (wash) tl.to(wash, { opacity: 0, ease: "none", duration: 0.45 }, 0.05);
  // Intro-Copy räumt die Bühne, bevor der Name landet — im Kino gehört das Bild der Person
  const content = hero.querySelector(".hero__content");
  if (content) tl.to(content, { autoAlpha: 0, y: -50, ease: "power2.in", duration: 0.22 }, 0.34);
  tl.to(letters, {
    opacity: 1,
    y: 0,
    stagger: 0.06,
    ease: "power3.out",
    duration: 0.35,
  }, 0.42);

  window.addEventListener("resize", () => ScrollTrigger.refresh());
}

/* =========================================================================
   Was du bekommst: Pin + Karten scrubben nacheinander über den Hintergrund
   ========================================================================= */
export function initPillars() {
  const section = document.getElementById("bekommst");
  if (!section) return;
  const pinEl = section.querySelector(".bekommst__pin");
  const cards = section.querySelectorAll("[data-pillar]");
  const bg = section.querySelector(".bekommst__bg img");

  if (prefersReduced || isCoarse) {
    // Ohne Pin: Karten einfach sichtbar
    cards.forEach((c) => { c.style.opacity = 1; c.style.transform = "none"; });
    return;
  }

  gsap.set(cards, { opacity: 0, y: 60 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinEl,
      start: "top top",
      end: "+=180%",
      pin: true,
      scrub: 0.5,
    },
  });
  if (bg) tl.fromTo(bg, { scale: 1.12 }, { scale: 1, ease: "none", duration: 3 }, 0);
  cards.forEach((card, i) => {
    tl.to(card, { opacity: 1, y: 0, ease: "power2.out", duration: 0.8 }, 0.3 + i * 0.85);
  });
}
