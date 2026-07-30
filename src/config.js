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
  // Konzept „Zwei Städte. Der Rest ist Platz.": nur echte Standorte zeigen —
  // neue Städte erst eintragen, wenn es sie wirklich gibt.
  locations: [
    { name: "Dresden", sub: "Home Base", lon: 13.7373, lat: 51.0504, primary: true, above: true },
    { name: "Leipzig", sub: "im Aufbau", lon: 12.3731, lat: 51.3397, above: true },
    { name: "Bald du?", sub: "dein Standort", lon: 12.1405, lat: 54.0924, soon: true, above: true },
  ],
};
