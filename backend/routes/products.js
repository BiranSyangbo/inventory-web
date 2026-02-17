import express from 'express';

const router = express.Router();

// In-memory database
let products = [
  {
    id: 1,
    name: 'Vodka',
    category: 'Spirits',
    brand: 'Smirnoff',
    volumeMl: 750,
    unit: 'bottle',
    barcode: 'VOD-001',
    minStock: 10,
    currentStock: 45,
    unitPrice: 25.99
  },
  {
    id: 2,
    name: 'Whiskey',
    category: 'Spirits',
    brand: 'Jack Daniel\'s',
    volumeMl: 750,
    unit: 'bottle',
    barcode: 'WHI-001',
    minStock: 8,
    currentStock: 32,
    unitPrice: 35.99
  },
  {
    id: 3,
    name: 'Red Bordeaux',
    category: 'Wine',
    brand: 'Château Margaux',
    volumeMl: 750,
    unit: 'bottle',
    barcode: 'RWN-001',
    minStock: 5,
    currentStock: 18,
    unitPrice: 45.99
  },
  {
    id: 4,
    name: 'IPA',
    category: 'Beer',
    brand: 'Dogfish Head',
    volumeMl: 355,
    unit: 'bottle',
    barcode: 'BER-001',
    minStock: 20,
    currentStock: 120,
    unitPrice: 6.99
  }
];

let nextId = 5;

// GET all products
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

// CREATE new product
router.post('/', (req, res) => {
  try {
    const { name, category, brand, volumeMl, unit, barcode, minStock, currentStock, unitPrice } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (minStock !== undefined && minStock < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock cannot be negative' });
    }

    // Check for duplicate barcode
    if (barcode && products.some(p => p.barcode === barcode)) {
      return res.status(400).json({ success: false, message: 'Barcode already exists' });
    }

    const newProduct = {
      id: nextId++,
      name: name.trim(),
      category: category || '',
      brand: brand || '',
      volumeMl: volumeMl || null,
      unit: unit || '',
      barcode: barcode || null,
      minStock: minStock || 0,
      currentStock: currentStock || 0,
      unitPrice: unitPrice || 0
    };

    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Product created', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
});

// UPDATE product
router.put('/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, category, brand, volumeMl, unit, barcode, minStock, currentStock, unitPrice } = req.body;

    if (name && !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name cannot be empty' });
    }

    if (minStock !== undefined && minStock < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock cannot be negative' });
    }

    // Check for duplicate barcode (excluding current product)
    if (barcode && products.some(p => p.barcode === barcode && p.id !== parseInt(req.params.id))) {
      return res.status(400).json({ success: false, message: 'Barcode already exists' });
    }

    // Update only provided fields
    const updatedProduct = {
      ...products[productIndex],
      ...(name && { name: name.trim() }),
      ...(category !== undefined && { category }),
      ...(brand !== undefined && { brand }),
      ...(volumeMl !== undefined && { volumeMl }),
      ...(unit !== undefined && { unit }),
      ...(barcode !== undefined && { barcode }),
      ...(minStock !== undefined && { minStock }),
      ...(currentStock !== undefined && { currentStock }),
      ...(unitPrice !== undefined && { unitPrice })
    };

    products[productIndex] = updatedProduct;
    res.json({ success: true, message: 'Product updated', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

// DELETE product
router.delete('/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const deletedProduct = products.splice(productIndex, 1);
    res.json({ success: true, message: 'Product deleted', data: deletedProduct[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

// SEARCH and FILTER products
router.get('/search/filter', (req, res) => {
  try {
    const { search, category, brand } = req.query;
    let filtered = products;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.barcode?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (brand) {
      filtered = filtered.filter(p => p.brand === brand);
    }

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filtering products' });
  }
});

export default router;
