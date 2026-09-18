import { CONFIG } from "../config.js";

const hasWhatsApp = () => /^\d{8,15}$/.test(CONFIG.whatsappNumber);
const hasEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email) && !CONFIG.email.includes("PLATZHALTER");
const hasInstagram = () => /^https:\/\/(www\.)?instagram\.com\//.test(CONFIG.instagramUrl) && !CONFIG.instagramUrl.includes("PLATZHALTER");
const waLink = (text) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

function configureWhatsAppLink(element, text) {
  if (!element) return;
  if (!hasWhatsApp()) {
    element.setAttribute("aria-disabled", "true");
    element.removeAttribute("href");
    return;
  }
  element.href = waLink(text);
  element.removeAttribute("aria-disabled");
}

export function initWhatsApp() {
  const baseMessage = "Hey Emil, ich möchte dich und euer Team kennenlernen.";
  const direct = document.getElementById("waDirect");
  const form = document.getElementById("interviewForm");
  const prepared = document.getElementById("waButton");
  configureWhatsAppLink(direct, baseMessage);
  if (!form || !prepared) return;

  const state = { ort: "", goals: new Set(), mode: "" };
  const groups = {
    ort: Array.from(form.querySelectorAll("[data-ort]")),
    goals: Array.from(form.querySelectorAll("[data-goal]")),
    mode: Array.from(form.querySelectorAll("[data-mode]")),
  };
  const modeText = { persönlich: "persönlich sprechen", Videocall: "per Videocall sprechen", schreiben: "erst einmal schreiben" };

  const message = () => {
    const parts = [baseMessage];
    if (state.ort === "Woanders") parts.push("Ich komme nicht direkt aus Dresden oder Leipzig.");
    else if (state.ort) parts.push(`Ich komme aus ${state.ort}.`);
    if (state.goals.size) parts.push(`Zuerst möchte ich ${[...state.goals].join(" und ").toLowerCase()}.`);
    if (state.mode) parts.push(`Am liebsten würde ich ${modeText[state.mode]}.`);
    return parts.join(" ");
  };
  const refresh = () => configureWhatsAppLink(prepared, message());
  const setPressed = (button, pressed) => {
    button.classList.toggle("is-active", pressed);
    button.setAttribute("aria-pressed", String(pressed));
  };

  groups.ort.forEach((button) => button.addEventListener("click", () => {
    const deselect = button.getAttribute("aria-pressed") === "true";
    groups.ort.forEach((item) => setPressed(item, false));
    state.ort = deselect ? "" : button.dataset.ort;
    if (!deselect) setPressed(button, true);
    refresh();
  }));
  groups.goals.forEach((button) => button.addEventListener("click", () => {
    const goal = button.dataset.goal;
    const active = state.goals.has(goal);
    if (active) state.goals.delete(goal); else state.goals.add(goal);
    setPressed(button, !active);
    refresh();
  }));
  groups.mode.forEach((button) => button.addEventListener("click", () => {
    const deselect = button.getAttribute("aria-pressed") === "true";
    groups.mode.forEach((item) => setPressed(item, false));
    state.mode = deselect ? "" : button.dataset.mode;
    if (!deselect) setPressed(button, true);
    refresh();
  }));
  refresh();
}

export function applyConfig() {
  document.querySelectorAll('[data-config="instagramUrl"]').forEach((element) => {
    if (!hasInstagram()) return;
    element.href = CONFIG.instagramUrl;
    element.hidden = false;
  });
  document.querySelectorAll('[data-config="instagramHandle"]').forEach((element) => {
    if (!hasInstagram()) return;
    element.textContent = CONFIG.instagramHandle;
    element.hidden = false;
  });
  document.querySelectorAll('[data-config="email"]').forEach((element) => {
    if (!hasEmail()) return;
    element.href = `mailto:${CONFIG.email}`;
    element.hidden = false;
  });
  document.querySelectorAll('[data-config="waPlain"]').forEach((element) => {
    if (!hasWhatsApp()) { element.hidden = true; return; }
    element.href = waLink("Hey Emil, ich möchte dich und euer Team kennenlernen.");
    element.textContent = `WhatsApp: +${CONFIG.whatsappNumber}`;
    element.hidden = false;
  });
  document.querySelectorAll("[data-contact-missing]").forEach((element) => {
    element.hidden = hasWhatsApp();
  });
}
