import express from 'express';
import { create } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewRouter from './routes/views.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const mongooseUri = process.env.MONGODB_URI;

app.set('io', io);

// Configuración de Handlebars 
const hbs = create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: '.handlebars',
  defaultLayout: 'main',
  helpers: {
    json: function (context) {
      return JSON.stringify(context);
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
// Redirige la raíz del proyecto a /api/products/view
app.get('/', (req, res) => {
  res.redirect('/api/products/view');
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

server.listen(8080, () => {
  console.log('Listening on port 8080');
});

mongoose.connect(mongooseUri)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
