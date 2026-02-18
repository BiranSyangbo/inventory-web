// Sample stock data for the dashboard
export const products = [
  { id: 1, name: 'Vodka Premium', category: 'Spirits', quantity: 45, price: 35.99, reorderLevel: 20 },
  { id: 2, name: 'Whiskey Blend', category: 'Spirits', quantity: 28, price: 42.50, reorderLevel: 15 },
  { id: 3, name: 'Rum Gold', category: 'Spirits', quantity: 8, price: 38.75, reorderLevel: 20 },
  { id: 4, name: 'Tequila Silver', category: 'Spirits', quantity: 35, price: 32.00, reorderLevel: 15 },
  { id: 5, name: 'Wine Red Bordeaux', category: 'Wine', quantity: 62, price: 18.99, reorderLevel: 25 },
  { id: 6, name: 'Wine White Sauvignon', category: 'Wine', quantity: 51, price: 16.50, reorderLevel: 20 },
  { id: 7, name: 'Beer IPA 6pack', category: 'Beer', quantity: 120, price: 12.99, reorderLevel: 50 },
  { id: 8, name: 'Beer Lager 6pack', category: 'Beer', quantity: 5, price: 10.99, reorderLevel: 40 },
  { id: 9, name: 'Gin Classic', category: 'Spirits', quantity: 33, price: 39.99, reorderLevel: 15 },
  { id: 10, name: 'Champagne Sparkling', category: 'Wine', quantity: 18, price: 55.00, reorderLevel: 10 },
];

// Stock movement history (sales/consumption over 30 days)
export const stockHistory = [
  { date: 'Jan 1', vodka: 45, whiskey: 28, rum: 8, tequila: 35, wine: 113, beer: 125, gin: 33, champagne: 18 },
  { date: 'Jan 2', vodka: 42, whiskey: 27, rum: 10, tequila: 33, wine: 111, beer: 130, gin: 31, champagne: 16 },
  { date: 'Jan 3', vodka: 40, whiskey: 25, rum: 12, tequila: 30, wine: 108, beer: 128, gin: 29, champagne: 14 },
  { date: 'Jan 4', vodka: 38, whiskey: 24, rum: 14, tequila: 28, wine: 105, beer: 135, gin: 27, champagne: 12 },
  { date: 'Jan 5', vodka: 43, whiskey: 26, rum: 9, tequila: 32, wine: 110, beer: 122, gin: 32, champagne: 17 },
  { date: 'Jan 6', vodka: 45, whiskey: 28, rum: 8, tequila: 35, wine: 113, beer: 125, gin: 33, champagne: 18 },
  { date: 'Jan 7', vodka: 41, whiskey: 26, rum: 11, tequila: 31, wine: 109, beer: 128, gin: 30, champagne: 15 },
  { date: 'Jan 8', vodka: 39, whiskey: 25, rum: 13, tequila: 29, wine: 106, beer: 132, gin: 28, champagne: 13 },
  { date: 'Jan 9', vodka: 37, whiskey: 23, rum: 15, tequila: 26, wine: 103, beer: 138, gin: 26, champagne: 11 },
  { date: 'Jan 10', vodka: 44, whiskey: 27, rum: 10, tequila: 34, wine: 112, beer: 124, gin: 31, champagne: 19 },
  { date: 'Jan 11', vodka: 45, whiskey: 28, rum: 8, tequila: 35, wine: 113, beer: 125, gin: 33, champagne: 18 },
  { date: 'Jan 12', vodka: 42, whiskey: 26, rum: 11, tequila: 32, wine: 110, beer: 129, gin: 30, champagne: 16 },
  { date: 'Jan 13', vodka: 40, whiskey: 25, rum: 12, tequila: 30, wine: 108, beer: 131, gin: 28, champagne: 14 },
  { date: 'Jan 14', vodka: 38, whiskey: 24, rum: 14, tequila: 28, wine: 105, beer: 136, gin: 26, champagne: 12 },
  { date: 'Jan 15', vodka: 43, whiskey: 27, rum: 9, tequila: 33, wine: 111, beer: 126, gin: 32, champagne: 17 },
  { date: 'Jan 16', vodka: 45, whiskey: 28, rum: 8, tequila: 35, wine: 113, beer: 125, gin: 33, champagne: 18 },
  { date: 'Jan 17', vodka: 41, whiskey: 26, rum: 11, tequila: 31, wine: 109, beer: 129, gin: 30, champagne: 15 },
  { date: 'Jan 18', vodka: 39, whiskey: 25, rum: 13, tequila: 29, wine: 106, beer: 133, gin: 28, champagne: 13 },
  { date: 'Jan 19', vodka: 37, whiskey: 23, rum: 15, tequila: 26, wine: 103, beer: 139, gin: 26, champagne: 11 },
  { date: 'Jan 20', vodka: 44, whiskey: 27, rum: 10, tequila: 34, wine: 112, beer: 125, gin: 31, champagne: 19 },
];

// Calculate inventory value
export const calculateTotalValue = (products) => {
  return products.reduce((total, product) => total + (product.quantity * product.price), 0);
};

// Get low stock items
export const getLowStockItems = (products) => {
  return products.filter(product => product.quantity <= product.reorderLevel);
};
