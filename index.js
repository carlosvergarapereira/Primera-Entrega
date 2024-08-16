import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import productsRouter from './routes/products.js';
import { getProducts, addProduct, saveProducts } from './data/products.js';
import { getCarts, addCart, deleteCart, saveCarts } from './data/carts.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('io', io);

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
});

hbs.handlebars.registerHelper('json', (context) => {
    return JSON.stringify(context);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Usa el router de productos
app.use('/api/products', productsRouter);

// Ruta para el formulario de creación de productos
app.get('/create', (req, res) => {
    res.render('createProduct');
});

// Ruta para renderizar todos los productos
app.get('/products', (req, res) => {
    res.render('index', { products: getProducts() });
});

// Ruta para renderizar productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

// Ruta para obtener todos los carts
app.get('/carts', (req, res) => {
    res.json(getCarts());
});

// WebSocket para manejar la conexión y los eventos
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        deleteProduct(+productId);
        await saveProducts(); // Actualiza el archivo de productos
        io.emit('updateProducts', getProducts()); // Actualiza todos los clientes
    });

    // Evento para eliminar un cart
    socket.on('deleteCart', async (cartId) => {
        deleteCart(+cartId);
        await saveCarts(); // Actualiza el archivo de carts
        io.emit('updateCarts', getCarts()); // Actualiza todos los clientes
    });

    // Evento cuando el cliente se desconecta
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Manejar la creación de productos
app.post('/api/products', (req, res) => {
    const newProduct = {
        id: getMaxProductId(getProducts()) + 1,
        ...req.body
    };

    addProduct(newProduct);
    io.emit('updateProducts', getProducts());

    res.status(201).json({ message: 'Producto agregado', products: getProducts() });
});

// Función para obtener el ID máximo de los productos
function getMaxProductId(products) {
    return products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
}

server.listen(8080, () => {
    console.log('Listening on 8080');
});
