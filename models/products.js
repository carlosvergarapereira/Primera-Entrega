import mongoose from 'mongoose';
import productoSchema from '../schemas/products.js'; // Importa el esquema del producto

const Productos = mongoose.model('products', productoSchema);  // El nombre debe coincidir con el de la referencia

export default Productos;