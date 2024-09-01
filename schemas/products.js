import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  descripcion: String   

});

export default productoSchema;