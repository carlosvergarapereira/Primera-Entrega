import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para manejar rutas no encontradas
app.get('*', (req, res) => {
    res.send('Ruta no Encontrada');
});

app.listen(8080, () => {
    console.log('Listening on 8080');
});
