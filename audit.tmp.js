/**
 * Deep UI audit: every route, both themes, four viewports.
 *
 * Colour maths runs inside the page via a canvas 2D context, which normalises
 * any CSS colour syntax (lab, oklch, color-mix, rgb) to rgba bytes. Parsing
 * the computed string in Node silently missed everything.
 */
const { chromium } = require("@playwright/test");

const ROUTES = [
  "/",
  "/work",
  "/work/vashix",
  "/work/multi-tenant-enterprise-crm",
  "/work/courier-hub",
  "/work/realtime-task-platform",
  "/engineering",
  "/engineering/postgres-row-level-security-multi-tenant",
  "/engineering/bullmq-redis-background-jobs",
  "/engineering/rag-in-production-pinecone-pgvector",
  "/about",
  "/contact",
  "/this-page-does-not-exist",
];

const VIEWPORTS = [
  { name: "320", w: 320, h: 640 },
  { name: "768", w: 768, h: 900 },
  { name: "1280s", w: 1280, h: 620 },
  { name: "1440", w: 1440, h: 900 },
];

const audit = () => {
  const out = [];
  const canvas = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });

  /** Any CSS colour → [r,g,b,a], via the browser's own parser. */
  const toRgba = (css) => {
    if (!css) return null;
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillStyle = "#000";
    canvas.fillStyle = css;
    const resolved = canvas.fillStyle;
    if (resolved.startsWith("#")) {
      const h = resolved.slice(1);
      const n =
        h.length === 3
          ? h.split("").map((c) => parseInt(c + c, 16))
          : [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
      return [...n, 1];
    }
    const m = resolved.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };

  const lum = ([r, g, b]) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  const contrast = (fg, bg) => {
    const a = lum(fg);
    const b = lum(bg);
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  };

  /** Walk up for the first opaque background, compositing any translucency. */
  const bgOf = (el) => {
    let node = el;
    let acc = null;
    while (node && node !== document.documentElement) {
      const c = toRgba(getComputedStyle(node).backgroundColor);
      if (c && c[3] > 0) {
        acc = acc ? acc : c;
        if (c[3] >= 0.99) return acc[3] >= 0.99 ? acc : c;
      }
      node = node.parentElement;
    }
    return toRgba(getComputedStyle(document.body).backgroundColor) || [0, 0, 0, 1];
  };

  const limit = document.documentElement.clientWidth;

  /* --- page-level overflow ------------------------------------------- */
  if (document.documentElement.scrollWidth > limit + 1) {
    out.push(`page scrolls horizontally: ${document.documentElement.scrollWidth} > ${limit}`);
  }

  const SCROLLERS = ".arch-canvas, .stack-tabs, .diagram-scroll, .shiki, pre, [data-overflow-ok]";
  const seen = new Set();

  for (const el of document.querySelectorAll("body *")) {
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") continue;

    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    const tag = `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0] || "?"}`;

    /* --- element escaping the viewport ------------------------------- */
    if (st.position !== "fixed" && !el.closest(SCROLLERS) && r.right > limit + 1) {
      const key = `overflow|${tag}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(`overflow: ${tag} right=${Math.round(r.right)} > ${limit}`);
      }
    }

    /* --- text clipped by a constrained box --------------------------- */
    if (
      st.overflow === "hidden" &&
      el.scrollHeight > el.clientHeight + 2 &&
      el.clientHeight > 0 &&
      el.textContent.trim() &&
      !el.closest(SCROLLERS) && 
      !el.classList.contains("sr-only")
    ) {
      const key = `clip|${tag}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(`text clipped: ${tag} content ${el.scrollHeight}px in ${el.clientHeight}px`);
      }
    }

    /* --- interactive target too small -------------------------------- */
    const interactive = el.matches("a[href], button, input, select, textarea, [role=tab]");
    if (interactive && !el.closest(".prose, .honeypot") && (r.width < 24 || r.height < 24)) {
      const key = `target|${tag}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(`small target: ${tag} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }

    /* --- contrast ----------------------------------------------------- */
    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
    );
    if (!hasOwnText) continue;

    const fg = toRgba(st.color);
    if (!fg || fg[3] < 0.95) continue;
    const bg = bgOf(el);
    if (!bg) continue;

    const px = parseFloat(st.fontSize);
    const weight = parseInt(st.fontWeight, 10) || 400;
    const large = px >= 24 || (px >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const got = contrast(fg, bg);

    if (got < need) {
      const key = `contrast|${tag}|${Math.round(got * 10)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(
          `contrast ${got.toFixed(2)}:1 (need ${need}) — ${tag} ${st.fontSize}/${weight} "${el.textContent.trim().slice(0, 30)}"`,
        );
      }
    }
  }

  return out;
};

(async () => {
  const browser = await chromium.launch();
  const problems = [];

  for (const theme of ["dark", "light"]) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.w, height: vp.h },
        colorScheme: theme,
      });

      for (const route of ROUTES) {
        const res = await page.goto(`http://127.0.0.1:3100${route}`, {
          waitUntil: "networkidle",
        });
        const expected = route.includes("does-not-exist") ? 404 : 200;
        if (res.status() !== expected) {
          problems.push(`${theme} ${vp.name} ${route} → HTTP ${res.status()}`);
          continue;
        }
        await page.waitForTimeout(450);

        const found = await page.evaluate(audit);
        for (const f of found) problems.push(`${theme} ${vp.name} ${route} → ${f}`);
      }

      await page.close();
    }
  }

  const unique = [...new Set(problems)];
  console.log(`\n===== ${unique.length} PROBLEMS =====`);
  for (const p of unique.slice(0, 60)) console.log(p);
  await browser.close();
})();
