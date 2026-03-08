import { useState, useEffect } from 'react'

export default function ProductForm({ product, onSave, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    volumeMl: '',
    unit: '',
    barcode: '',
    minStock: '0',
    currentStock: '0',
    unitPrice: '0'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand,
        volumeMl: product.volumeMl || '',
        unit: product.unit,
        barcode: product.barcode || '',
        minStock: product.minStock.toString(),
        currentStock: product.currentStock.toString(),
        unitPrice: product.unitPrice.toString()
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    const minStock = parseInt(formData.minStock)
    if (isNaN(minStock) || minStock < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative'
    }

    if (formData.volumeMl && isNaN(parseInt(formData.volumeMl))) {
      newErrors.volumeMl = 'Volume must be a number'
    }

    if (isNaN(parseFloat(formData.unitPrice)) || parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'Unit price must be a valid number'
    }

    if (isNaN(parseInt(formData.currentStock)) || parseInt(formData.currentStock) < 0) {
      newErrors.currentStock = 'Current stock cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const dataToSend = {
      name: formData.name.trim(),
      category: formData.category,
      brand: formData.brand,
      volumeMl: formData.volumeMl ? parseInt(formData.volumeMl) : null,
      unit: formData.unit,
      barcode: formData.barcode || null,
      minStock: parseInt(formData.minStock),
      currentStock: parseInt(formData.currentStock),
      unitPrice: parseFloat(formData.unitPrice)
    }

    onSave(dataToSend)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="e.g., Vodka"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                placeholder="e.g., Spirits"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                placeholder="e.g., Smirnoff"
              />
            </div>
          </div>

          {/* Volume and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Volume (ml)
              </label>
              <input
                type="number"
                name="volumeMl"
                value={formData.volumeMl}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.volumeMl ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="e.g., 750"
              />
              {errors.volumeMl && <p className="text-red-400 text-sm mt-1">{errors.volumeMl}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                placeholder="e.g., bottle"
              />
            </div>
          </div>
          {/* Stock Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.currentStock ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0"
              />
              {errors.currentStock && <p className="text-red-400 text-sm mt-1">{errors.currentStock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Stock *
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.minStock ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0"
              />
              {errors.minStock && <p className="text-red-400 text-sm mt-1">{errors.minStock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Unit Price
              </label>
              <input
                type="number"
                name="unitPrice"
                step="0.01"
                value={formData.unitPrice}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.unitPrice ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="text-red-400 text-sm mt-1">{errors.unitPrice}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-2 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-blue-600 opacity-70 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`flex-1 px-6 py-2 text-white font-medium rounded-lg transition ${
                isLoading 
                  ? 'bg-slate-700 opacity-70 cursor-not-allowed' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
