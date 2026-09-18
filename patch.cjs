const fs = require('fs');
let code = fs.readFileSync('update-firebase.ts', 'utf8');

code = code.replace(
`      const imgSku = normalizeId(sku);
      if (imgSku && tempImageMap[imgSku]) {
        const images = tempImageMap[imgSku].map(x => x.url).filter(Boolean);
        productMap[id] = {
          ...productMap[id],
          images,
          coverImage: images[0],
        };
      }`,
`      const imgSku = normalizeId(sku);
      const imgArt = normalizeId(articulo);
      const imageItems = tempImageMap[imgArt] || tempImageMap[imgSku] || [];
      const images = Array.from(new Set(imageItems.map(x => x.url).filter(Boolean)));
      if (images.length > 0) {
        productMap[id] = {
          ...productMap[id],
          images,
          coverImage: images[0] || '',
        };
      }`
);

fs.writeFileSync('update-firebase.ts', code);
