/**
 * Lighthouse against a URL, with no browser extensions in the way.
 *
 * A local Chrome profile with ad blockers and other extensions installed can
 * cost 30+ performance points, so the number DevTools reports in a normal
 * window is not the number real visitors get. This launches a clean instance.
 *
 *   node scripts/lighthouse.mjs [url]
 */
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const url = process.argv[2] ?? "https://rameshwartiwari.vercel.app/";

const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-extensions"],
});

try {
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
  });

  console.log(`\n${url}\n`);
  for (const cat of Object.values(lhr.categories)) {
    console.log(`${cat.title.padEnd(16)} ${Math.round(cat.score * 100)}`);
  }

  // Grouped by category so it is obvious which score each failure feeds.
  for (const cat of Object.values(lhr.categories)) {
    const failing = cat.auditRefs
      .map((ref) => lhr.audits[ref.id])
      .filter(
        (a) =>
          a &&
          a.score !== null &&
          a.score < 1 &&
          a.scoreDisplayMode !== "informative" &&
          a.scoreDisplayMode !== "notApplicable",
      )
      .sort((a, b) => a.score - b.score);

    if (failing.length === 0) continue;

    console.log(`\n--- ${cat.title}: ${failing.length} below full marks ---`);

    for (const a of failing) {
      console.log(`[${a.score.toFixed(2)}] ${a.id}: ${a.title}`);
      if (a.displayValue) console.log(`        ${a.displayValue}`);

      for (const item of (a.details?.items ?? []).slice(0, 5)) {
        const target =
          item.node?.selector ?? item.node?.snippet ?? item.url ?? "";
        if (target) console.log(`        -> ${String(target).slice(0, 130)}`);
      }
    }
  }
} finally {
  // Windows often refuses to delete Chrome's temp profile. The audit is done
  // by this point, so a cleanup failure must not mask the result.
  try {
    await chrome.kill();
  } catch {
    process.exit(0);
  }
}
