import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { carts } from '../data/carts.js';
import { products } from '../data/products.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cartsFilePath = path.join(__dirname, '../data/carts.js');

function getMaxCartsId(carts) {
    let maxId = 0;
    for (const cart of carts) {
        if (cart.id > maxId) {
            maxId = cart.id;
        }
    }
    return maxId;
}

function saveCartsToFile(carts) {
    fs.writeFileSync(cartsFilePath, `export const carts = ${JSON.stringify(carts, null, 2)};`);
}

// Crear un nuevo carrito
router.post('/', (req, res) => {
    const productIds = req.body.productIds;
    const newIdCart = {
        id: getMaxCartsId(carts) + 1
    };
    const cartProducts = productIds.map(productId => {
        const product = products.find(p => p.id === productId);
        return { id: product.id, quantity: 1 };
    });
    const cart = { id: newIdCart.id, products: cartProducts };
    carts.push(cart);
    saveCartsToFile(carts);
    res.json(cart);
});

// Añadir producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = +req.params.cid;
    const productId = +req.params.pid;

    const cart = carts.find(c => c.id === cartId);
    if (!cart) {
        return res.status(404).json({ message: 'No existe el carrito con ese ID' });
    }

    const product = cart.products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'No existe el producto con ese ID' });
    }

    if (!product.quantity) {
        product.quantity = 0;
    }
    product.quantity += 1;
    saveCartsToFile(carts);

    res.json({ message: 'Cantidad actualizada', cart });
});

// Obtener todos los carritos
router.get('/', (req, res) => {
    res.json({ carts });
});

// Obtener un carrito por ID
router.get('/:id', (req, res) => {
    const id = +req.params.id;

    if (Number.isNaN(id)) {
        return res.json({ message: 'El id ingresado no es numerico' });
    }

    const cart = carts.find(c => c.id === id);

    if (!cart) {
        return res.json({ message: 'El id ingresado no existe' });
    }

    res.json({ cart });
});

export default router;
