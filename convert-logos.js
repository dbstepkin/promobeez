const fs = require('fs');
const path = require('path');

// SVG content templates
const logoTemplates = {
  'transparent': `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="beeBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD84D"/>
      <stop offset="1" stop-color="#FF9E1B"/>
    </linearGradient>
    <clipPath id="bclip">
      <rect x="105" y="108" width="63" height="98" rx="31.5"/>
    </clipPath>
  </defs>
  <g transform="translate(104, 98)">
    <path d="M21 17 C17 7 12 4 8 5" stroke="#100D1A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M27 17 C31 7 36 4 40 5" stroke="#100D1A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="6" cy="4" r="4" fill="#FF5A3C"/>
    <circle cx="42" cy="4" r="4" fill="#FF5A3C"/>
    <ellipse cx="8" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="2"/>
    <ellipse cx="40" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="2"/>
    <rect x="15" y="18" width="18" height="28" rx="9" fill="url(#beeBody)" stroke="#100D1A" stroke-width="2.5"/>
    <g clip-path="url(#bclip)">
      <rect x="13" y="31" width="22" height="6" fill="#100D1A"/>
      <rect x="13" y="41" width="22" height="6" fill="#100D1A"/>
    </g>
  </g>
</svg>`,
  'black': `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="beeBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD84D"/>
      <stop offset="1" stop-color="#FF9E1B"/>
    </linearGradient>
    <clipPath id="bclip">
      <rect x="105" y="108" width="63" height="98" rx="31.5"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#100D1A"/>
  <g transform="translate(104, 98)">
    <path d="M21 17 C17 7 12 4 8 5" stroke="#FDF9F3" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M27 17 C31 7 36 4 40 5" stroke="#FDF9F3" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="6" cy="4" r="4" fill="#FF5A3C"/>
    <circle cx="42" cy="4" r="4" fill="#FF5A3C"/>
    <ellipse cx="8" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".85" stroke="#FDF9F3" stroke-width="2"/>
    <ellipse cx="40" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".85" stroke="#FDF9F3" stroke-width="2"/>
    <rect x="15" y="18" width="18" height="28" rx="9" fill="url(#beeBody)" stroke="#FDF9F3" stroke-width="2.5"/>
    <g clip-path="url(#bclip)">
      <rect x="13" y="31" width="22" height="6" fill="#FDF9F3"/>
      <rect x="13" y="41" width="22" height="6" fill="#FDF9F3"/>
    </g>
  </g>
</svg>`,
  'white': `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="beeBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD84D"/>
      <stop offset="1" stop-color="#FF9E1B"/>
    </linearGradient>
    <clipPath id="bclip">
      <rect x="105" y="108" width="63" height="98" rx="31.5"/>
    </clipPath>
  </defs>
  <rect width="256" height="256" fill="#FFFFFF"/>
  <g transform="translate(104, 98)">
    <path d="M21 17 C17 7 12 4 8 5" stroke="#100D1A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M27 17 C31 7 36 4 40 5" stroke="#100D1A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="6" cy="4" r="4" fill="#FF5A3C"/>
    <circle cx="42" cy="4" r="4" fill="#FF5A3C"/>
    <ellipse cx="8" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="2"/>
    <ellipse cx="40" cy="30" rx="11" ry="7" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="2"/>
    <rect x="15" y="18" width="18" height="28" rx="9" fill="url(#beeBody)" stroke="#100D1A" stroke-width="2.5"/>
    <g clip-path="url(#bclip)">
      <rect x="13" y="31" width="22" height="6" fill="#100D1A"/>
      <rect x="13" y="41" width="22" height="6" fill="#100D1A"/>
    </g>
  </g>
</svg>`
};

// Write SVG files
console.log('Creating SVG files...');
Object.entries(logoTemplates).forEach(([variant, content]) => {
  const svgPath = path.join(__dirname, 'assets', `logo-${variant}.svg`);
  fs.writeFileSync(svgPath, content, 'utf8');
  console.log(`✓ ${svgPath}`);
});

console.log('\nTo convert SVG to PNG, use one of these methods:');
console.log('1. Online: https://cloudconvert.com/svg-to-png');
console.log('2. CLI with ffmpeg: ffmpeg -i logo-transparent.svg -y logo-transparent.png');
console.log('3. CLI with inkscape: inkscape --export-type=png logo-transparent.svg');
console.log('4. Node.js: npm install sharp && node -e "require(\'sharp\')(\'assets/logo-transparent.svg\').png().toFile(\'assets/logo-transparent.png\')"');
