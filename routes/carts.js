import express from 'express';
import Cart from '../models/carts.js';
import Product from '../models/products.js';

const router = express.Router();

// GET /cart-details para mostrar los detalles del carrito
// Ruta para mostrar la página de detalles del carrito
router.get('/cart-details', async (req, res) => {
  try {
      const cart = await Cart.findOne().populate('products.product');
      if (!cart || cart.products.length === 0) {  // Verifica si el carrito no existe o está vacío
          // Renderiza la vista con un mensaje indicando que el carrito está vacío
          return res.render('cart-details', { products: [], title: "Detalles del Carrito", message: "Tu carrito está vacío." });
      }
      
      // Prepara los productos y otros datos necesarios para pasar a la vista
      const products = cart.products.map(item => ({
          nombre: item.product.nombre,
          precio: item.product.precio,
          cantidad: item.quantity,
          total: item.product.precio * item.quantity,
          id: item.product._id
      }));
      
      const totalPrice = products.reduce((acc, curr) => acc + curr.total, 0);  // Calcula el precio total del carrito
      
      res.render('cart-details', {
          products: products,
          title: "Detalles del Carrito",
          totalPrice: totalPrice
      });  // Envía los datos a la vista
  } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).send('Error al obtener los detalles del carrito');
  }
});

// POST /api/carts/add-product/:pid para agregar un producto al carrito
router.post('/add-product/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    // Busca el único carrito existente en la base de datos
    let cart = await Cart.findOne();

    if (!cart) {
      // Si no existe un carrito, crea uno nuevo
      cart = new Cart({ products: [{ product: pid, quantity: 1 }] });
      await cart.save();
      return res.status(201).json({ success: true, message: 'Carrito creado y producto añadido con éxito.', cart });
    }

    // Si el carrito ya existe, revisa si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      // Si el producto no está en el carrito, lo añade
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      // Si el producto ya está en el carrito, aumenta la cantidad
      cart.products[productIndex].quantity += 1;
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Producto añadido al carrito con éxito.', cart });
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).json({ success: false, message: 'Error al agregar el producto al carrito.', error: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid para eliminar un producto específico del carrito
router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
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

// PUT /api/carts/:cid/products/:pid para actualizar la cantidad de un producto en el carrito
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

// DELETE /api/carts/:cid para vaciar el carrito
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

export default router;
