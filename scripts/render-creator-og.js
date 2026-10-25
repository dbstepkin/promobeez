// Renders 1200x675 hero/OG cards for the creator collaboration articles into assets/blog/ (PNG + WebP).
// Run: node scripts/render-creator-og.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const CARDS = [
  {
    file: 'creator-collabs-helsinki', lang: 'en', eyebrow: 'For creators · Helsinki',
    title: 'Brand collabs in Helsinki <span class="p">from 500 followers</span>',
    tag: 'Where offers come from, how to pitch, KKV labels and tax',
    offer: { place: 'Café in Vallila', get: 'Brunch for two', give: '1 Reel + 2 Stories', label: 'Mainos / Saatu' },
    foot: 'Guide · 2026', apply: 'Apply',
  },
  {
    file: 'yhteistyot-helsinki', lang: 'fi', eyebrow: 'Sisällöntuottajille · Helsinki',
    title: 'Kaupalliset yhteistyöt <span class="p">500 seuraajasta</span>',
    tag: 'Mistä yhteistyöt löytyvät, miten lähestyä, KKV ja verotus',
    offer: { place: 'Kahvila Vallilassa', get: 'Brunssi kahdelle', give: '1 Reels + 2 tarinaa', label: 'Mainos / Saatu' },
    foot: 'Opas · 2026', apply: 'Hae',
  },
  {
    file: 'collaborazioni-milano', lang: 'it', eyebrow: 'Per i creator · Milano',
    title: 'Collaborazioni a Milano <span class="p">da 500 follower</span>',
    tag: 'Dove trovarle, come proporsi, Digital Chart IAP e fisco',
    offer: { place: "Bar all'Isola", get: 'Brunch per due', give: '1 reel + 2 storie', label: 'invitata da' },
    foot: 'Guida · 2026', apply: 'Candidati',
  },
];

const fontsUrl = 'assets/fonts.css'; // relative to the temp page written into ROOT

const html = (c) => `<!DOCTYPE html><html lang="${c.lang}"><head><meta charset="utf-8">
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
  .main{display:flex;gap:48px;align-items:center}
  .text{flex:1}
  h1{font-family:'Clash Display',sans-serif;font-weight:600;font-size:68px;line-height:1.04;letter-spacing:-.025em;margin:0}
  h1 .p{display:block;background:linear-gradient(90deg,#FF5A3C,#FF9E1B);-webkit-background-clip:text;color:transparent}
  .tag{font-size:26px;font-weight:500;opacity:.8;margin:22px 0 0}
  .offer{width:330px;flex:none;background:#fff;border-radius:22px;padding:26px 26px 22px;box-shadow:0 18px 50px rgba(16,13,26,.12);transform:rotate(2deg)}
  .offer .place{font-size:18px;color:#7A7486;font-weight:600}
  .offer .get{font-family:'Clash Display',sans-serif;font-size:34px;font-weight:600;margin:6px 0 14px}
  .offer .row{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:600;padding:10px 0;border-top:1px solid rgba(16,13,26,.08)}
  .offer .arrow{color:#FF5A3C}
  .offer .chip{display:inline-block;margin-top:12px;font-size:16px;font-weight:600;padding:7px 12px;border-radius:999px;background:rgba(255,158,27,.16);color:#B35A00}
  .offer .apply{margin-top:16px;text-align:center;font-weight:700;font-size:20px;color:#fff;background:linear-gradient(90deg,#FF5A3C,#FF9E1B);border-radius:999px;padding:12px}
  .foot{display:flex;justify-content:space-between;align-items:center;font-size:24px;font-weight:600}
  .logo{font-family:'Clash Display',sans-serif;font-size:34px;font-weight:700}
  .logo span{color:#FF9E1B}
  .muted{color:#7A7486}
</style></head><body><div class="card">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="inner">
    <div class="eyebrow">${c.eyebrow}</div>
    <div class="main">
      <div class="text"><h1>${c.title}</h1><p class="tag">${c.tag}</p></div>
      <div class="offer">
        <div class="place">${c.offer.place}</div>
        <div class="get">${c.offer.get}</div>
        <div class="row"><span class="arrow">→</span>${c.offer.give}</div>
        <span class="chip">${c.offer.label}</span>
        <div class="apply">${c.apply}</div>
      </div>
    </div>
    <div class="foot"><div class="logo">Promo<span>beez</span></div><div class="muted">${c.foot}</div></div>
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
