import { prefersReduced } from "./scroll.js";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - (2 * t));
};

export function initLifeHero() {
  const hero = document.querySelector("[data-life-hero]");
  if (!hero) return;

  const stage = hero.querySelector(".life-hero__stage");
  const media = hero.querySelector("[data-life-media]");
  const video = hero.querySelector("video[data-src]");
  const playbackButton = hero.querySelector("[data-hero-playback]");
  if (!stage || !media || !video) return;

  if (prefersReduced) return;

  let frameRequested = false;
  let heroIsVisible = true;
  let userPaused = false;

  const markVideoReady = () => media.classList.add("video-ready");
  const playVideo = () => {
    if (!heroIsVisible || userPaused) return;
    const playback = video.play();
    if (playback?.catch) playback.catch(() => {});
  };
  const updatePlaybackButton = () => {
    if (!playbackButton) return;
    playbackButton.setAttribute("aria-pressed", String(userPaused));
    playbackButton.setAttribute("aria-label", userPaused ? "Hero-Film abspielen" : "Hero-Film pausieren");
    const label = playbackButton.querySelector("span");
    if (label) label.textContent = userPaused ? "Abspielen" : "Pause";
  };

  const render = () => {
    frameRequested = false;

    const start = hero.offsetTop;
    const distance = Math.max(hero.offsetHeight - stage.offsetHeight, 1);
    const progress = clamp((window.scrollY - start) / distance);
    const maskLift = smoothstep((progress - .035) / .52);
    const finale = smoothstep((progress - .84) / .12);
    const scrollFade = 1 - smoothstep((progress - .015) / .11);
    const veil = .02 + (finale * .34);

    hero.style.setProperty("--hero-mask-y", `${(-102 * maskLift).toFixed(2)}%`);
    hero.style.setProperty("--hero-final-opacity", finale.toFixed(3));
    hero.style.setProperty("--hero-final-y", `${((1 - finale) * 28).toFixed(1)}px`);
    hero.style.setProperty("--hero-veil-opacity", veil.toFixed(3));
    hero.style.setProperty("--hero-scroll-opacity", scrollFade.toFixed(3));

    if (heroIsVisible && !userPaused && video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) playVideo();
  };

  const requestRender = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  };

  video.addEventListener("loadeddata", () => {
    markVideoReady();
    playVideo();
  }, { once: true });
  video.addEventListener("error", () => media.classList.remove("video-ready"));

  video.preload = "auto";
  video.muted = true;
  video.loop = true;
  video.src = video.dataset.src;
  video.removeAttribute("data-src");
  video.load();
  playVideo();

  playbackButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    if (userPaused) video.pause();
    else playVideo();
    updatePlaybackButton();
  });
  updatePlaybackButton();

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      heroIsVisible = entry.isIntersecting;
      if (heroIsVisible) playVideo();
      else video.pause();
    }, { threshold: .04 });
    visibilityObserver.observe(hero);
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  requestRender();
}
