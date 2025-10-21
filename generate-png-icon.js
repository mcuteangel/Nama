const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generatePngIcon() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  const outputPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.png');

  // Read SVG and convert to PNG
  await sharp(svgPath)
    .resize(512, 512)  // سایز مناسب برای آیکون
    .png()
    .toFile(outputPath);

  console.log('PNG icon generated successfully!');
}

generatePngIcon().catch(console.error);
