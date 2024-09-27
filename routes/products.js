import express from 'express';
import { body, validationResult } from 'express-validator';
import Productos from '../models/products.js';

const router = express.Router();

// Middleware para manejo de errores
const errorHandler = (error, res) => {
  console.error(error);
  res.status(500).json({ status: 'error', message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.' });
};

// Ruta para obtener productos con filtros (nombre, categoría, disponibilidad, etc.)
router.get('/', async (req, res) => {
  const { query, category, availability = 'true', sort = 'asc', page = 1, limit = 10 } = req.query;

  const filter = {};

  // Búsqueda por nombre o categoría
  if (query) {
    filter.$or = [
      { nombre: { $regex: query, $options: 'i' } },
      { categoria: { $regex: query, $options: 'i' } }
    ];
  }

  // Filtrado por disponibilidad
  filter.estado = availability === 'true';

  try {
    const totalProducts = await Productos.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const options = {
      sort: { precio: sort === 'asc' ? 1 : -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };

    const products = await Productos.find(filter, {}, options);

    const response = {
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page: parseInt(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?page=${page - 1}&limit=${limit}` : null,
      nextLink: page < totalPages ? `/api/products?page=${page + 1}&limit=${limit}` : null
    };

    res.json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

// Ruta para mostrar productos en la vista (filtrados por disponibilidad)
router.get('/view', async (req, res) => {
  try {
    const productos = await Productos.find({ estado: true });
    res.render('index', { payload: productos });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Ruta para crear un nuevo producto con validaciones mejoradas
router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre del producto es obligatorio'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    body('categoria').notEmpty().withMessage('La categoría es obligatoria'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newProduct = new Productos(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

// Ruta para obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Productos.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    errorHandler(error, res);
  }
});

// Ruta para actualizar un producto por ID con validaciones mejoradas
router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().withMessage('El nombre del producto es obligatorio'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    body('categoria').optional().notEmpty().withMessage('La categoría es obligatoria'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedProduct = await Productos.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.json(updatedProduct);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

// Ruta para eliminar un producto por ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Productos.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;
