import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFilePath = path.join(__dirname, 'products.json'); // Ruta del archivo JSON

// Ruta de la imagen predeterminada
const defaultImageUrl = 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg';

// Cargar productos desde el archivo JSON al inicio
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// Asegúrate de que cada producto tenga un campo `thumbnails` con un valor predeterminado si es necesario
products = products.map(product => ({
  ...product,
  thumbnails: product.thumbnails || [defaultImageUrl]
}));

export function getProducts() {
  return products;
}

export function addProduct(product) {
  // Establecer una imagen predeterminada si no se proporciona una
  if (!product.thumbnails || product.thumbnails.length === 0) {
    product.thumbnails = [defaultImageUrl];
  }
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
