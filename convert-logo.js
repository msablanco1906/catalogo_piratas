import { Jimp } from 'jimp';

async function main() {
  const image = await Jimp.read('public/logo-dass.png');
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    // If it's a dark color (e.g., black or dark gray), make it white
    if (a > 0 && r < 50 && g < 50 && b < 50) {
      this.bitmap.data[idx + 0] = 255;
      this.bitmap.data[idx + 1] = 255;
      this.bitmap.data[idx + 2] = 255;
    }
  });

  await image.write('public/logo-dass.png');
  console.log('Done!');
}

main().catch(console.error);
