import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svgPath = path.join(process.cwd(), 'public', 'app_icon.svg');
const svg = fs.readFileSync(svgPath, 'utf-8');

function renderIcon(size: number, outPath: string) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: size,
    },
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Rendered ${outPath} (${size}x${size}, ${pngBuffer.length} bytes)`);
}

const pubDir = path.join(process.cwd(), 'public');

// Standard names
renderIcon(512, path.join(pubDir, 'apple-touch-icon.png'));
renderIcon(192, path.join(pubDir, 'pwa-192x192.png'));
renderIcon(512, path.join(pubDir, 'pwa-512x512.png'));
renderIcon(512, path.join(pubDir, 'pwa-maskable-512x512.png'));
renderIcon(64, path.join(pubDir, 'favicon.png'));

// Versioned names (Cache-busting for mobile browser SQLite / WebKit icon cache)
renderIcon(512, path.join(pubDir, 'apple-touch-icon-v2.png'));
renderIcon(180, path.join(pubDir, 'apple-touch-icon-180-v2.png'));
renderIcon(192, path.join(pubDir, 'pwa-192x192-v2.png'));
renderIcon(512, path.join(pubDir, 'pwa-512x512-v2.png'));
renderIcon(512, path.join(pubDir, 'pwa-maskable-512x512-v2.png'));
renderIcon(64, path.join(pubDir, 'favicon-v2.png'));

console.log('All icons generated successfully with v2 cache-busting files!');
