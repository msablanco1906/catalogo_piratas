import { getParsedProductsFromSheets } from './src/server/syncService';
async function test() {
  const products = await getParsedProductsFromSheets();
  console.log("Product:", products.find(p => p.id === '347011251'));
}
test();
