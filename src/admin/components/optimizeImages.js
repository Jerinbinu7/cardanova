const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = './public/images';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`Optimizing ${files.length} image files...`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  const statBefore = fs.statSync(filePath).size;
  totalBefore += statBefore;

  const tempOutDir = path.join(dir, 'opt');
  if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir);
  const tempOut = path.join(tempOutDir, file);

  try {
    const format = file.endsWith('.png') ? 'png' : 'jpeg';
    execSync(`npx -y sharp-cli -i "${filePath}" -o "${tempOutDir}" -q 85 -- ${format}`);

    if (fs.existsSync(tempOut)) {
      const statAfter = fs.statSync(tempOut).size;
      if (statAfter < statBefore) {
        fs.copyFileSync(tempOut, filePath);
        totalAfter += statAfter;
        console.log(`✓ ${file}: ${Math.round(statBefore/1024)} KB -> ${Math.round(statAfter/1024)} KB (${Math.round((1 - statAfter/statBefore)*100)}% lighter)`);
      } else {
        totalAfter += statBefore;
      }
      fs.unlinkSync(tempOut);
    }
  } catch (err) {
    totalAfter += statBefore;
  }
}

if (fs.existsSync(path.join(dir, 'opt'))) {
  fs.rmdirSync(path.join(dir, 'opt'));
}

console.log(`\n🎉 Image Optimization Complete: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(totalAfter / 1024 / 1024).toFixed(2)} MB!`);
