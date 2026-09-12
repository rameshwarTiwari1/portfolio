/**
 * Colour helpers that run inside the page.
 *
 * Parsing `getComputedStyle().color` in Node does not work: Chrome returns
 * `lab(...)`, `oklch(...)` or `color(srgb ...)` depending on how the value was
 * authored. Painting the colour onto a 1×1 canvas and reading the pixel back
 * normalises every syntax to bytes, with no parser to keep up to date.
 */
export const CONTRAST_HELPERS = `
  const __cv = document.createElement("canvas");
  __cv.width = 1; __cv.height = 1;
  const __ctx = __cv.getContext("2d", { willReadFrequently: true });

  function toRgb(css) {
    __ctx.clearRect(0, 0, 1, 1);
    __ctx.fillStyle = "#000";
    __ctx.fillStyle = css;
    __ctx.fillRect(0, 0, 1, 1);
    const d = __ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }

  function luminance([r, g, b]) {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function contrast(fg, bg) {
    const a = luminance(fg);
    const b = luminance(bg);
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  }

  /** First opaque background walking up the tree. */
  function backgroundOf(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = toRgb(getComputedStyle(node).backgroundColor);
      if (c[3] >= 0.99) return c;
      node = node.parentElement;
    }
    return toRgb(getComputedStyle(document.body).backgroundColor);
  }
`;
