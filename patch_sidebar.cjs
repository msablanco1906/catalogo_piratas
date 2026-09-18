const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The sidebar logic has multiple MultiSelectFilters, remove them
code = code.replace(/<MultiSelectFilter[\s\S]*?label="División"[\s\S]*?\/>/g, "");
code = code.replace(/<MultiSelectFilter[\s\S]*?label="Categoría"[\s\S]*?\/>/g, `
<MultiSelectFilter
  label="Sección"
  options={categories}
  selectedValues={filterSeccion}
  onChange={setFilterSeccion}
  placeholder="Todas las secciones"
/>`);
code = code.replace(/<MultiSelectFilter[\s\S]*?label="Disciplina \/ Línea"[\s\S]*?\/>/g, "");
code = code.replace(/<MultiSelectFilter[\s\S]*?label="Driver \/ Cápsula"[\s\S]*?\/>/g, "");
code = code.replace(/<MultiSelectFilter[\s\S]*?label="Género"[\s\S]*?\/>/g, "");

// Remove GroupBySwitch from both mobile drawer and desktop sidebar
code = code.replace(/<GroupBySwitch [^>]*\/>/g, "");

// Remove Group By labels
code = code.replace(/<label[^>]*>[\s\S]*?Agrupar por[\s\S]*?<\/label>[\s\S]*?<div className="flex justify-center">[\s\S]*?<\/div>/g, "");
code = code.replace(/<div className="flex items-center gap-2">[\s\S]*?Agrupado por:[\s\S]*?<\/div>/g, "");

// Remove the import of GroupBySwitch
code = code.replace(/import \{ GroupBySwitch \} from '\.\/components\/GroupBySwitch';/g, "");

fs.writeFileSync('src/App.tsx', code);
