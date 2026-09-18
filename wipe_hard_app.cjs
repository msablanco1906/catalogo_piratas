const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There's a big chunk of active filters logic inside the render.
// I'll just remove the entire active filters UI block from App.tsx.
// The active filters div looks like:
// {activeFiltersCount > 0 && (
//   <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
// ...
//   </div>
// )}

code = code.replace(/\{activeFiltersCount > 0 && \([\s\S]*?\}\)/g, '');
fs.writeFileSync('src/App.tsx', code);

// For MobileFilterDrawer, remove the handleSelectMarca block and groupBy block entirely
let drawer = fs.readFileSync('src/components/MobileFilterDrawer.tsx', 'utf8');
drawer = drawer.replace(/\{false && \([\s\S]*?\}\)/g, '');
drawer = drawer.replace(/\{isAdmin === 'admin' && \(/, '{isAdmin && (');
drawer = drawer.replace(/<GroupBySwitch[^>]*\/>/g, '');
fs.writeFileSync('src/components/MobileFilterDrawer.tsx', drawer);
