import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartsFilePath = path.join(__dirname, 'carts.json'); // Ruta del archivo JSON

// Cargar carts desde el archivo JSON al inicio
let carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));

// Función para obtener los carts
export function getCarts() {
  return carts;
}

// Función para agregar un nuevo cart
export function addCart(cart) {
  carts.push(cart);
  saveCarts(); // Guarda automáticamente después de agregar
}

// Función para eliminar un cart
export function deleteCart(cartId) {
  carts = carts.filter(cart => cart.id !== cartId);
  saveCarts(); // Guarda automáticamente después de eliminar
}

// Función para guardar los carts en el archivo JSON
export function saveCarts() {
  const data = JSON.stringify(carts, null, 2);
  fs.writeFileSync(cartsFilePath, data, 'utf-8');
}
