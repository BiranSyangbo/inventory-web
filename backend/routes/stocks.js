import express from 'express';
import { products, stockHistory, calculateTotalValue, getLowStockItems } from '../data/stocks.js';

const router = express.Router();

// Get all products inventory levels
router.get('/inventory', (req, res) => {
  try {
    const inventoryData = products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      category: product.category,
      price: product.price
    }));
    res.json(inventoryData);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock movement history
router.get('/history', (req, res) => {
  try {
    res.json(stockHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category breakdown
router.get('/categories', (req, res) => {
  try {
    const categoryData = {};
    products.forEach(product => {
      if (!categoryData[product.category]) {
        categoryData[product.category] = 0;
      }
      categoryData[product.category] += product.quantity;
    });

    const categoryBreakdown = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    }));

    res.json(categoryBreakdown);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock alerts
router.get('/alerts', (req, res) => {
  try {
    const lowStockItems = getLowStockItems(products);
    const alerts = lowStockItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      status: item.quantity === 0 ? 'out-of-stock' : 'low-stock'
    }));
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory value analysis
router.get('/value', (req, res) => {
  try {
    const totalValue = calculateTotalValue(products);
    const valueByCategory = {};

    products.forEach(product => {
      const productValue = product.quantity * product.price;
      if (!valueByCategory[product.category]) {
        valueByCategory[product.category] = 0;
      }
      valueByCategory[product.category] += productValue;
    });

    const categoryValues = Object.entries(valueByCategory).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));

    res.json({
      totalValue: parseFloat(totalValue.toFixed(2)),
      categories: categoryValues
    });
  } catch (error) {
    console.error('Error fetching value data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard summary
router.get('/summary', (req, res) => {
  try {
    const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = calculateTotalValue(products);
    const lowStockCount = getLowStockItems(products).length;
    const categoryCount = new Set(products.map(p => p.category)).size;

    res.json({
      totalItems,
      totalValue: parseFloat(totalValue.toFixed(2)),
      lowStockCount,
      categoryCount,
      productCount: products.length
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
