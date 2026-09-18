const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rename filterCategory state variable to filterSeccion
code = code.replace(/const \[filterCategory, setFilterCategory\] = useState<string\[\]>\(\[\]\);/g, 
  "const [filterSeccion, setFilterSeccion] = useState<string[]>([]);");

// 2. Remove other filters logic
// Remove filter hooks
code = code.replace(/const \[filterDivision, setFilterDivision\] = useState<string\[\]>\(\[\]\);\n/g, "");
code = code.replace(/const \[filterGender, setFilterGender\] = useState<string\[\]>\(\[\]\);\n/g, "");
code = code.replace(/const \[filterLine, setFilterLine\] = useState<string\[\]>\(\[\]\);\n/g, "");
code = code.replace(/const \[filterDriver, setFilterDriver\] = useState<string\[\]>\(\[\]\);\n/g, "");
code = code.replace(/const \[filterDiscount, setFilterDiscount\] = useState<string\[\]>\(\[\]\);\n/g, "");

// Modify handleClearAllFilters
code = code.replace(/setFilterDivision\(\[\]\);\n/g, "");
code = code.replace(/setFilterGender\(\[\]\);\n/g, "");
code = code.replace(/setFilterLine\(\[\]\);\n/g, "");
code = code.replace(/setFilterDriver\(\[\]\);\n/g, "");
code = code.replace(/setFilterDiscount\(\[\]\);\n/g, "");
code = code.replace(/setFilterCategory\(\[\]\);/g, "setFilterSeccion([]);");

// Replace activeFiltersCount logic
code = code.replace(/const activeFiltersCount = useMemo[\s\S]*?}, \[.*\]\);/g, 
`const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterSeccion.length > 0) count += filterSeccion.length;
    if (filterStatus !== 'ALL') count += 1;
    if (search.trim()) count += 1;
    return count;
  }, [filterSeccion, filterStatus, search]);`);

// Modify extract filter options
code = code.replace(/const extractFilterOptions =[\s\S]*?const driverGroups = \[\];/g, 
`const extractFilterOptions = (items: Product[], key: keyof Product) => {
    const vals = items.map(p => String(p[key] || '')).filter(v => v.trim() !== '');
    return [...new Set(vals)].sort((a, b) => a.localeCompare(b));
  };

  const categories = useMemo(() => extractFilterOptions(baseCatalogProducts, 'category'), [baseCatalogProducts]);`);

// Modify filtering logic
code = code.replace(/const filteredProducts = useMemo[\s\S]*?return filtered;\n  }, \[.*?\]\);/g, 
`const filteredProducts = useMemo(() => {
    let filtered = baseCatalogProducts;
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    if (filterSeccion.length > 0) {
      filtered = filtered.filter(p => p.category && filterSeccion.includes(p.category));
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [baseCatalogProducts, filterStatus, filterSeccion, search]);`);

// Modify groupedProductSections
code = code.replace(/const groupedProductSections = useMemo[\s\S]*?return result;\n  }, \[filteredProducts, groupBy\]\);/g,
`const groupedProductSections = useMemo(() => {
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
        items: items.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      }));
  }, [filteredProducts]);`);

fs.writeFileSync('src/App.tsx', code);
