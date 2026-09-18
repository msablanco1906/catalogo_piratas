const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The mobile drawer still references filterDivision, etc. in MobileFilterDrawer props or logic inside App.tsx
// It passes them to MobileFilterDrawer:
code = code.replace(/filterDivision=\{filterDivision\}[\s\S]*?setFilterDriver=\{setFilterDriver\}/g, '');
code = code.replace(/filterDiscount=\{filterDiscount\}[\s\S]*?setFilterDiscount=\{setFilterDiscount\}/g, '');
code = code.replace(/filterDivision=\{filterDivision\}[\s\S]*?setFilterDiscount=\{setFilterDiscount\}/g, '');
code = code.replace(/filterGender=\{filterGender\}[\s\S]*?setFilterGender=\{setFilterGender\}/g, '');
code = code.replace(/filterLine=\{filterLine\}[\s\S]*?setFilterLine=\{setFilterLine\}/g, '');

// Look for handleClearAllFilters references from MobileFilterDrawer
// We'll just remove the whole props block from MobileFilterDrawer in App.tsx
code = code.replace(/<MobileFilterDrawer[\s\S]*?\/>/g, `
<MobileFilterDrawer 
  isOpen={isMobileFilterOpen}
  onClose={() => setIsMobileFilterOpen(false)}
  categories={categories}
  filterSeccion={filterSeccion}
  setFilterSeccion={setFilterSeccion}
  filterStatus={filterStatus}
  setFilterStatus={setFilterStatus}
  isAdmin={isAdmin}
  imageFilter={imageFilter}
  setImageFilter={setImageFilter}
  onClearFilters={handleClearAllFilters}
  totalResults={filteredProducts.length}
  onSyncFromSheets={() => syncFromSheetsToFirebase(false)}
/>
`);

// Also update MobileFilterDrawer.tsx
let drawer = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');
drawer = drawer.replace(/interface MobileFilterDrawerProps \{[\s\S]*?\}/, `
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  filterSeccion: string[];
  setFilterSeccion: (v: string[]) => void;
  filterStatus: 'LINEA' | 'OFF' | 'ALL';
  setFilterStatus: (v: 'LINEA' | 'OFF' | 'ALL') => void;
  isAdmin: boolean;
  imageFilter: 'all' | 'with_images' | 'without_images';
  setImageFilter: (v: 'all' | 'with_images' | 'without_images') => void;
  onClearFilters: () => void;
  totalResults: number;
  onSyncFromSheets: () => void;
}
`);
drawer = drawer.replace(/export function MobileFilterDrawer\(\{[\s\S]*?\}\: MobileFilterDrawerProps\) \{/, `
export function MobileFilterDrawer({
  isOpen, onClose, categories, filterSeccion, setFilterSeccion,
  filterStatus, setFilterStatus, isAdmin, imageFilter, setImageFilter,
  onClearFilters, totalResults, onSyncFromSheets
}: MobileFilterDrawerProps) {
`);
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="División"[\s\S]*?\/>/g, '');
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="Categoría"[\s\S]*?\/>/g, `
<MultiSelectFilter
  label="Sección"
  options={categories}
  selectedValues={filterSeccion}
  onChange={setFilterSeccion}
  placeholder="Todas las secciones"
/>
`);
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="Disciplina \/ Línea"[\s\S]*?\/>/g, '');
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="Driver \/ Cápsula"[\s\S]*?\/>/g, '');
drawer = drawer.replace(/<MultiSelectFilter[\s\S]*?label="Género"[\s\S]*?\/>/g, '');

fs.writeFileSync('src/components/MobileFilterDrawer.tsx', drawer);

fs.writeFileSync('src/App.tsx', code);
