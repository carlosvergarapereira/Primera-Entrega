import express from 'express';
import { getProducts, deleteProduct, saveProducts } from '../data/products.js';

const router = express.Router();

// Ruta para eliminar un producto por ID
router.delete('/:id', (req, res) => {
    const id = +req.params.id;
    const productIndex = getProducts().findIndex(p => p.id === id);

    if (productIndex !== -1) {
        deleteProduct(id);
        saveProducts(); // Guarda los cambios en el archivo
        req.app.get('io').emit('updateProducts', getProducts()); // Notificar a los clientes
        res.json({ message: 'Producto eliminado', products: getProducts() });
    } else {
        res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
});

export default router;
