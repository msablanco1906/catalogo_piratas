export const APPAREL_SIZE_ORDER = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'U'
];

export function sortSizes(a: string, b: string, category?: string) {
  const numA = Number(a.replace(',', '.').trim());
  const numB = Number(b.replace(',', '.').trim());
  
  const isNumA = !isNaN(numA);
  const isNumB = !isNaN(numB);

  if (isNumA && isNumB) {
    return numA - numB;
  }
  
  if (isNumA && !isNumB) {
    return -1;
  }
  if (!isNumA && isNumB) {
    return 1;
  }
  
  const idxA = APPAREL_SIZE_ORDER.indexOf(a.trim().toUpperCase());
  const idxB = APPAREL_SIZE_ORDER.indexOf(b.trim().toUpperCase());
  
  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  
  return a.localeCompare(b);
}

export function calculateSuggestedCurve(sizes: Record<string, number>, targetTotal: number): Record<string, number> {
  const availableSizes = Object.entries(sizes)
    .filter(([_, stock]) => stock > 0)
    .map(([size, stock]) => ({ size, stock }));
    
  if (availableSizes.length === 0 || targetTotal <= 0) return {};
  
  let result: Record<string, number> = {};
  availableSizes.forEach(s => result[s.size] = 0);
  
  // 1. Force minimum of 1 for all sizes if possible.
  // We prioritize sizes with larger stock if targetTotal < availableSizes.length
  availableSizes.sort((a, b) => b.stock - a.stock);
  let assignedTotal = 0;
  
  for (let i = 0; i < availableSizes.length && assignedTotal < targetTotal; i++) {
    result[availableSizes[i].size] = 1;
    assignedTotal++;
  }
  
  // 2. Distribute remaining using D'Hondt method (highest quotient)
  while (assignedTotal < targetTotal) {
    let maxQuotient = -1;
    let selectedSize: string | null = null;
    
    for (let i = 0; i < availableSizes.length; i++) {
      const { size, stock } = availableSizes[i];
      if (result[size] < stock) {
        const quotient = stock / (result[size] + 1);
        if (quotient > maxQuotient) {
          maxQuotient = quotient;
          selectedSize = size;
        }
      }
    }
    
    if (selectedSize === null) {
      // Cannot assign more (all sizes reached their max stock)
      break;
    }
    
    result[selectedSize]++;
    assignedTotal++;
  }
  
  return result;
}
