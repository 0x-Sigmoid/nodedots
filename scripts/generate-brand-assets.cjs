/* Deterministic, editable brand graphics. Run with Playwright available, or
 * set NODEDOTS_PLAYWRIGHT_MODULE to an installed Playwright module path. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.NODEDOTS_PLAYWRIGHT_MODULE || 'playwright');
const out = path.join(process.cwd(), 'public', 'brand');
fs.mkdirSync(out, { recursive: true });
const ink = '#1a1030', paper = '#fbfafd', lime = '#d5ef79', muted = '#b8adc9';
const mark = (x, y, size, color) => `<g transform="translate(${x} ${y}) scale(${size / 64})" fill="none" stroke="${color}"><g stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 44V20L24.2 24.2"/><path d="M39.8 39.8L44 44V20"/></g><circle cx="32" cy="32" r="4.5" stroke-width="3"/></g>`;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>NodeDots</title>${body}</svg>`;
const text = (x, y, size, color, content, weight = 400, extra = '') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${content}</text>`;
const background = (w, h, dark = true) => `<rect width="${w}" height="${h}" fill="${dark ? ink : paper}"/><defs><radialGradient id="glow"><stop stop-color="${lime}" stop-opacity=".12"/><stop offset="1" stop-color="${lime}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${w * .9}" cy="${h * .15}" rx="${w * .5}" ry="${h}" fill="url(#glow)"/>`;
const graph = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="none"><path d="M0 100C85 100 85 0 160 0M0 100C85 100 85 200 160 200M160 0H320M160 200C240 200 240 0 320 0M160 200H320" stroke="#63566e" stroke-width="2"/><circle cx="0" cy="100" r="10" fill="${lime}"/><circle cx="160" cy="0" r="10" fill="${lime}"/><circle cx="160" cy="200" r="10" fill="${lime}"/><circle cx="320" cy="0" r="12" stroke="#ff8a7a" stroke-width="3"/><path d="m310 10 20-20" stroke="#ff8a7a" stroke-width="3"/><circle cx="320" cy="200" r="11" stroke="#e6a23c" stroke-width="3"/></g>`;
const brand = (x, y, color = paper) => mark(x - 12, y - 42, 64, color) + text(x + 52, y + 2, 30, color, 'NodeDots', 600, 'letter-spacing="-1"');
const covers = (w, h, vision = false) => svg(w, h, background(w, h) + brand(72, 88) + text(76, 160, 18, muted, vision ? 'CODE FIRST. MORE TO COME.' : 'FOR GITHUB PULL REQUESTS', 500, 'letter-spacing="2"') + text(72, 253, 68, paper, vision ? 'One idea.' : 'Catch What Your', 600, 'letter-spacing="-3"') + text(72, 332, 68, paper, vision ? 'More possibilities.' : 'Pull Request Missed.', 600, 'letter-spacing="-3"') + text(76, 402, 23, muted, vision ? 'Explore the future of NodeDots.' : 'See what breaks, is missing, or needs a test.') + graph(824, 208, .82) + `<path d="M72 ${h - 100}H${w - 72}" stroke="#3c2f50"/>` + text(76, h - 52, 19, lime, 'nodedots.com' + (vision ? '/vision' : '/waitlist')) + text(w - 72, h - 52, 16, muted, vision ? 'Future directions · In exploration' : 'Early access · Join the waitlist', 400, 'text-anchor="end"'));
const files = [
  ['mark-dark', 64, 64, svg(64, 64, mark(0, 0, 64, ink))],
  ['mark-light', 64, 64, svg(64, 64, mark(0, 0, 64, paper))],
  ['mark-lemon', 64, 64, svg(64, 64, mark(0, 0, 64, lime))],
  ['logo-dark', 450, 100, svg(450, 100, mark(0, 0, 100, ink) + text(106, 69, 58, ink, 'NodeDots', 600, 'letter-spacing="-2"'))],
  ['logo-light', 450, 100, svg(450, 100, mark(0, 0, 100, paper) + text(106, 69, 58, paper, 'NodeDots', 600, 'letter-spacing="-2"'))],
  ['x-avatar', 400, 400, svg(400, 400, `<rect width="400" height="400" fill="${ink}"/>` + mark(-24, -24, 448, lime))],
  ['icon-192', 192, 192, svg(192, 192, `<rect width="192" height="192" rx="40" fill="${ink}"/>` + mark(-10, -10, 212, lime))],
  ['icon-512', 512, 512, svg(512, 512, `<rect width="512" height="512" rx="108" fill="${ink}"/>` + mark(-28, -28, 568, lime))],
  ['icon-maskable-512', 512, 512, svg(512, 512, `<rect width="512" height="512" fill="${ink}"/>` + mark(0, 0, 512, lime))],
  ['apple-touch-icon', 180, 180, svg(180, 180, `<rect width="180" height="180" fill="${ink}"/>` + mark(-10, -10, 200, lime))],
  ['favicon-32', 32, 32, svg(32, 32, `<rect width="32" height="32" rx="7" fill="${ink}"/>` + mark(-6, -6, 44, lime))],
  ['favicon-16', 16, 16, svg(16, 16, `<rect width="16" height="16" rx="3" fill="${ink}"/>` + mark(-3, -3, 22, lime))],
  ['social-card', 1200, 630, covers(1200, 630)],
  ['vision-card', 1200, 630, covers(1200, 630, true)],
  ['x-pinned-post', 1200, 675, covers(1200, 675)],
  ['x-cover', 1500, 500, svg(1500, 500, background(1500, 500) + brand(332, 116) + text(332, 212, 57, paper, 'Catch What Your', 600, 'letter-spacing="-2"') + text(332, 280, 57, paper, 'Pull Request Missed.', 600, 'letter-spacing="-2"') + text(336, 330, 23, muted, 'A clearer review before you merge.') + text(336, 380, 20, lime, 'nodedots.com/waitlist') + graph(1120, 180, .72))],
];
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, w, h, source] of files) {
    fs.writeFileSync(path.join(out, name + '.svg'), source + '\n');
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${source}</body></html>`);
    await page.screenshot({ path: path.join(out, name + '.png'), omitBackground: true });
  }
  // ICO container with embedded PNG entries, no raster-editing dependencies.
  const sizes = [16, 32];
  const pngs = sizes.map(size => fs.readFileSync(path.join(out, `favicon-${size}.png`)));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, index) => { const entry = 6 + index * 16; header[entry] = size; header[entry + 1] = size; header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6); header.writeUInt32LE(pngs[index].length, entry + 8); header.writeUInt32LE(offset, entry + 12); offset += pngs[index].length; });
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), Buffer.concat([header, ...pngs]));
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.svg'), svg(64, 64, `<rect width="64" height="64" rx="14" fill="${ink}"/>` + mark(-12, -12, 88, lime)) + '\n');
  await browser.close();
  console.log(`Created ${files.length} SVG/PNG pairs and favicon.svg/favicon.ico`);
})().catch(error => { console.error(error); process.exitCode = 1; });
