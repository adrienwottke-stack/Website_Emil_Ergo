/* =========================================================================
   EMIL · Scrub-Engine
   Desktop: video.currentTime an ScrollTrigger-Progress gekoppelt (mit Lerp).
   Mobile / reduced-motion: degradiert zu Autoplay-Loop bzw. Poster.
   Video fehlt / lädt nicht: Poster bleibt sichtbar, Layout stabil.
   ========================================================================= */
import { gsap, ScrollTrigger, prefersReduced, isCoarse } from "./scroll.js";

const LERP = 0.2;
const HALF_FRAME = 1 / 48; // Quell-Clips laufen mit 24 fps

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
    // Decoder aufwecken, damit der erste Scrub-Seek nicht hakt
    try { video.currentTime = 0.001; } catch { /* noop */ }
  };
  if (video.readyState >= 1) onMeta();
  else video.addEventListener("loadedmetadata", onMeta, { once: true });

  const tick = () => {
    if (!video.isConnected) { gsap.ticker.remove(tick); ticking = false; return; }
    if (!duration) return;
    current += (target - current) * LERP;
    if (Math.abs(target - current) < 0.004) {
      current = target;
      gsap.ticker.remove(tick);
      ticking = false;
    }
    // Nie in einen laufenden Seek hineinfeuern — gestaute Seeks sind das Ruckeln.
    // Unterhalb einer halben Frame-Dauer gibt es ohnehin kein neues Bild.
    if (!video.seeking && Math.abs(video.currentTime - current) > HALF_FRAME) {
      try { video.currentTime = current; } catch { /* noop */ }
    }
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
  const frame = hero.querySelector(".hero__frame");
  const vids = media.querySelectorAll(".scrub-video, .scrub-poster");
  const navEl = document.getElementById("nav");

  // Bild-Einpassung: das 16:9-Bild wird NIE vertikal beschnitten.
  // Start: ganzes Bild zentriert im Bühnenfenster. Ende: volle Viewport-Höhe
  // (auf Breit-Viewports laufen die Seiten in den Studio-Backdrop aus).
  const ASPECT = 16 / 9;
  const fit = () => {
    const vw = pin.clientWidth;
    const vh = pin.clientHeight;
    const dispW = Math.min(vw, vh * ASPECT); // contain-Größe des Bildinhalts
    const dispH = dispW / ASPECT;
    const pr = pin.getBoundingClientRect();
    const fr = (frame || media).getBoundingClientRect();
    const winW = Math.max(fr.width, 1);
    const winH = Math.max(fr.height, 1);
    return {
      s0: Math.min(winH / dispH, winW / dispW),
      ty: fr.top - pr.top + winH / 2 - vh / 2,
      sEnd: vh / dispH,
    };
  };

  if (prefersReduced) {
    hero.style.height = "auto";
    pin.style.position = "relative";
    letters.forEach((l) => { l.style.opacity = 1; l.style.transform = "none"; });
    pin.classList.add("is-cinema");
    const f = fit();
    gsap.set(vids, { y: f.ty, scale: f.s0 });
    return;
  }

  // Video-Scrub über die gesamte Hero-Strecke
  initVideoScrub(media, { trigger: hero, start: "top top", end: "bottom bottom" });

  // Start-Clip aus der realen Frame-Geometrie ablesen (Pixel; resize-fest,
  // weil invalidateOnRefresh die Funktion neu auswertet). Der Frame-Div wird
  // nie geclippt/transformiert und ist damit die stabile Referenz.
  const radius = getComputedStyle(document.documentElement).getPropertyValue("--radius-l").trim() || "28px";
  const clipStart = () => {
    const pr = pin.getBoundingClientRect();
    const fr = (frame || media).getBoundingClientRect();
    return `inset(${Math.max(fr.top - pr.top, 0)}px ${Math.max(pr.right - fr.right, 0)}px ${Math.max(pr.bottom - fr.bottom, 0)}px ${Math.max(fr.left - pr.left, 0)}px round ${radius})`;
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        pin.classList.toggle("is-cinema", p > 0.42);
        // Nav räumt die Kino-Phase, kommt zum Hero-Ende zurück
        if (navEl) navEl.classList.toggle("nav--hidden", p > 0.3 && p < 0.96);
      },
    },
  });

  // Bühne → Fullbleed nur über clip-path (kompositierbar, kein Repaint des Videos)
  tl.fromTo(media,
    { clipPath: clipStart },
    { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "power2.inOut", duration: 0.55 }, 0);
  // Ganzes Bild: aus dem Bühnenfenster auf volle Höhe wachsen
  tl.fromTo(vids,
    { y: () => fit().ty, scale: () => fit().s0 },
    { y: 0, scale: () => fit().sEnd, ease: "power2.inOut", duration: 0.55 }, 0);
  if (frame) tl.to(frame, { autoAlpha: 0, ease: "none", duration: 0.28 }, 0.08);
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

  // Refresh gebündelt statt bei jedem Resize-Event
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
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
