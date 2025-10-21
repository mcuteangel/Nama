const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  const outputPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.ico');

  // تولید سایزهای مختلف برای ICO
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = [];

  for (const size of sizes) {
    const buffer = await sharp(svgPath)
      .resize(size, size)
      .png()
      .toBuffer();
    buffers.push(buffer);
  }

  // تولید ICO از تمام سایزها
  const icoBuffer = await toIco(buffers);

  // نوشتن فایل ICO
  fs.writeFileSync(outputPath, icoBuffer);
  console.log('Icon generated successfully with multiple sizes!');
}

generateIcon().catch(console.error);
