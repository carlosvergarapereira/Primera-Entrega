import express from 'express';
import Productos from '../models/products.js'; // Importa el modelo de Productos

const router = express.Router();

// Ruta GET /api/products con búsqueda, filtrado, ordenamiento y paginación
router.get('/', async (req, res) => {
  const { query, category, availability, sort, page = 1, limit = 10 } = req.query;

  const filter = {};

  // Búsqueda por nombre
  if (query) {
    filter.nombre = { $regex: query, $options: 'i' }; // Búsqueda insensible a mayúsculas y minúsculas
  }

  // Filtrado por categoría
  if (category) {
    filter.categoria = category;
  }

  // Filtrado por disponibilidad
  if (availability) {
    filter.estado = availability === 'true';
  }

  try {
    const totalProducts = await Productos.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const options = {
      sort: sort ? { precio: sort === 'asc' ? 1 : -1 } : {}, // Ordenamiento por precio ascendente o descendente
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
      prevLink: page > 1 ? `/api/products?query=${query}&category=${category}&availability=${availability}&sort=${sort}&page=${page - 1}&limit=${limit}` : null,
      nextLink: page < totalPages ? `/api/products?query=${query}&category=${category}&availability=${availability}&sort=${sort}&page=${page + 1}&limit=${limit}` : null
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});

// Ruta POST /api/products para crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const newProduct = new Productos(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al crear el producto' });
  }
});

// Ruta GET /api/products/:id para obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Productos.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
});



// Ruta PUT /api/products/:id para actualizar un producto por ID
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Productos.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al actualizar el producto' });
  }
});

// Ruta DELETE /api/products/:id para eliminar un producto por ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Productos.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

// Ruta para mostrar la página de productos usando Handlebars
router.get('/view', async (req, res) => {
  try {
      const productos = await Productos.find(); // Obtiene todos los productos sin filtros
      res.render('index', { payload: productos }); // Renderiza la vista 'index.handlebars' pasando los productos
  } catch (error) {
      console.error('Error al obtener los productos:', error);
      res.status(500).send('Error en el servidor');
  }
});

export default router;
