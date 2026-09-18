const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/<title>.*?<\/title>/, '<title>Catálogo de Productos</title>');
index = index.replace(/<meta name="description" content=".*?" \/>/, '<meta name="description" content="Catálogo de Productos" />');
index = index.replace(/<meta property="og:title" content=".*?" \/>/, '<meta property="og:title" content="Catálogo de Productos" />');
index = index.replace(/<meta property="og:description" content=".*?" \/>/, '<meta property="og:description" content="Catálogo de Productos" />');
fs.writeFileSync('index.html', index);

let meta = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
meta.name = "Catálogo de Productos";
meta.description = "Catálogo de Productos M. Sanchez Y Cia";
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/Catálogo Oficial/g, 'Catálogo de Productos');
app = app.replace(/Grupo Dass • FILA & Umbro/g, 'Productos');
fs.writeFileSync('src/App.tsx', app);
