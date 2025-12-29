#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = path.resolve(process.argv[2] || 'articles/cover-modern.svg');
const outputPath = inputPath.replace(/\.svg$/i, '.png');

console.log('Input:', inputPath);
console.log('Output:', outputPath);

try {
  const svgBuffer = fs.readFileSync(inputPath);
  const pngBuffer = await sharp(svgBuffer)
    .resize(1200, 630, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync(outputPath, pngBuffer);
  console.log('✓ Success!');
  console.log('File size:', (pngBuffer.length / 1024).toFixed(2), 'KB');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
