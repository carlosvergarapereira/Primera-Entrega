//Carlos Vergara Pereira 

import express from 'express';
import { v4 as uuidv4 } from 'uuid'; //cambiar a id numerico
import { products } from './products.js';
import { carts } from './carts.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Products

//Metodo Delete

app.delete('/api/products/:id', (req, res) => {
    const id = +req.params.id;
  
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
  
    products.splice(productIndex, 1);
  
    res.json({ message: 'Producto eliminado', products });
  });

// Métodos Post
app.post('/api/products', (req, res) => {

    console.log(req);

    const query = req.query.category;

    if ((query && query === 'Hogar') || query === 'jardin') {
        const productByDescription = products.filter(p => p.category === query);
        return res.json({ productByDescription });
    }
    console.log(products);

    const newIdProduct = {
        id: getMaxProductId(products) + 1,
        ...req.body
      };
    const product =newIdProduct; //req.body;
    const existingProduct = products.find(p => p.id === product.id);
    products
    
    if (existingProduct) {
        return res.status(400).json({ message: 'El ID ya existe' });
    }

    const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category'];
    for (const field of requiredFields) {
        if (!product[field]) {
            return res.status(400).json({ message: `El campo ${field} es obligatorio y no debe estar vacío` });
        }
    }

    products.push(product);
    res.status(201).json({ message: 'Request successful', products });
});

function getMaxProductId(products) {
    let maxId = 0;
    for (const product of products) {
      if (product.id > maxId) {
        maxId = product.id;
      }
    }
    return maxId;
  }

//Metodo Put

app.put('/api/products/:id', (req, res) => {
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
  
    res.status(200).json({ message: 'Producto actualizado', product: products[pos] });
  });


//Metodo Get 

// Todos los Productos
app.get('/api/products', (req, res) => {
    console.log(req);

    const query = req.query.category;

    if ((query && query === 'Hogar') || query === 'jardin') {
        const productByDescription = products.filter(p => p.category === query);
        return res.json({ productByDescription });
    }
    console.log(products);
    res.json({ products });
});

// Un producto
app.get('/api/products/:id', (req, res) => {
    console.log(req.params.id);
    
    if (Number.isNaN(+req.params.id)) {
        return res.json({ message: 'El id ingresado no es numerico' });
    }
    
    const product = products.find(p => p.id === +req.params.id);

    if (!product) {
        return res.json({ message: 'El id ingresado no existe' });
    }
    
    console.log(product);
    res.json({ product });
});

//CARTS

app.post('/api/carts', (req, res) => {
    const productIds = req.body.productIds;
    const newIdCart = {
      id: getMaxCartsId(carts) + 1
    };
    const cartProducts = productIds.map(productId => {
      const product = products.find(p => p.id === productId);
      return { id: product.id , quantity:1};
    });
    const cart = { id: newIdCart.id, products:  cartProducts  };
    carts.push(cart);
    res.json(cart);
  });


function getMaxCartsId(carts) {
    let maxId = 0;
    for (const cart of carts) {
      if (cart.id > maxId) {
        maxId = cart.id;
      }
    }
    return maxId;
  }

  // Añadir al carro

  app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
  
    const cart = carts.find(c => c.id === +cartId);
    if (!cart) {
      return res.status(404).json({ message: 'No existe el carrito con ese ID' });
    }
  
    const product = cart.products.find(p => p.id === +productId);
    if (!product) {
      return res.status(404).json({ message: 'No existe el producto con ese ID' });
    }
  
    if (!product.quantity) {
      product.quantity = 0;
    }
    product.quantity += 1;
  
    res.json({ message: 'Cantidad actualizada', cart });
  });


//   app.post('/api/carts/:cid/product/:pid', (req, res) => {
//     const cartId = req.params.cid;
//     const productId = req.params.pid;
  
//     const cart = carts.find(c => c.id === +cartId);
//     console.log(cart);
//     if (!cart) {
//       return res.status(404).json({ message: 'No existe el carrito con ese ID' });
//     }
  
//     const product = cart.products.find(p => p.id === +productId);
//     if (!product) {
//       return res.status(404).json({ message: 'No existe el producto con ese ID' });
//     }
  
//     const newItem = { ...product };
//     cart.products.push(newItem);
  
//     res.json({ message: 'Nuevo item agregado al carrito', cart });
//   });


//Metodo Get 

app.get('/api/carts', (req, res) => {
    console.log(req);
    console.log(carts);
    res.json({ carts });
});


// Un producto
app.get('/api/carts/:id', (req, res) => {
    console.log(req.params.id);
    
    if (Number.isNaN(+req.params.id)) {
        return res.json({ message: 'El id ingresado no es numerico' });
    }
    
    const cart = carts.find(c => c.id === +req.params.id);

    if (!cart) {
        return res.json({ message: 'El id ingresado no existe' });
    }
    
    console.log(cart);
    res.json({ cart });
});


//validaciones
app.get('*', (req, res) => {
    res.send('Ruta no Encontrada');
});

app.listen(8080, () => {
    console.log('Listening on 8080');
});