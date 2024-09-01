import mongoose from 'mongoose';
import productoSchema from '../schemas/products.js'; // Importando el esquema

const Productos = mongoose.model('products', productoSchema);

export default Productos; // Exportar el modelo como default
