import express from 'express';
import { getProducts, addProduct, deleteProduct, saveProducts } from '../data/products.js';

const router = express.Router();

// Ruta para crear un nuevo producto
router.post('/', (req, res) => {
    const newProduct = {
        id: getMaxProductId(getProducts()) + 1,
        ...req.body
    };

    addProduct(newProduct);
    saveProducts(); // Guarda los cambios en el archivo
    req.app.get('io').emit('updateProducts', getProducts()); // Notificar a los clientes

    res.status(201).json({ message: 'Producto agregado', products: getProducts() });
});

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

// Ruta para renderizar productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

// Función para obtener el ID máximo de los productos
function getMaxProductId(products) {
    return products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
}

export default router;
