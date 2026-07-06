/* =========================================================================
   EMIL · WhatsApp-First-Buchung
   Baut den wa.me-Link mit vorbefüllter Nachricht aus dem Mini-Interview.
   Der Nutzer sieht die Nachricht in WhatsApp und entscheidet selbst
   über das Absenden — hier wird nichts übertragen oder gespeichert.
   ========================================================================= */
import { CONFIG } from "../config.js";

const waLink = (text) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

export function initWhatsApp() {
  const form = document.getElementById("interviewForm");
  if (!form) return;

  const ortInput = document.getElementById("q-ort");
  const goalChips = form.querySelectorAll("[data-goal]");
  const modeChips = form.querySelectorAll("[data-mode]");
  const waButton = document.getElementById("waButton");
  const waTermin = document.getElementById("waTermin");

  const state = { ort: "", goals: new Set(), mode: "persönlich" };

  const buildMessage = () => {
    const parts = ["Hey Emil! 👋"];
    if (state.ort) parts.push(`Ich komme aus ${state.ort}.`);
    if (state.goals.size) parts.push(`Mein Ziel: ${[...state.goals].join(" + ")}.`);
    parts.push(
      state.mode === "Zoom"
        ? "Lass uns per Zoom sprechen — wann passt es dir?"
        : "Lass uns persönlich sprechen (Dresden/Leipzig) — wann passt es dir?"
    );
    return parts.join(" ");
  };

  const refresh = () => {
    waButton.href = waLink(buildMessage());
    waTermin.href = waLink(
      `Hey Emil! Ich will direkt einen Termin ausmachen (${state.mode}). Welche Slots hast du diese Woche frei?`
    );
  };

  ortInput.addEventListener("input", () => {
    state.ort = ortInput.value.trim().slice(0, 60);
    refresh();
  });

  goalChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const goal = chip.dataset.goal;
      if (state.goals.has(goal)) {
        state.goals.delete(goal);
        chip.classList.remove("is-active");
      } else {
        state.goals.add(goal);
        chip.classList.add("is-active");
      }
      refresh();
    });
  });

  modeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      modeChips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      state.mode = chip.dataset.mode;
      refresh();
    });
  });

  refresh();
}

/** Platzhalter aus der Config in alle data-config-Elemente schreiben */
export function applyConfig() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    switch (el.dataset.config) {
      case "instagramUrl":
        el.href = CONFIG.instagramUrl;
        break;
      case "instagramHandle":
        el.textContent = CONFIG.instagramHandle;
        break;
      case "email":
        el.href = `mailto:${CONFIG.email}`;
        if (el.textContent.includes("[")) el.textContent = CONFIG.email.includes("PLATZHALTER") ? "[E-Mail folgt]" : CONFIG.email;
        break;
      case "waPlain": {
        const isPlaceholder = /X/.test(CONFIG.whatsappNumber);
        el.href = waLink("Hey Emil! 👋");
        el.textContent = isPlaceholder ? "WhatsApp: [Nummer folgt]" : `WhatsApp: +${CONFIG.whatsappNumber}`;
        break;
      }
    }
  });
}
