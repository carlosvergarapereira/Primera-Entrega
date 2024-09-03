import express from 'express';
import Cart from '../models/carts.js';
import Productos from '../models/products.js'; // Asegúrate de importar el modelo de Productos

const router = express.Router();

// DELETE api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();

    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
  }
});

// PUT api/carts/:cid
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body; // Array de productos con formato { product, quantity }

  try {
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el carrito' });
  }
});

// PUT api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cantidad del producto' });
  }
});

// DELETE api/carts/:cid
router.delete('/:cid', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar todos los productos del carrito' });
  }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
});

// POST /api/carts
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el carrito' });
  }
});

// POST /api/carts/add-product/:pid
router.post('/add-product/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    let cart = await Cart.findOne(); // Busca el primer carrito o crea uno nuevo

    if (!cart) {
      // Si no hay carritos existentes, crea uno nuevo
      cart = new Cart({ products: [{ product: pid, quantity: 1 }] });
      await cart.save();
      return res.status(201).json(cart);
    }

    // Añade el producto al carrito existente
    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += 1;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el producto al carrito' });
  }
});

export default router;
