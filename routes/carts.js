import express from 'express';
import Cart from '../models/carts.js';
import Productos from '../models/products.js';  // Modelo de Productos

const router = express.Router();

router.get('/cart-details', async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('products.product');
    
    if (!cart || cart.products.length === 0) {
      return res.status(200).json({
        message: "Tu carrito está vacío.",
        cartId: null
      });
    }

    const products = cart.products.map(item => {
      if (!item.product) {
        // Si el producto no está poblado correctamente, devuélvelo como nulo
        return null;
      }
      return {
        nombre: item.product.nombre,
        precio: item.product.precio,
        cantidad: item.quantity,
        total: item.product.precio * item.quantity,
        id: item.product._id
      };
    }).filter(product => product !== null);  // Filtra productos nulos

    const totalPrice = products.reduce((acc, curr) => acc + curr.total, 0);

    res.status(200).json({
      cartId: cart._id,
      products: products,
      totalPrice: totalPrice
    });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener los detalles del carrito');
  }
});
// PUT /api/carts/:cid/products/:pid para actualizar la cantidad de un producto en el carrito
router.put('/api/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    // Actualiza la cantidad del producto
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Error al actualizar la cantidad del producto:', error);
    res.status(500).json({ message: 'Error al actualizar la cantidad del producto', error: error.message });
  }
});
// POST /api/carts/add-product/:pid para agregar un producto al carrito
router.post('/add-product/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    let cart = await Cart.findOne();

    if (!cart) {
      cart = new Cart({ products: [{ product: pid, quantity: 1 }] });
      await cart.save();
      return res.status(201).json({ success: true, message: 'Carrito creado y producto añadido con éxito.', cart });
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += 1;
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Producto añadido al carrito con éxito.', cart });
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).json({ success: false, message: 'Error al agregar el producto al carrito.', error: error.message });
  }
});

// DELETE /api/carts/api/carts/:cid/products/:pid para reducir la cantidad de un producto o eliminarlo del carrito
router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    // Reduce la cantidad del producto en 1
    cart.products[productIndex].quantity -= 1;

    // Si la cantidad llega a 0, elimina el producto del carrito
    if (cart.products[productIndex].quantity <= 0) {
      cart.products.splice(productIndex, 1);
    }

    await cart.save();

    res.json({ message: 'Cantidad del producto reducida en 1', cart });
  } catch (error) {
    console.error('Error al modificar el producto del carrito:', error);
    res.status(500).json({ message: 'Error al modificar el producto del carrito', error: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid para actualizar la cantidad de un producto en el carrito
router.put('/api/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Error al actualizar la cantidad del producto:', error);
    res.status(500).json({ message: 'Error al actualizar la cantidad del producto', error: error.message });
  }
});

// DELETE /api/carts/:cid para vaciar el carrito
router.delete('/api/carts/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json({ message: 'Todos los productos han sido eliminados del carrito' });
  } catch (error) {
    console.error('Error al eliminar todos los productos del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar todos los productos del carrito', error: error.message });
  }
});

export default router;
