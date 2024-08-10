import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFilePath = path.join(__dirname, 'products.json'); // Ruta del archivo JSON

// Cargar productos desde el archivo JSON al inicio
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

export function getProducts() {
  return products;
}

export function addProduct(product) {
  products.push(product);
  saveProducts(); // Guarda automáticamente después de agregar
}

export function deleteProduct(productId) {
  products = products.filter(product => product.id !== productId);
  saveProducts(); // Guarda automáticamente después de eliminar
}

export function saveProducts() {
  const data = JSON.stringify(products, null, 2);
  fs.writeFileSync(productsFilePath, data, 'utf-8');
}
