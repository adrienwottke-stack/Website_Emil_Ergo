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

  const ortChips = form.querySelectorAll("[data-ort]");
  const goalChips = form.querySelectorAll("[data-goal]");
  const modeChips = form.querySelectorAll("[data-mode]");
  const waButton = document.getElementById("waButton");

  const state = { ort: "", goals: new Set(), mode: "persönlich" };

  const MODE_PHRASE = {
    "persönlich": "persönlich sprechen",
    Videocall: "per Videocall sprechen",
    schreiben: "erst mal hier schreiben",
  };

  const buildMessage = () => {
    const parts = ["Hey Emil!"];
    if (state.ort === "Woanders") parts.push("Ich komme nicht direkt aus Dresden oder Leipzig.");
    else if (state.ort) parts.push(`Ich komme aus ${state.ort}.`);
    if (state.goals.size) parts.push(`Mir geht's gerade vor allem um: ${[...state.goals].join(", ")}.`);
    parts.push(`Am liebsten würde ich ${MODE_PHRASE[state.mode]}.`);
    return parts.join(" ");
  };

  const refresh = () => {
    waButton.href = waLink(buildMessage());
  };

  // Frage 1: Ort — Einfachauswahl, nochmal tippen wählt ab
  ortChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const ort = chip.dataset.ort;
      const wasActive = chip.classList.contains("is-active");
      ortChips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      state.ort = wasActive ? "" : ort;
      if (!wasActive) {
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
      }
      refresh();
    });
  });

  // Frage 2: Ziele — Mehrfachauswahl
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

  // Frage 3: Gesprächsform — Einfachauswahl mit Default
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
