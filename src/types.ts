export interface Product {
  id: string;
  sku: string;
  articulo: string;
  modelo: string;
  name: string;
  marca: string;
  category: string;
  division?: string;
  gender: string;
  line: string;
  driver: string;
  colorCode?: string;
  colorDesc?: string;
  discount?: string;
  price?: number;
  priceConfidential?: number;
  priceConfidentialDiscounted?: number;
  pricePublic?: number;
  pricePublicDiscounted?: number;
  status?: string;
  classification?: string;
  sizes: Record<string, number>; // Size to stock mapping
  images: string[];
  coverImage?: string;
}

export interface CartItem {
  product: Product;
  quantities: Record<string, number>; // Size to requested quantity mapping
}

export interface SheetConfig {
  stockSheetId: string;
  stockSheetTab: string;
  imageSheetId: string;
  imageSheetTab: string;
  scriptUrl?: string;
}
