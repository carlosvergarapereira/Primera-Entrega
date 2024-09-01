import mongoose from 'mongoose';
import cartSchema from '../schemas/carts.js';

const Cart = mongoose.model('carts', cartSchema);

export default Cart;