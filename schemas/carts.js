import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',  // Referencia al modelo Producto
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
});

export default cartSchema;