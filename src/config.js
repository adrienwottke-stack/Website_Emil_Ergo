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
  // auf die Bundesländer-Karte projiziert; einfach Städte ergänzen)
  locations: [
    { name: "Dresden", sub: "Home Base", lon: 13.7373, lat: 51.0504 },
    { name: "Leipzig", sub: "Standort", lon: 12.3731, lat: 51.3397, above: true },
    { name: "[Dein Standort?]", sub: "bald — vielleicht mit dir", lon: 13.405, lat: 52.52, soon: true },
  ],
};
