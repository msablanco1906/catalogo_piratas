const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the old groupedProductSections logic completely and replace it
const newGrouping = `const groupedProductSections = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, p) => {
      const sec = p.category || 'Otras Secciones';
      if (!acc[sec]) acc[sec] = [];
      acc[sec].push(p);
      return acc;
    }, {} as Record<string, Product[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sectionName, items]) => ({
        key: sectionName,
        title: sectionName,
        marca: '',
        division: '',
        category: sectionName,
        line: '',
        driver: '',
        items: items.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }));
  }, [filteredProducts]);`;

code = code.replace(/const groupedProductSections = useMemo\(\(\) => \{[\s\S]*?return groups;\n  \}, \[filteredProducts, groupBy\]\);/g, newGrouping);
// Try also matching without groupBy dependency
code = code.replace(/const groupedProductSections = useMemo\(\(\) => \{[\s\S]*?return groups;\n  \}, \[filteredProducts\]\);/g, newGrouping);

// 2. Remove "Vista de Tarjetas" from sidebar
code = code.replace(/<div>\s*<label className="text-\[11px\] font-bold text-slate-500 uppercase tracking-wider mb-1\.5 block">\s*Vista de Tarjetas\s*<\/label>\s*<div className="flex justify-center">\s*<\/div>\s*<\/div>/, `
                  <div className="pt-2">
                    <MultiSelectFilter
                      label="Sección"
                      options={categories}
                      selectedValues={filterSeccion}
                      onChange={setFilterSeccion}
                      placeholder="Todas las secciones"
                    />
                  </div>
`);

fs.writeFileSync('src/App.tsx', code);
