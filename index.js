import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { getProducts, addProduct, deleteProduct } from './data/products.js'; // No necesitas importar saveProducts aquí
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
});

hbs.handlebars.registerHelper('json', (context) => {
    return JSON.stringify(context);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/create', (req, res) => {
    res.render('createProduct');
});

app.get('/products', (req, res) => {
    res.render('index', { products: getProducts() });
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('deleteProduct', (productId) => {
        deleteProduct(+productId);
        io.emit('updateProducts', getProducts()); // Actualiza todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.post('/api/products', (req, res) => {
    const newProduct = {
        id: getMaxProductId(getProducts()) + 1,
        ...req.body
    };

    addProduct(newProduct);
    io.emit('updateProducts', getProducts()); 

    res.status(201).json({ message: 'Producto agregado', products: getProducts() });
});

app.delete('/api/products/:id', (req, res) => {
    const id = +req.params.id;
    const productIndex = getProducts().findIndex(p => p.id === id);

    if (productIndex !== -1) {
        deleteProduct(id);
        io.emit('updateProducts', getProducts()); // Notificar a los clientes
        res.json({ message: 'Producto eliminado', products: getProducts() });
    } else {
        res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
});

function getMaxProductId(products) {
    return products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
}

server.listen(8080, () => {
    console.log('Listening on 8080');
});
