import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    precio: {
        type: Number,
        required: true,
    },
    descripcion: String,
    categoria: {
        type: String,
        enum: ['electronica', 'ropa', 'hogar', 'otros'] //  agregar categorías.
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