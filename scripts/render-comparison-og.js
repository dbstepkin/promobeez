// Renders 1200x675 hero/OG cards for the comparison pages into assets/blog/ (PNG + WebP).
// Run: node scripts/render-comparison-og.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const CARDS = [
  { file: 'promobeez-vs-invited', rival: 'Invited Agency', tag: 'Self-serve barter vs influencer & PR agency' },
  { file: 'promobeez-vs-vaiku', rival: 'Vaiku', tag: 'Barter offers vs paid influencer campaigns' },
  { file: 'promobeez-vs-castersapp', rival: 'CastersApp', tag: 'Self-serve barter vs managed UGC & influencer campaigns' },
];

const fontsUrl = 'assets/fonts.css'; // relative to the temp page written into ROOT

const html = (c) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${fontsUrl}">
<style>
  html,body{margin:0}
  .card{position:relative;width:1200px;height:675px;overflow:hidden;background:#FDF9F3;font-family:'General Sans',sans-serif;color:#100D1A}
  .blob{position:absolute;border-radius:50%;filter:blur(70px)}
  .b1{width:560px;height:560px;left:-140px;top:-180px;background:#FF5A3C;opacity:.16}
  .b2{width:520px;height:520px;right:-120px;top:-140px;background:#FFD84D;opacity:.24}
  .b3{width:460px;height:460px;right:120px;bottom:-260px;background:#FF6FB5;opacity:.12}
  .inner{position:absolute;inset:72px 88px;display:flex;flex-direction:column;justify-content:space-between}
  .eyebrow{font-size:22px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#FF5A3C}
  h1{font-family:'Clash Display',sans-serif;font-weight:600;font-size:96px;line-height:1.02;letter-spacing:-.03em;margin:0}
  h1 .vs{display:block;font-size:44px;color:#7A7486;font-weight:500;margin:14px 0 10px;letter-spacing:0}
  h1 .p{background:linear-gradient(90deg,#FF5A3C,#FF9E1B);-webkit-background-clip:text;color:transparent}
  .tag{font-size:30px;font-weight:500;color:#100D1A;opacity:.8}
  .foot{display:flex;justify-content:space-between;align-items:center;font-size:24px;font-weight:600}
  .logo{font-family:'Clash Display',sans-serif;font-size:34px;font-weight:700}
  .logo span{color:#FF9E1B}
  .fi{color:#7A7486}
</style></head><body><div class="card">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="inner">
    <div class="eyebrow">Comparison · Vertailu</div>
    <div>
      <h1><span class="p">Promobeez</span><span class="vs">vs</span>${c.rival}</h1>
      <p class="tag">${c.tag}</p>
    </div>
    <div class="foot"><div class="logo">Promo<span>beez</span></div><div class="fi">Finland · October 2026</div></div>
  </div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 } });
  for (const c of CARDS) {
    const tmp = path.join(ROOT, `_og-${c.file}.html`);
    fs.writeFileSync(tmp, html(c), 'utf8');
    await page.goto('file:///' + tmp.split(path.sep).join('/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = path.join(ROOT, 'assets/blog', `${c.file}.png`);
    await page.screenshot({ path: png });
    fs.unlinkSync(tmp);
    const b64 = fs.readFileSync(png).toString('base64');
    const webp = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + src;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      cv.getContext('2d').drawImage(img, 0, 0);
      return cv.toDataURL('image/webp', 0.86).split(',')[1];
    }, b64);
    fs.writeFileSync(path.join(ROOT, 'assets/blog', `${c.file}.webp`), Buffer.from(webp, 'base64'));
    console.log(c.file, fs.statSync(png).size, 'png');
  }
  await browser.close();
})();
