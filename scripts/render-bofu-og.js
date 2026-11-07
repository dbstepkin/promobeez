// Renders 1200x675 hero/OG cards for the FI and IT bottom-of-funnel guides (build-bofu-guides.js) into assets/blog/ (PNG + WebP).
// Same visual system as render-comparison-og.js. Run: node scripts/render-bofu-og.js [fi|it]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const CARDS = [
  { file: 'vaikuttajamarkkinointi-hinta', eyebrow: 'Hinnat · Suomi 2026', title: 'Paljonko <span class="p">vaikuttaja&shy;markkinointi</span> maksaa?', tag: 'Nanotuottaja, mikrotuottaja, UGC, toimisto ja alustat' },
  { file: 'vaikuttajamarkkinointialustat-suomessa', eyebrow: 'Vertailu · Suomi 2026', title: '<span class="p">Vaikuttaja&shy;markkinointi&shy;alustat</span> Suomessa', tag: 'Vaiku, CastersApp, Invited Agency, Influee ja Promobeez' },
  { file: 'vaikuttajamarkkinointitoimisto-vai-alusta', eyebrow: 'Opas', title: '<span class="p">Toimisto</span> vai alusta?', tag: 'Hinta, aika, kontrolli ja suhde tuottajaan' },
  { file: 'paikalliset-vaikuttajat-helsinki', eyebrow: 'Opas · Helsinki', title: 'Paikalliset <span class="p">vaikuttajat</span> Helsingissä', tag: 'Mistä löydät tuottajan, jonka yleisö asuu lähellä' },
  { file: 'ugc-vai-vaikuttajayhteistyo', eyebrow: 'Opas', title: '<span class="p">UGC</span> vai vaikuttaja&shy;yhteistyö?', tag: 'Ero, hinnat ja käyttöoikeudet paikalliselle yritykselle' },
  { lang: 'it', file: 'quanto-costa-influencer-marketing', eyebrow: 'Prezzi · Italia 2026', title: 'Quanto costa l’<span class="p">influencer marketing</span>?', tag: 'Nano e micro influencer, UGC, agenzie e piattaforme' },
  { lang: 'it', file: 'piattaforme-influencer-marketing-italia', eyebrow: 'Confronto · Italia 2026', title: '<span class="p">Piattaforme</span> di influencer marketing in Italia', tag: 'CollaborUp, Influee, Kolsquare, agenzie e Promobeez' },
  { lang: 'it', file: 'agenzia-o-piattaforma-influencer', eyebrow: 'Guida', title: '<span class="p">Agenzia</span> o piattaforma?', tag: 'Prezzo, tempo, controllo e rapporto con il creator' },
  { lang: 'it', file: 'trovare-influencer-locali-milano', eyebrow: 'Guida · Milano', title: 'Influencer <span class="p">locali</span> a Milano', tag: 'Come trovare creator con il pubblico in città' },
  { lang: 'it', file: 'ugc-o-influencer', eyebrow: 'Guida', title: '<span class="p">UGC</span> o influencer?', tag: 'Differenze, prezzi e diritti d’uso per un’attività locale' },
];
const FOOT = { fi: 'Suomi · marraskuu 2026', it: 'Italia · novembre 2026' };

const html = (c) => `<!DOCTYPE html><html lang="${c.lang || 'fi'}"><head><meta charset="utf-8">
<link rel="stylesheet" href="assets/fonts.css">
<style>
  html,body{margin:0}
  .card{position:relative;width:1200px;height:675px;overflow:hidden;background:#FDF9F3;font-family:'General Sans',sans-serif;color:#100D1A}
  .blob{position:absolute;border-radius:50%;filter:blur(70px)}
  .b1{width:560px;height:560px;left:-140px;top:-180px;background:#FF5A3C;opacity:.16}
  .b2{width:520px;height:520px;right:-120px;top:-140px;background:#FFD84D;opacity:.24}
  .b3{width:460px;height:460px;right:120px;bottom:-260px;background:#FF6FB5;opacity:.12}
  .inner{position:absolute;inset:72px 88px;display:flex;flex-direction:column;justify-content:space-between}
  .eyebrow{font-size:22px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#FF5A3C}
  h1{font-family:'Clash Display',sans-serif;font-weight:600;font-size:84px;line-height:1.04;letter-spacing:-.03em;margin:0;max-width:1000px;hyphens:manual}
  h1 .p{background:linear-gradient(90deg,#FF5A3C,#FF9E1B);-webkit-background-clip:text;color:transparent}
  .tag{font-size:30px;font-weight:500;color:#100D1A;opacity:.8;margin:22px 0 0}
  .foot{display:flex;justify-content:space-between;align-items:center;font-size:24px;font-weight:600}
  .logo{font-family:'Clash Display',sans-serif;font-size:34px;font-weight:700}
  .logo span{color:#FF9E1B}
  .fi{color:#7A7486}
</style></head><body><div class="card">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="inner">
    <div class="eyebrow">${c.eyebrow}</div>
    <div>
      <h1>${c.title}</h1>
      <p class="tag">${c.tag}</p>
    </div>
    <div class="foot"><div class="logo">Promo<span>beez</span></div><div class="fi">${FOOT[c.lang || 'fi']}</div></div>
  </div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 } });
  const only = process.argv[2];
  for (const c of CARDS.filter((x) => !only || (x.lang || 'fi') === only)) {
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
