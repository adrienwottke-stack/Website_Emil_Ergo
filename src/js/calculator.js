/* =========================================================================
   EMIL · Rechenbeispiel (MSCI World)
   Portiert aus dem Alt-Repo: nachschüssige monatliche Verzinsung + SVG-Chart.
   Neu: 4-Schritte-UI, Rendite-Presets, FOMO-Reframe ("Warten kostet"),
   Real-Check über die echte MSCI-World-Serie 2012–2025.
   ========================================================================= */
import { msciBacktest, MSCI_FIRST_YEAR, MSCI_LAST_YEAR } from "./msci-data.js";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const eur0 = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("de-DE");
const eurShort = (v) => {
  if (v >= 1000000) return (v / 1000000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Mio";
  if (v >= 1000) return Math.round(v / 1000) + " Tsd";
  return Math.round(v).toString();
};

function animateNumber(el, to, { duration = 700, fmt = (v) => Math.round(v).toString(), from = 0 } = {}) {
  if (prefersReduced) { el.textContent = fmt(to); return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Finanzmathematik: monatliche Verzinsung, Einzahlung am Monatsende */
function compute(monthly, years, annualYieldPct) {
  const i = annualYieldPct / 100 / 12;
  const pts = { years: [], paid: [], total: [] };
  for (let y = 0; y <= years; y++) {
    const m = y * 12;
    let total;
    if (i === 0) total = monthly * m;
    else total = monthly * ((Math.pow(1 + i, m) - 1) / i);
    pts.years.push(y);
    pts.paid.push(monthly * m);
    pts.total.push(total);
  }
  return pts;
}

export function initCalculator() {
  const chart = $("#chart");
  if (!chart) return;
  const tip = $("#chartTip");

  const controls = {
    rate: { slider: $("#s-rate"), input: $("#i-rate"), min: 10, max: 500 },
    years: { slider: $("#s-years"), input: $("#i-years"), min: 5, max: 40 },
  };
  const out = { amount: $("#r-amount"), paid: $("#r-paid"), gain: $("#r-gain"), fomo: $("#r-fomo") };
  const yieldLabel = $("#v-yield");
  let yieldPct = 12;
  let prevTotal = 0;

  const clamp = (v, c) => {
    v = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
    if (isNaN(v)) v = c.min;
    return Math.max(c.min, Math.min(c.max, v));
  };

  const setFill = (c) => {
    const pct = ((c.slider.value - c.min) / (c.max - c.min)) * 100;
    c.slider.style.setProperty("--fill", pct + "%");
  };

  /* --- SVG-Chart (portiert, Farben via CSS-Klassen) --- */
  const CW = 560, CH = 300, PAD = { t: 16, r: 12, b: 30, l: 46 };
  const plotW = CW - PAD.l - PAD.r;
  const plotH = CH - PAD.t - PAD.b;

  function renderChart(pts, animate) {
    const maxV = Math.max(pts.total[pts.total.length - 1], 1);
    const nY = pts.years.length - 1;
    const x = (idx) => PAD.l + (plotW * idx) / Math.max(nY, 1);
    const y = (val) => PAD.t + plotH - (plotH * val) / maxV;

    const linePath = (arr) => arr.map((v, idx) => (idx === 0 ? "M" : "L") + x(idx).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
    const areaPath = (arr) => linePath(arr) + ` L${x(nY).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;

    let grid = "";
    for (let g = 0; g <= 4; g++) {
      const val = (maxV * g) / 4;
      const yy = y(val).toFixed(1);
      grid += `<line x1="${PAD.l}" y1="${yy}" x2="${CW - PAD.r}" y2="${yy}" class="grid"/>`;
      grid += `<text x="${PAD.l - 8}" y="${(+yy + 4).toFixed(1)}" class="axis-y" text-anchor="end">${eurShort(val)}</text>`;
    }
    const xlabels = [0, Math.round(nY / 2), nY].map((idx) =>
      `<text x="${x(idx).toFixed(1)}" y="${CH - 8}" class="axis-x" text-anchor="middle">${pts.years[idx]} J.</text>`
    ).join("");

    chart.innerHTML = `
      <defs>
        <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C9A75A" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#C9A75A" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <g class="grids">${grid}</g>
      <path d="${areaPath(pts.total)}" fill="url(#gArea)" class="area"/>
      <path d="${linePath(pts.paid)}" fill="none" class="line-paid"/>
      <path d="${linePath(pts.total)}" fill="none" class="line-total"/>
      <g class="xlabels">${xlabels}</g>
      <circle r="5.5" class="cursor-dot" style="opacity:0"/>
      <rect x="${PAD.l}" y="${PAD.t}" width="${plotW}" height="${plotH}" fill="transparent" class="hit"/>
    `;

    if (animate && !prefersReduced) {
      const areaEl = chart.querySelector(".area");
      chart.querySelectorAll(".line-total, .line-paid").forEach((p) => {
        const l = p.getTotalLength();
        p.style.strokeDasharray = l;
        p.style.strokeDashoffset = l;
        p.getBoundingClientRect();
        p.style.transition = "stroke-dashoffset 1100ms cubic-bezier(.16,1,.3,1)";
        p.style.strokeDashoffset = "0";
      });
      areaEl.style.opacity = "0";
      areaEl.getBoundingClientRect();
      areaEl.style.transition = "opacity 900ms ease 250ms";
      areaEl.style.opacity = "1";
    }

    const dot = chart.querySelector(".cursor-dot");
    const hit = chart.querySelector(".hit");
    const moveTip = (clientX) => {
      const rect = chart.getBoundingClientRect();
      const scale = CW / rect.width;
      let px = (clientX - rect.left) * scale;
      px = Math.max(PAD.l, Math.min(CW - PAD.r, px));
      const idx = Math.round(((px - PAD.l) / plotW) * nY);
      const cx = x(idx), cy = y(pts.total[idx]);
      dot.setAttribute("cx", cx);
      dot.setAttribute("cy", cy);
      dot.style.opacity = "1";
      tip.style.left = cx / scale + "px";
      tip.style.top = cy / scale + "px";
      tip.innerHTML = `<span class="yr">Jahr ${pts.years[idx]}</span><br><b>${eur0.format(pts.total[idx])}</b><br>eingezahlt ${eur0.format(pts.paid[idx])}`;
      tip.classList.add("show");
    };
    const hideTip = () => { tip.classList.remove("show"); dot.style.opacity = "0"; };
    hit.addEventListener("mousemove", (e) => moveTip(e.clientX));
    hit.addEventListener("mouseleave", hideTip);
    hit.addEventListener("touchstart", (e) => moveTip(e.touches[0].clientX), { passive: true });
    hit.addEventListener("touchmove", (e) => moveTip(e.touches[0].clientX), { passive: true });
    hit.addEventListener("touchend", hideTip);
  }

  function readValues() {
    return {
      rate: clamp(controls.rate.input.value, controls.rate),
      years: clamp(controls.years.input.value, controls.years),
    };
  }

  function update(animateChart) {
    const v = readValues();
    const series = compute(v.rate, v.years, yieldPct);
    const total = series.total[series.total.length - 1];
    const paid = series.paid[series.paid.length - 1];

    animateNumber(out.amount, total, { from: prevTotal, duration: 700, fmt: (x) => eur0.format(x) });
    animateNumber(out.paid, paid, { duration: 500, fmt: (x) => eur0.format(x) });
    animateNumber(out.gain, total - paid, { duration: 500, fmt: (x) => eur0.format(x) });
    prevTotal = total;

    renderChart(series, animateChart);

    // FOMO-Reframe: Warten kostet + Real-Check mit echten Jahresrenditen
    const lateSeries = compute(v.rate, Math.max(v.years - 5, 0), yieldPct);
    const lateTotal = lateSeries.total[lateSeries.total.length - 1];
    const waitCost = total - lateTotal;
    const real = msciBacktest(v.rate);
    out.fomo.innerHTML =
      `<b>Warten kostet:</b> Startest du erst in 5 Jahren, fehlen dir am Ende ≈ ${eur0.format(waitCost)}.<br>` +
      `<b>Real-Check:</b> ${num.format(v.rate)} €/Monat seit ${MSCI_FIRST_YEAR} mit den echten MSCI-World-Jahresrenditen ` +
      `(bis ${MSCI_LAST_YEAR}) wären heute ≈ ${eur0.format(real.total)} — eingezahlt: ${eur0.format(real.paid)}.`;
  }

  // Slider ↔ Eingabefeld synchron halten
  Object.values(controls).forEach((c) => {
    setFill(c);
    c.slider.addEventListener("input", () => {
      c.input.value = num.format(clamp(c.slider.value, c));
      setFill(c);
      update(false);
    });
    c.input.addEventListener("input", () => {
      c.slider.value = clamp(c.input.value, c);
      setFill(c);
      update(false);
    });
    c.input.addEventListener("blur", () => {
      const val = clamp(c.input.value, c);
      c.input.value = num.format(val);
      c.slider.value = val;
      setFill(c);
      update(false);
    });
  });

  // Rendite-Presets
  $$(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".preset").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      yieldPct = parseFloat(btn.dataset.yield);
      yieldLabel.innerHTML = `${num.format(yieldPct)}&nbsp;%`;
      update(false);
    });
  });

  // Erste animierte Berechnung, sobald der Chart sichtbar wird
  let didFirst = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !didFirst) {
        didFirst = true;
        update(true);
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(chart);
  update(false);
}
