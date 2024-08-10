import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { products } from './data/products.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
});

// Agregar el helper `json` para Handlebars
hbs.handlebars.registerHelper('json', (context) => {
    return JSON.stringify(context);
});
app.use(express.static('public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ruta para el formulario de creación de productos
app.get('/create', (req, res) => {
    res.render('createProduct');
});

// Ruta para renderizar todos los productos
app.get('/products', (req, res) => {
    res.render('index', { products });
});

// Ruta para renderizar productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products });
});

// WebSocket para manejar la conexión y los eventos
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Evento para eliminar un producto
    socket.on('deleteProduct', (productId) => {
        const productIndex = products.findIndex(p => p.id === +productId);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            io.emit('updateProducts', products); 
        }
    });

    // Evento cuando el cliente se desconecta
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Manejar la creación de productos
app.post('/api/products', (req, res) => {
    const newProduct = {
        id: getMaxProductId(products) + 1,
        ...req.body
    };

    products.push(newProduct);
    io.emit('updateProducts', products); 

    res.status(201).json({ message: 'Producto agregado', products });
});

// Manejar la eliminación de productos
app.delete('/api/products/:id', (req, res) => {
    const id = +req.params.id;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        io.emit('updateProducts', products); 
        res.json({ message: 'Producto eliminado', products });
    } else {
        res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
});

// Función para obtener el ID máximo de los productos
function getMaxProductId(products) {
    return products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
}

// Función para escribir productos al archivo
const writeProductsToFile = (products) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error al escribir productos en el archivo', error);
    }
};

// Modifica la función que maneja la eliminación de productos
app.delete('/api/products/:id', (req, res) => {
    const id = +req.params.id;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        writeProductsToFile(products); // Escribir la lista actualizada en el archivo
        io.emit('updateProducts', products); // Notificar a los clientes
        res.json({ message: 'Producto eliminado', products });
    } else {
        res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
});

server.listen(8080, () => {
    console.log('Listening on 8080');
});