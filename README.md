# Emil · Recruiting-First Personal Brand — Dresden & Leipzig

Cineastischer One-Pager für „Emil“: **Recruiting zuerst** (≈80 %), Klienten subtil (≈20 %).
Beige · Navy · Gold, Scroll-Scrub-Videos, MSCI-World-Rechenbeispiel, WhatsApp-First-Buchung.

**Harte Leitplanken:** Kein „ERGO“, kein „Versicherung“, keine Vanity-Statistiken auf der
Marketing-Fläche — Pflichtangaben leben nur auf den `noindex`-Rechtsseiten. Durchgängig **DU**.

## Stack

- [Vite](https://vitejs.dev) (Multi-Page: `index` + 3 Rechtsseiten) → statisches `dist/` für **Cloudflare Pages**
- [GSAP + ScrollTrigger](https://gsap.com) (Scroll-Scrub, Pins) · [Lenis](https://lenis.darkroom.engineering) (Smooth-Scroll)
- Fonts **lokal** via Fontsource (Fraunces · Inter · Archivo) — kein Google-CDN, DSGVO-sauber

## Entwickeln

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # Production-Build lokal testen
```

## Struktur

```
index.html               ← One-Pager (11 Sektionen)
impressum.html           ← noindex
datenschutz.html         ← noindex
erstinformation.html     ← noindex (einzige ERGO-Nennung, § 15 VersVermV)
src/
  config.js              ← ALLE Platzhalter zentral (WhatsApp, Instagram, E-Mail, Standorte)
  main.js / legal.js     ← Entries
  styles/                ← tokens · base · components · sections · legal
  js/                    ← scroll · scrub · calculator · msci-data · map · whatsapp
public/assets/
  img/                   ← echte Fotos (founder, team) + Ambient-Stills
  video/                 ← Platzhalter-Loops mit FIXEN Dateinamen (s. unten)
```

## ✅ Vor dem Livegang (Adrien)

1. **`src/config.js` füllen:** WhatsApp-Nummer, Instagram, E-Mail, Standorte.
2. **Videos 1:1 tauschen** (Dateiname beibehalten, Code bleibt unverändert):

| Slot | Datei | Später |
|---|---|---|
| Hero-Scrub | `public/assets/video/hero-placeholder.mp4` + `hero-poster.jpg` | echtes Emil/Team-Clip |
| Intro | `public/assets/video/intro-placeholder.mp4` + `intro-poster.jpg` | echtes Handy-Video (9:16) |
| Team-Scrub | `public/assets/video/team-placeholder.mp4` + `team-poster.jpg` | echtes Team-Footage |
| Finale-Scrub | `public/assets/video/finale-placeholder.mp4` + `finale-poster.jpg` | Galerie/Hero-Pose |

3. **Echte Stimmen** in Sektion „Erfolgsgeschichten“ (nur freigegebene Zitate!).
4. **Rechtsseiten**: alle `[Platzhalter]` ersetzen + anwaltlich prüfen lassen.
5. **`[Emil]`/Namens-Platzhalter** in `index.html` durch echten Namen ersetzen.

## Deployment (Cloudflare Pages)

Build-Command `npm run build`, Output-Verzeichnis `dist`. Fertig — keine Env-Vars nötig.

## Daten-Herkunft Rechner

`src/js/msci-data.js`: MSCI World **Net Total Return in EUR**, Jahresrenditen **2012–2025**
(verifiziert; Ø ≈ 12,7 % p. a.). Real-Check & Ø-Aussagen rechnen live aus dieser Serie.
Label „Unverbindliches Rechenbeispiel“ bleibt Pflicht.
