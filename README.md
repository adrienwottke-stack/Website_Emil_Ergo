# Emil und sein Team — Weiter. Zusammen.

Statische Editorial-Website für Emil und sein Team in Dresden und Leipzig. Die Startseite erzählt zuerst von Team, Entwicklung und gemeinsamer Verantwortung. Die konkrete Tätigkeit in Finanzen, Absicherung und Beratung wird beim Kennenlernen eingeordnet.

## Stack

- Vite als statischer Multi-Page-Build
- lokale variable Schriften: Archivo und Inter
- semantisches HTML, native Scrollbedienung, scrollgesteuerte Typografiemaske und kleine IntersectionObserver-Reveals
- eigenständiger Zinsrechner ohne Datenspeicherung
- WhatsApp-Nachrichtenvorbereitung ohne Formular-Backend

## Lokale Entwicklung

```bash
npm install
npm run dev
npm run build
npm run preview
```

Der Produktionsbuild liegt in `dist/`. Direkte Einstiege bestehen für `/`, `/rechner.html`, `/impressum.html`, `/datenschutz.html` und `/erstinformation.html`.

## Inhalt und Konfiguration

`src/config.js` ist die zentrale Quelle für WhatsApp, E-Mail, Instagram und die bestätigten Standorte. Ungültige oder erkennbare Platzhalterwerte werden in der Oberfläche nicht verlinkt. Die Kontaktaktion bleibt bis zur Ergänzung echter Daten sichtbar, aber deaktiviert.

Der Einstieg „The Life of Emil“ verwendet auf ausdrücklichen Wunsch den vorhandenen Emil-Clip `public/assets/video/hero-placeholder.mp4` mit seinem Poster. Die übrigen früheren Platzhaltervideos werden nicht geladen. Herkunft und Veröffentlichungserlaubnis des Hero-Clips müssen vor dem Livegang bestätigt oder der Clip unter demselben Pfad durch freigegebenes Material ersetzt werden.

## Veröffentlichung

Vor einer Veröffentlichung ist [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) vollständig abzuarbeiten. Dazu gehören vor allem echte Kontaktdaten, vollständige Pflichtangaben, Aufnahmefreigaben, die zwei zentralen Teammotive und ein belegbarer Datenstand des Rechners.

## Rechner

`src/js/msci-data.js` enthält eine hinterlegte Jahresreihe für einen historischen Vergleich. Die Berechnung ist eine Modellrechnung mit nachschüssiger monatlicher Einzahlung und nominalem Monatszins. Datenherkunft und Aktualität müssen vor Veröffentlichung anhand einer belastbaren Primärquelle dokumentiert werden.
