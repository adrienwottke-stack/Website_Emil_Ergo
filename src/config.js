/* =========================================================================
   EMIL · Zentrale Platzhalter-Konfiguration
   Adrien: Vor Livegang NUR diese Datei mit echten Daten füllen —
   alle Stellen auf der Seite ziehen sich die Werte von hier.
   ========================================================================= */
export const CONFIG = {
  // WhatsApp im internationalen Format ohne "+" und ohne Leerzeichen,
  // z. B. "4915112345678"  — [Platzhalter]
  whatsappNumber: "49XXXXXXXXXXX",

  // Instagram — [Platzhalter]
  instagramHandle: "@[instagram-handle]",
  instagramUrl: "https://instagram.com/PLATZHALTER_INSTAGRAM",

  // Kontakt — [Platzhalter]
  email: "PLATZHALTER@MAIL.DE",

  // Standorte für Karte + Liste (echte Lon/Lat — Pins werden automatisch
  // auf die Bundesländer-Karte projiziert; einfach Städte ergänzen).
  // primary = Home Base (Puls + Label immer sichtbar) · above/below/labelDx/
  // labelDy steuern die Label-Position · soon = gestrichelter Zukunfts-Pin.
  locations: [
    { name: "Dresden", sub: "Home Base", lon: 13.7373, lat: 51.0504, primary: true, above: true },
    { name: "Leipzig", sub: "Standort", lon: 12.3731, lat: 51.3397, above: true },
    { name: "Hamburg", sub: "Standort", lon: 9.9937, lat: 53.5511 },
    { name: "Bremen", sub: "Standort", lon: 8.8017, lat: 53.0793 },
    { name: "Oldenburg", sub: "Standort", lon: 8.2146, lat: 53.1435, above: true },
    { name: "Hannover", sub: "Standort", lon: 9.732, lat: 52.3759 },
    { name: "Berlin", sub: "Standort", lon: 13.405, lat: 52.52 },
    { name: "Magdeburg", sub: "Standort", lon: 11.6276, lat: 52.1205 },
    { name: "Jena", sub: "Standort", lon: 11.5892, lat: 50.9271 },
    { name: "Zwickau", sub: "Standort", lon: 12.4961, lat: 50.7189, below: true },
    { name: "Görlitz", sub: "Standort", lon: 14.9872, lat: 51.1524, labelDx: -12, labelDy: 14 },
    { name: "[Dein Standort?]", sub: "bald — vielleicht mit dir", lon: 12.1405, lat: 54.0924, soon: true, above: true },
  ],
};
