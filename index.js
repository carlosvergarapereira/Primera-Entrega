import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewRouter from './routes/views.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const mongooseUri = process.env.MONGODB_URI;

app.set('io', io);

const hbs = create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: '.handlebars',
  defaultLayout: 'main',
  helpers: {
    json: function (context) {
      return JSON.stringify(context);
    },
    calculateTotal: function (products) {
      return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', viewRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/cart-details', cartsRouter); 

server.listen(8080, () => {
  console.log('Listening puerto 8080');
});

mongoose.connect(mongooseUri)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
