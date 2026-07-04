# Alexander Reinhardt · Finanzberatung Dresden

Elegante, statische One-Page-Website für einen selbstständigen Finanz- & Vorsorgeberater
(Partner der ERGO) in Dresden. Bordeaux/Gold-Design, hochwertige Animationen, Zinseszins-Rechner.

**Kein Build nötig.** Reines HTML/CSS/JS — einfach hochladen und fertig.

```
Website-Ergo-Premium/
├── index.html                 ← die komplette Seite
├── assets/
│   ├── css/styles.css         ← Design-System & Layout
│   ├── js/main.js             ← Nav, Scroll-Reveal, Rechner, Formular
│   └── img/                   ← hier deine Fotos ablegen (siehe unten)
└── README.md
```

## Lokal ansehen

Wegen der Animationen (IntersectionObserver, `fetch`-freie Logik) läuft alles auch per Doppelklick
auf `index.html`. Sauberer ist ein kleiner lokaler Server:

```powershell
# Variante 1: mit installiertem Node
npx serve .

# Variante 2: mit Python
py -m http.server 8080
# → http://localhost:8080
```

---

## ✅ Was du VOR dem Livegang ersetzen musst

Der Vorname **Emil** ist überall eingesetzt (Monogramm „E"). Offen sind nur noch Nachname
und echte Kontaktdaten — Platzhalter sind so benannt, dass du sie per Suchen-&-Ersetzen findest.

| Platzhalter | Wo | Ersetzen durch |
|---|---|---|
| `Emil` | überall | ggf. voller Name (Vor- + Nachname) |
| `kontakt@emil-finanz.de` | Kontakt, `mailto:` | **echte E-Mail** (Domain noch geraten!) |
| `+49 351 000 000 0` | Kontakt, Footer-`tel:` | echte Telefonnummer |
| `Musterstraße 1, 01067 Dresden` | Kontakt | echte Büroadresse |
| Kennzahlen im Hero (`12` Jahre, `450+`, `4,9`, `100%`) | `data-count`-Werte in `index.html` | deine echten Zahlen |
| Referenzen / Testimonials | Sektion „Stimmen meiner Mandanten“ | **echte, freigegebene** Zitate |

### Bilder & Video (liegen bereits in `assets/`)

Echte Assets sind eingebunden: `hero-bg.jpg` (Hero, KI-Badge weggeschnitten, aus `Hero.png`),
`founder-smiling.jpg` (Über mich), `mirror-selfie-1.jpg` (Inset), `team-mirror.jpg` +
`team-couch.jpg` (Personal-Band), `dresden-hero.jpg` (Dresden) und `dresden-hero.mp4` (Video).

> **Video:** Das 130-MB-Original (`dresden-hero.mp4`, 6:19 min, 1080p) bleibt lokal und ist per
> `.gitignore` vom Repo ausgeschlossen. Deployt & referenziert wird die komprimierte Web-Version
> **`dresden-hero-web.mp4` (~22 MB, 720p, ohne Ton)** – erstellt mit:
> ```bash
> ffmpeg -i dresden-hero.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 30 -preset medium -an -movflags +faststart dresden-hero-web.mp4
> ```
> Sie lädt weiterhin erst per Klick (Poster = Dresden-Foto, `preload="none"`) und streamt dank
> `faststart` progressiv. Wer eine leichtere Loop möchte, kann den Clip vorher kürzen (`-t 30`).
> Optional: `Hero.png` (18,9 MB Original) kann gelöscht werden – genutzt wird `hero-bg.jpg`.

---

## 📨 Kontaktformular scharf schalten

Aktuell zeigt das Formular nach dem Absenden nur eine Erfolgsmeldung (kein Versand).
Zwei einfache Wege, echte Nachrichten zu empfangen:

**A) Formspree (empfohlen, kostenlos für kleine Mengen)**
1. Konto auf [formspree.io](https://formspree.io) anlegen, Formular-ID kopieren.
2. In `index.html` das `<form id="contactForm" novalidate>` ergänzen:
   `action="https://formspree.io/f/DEINE_ID" method="POST"`
3. In `assets/js/main.js` im `submit`-Handler den `setTimeout(...)`-Block durch ein
   `fetch(form.action, { method:'POST', body:new FormData(form), headers:{Accept:'application/json'} })`
   ersetzen (Erfolg → `#formSuccess` einblenden).

**B) Ohne Backend:** Den Submit-Button durch einen `mailto:`-Link ersetzen.
Weniger komfortabel, aber ohne Drittanbieter.

---

## ⚖️ Pflicht vor Veröffentlichung (Deutschland)

- **Impressum** (§ 5 DDG/TMG) — Anker `#impressum` ist vorhanden, Inhalt noch leer.
- **Datenschutzerklärung** (DSGVO) — Anker `#datenschutz`, inkl. Hinweis zu Google Fonts
  (werden aktuell von Google geladen; für volle DSGVO-Konformität ggf. **Fonts lokal hosten** —
  siehe unten).
- **Erstinformation** nach § 15 VersVermV (als Vermittler).
- **ERGO-Freigabe:** Als gebundener/Partner-Vermittler bitte prüfen, ob die ERGO-Compliance
  die Seite freigeben muss, bevor du sie mit ERGO-Bezug veröffentlichst.

### Google Fonts lokal hosten (optional, DSGVO)
Fonts von [google-webfonts-helper](https://gwfh.mranftl.com/fonts) herunterladen
(Cormorant Garamond + IBM Plex Sans), in `assets/fonts/` ablegen, `@font-face` in `styles.css`
ergänzen und den `<link>`-Tag zu Google in `index.html` entfernen.

---

## 🌐 Deployment

Die Seite ist statisch — sie läuft auf jedem Webhosting oder kostenlos bei:

- **Netlify / Vercel:** Ordner per Drag-&-Drop hochladen, fertig.
- **Klassisches Webhosting (Strato, IONOS …):** Inhalt per FTP in den Web-Ordner kopieren.

Eigene Domain (z. B. `reinhardt-finanz.de`) beim Anbieter verbinden.

---

## Design-Referenz

- **Farben:** Bordeaux `#5C182B`/`#7A2036`, Anthrazit `#17100F`, Gold `#C4A052`/`#D4B86C`, Ivory `#FCFAF5`
- **Schrift:** Cormorant Garamond (Headlines) · IBM Plex Sans (Fließtext)
- **Animation:** Scroll-Reveal, Count-up, animiertes SVG-Chart — alle `prefers-reduced-motion`-fest
- **A11y:** Fokus-Ringe, aria-Labels, Kontrast ≥ 4.5:1, Tastaturbedienung, Skip-Link
