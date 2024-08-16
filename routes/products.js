import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/products.js'; // Importa las rutas de productos

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

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Usa las rutas importadas
app.use('/api/products', productRoutes);

// WebSocket para manejar la conexión y los eventos
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        // Llama al router para manejar la lógica de eliminar
        await deleteProductHandler(productId);
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

server.listen(8080, () => {
    console.log('Listening on 8080');
});
