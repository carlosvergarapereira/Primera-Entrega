import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    descripcion: String,
    categoria: {
        type: String,
        enum: ['electronica', 'ropa', 'hogar', 'otros'] //  agregar más categorías.
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