import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    descripcion: String,
    categoria: {
        type: String,
        enum: ['electronica', 'ropa', 'hogar', 'otros'] // Puedes agregar más categorías si lo deseas
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