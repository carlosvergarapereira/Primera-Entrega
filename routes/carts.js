import express from 'express';
import Cart from '../models/carts.js';
import Product from '../models/products.js'; // Importa el modelo de productos

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
      // Verificar que haya stock antes de incrementar la cantidad
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
    // Buscar el carrito y poblar los productos
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product._id.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    const product = cart.products[productIndex].product;
    const quantityToReturn = cart.products[productIndex].quantity;

    // Devolver el stock
    product.stock += quantityToReturn;

    // Guardar el producto con el stock actualizado
    await product.save();

    // Eliminar el producto del carrito
    cart.products.splice(productIndex, 1);

    // Guardar el carrito actualizado
    await cart.save();

    res.json({ message: 'Producto eliminado del carrito y stock actualizado', cart });
  } catch (error) {
    console.error('Error al modificar el producto del carrito:', error);
    res.status(500).json({ message: 'Error al modificar el producto del carrito', error: error.message });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito y ajustar el stock
router.put('/api/carts/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(cid).populate('products.product'); // Poblar los productos en el carrito
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product._id.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    const product = cart.products[productIndex].product;
    const currentQuantity = cart.products[productIndex].quantity;
    const quantityDifference = quantity - currentQuantity;

    // Verificar stock disponible antes de aumentar la cantidad
    if (quantityDifference > 0 && product.stock < quantityDifference) {
      return res.status(400).json({ message: 'No hay suficiente stock disponible' });
    }

    // Actualizar la cantidad en el carrito y ajustar el stock del producto
    cart.products[productIndex].quantity = quantity;

    // Ajustar el stock del producto
    product.stock -= quantityDifference;

    await product.save();
    await cart.save();

    res.json({ message: 'Cantidad actualizada y stock ajustado', cart });
  } catch (error) {
    console.error('Error al actualizar la cantidad del producto en el carrito:', error);
    res.status(500).json({ message: 'Error al actualizar la cantidad del producto en el carrito', error: error.message });
  }
});

export default router;
