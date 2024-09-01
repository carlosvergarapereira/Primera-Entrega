import express from 'express';
import Productos from '../models/products.js';
import Carts from '../models/carts.js'; 
const router = express.Router();

// Ruta para mostrar la lista de productos con paginación
router.get('/products', async (req, res) => {
  const { query, sort = 'asc', page = 1, limit = 10 } = req.query;

  // Definir el filtro basado en el query parameter
  let filter = {};

  // Si se proporciona un query parameter, añadirlo al filtro
  if (query) {
    filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } }, // Filtra por título
        { description: { $regex: query, $options: 'i' } }, // Filtra por descripción
        // Añade más campos si es necesario
      ],
    };
  }

  // Lógica para filtrar, ordenar y paginar los productos
  const products = await Productos.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ price: sort === 'asc' ? 1 : -1 });

  // Calcular valores para la paginación (por simplicidad, se asume que totalPages, hasPrevPage, etc. ya están definidos)
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

export default router;  