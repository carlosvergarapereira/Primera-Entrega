import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '../data/products.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFilePath = path.join(__dirname, '../data/products.js');

function getMaxProductId(products) {
    let maxId = 0;
    for (const product of products) {
        if (product.id > maxId) {
            maxId = product.id;
        }
    }
    return maxId;
}

function saveProductsToFile(products) {
    fs.writeFileSync(productsFilePath, `export const products = ${JSON.stringify(products, null, 2)};`);
}

// Obtener todos los productos
router.get('/', (req, res) => {
    const query = req.query.category;

    if (query && (query === 'Hogar' || query === 'jardin')) {
        const productByDescription = products.filter(p => p.category === query);
        return res.json({ productByDescription });
    }
    res.json({ products });
});

// Obtener un producto por ID
router.get('/:id', (req, res) => {
    const id = +req.params.id;

    if (Number.isNaN(id)) {
        return res.json({ message: 'El id ingresado no es numerico' });
    }

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.json({ message: 'El id ingresado no existe' });
    }

    res.json({ product });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const newIdProduct = {
        id: getMaxProductId(products) + 1,
        ...req.body
    };

    const existingProduct = products.find(p => p.id === newIdProduct.id);
    if (existingProduct) {
        return res.status(400).json({ message: 'El ID ya existe' });
    }

    const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
    for (const field of requiredFields) {
        if (!newIdProduct[field]) {
            return res.status(400).json({ message: `El campo ${field} es obligatorio y no debe estar vacío` });
        }
    }

    products.push(newIdProduct);
    saveProductsToFile(products);
    res.status(201).json({ message: 'Request successful', products });
});

// Actualizar un producto por ID
router.put('/:id', (req, res) => {
    const id = +req.params.id;
    const newProduct = req.body;

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.status || !newProduct.stock || !newProduct.category) {
        return res.status(400).json({ message: 'Faltan Campos' });
    }

    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ message: `No existe el producto con ID ${id}` });
    }

    const pos = products.findIndex(p => p.id === id);
    products[pos] = { ...product, ...newProduct };
    saveProductsToFile(products);

    res.status(200).json({ message: 'Producto actualizado', product: products[pos] });
});

// Eliminar un producto por ID
router.delete('/:id', (req, res) => {
    const id = +req.params.id;

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'No existe el producto con ese ID' });
    }

    products.splice(productIndex, 1);
    saveProductsToFile(products);

    res.json({ message: 'Producto eliminado', products });
});

export default router;
