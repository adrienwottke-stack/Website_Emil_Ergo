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

  // Standorte für Karte + Liste (x/y = Koordinaten im 400×520-ViewBox)
  locations: [
    { name: "Dresden", sub: "Home Base", x: 330, y: 269 },
    { name: "Leipzig", sub: "Standort", x: 276, y: 251 },
    { name: "[Dein Standort?]", sub: "bald — vielleicht mit dir", x: 317, y: 179, soon: true },
  ],
};
