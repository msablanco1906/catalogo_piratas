const { Jimp } = require('jimp');

async function main() {
  const image = await Jimp.read('src/assets/logo-dass.png');
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    // If it's a dark color (the black text)
    if (a > 0 && r < 60 && g < 60 && b < 60) {
      // Make it white, keep same alpha for anti-aliasing
      // Or we can just calculate luminance
      this.bitmap.data[idx + 0] = 255;
      this.bitmap.data[idx + 1] = 255;
      this.bitmap.data[idx + 2] = 255;
      // We might want to boost alpha if it's anti-aliased with a dark background, but let's see
    }
  });

  await image.write('src/assets/logo-dass.png');
  console.log("Done");
}

main().catch(console.error);
