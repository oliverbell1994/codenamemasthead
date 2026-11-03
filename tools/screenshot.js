#!/usr/bin/env node
// Masthead screenshot tool: renders each HTML file at 390 / 834 / 1440 (full page)
// and builds a contact sheet. Usage: node tools/screenshot.js a.html b.html --out dir
// Requires: npm install && npx playwright install chromium

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1194 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf('--out');
  const out = outIdx >= 0 ? argv[outIdx + 1] : path.join(process.cwd(), 'screens');
  const files = argv.filter((a, i) => !a.startsWith('--') && i !== outIdx + 1);
  if (!files.length) { console.error('usage: node tools/screenshot.js <html...> --out <dir>'); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });

  const browser = await chromium.launch();
  const shots = [];
  for (const f of files) {
    const abs = path.resolve(f);
    const label = path.basename(abs).toLowerCase() === 'index.html' ? path.basename(path.dirname(abs)) : path.basename(abs, '.html');
    const row = { label, images: {} };
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      await page.goto('file://' + abs, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollW > vp.width + 1) console.log(`warn  ${label} @${vp.width}: horizontal overflow (${scrollW}px)`);
      const file = path.join(out, `${label}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      row.images[vp.name] = file;
      await page.close();
      console.log(`ok    ${file}`);
    }
    shots.push(row);
  }

  // contact sheet: one row per file, desktop | tablet | mobile, top 1400px of each
  const cell = (src, w) => `<div class="c" style="width:${w}px"><img src="file://${path.resolve(src)}"></div>`;
  const rows = shots.map(r => `
    <section><h2>${r.label}</h2><div class="r">
      ${cell(r.images.desktop, 720)}${cell(r.images.tablet, 417)}${cell(r.images.mobile, 195)}
    </div></section>`).join('');
  const htmlDoc = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:24px;background:#eceae4;font:600 13px/1 system-ui;color:#161412}
    h2{margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
    section{margin-bottom:28px}
    .r{display:flex;gap:12px;align-items:flex-start}
    .c{height:860px;overflow:hidden;border:1px solid #cfc8ba;background:#fff}
    .c img{width:100%;display:block}
  </style>${rows}`;
  const sheetHtml = path.join(out, 'contact-sheet.html');
  fs.writeFileSync(sheetHtml, htmlDoc);
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(sheetHtml), { waitUntil: 'networkidle' });
  const sheet = path.join(out, 'contact-sheet.png');
  await page.screenshot({ path: sheet, fullPage: true });
  await browser.close();
  console.log(`sheet ${sheet}`);
})().catch(e => { console.error(e); process.exit(1); });
