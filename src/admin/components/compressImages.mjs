import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/images';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`Starting Sharp node compression for ${files.length} image files...`);

let totalBefore = 0;
let totalAfter = 0;

async function processImages() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    const statBefore = fs.statSync(filePath).size;
    totalBefore += statBefore;

    const tempOut = path.join(dir, 'opt_' + file);

    try {
      if (file.endsWith('.png')) {
        await sharp(filePath)
          .png({ quality: 85, compressionLevel: 9 })
          .toFile(tempOut);
      } else {
        await sharp(filePath)
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(tempOut);
      }

      if (fs.existsSync(tempOut)) {
        const statAfter = fs.statSync(tempOut).size;
        if (statAfter < statBefore) {
          fs.unlinkSync(filePath);
          fs.renameSync(tempOut, filePath);
          totalAfter += statAfter;
          console.log(`✓ ${file}: ${Math.round(statBefore/1024)} KB -> ${Math.round(statAfter/1024)} KB (${Math.round((1 - statAfter/statBefore)*100)}% lighter)`);
        } else {
          fs.unlinkSync(tempOut);
          totalAfter += statBefore;
        }
      }
    } catch (err) {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
      totalAfter += statBefore;
    }
  }

  console.log(`\n🎉 Image Optimization Complete: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(totalAfter / 1024 / 1024).toFixed(2)} MB!`);
}

processImages();
