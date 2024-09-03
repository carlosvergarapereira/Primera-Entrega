import express from 'express';
import Productos from '../models/products.js';
import Cart from '../models/carts.js';
const router = express.Router();

// Ruta para mostrar la página de creación de productos usando Handlebars
router.get('/create', (req, res) => {
  res.render('createProduct', { title: 'Crear Nuevo Producto' });
});

// Ruta para mostrar la lista de productos con paginación
router.get('/products', async (req, res) => {
  const { query, sort = 'asc', page = 1, limit = 10 } = req.query;
  let filter = {};

  // Si se proporciona un query parameter, añadirlo al filtro
  if (query) {
    filter = {
      $or: [
        { nombre: { $regex: query, $options: 'i' } }, // Filtra por nombre
        { descripcion: { $regex: query, $options: 'i' } }, // Filtra por descripción
      ],
    };
  }
    

  // Lógica para filtrar, ordenar y paginar los productos
  const products = await Productos.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ precio: sort === 'asc' ? 1 : -1 });

  const totalProducts = await Productos.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevLink = hasPrevPage ? `/products?page=${page - 1}&limit=${limit}` : null;
  const nextLink = hasNextPage ? `/products?page=${page + 1}&limit=${limit}` : null;

  res.render('index', {
    payload: products,
    totalPages,
    page,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
  });
});


// GET /product-details/:pid
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


// Ruta para servir la página de productos en tiempo real, cargando todos los productos disponibles
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
      const cart = await Cart.findOne(); // Obtén el carrito. Considera manejar usuarios o sesiones específicas
      if (!cart) {
          // Si no hay un carrito, tal vez quieras enviar al usuario a una página de "Carrito Vacío"
          return res.render('cart-details', { products: [], title: "Detalles del Carrito" });
      }
      // Preparar productos y otros datos necesarios para pasar a la vista
      const products = cart.products.map(item => ({
          nombre: item.product.nombre, // Asegúrate de que estas propiedades existen
          precio: item.product.precio,
          cantidad: item.quantity,
          total: item.product.precio * item.quantity,
          id: item.product._id
      }));

      res.render('cart-details', { products: products, title: "Detalles del Carrito" }); // Envía los datos a la vista
  } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).send('Error al obtener los detalles del carrito');
  }
});



export default router;
