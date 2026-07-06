/* =========================================================================
   MSCI World Net Total Return in EUR — Jahresrenditen (Kalenderjahre)
   Quelle: MSCI (Net-Total-Return-Index in EUR), verifiziert Jul 2026.
   Nur verifizierte Jahre einbetten — der Real-Check und die
   Ø-Rendite-Aussage auf der Seite rechnen live aus dieser Serie.
   ========================================================================= */
export const MSCI_WORLD_EUR = [
  { year: 2012, r: 14.05 },
  { year: 2013, r: 21.20 },
  { year: 2014, r: 19.50 },
  { year: 2015, r: 10.42 },
  { year: 2016, r: 10.73 },
  { year: 2017, r: 7.51 },
  { year: 2018, r: -4.11 },
  { year: 2019, r: 30.02 },
  { year: 2020, r: 6.33 },
  { year: 2021, r: 31.07 },
  { year: 2022, r: -12.78 },
  { year: 2023, r: 19.60 },
  { year: 2024, r: 26.60 },
  { year: 2025, r: 6.77 },
];

/** Annualisierte Rendite (CAGR) der eingebetteten Serie in % p. a. */
export function msciCagr() {
  const growth = MSCI_WORLD_EUR.reduce((acc, { r }) => acc * (1 + r / 100), 1);
  return (Math.pow(growth, 1 / MSCI_WORLD_EUR.length) - 1) * 100;
}

/**
 * Real-Check: monatliche Sparrate über die echte Serie laufen lassen.
 * Nachschüssige monatliche Einzahlung, Monatsrendite aus Jahresrendite
 * geometrisch abgeleitet. Liefert { total, paid }.
 */
export function msciBacktest(monthly) {
  let total = 0;
  let paid = 0;
  for (const { r } of MSCI_WORLD_EUR) {
    const im = Math.pow(1 + r / 100, 1 / 12) - 1;
    for (let m = 0; m < 12; m++) {
      total = total * (1 + im) + monthly;
      paid += monthly;
    }
  }
  return { total, paid };
}

export const MSCI_FIRST_YEAR = MSCI_WORLD_EUR[0].year;
export const MSCI_LAST_YEAR = MSCI_WORLD_EUR[MSCI_WORLD_EUR.length - 1].year;
