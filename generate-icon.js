const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  const outputPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.ico');

  // Read SVG and convert to PNG buffer
  const pngBuffer = await sharp(svgPath)
    .resize(256, 256)
    .png()
    .toBuffer();

  // Convert PNG to ICO
  const icoBuffer = await toIco([pngBuffer]);

  // Write ICO file
  fs.writeFileSync(outputPath, icoBuffer);
  console.log('Icon generated successfully!');
}

generateIcon().catch(console.error);
