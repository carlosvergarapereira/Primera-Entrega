import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    descripcion: String,
    categoria: {
        type: String,
        enum: ['electronica', 'ropa', 'hogar', 'otros'] // categorías.
    },
    stock: {
        type: Number,
        required: true,
        min: 0  
      },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: Boolean,
        default: true
    }
});

export default productoSchema;