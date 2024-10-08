import express from 'express';
import Productos from '../models/products.js';
import Cart from '../models/carts.js';
const router = express.Router();

// Ruta para mostrar la página de creación de productos usando Handlebars
router.get('/create', (req, res) => {
  res.render('createProduct', { title: 'Crear Nuevo Producto' });
});

// Ruta para mostrar la lista de productos con paginación y filtrado por categoría
router.get('/products', async (req, res) => {
  const { category, sort = 'asc', page = 1, limit = 10 } = req.query;
  let filter = { estado: true }; // Filtrar siempre por productos activos

  // Filtrar por categoría si se proporciona
  if (category && category !== '') {
    filter.categoria = category;
  }

  try {
    // Lógica para filtrar, ordenar y paginar los productos
    const products = await Productos.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ precio: sort === 'asc' ? 1 : -1 });

    const totalProducts = await Productos.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevLink = hasPrevPage ? `/products?category=${category}&page=${page - 1}&limit=${limit}` : null;
    const nextLink = hasNextPage ? `/products?category=${category}&page=${page + 1}&limit=${limit}` : null;

    res.render('index', {
      payload: products,
      totalPages,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});




router.get('/product-details/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    const product = await Productos.findById(pid);
    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado' });
    }

    res.render('product-details', { product });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error al obtener el producto' });
  }
});


// Ruta para servir la página de productos en tiempo real, mostrando los productos disponibles
router.get('/realtimeproducts', async (req, res) => {
  try {
      const products = await Productos.find({});
      // Escapa correctamente el JSON
      const productsJSON = JSON.stringify(products).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      res.render('realtimeproducts', { products: productsJSON });
  } catch (error) {
      console.error('Error al cargar los productos:', error);
      res.status(500).send('Error en el servidor');
  }
});

// Ruta para mostrar la página de detalles del carrito
router.get('/cart-details', async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('products.product'); 
    if (!cart || cart.products.length === 0) {
      return res.render('cart-details', { products: [], title: "Detalles del Carrito" });
    }

   
    const products = cart.products.map(item => {
      if (!item.product) {
        return null;  
      }
      return {
        nombre: item.product.nombre || 'Producto sin nombre',  
        precio: item.product.precio || 0,  
        cantidad: item.quantity,
        total: (item.product.precio || 0) * item.quantity,  
        id: item.product._id
      };
    }).filter(product => product !== null);  

    const totalPrice = products.reduce((acc, curr) => acc + curr.total, 0); 

    res.render('cart-details', {
      cartId: cart._id,
      products: products,
      title: "Detalles del Carrito",
      totalPrice: totalPrice
    });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener los detalles del carrito');
  }
});



export default router;
