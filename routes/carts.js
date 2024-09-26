import express from 'express';
import Cart from '../models/carts.js';
import Product from '../models/products.js'; // Asegúrate de importar el modelo de productos

const router = express.Router();

// Ruta para agregar un producto al carrito
router.post('/add-product/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    // Verificar si el producto existe y su stock
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'El producto no tiene stock disponible' });
    }

    let cart = await Cart.findOne();

    if (!cart) {
      // Crear un nuevo carrito y agregar el producto si no existe
      cart = new Cart({ products: [{ product: pid, quantity: 1 }] });

      // Descontar el stock del producto
      product.stock -= 1;
      await product.save();

      await cart.save();
      return res.status(201).json({ success: true, message: 'Carrito creado y producto añadido con éxito.', cart });
    }

    // Verificar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex === -1) {
      cart.products.push({ product: pid, quantity: 1 });

      // Descontar el stock del producto
      product.stock -= 1;
    } else {
      // Si ya existe el producto en el carrito, verificar que haya stock antes de incrementar la cantidad
      if (product.stock <= 0) {
        return res.status(400).json({ success: false, message: 'El producto no tiene stock disponible' });
      }

      cart.products[productIndex].quantity += 1;

      // Descontar el stock del producto
      product.stock -= 1;
    }

    // Guardar el carrito y el producto actualizado
    await product.save();
    await cart.save();
    res.status(200).json({ success: true, message: 'Producto añadido al carrito con éxito.', cart });
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).json({ success: false, message: 'Error al agregar el producto al carrito.', error: error.message });
  }
});

// Ruta para eliminar un producto del carrito y devolver el stock
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

    // Obtener el producto y devolver el stock
    const product = await Product.findById(pid);
    if (product) {
      product.stock += 1; // Devolver el stock
      await product.save();
    }

    // Reducir la cantidad del producto en 1
    cart.products[productIndex].quantity -= 1;

    // Si la cantidad llega a 0, eliminar el producto del carrito
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

export default router;
