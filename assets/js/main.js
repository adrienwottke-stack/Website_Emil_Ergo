/* =========================================================================
   ERGO PREMIUM · main.js
   Vanilla JS — no dependencies. Everything animates via transform/opacity.
   ========================================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     Formatting helpers (de-DE)
     --------------------------------------------------------------------- */
  const eur0 = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const eurShort = (v) => {
    if (v >= 1000000) return (v / 1000000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Mio";
    if (v >= 1000) return Math.round(v / 1000) + " Tsd";
    return Math.round(v).toString();
  };
  const num = new Intl.NumberFormat("de-DE");

  /* ---------------------------------------------------------------------
     Navbar scroll state + mobile menu
     --------------------------------------------------------------------- */
  const nav = $("#nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle");
  const menu = $("#mobileMenu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------------- */
  const revealEls = $$("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     Count-up (stats + calculator result)
     --------------------------------------------------------------------- */
  function animateNumber(el, to, { duration = 1400, fmt = (v) => Math.round(v).toString(), from = 0 } = {}) {
    if (prefersReduced) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = fmt(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Stat counters fire when scrolled into view
  const counters = $$("[data-count]");
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      animateNumber(el, to, {
        duration: 1600,
        fmt: (v) => num.format(Number(v.toFixed(decimals))) + suffix,
      });
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => counterIO.observe(el));

  /* =====================================================================
     WEALTH CALCULATOR (Zinseszins-Sparplan)
     ===================================================================== */
  const calc = (() => {
    const controls = {
      start:  { kind: "money", slider: $("#s-start"),  input: $("#i-start"),  min: 0,  max: 100000 },
      rate:   { kind: "money", slider: $("#s-rate"),   input: $("#i-rate"),   min: 0,  max: 2000 },
      years:  { kind: "int",   slider: $("#s-years"),  input: $("#i-years"),  min: 1,  max: 40 },
      yield:  { kind: "float", slider: $("#s-yield"),  input: $("#i-yield"),  min: 0,  max: 10 },
    };
    if (!controls.start.slider) return null;

    const out = {
      amount: $("#r-amount"),
      paid:   $("#r-paid"),
      gain:   $("#r-gain"),
    };
    const chart = $("#chart");
    const tip = $("#chartTip");

    let prevTotal = 0;
    let series = { years: [], paid: [], total: [] };

    /* --- Finance math: monthly compounding, contribution at month end --- */
    function compute(start, monthly, years, annualYieldPct) {
      const i = annualYieldPct / 100 / 12;
      const pts = { years: [], paid: [], total: [] };
      for (let y = 0; y <= years; y++) {
        const m = y * 12;
        let total;
        if (i === 0) total = start + monthly * m;
        else total = start * Math.pow(1 + i, m) + monthly * ((Math.pow(1 + i, m) - 1) / i);
        const paid = start + monthly * m;
        pts.years.push(y);
        pts.paid.push(paid);
        pts.total.push(total);
      }
      return pts;
    }

    /* --- SVG chart rendering --- */
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

      // y gridlines (4)
      let grid = "";
      for (let g = 0; g <= 4; g++) {
        const val = (maxV * g) / 4;
        const yy = y(val).toFixed(1);
        grid += `<line x1="${PAD.l}" y1="${yy}" x2="${CW - PAD.r}" y2="${yy}" class="grid"/>`;
        grid += `<text x="${PAD.l - 8}" y="${(+yy + 4).toFixed(1)}" class="axis-y" text-anchor="end">${eurShort(val)}</text>`;
      }

      // x labels (start, mid, end)
      const xlabels = [0, Math.round(nY / 2), nY].map((idx) =>
        `<text x="${x(idx).toFixed(1)}" y="${CH - 8}" class="axis-x" text-anchor="middle">${pts.years[idx]} J.</text>`
      ).join("");

      const totalArea = areaPath(pts.total);
      const totalLine = linePath(pts.total);
      const paidLine = linePath(pts.paid);

      chart.innerHTML = `
        <defs>
          <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#D4B86C" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="#D4B86C" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <g class="grids">${grid}</g>
        <path d="${totalArea}" fill="url(#gArea)" class="area"/>
        <path d="${paidLine}" fill="none" class="line-paid"/>
        <path d="${totalLine}" fill="none" class="line-total"/>
        <g class="xlabels">${xlabels}</g>
        <circle r="5.5" class="cursor-dot" style="opacity:0"/>
        <rect x="${PAD.l}" y="${PAD.t}" width="${plotW}" height="${plotH}" fill="transparent" class="hit"/>
      `;

      const totalEl = chart.querySelector(".line-total");
      const areaEl = chart.querySelector(".area");
      const paidEl = chart.querySelector(".line-paid");
      if (animate && !prefersReduced) {
        const len = totalEl.getTotalLength();
        [totalEl, paidEl].forEach((p) => {
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

      // interaction
      const dot = chart.querySelector(".cursor-dot");
      const hit = chart.querySelector(".hit");
      const moveTip = (clientX) => {
        const rect = chart.getBoundingClientRect();
        const scale = CW / rect.width;
        let px = (clientX - rect.left) * scale;
        px = Math.max(PAD.l, Math.min(CW - PAD.r, px));
        const idx = Math.round(((px - PAD.l) / plotW) * nY);
        const cx = x(idx), cy = y(pts.total[idx]);
        dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.style.opacity = "1";
        tip.style.left = (cx / scale) + "px";
        tip.style.top = (cy / scale) + "px";
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
        start: clamp(controls.start.input.value, controls.start),
        rate: clamp(controls.rate.input.value, controls.rate),
        years: clamp(controls.years.input.value, controls.years),
        yield: clampFloat(controls.yield.input.value, controls.yield),
      };
    }
    // Strip thousand separators / currency symbols before parsing integers
    function clamp(v, c) { v = parseInt(String(v).replace(/[^\d-]/g, ""), 10); if (isNaN(v)) v = c.min; return Math.max(c.min, Math.min(c.max, v)); }
    function clampFloat(v, c) { v = parseFloat(String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0; return Math.max(c.min, Math.min(c.max, v)); }
    function fmtControl(c, val) {
      if (c.kind === "money") return num.format(val);
      if (c.kind === "float") return String(Number(val.toFixed(1))).replace(".", ",");
      return String(val);
    }

    function update(animateChart) {
      const v = readValues();
      series = compute(v.start, v.rate, v.years, v.yield);
      const total = series.total[series.total.length - 1];
      const paid = series.paid[series.paid.length - 1];
      const gain = total - paid;

      animateNumber(out.amount, total, { from: prevTotal, duration: 700, fmt: (x) => eur0.format(x) });
      animateNumber(out.paid, paid, { from: 0, duration: 500, fmt: (x) => eur0.format(x) });
      animateNumber(out.gain, gain, { from: 0, duration: 500, fmt: (x) => eur0.format(x) });
      prevTotal = total;

      renderChart(series, animateChart);
    }

    // Sync slider <-> number input for each control
    Object.values(controls).forEach((c) => {
      const parse = (raw) => (c.kind === "float" ? clampFloat(raw, c) : clamp(raw, c));
      // Dragging the slider updates + reformats the number field
      c.slider.addEventListener("input", () => {
        c.input.value = fmtControl(c, parse(c.slider.value));
        update(false);
      });
      // Typing moves the slider but leaves the raw text alone until blur
      c.input.addEventListener("input", () => {
        c.slider.value = parse(c.input.value);
        update(false);
      });
      // On blur, normalise the displayed value (thousand separators / comma)
      c.input.addEventListener("blur", () => {
        const val = parse(c.input.value);
        c.input.value = fmtControl(c, val);
        c.slider.value = val;
        update(false);
      });
    });

    // First render when scrolled into view (animated)
    let didFirst = false;
    const calcIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !didFirst) { didFirst = true; update(true); calcIO.disconnect(); }
      });
    }, { threshold: 0.35 });
    calcIO.observe(chart);
    // compute silently so numbers exist even before scroll
    update(false);

    return { update };
  })();

  /* =====================================================================
     CONTACT FORM — inline validation + success state
     ===================================================================== */
  const form = $("#contactForm");
  if (form) {
    const showError = (group, msg) => {
      group.classList.add("invalid");
      const e = group.querySelector(".error-msg");
      if (e) e.textContent = msg;
    };
    const clearError = (group) => { group.classList.remove("invalid"); const e = group.querySelector(".error-msg"); if (e) e.textContent = ""; };

    const validators = {
      name: (v) => v.trim().length >= 2 || "Bitte gib deinen Namen ein.",
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Bitte gib eine gültige E-Mail-Adresse ein.",
      message: (v) => v.trim().length >= 10 || "Bitte beschreibe dein Anliegen kurz (mind. 10 Zeichen).",
    };

    // Validate on blur
    $$("[data-validate]", form).forEach((field) => {
      field.addEventListener("blur", () => {
        const key = field.dataset.validate;
        const res = validators[key](field.value);
        const group = field.closest(".form-group");
        if (res === true) clearError(group); else showError(group, res);
      });
      field.addEventListener("input", () => {
        const group = field.closest(".form-group");
        if (group.classList.contains("invalid")) {
          const res = validators[field.dataset.validate](field.value);
          if (res === true) clearError(group);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;
      $$("[data-validate]", form).forEach((field) => {
        const res = validators[field.dataset.validate](field.value);
        const group = field.closest(".form-group");
        if (res === true) clearError(group);
        else { showError(group, res); if (!firstInvalid) firstInvalid = field; }
      });
      const consent = $("#consent");
      const consentGroup = consent.closest(".consent");
      if (!consent.checked) { consentGroup.style.color = "#F0A0AA"; if (!firstInvalid) firstInvalid = consent; }
      else consentGroup.style.color = "";

      if (firstInvalid) { firstInvalid.focus(); return; }

      // Success (no backend wired — see README for Formspree/mailto setup)
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Wird gesendet …";
      setTimeout(() => {
        form.querySelector(".form__fields").style.display = "none";
        $("#formSuccess").classList.add("show");
      }, prefersReduced ? 0 : 650);
    });
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  const yEl = $("#year");
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Dresden video — click to play (nothing loads until the user asks)
     --------------------------------------------------------------------- */
  const dVideo = $("#dresdenVideo");
  const dPlay = $("#dresdenPlay");
  const dFeat = $("#dresdenFeat");
  if (dVideo && dPlay) {
    dPlay.addEventListener("click", () => {
      if (!dVideo.src) dVideo.src = "assets/dresden-hero-web.mp4";
      dVideo.setAttribute("controls", "");
      dFeat.classList.add("playing");
      dPlay.style.display = "none";
      const p = dVideo.play();
      if (p && p.catch) p.catch(() => {});
    });
  }

  /* ---------------------------------------------------------------------
     Subtle hero parallax (skyline) — reduced-motion aware
     --------------------------------------------------------------------- */
  const skyline = $(".hero__skyline");
  if (skyline && !prefersReduced) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        skyline.style.transform = `translateY(${y * 0.12}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Magnetic gold buttons — pointer-fine devices, motion allowed only
     --------------------------------------------------------------------- */
  if (!prefersReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const MAX = 10; // px — keep the pull a whisper, not a leap
    const cap = (v) => Math.max(-MAX, Math.min(MAX, v));
    $$(".btn--gold:not(.btn--full)").forEach((btn) => {
      const strength = 0.3;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = cap((e.clientX - (r.left + r.width / 2)) * strength);
        const my = cap((e.clientY - (r.top + r.height / 2)) * strength);
        btn.style.transform = `translate(${mx.toFixed(1)}px, ${(my - 2).toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }
})();
