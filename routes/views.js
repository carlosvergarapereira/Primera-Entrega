import express from 'express';
import { getProducts } from '../data/products.js';

const router = express.Router();

// Ruta para el formulario de creación de productos
router.get('/create', (req, res) => {
    res.render('createProduct');
});

// Ruta para renderizar todos los productos
router.get('/products', (req, res) => {
    res.render('index', { products: getProducts() });
});

// Ruta para renderizar productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

export default router;
