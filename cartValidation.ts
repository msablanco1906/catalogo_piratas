import { CartItem } from '../types';

export const MIN_UNITS_PER_BRAND_DIVISION = 12;

export interface BrandDivisionGroup {
  key: string;
  marca: string;
  division: string;
  units: number;
  minRequired: number;
  isValid: boolean;
  missingUnits: number;
  progressPercentage: number;
}

export interface CartValidationResult {
  totalUnits: number;
  groups: BrandDivisionGroup[];
  allGroupsValid: boolean;
  invalidGroups: BrandDivisionGroup[];
  validGroups: BrandDivisionGroup[];
}

export function validateCartBrandDivision(cart: CartItem[]): CartValidationResult {
  const map = new Map<string, { marca: string; division: string; units: number }>();
  let totalUnits = 0;

  cart.forEach(item => {
    const qty = Object.values(item.quantities).reduce((a, b) => a + (b || 0), 0);
    if (qty <= 0) return;

    totalUnits += qty;

    const marcaClean = (item.product.marca || 'Sin Marca').trim();
    const divisionClean = (item.product.category || 'General').trim();
    const key = `${marcaClean.toUpperCase()}___${divisionClean.toUpperCase()}`;

    const existing = map.get(key) || { marca: marcaClean, division: divisionClean, units: 0 };
    existing.units += qty;
    map.set(key, existing);
  });

  const groups: BrandDivisionGroup[] = Array.from(map.entries()).map(([key, data]) => {
    const isValid = data.units >= MIN_UNITS_PER_BRAND_DIVISION;
    const missingUnits = isValid ? 0 : MIN_UNITS_PER_BRAND_DIVISION - data.units;
    const progressPercentage = Math.min(100, Math.round((data.units / MIN_UNITS_PER_BRAND_DIVISION) * 100));

    return {
      key,
      marca: data.marca,
      division: data.division,
      units: data.units,
      minRequired: MIN_UNITS_PER_BRAND_DIVISION,
      isValid,
      missingUnits,
      progressPercentage
    };
  });

  // Sort: invalid groups first, then by marca, division
  groups.sort((a, b) => {
    if (a.isValid !== b.isValid) {
      return a.isValid ? 1 : -1;
    }
    return a.marca.localeCompare(b.marca) || a.division.localeCompare(b.division);
  });

  const invalidGroups = groups.filter(g => !g.isValid);
  const validGroups = groups.filter(g => g.isValid);
  const allGroupsValid = groups.length > 0 && invalidGroups.length === 0;

  return {
    totalUnits,
    groups,
    allGroupsValid,
    invalidGroups,
    validGroups
  };
}
