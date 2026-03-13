import { useState, useEffect } from 'react'

const CATEGORIES = ['Whiskey', 'Vodka', 'Beer', 'Wine', 'Rum', 'Gin', 'Brandy','Cigarette', 'Other']
const VOLUMES = [180, 375, 750, 1000]
const TYPES = ['Full', 'Half', 'Quarter']

export default function ProductForm({ product, onSave, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    volumeMl: '',
    type: '',
    alcoholPercentage: '',
    mrp: '',
    unit: '',
    barcode: '',
    minStock: '0',
    sellingPrice: '0',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        brand: product.brand || '',
        volumeMl: product.volumeMl?.toString() || '',
        type: product.type || '',
        alcoholPercentage: product.alcoholPercentage?.toString() || '',
        mrp: product.mrp?.toString() || '',
        unit: product.unit || '',
        barcode: product.barcode || '',
        minStock: product.minStock?.toString() || '0',
        sellingPrice: product.sellingPrice?.toString() || '0',
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'

    const minStock = parseInt(formData.minStock)
    if (isNaN(minStock) || minStock < 0) newErrors.minStock = 'Minimum stock cannot be negative'

    if (formData.volumeMl && isNaN(parseInt(formData.volumeMl))) newErrors.volumeMl = 'Volume must be a number'

    if (formData.mrp && (isNaN(parseInt(formData.mrp)) || parseInt(formData.mrp) < 0)) newErrors.mrp = 'MRP must be a positive number'

    if (formData.alcoholPercentage) {
      const alc = parseFloat(formData.alcoholPercentage)
      if (isNaN(alc) || alc < 0 || alc > 100) newErrors.alcoholPercentage = 'Alcohol % must be between 0 and 100'
    }

    if (!formData.barcode.trim()) newErrors.barcode = 'Product code is required'
    const price = parseFloat(formData.sellingPrice)
    if (isNaN(price) || price <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    onSave({
      name: formData.name.trim(),
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      volumeMl: formData.volumeMl ? parseInt(formData.volumeMl) : undefined,
      type: formData.type || undefined,
      alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
      mrp: formData.mrp ? parseInt(formData.mrp) : undefined,
      unit: formData.unit || undefined,
      barcode: formData.barcode || undefined,
      minStock: parseInt(formData.minStock),
      sellingPrice: parseFloat(formData.sellingPrice),
    })
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${errors.name ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="e.g., Smirnoff Vodka"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Volume (ml)</label>
              <select
                name="volumeMl"
                value={formData.volumeMl}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white ${errors.volumeMl ? 'border-red-500' : 'border-slate-600'}`}
              >
                <option value="">Select volume</option>
                {VOLUMES.map(v => (
                  <option key={v} value={v}>{v} ml</option>
                ))}
              </select>
              {errors.volumeMl && <p className="text-red-400 text-sm mt-1">{errors.volumeMl}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unit</label>
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

          {/* Type and Alcohol Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                list="type-suggestions"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                placeholder="e.g., Full, Half, Quarter"
              />
              <datalist id="type-suggestions">
                {TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Alcohol %</label>
              <input
                type="number"
                name="alcoholPercentage"
                step="0.1"
                min="0"
                max="100"
                value={formData.alcoholPercentage}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${errors.alcoholPercentage ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="e.g., 42.8"
              />
              {errors.alcoholPercentage && <p className="text-red-400 text-sm mt-1">{errors.alcoholPercentage}</p>}
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">code*</label>
            <input
              type="text"
              name="code"
              value={formData.barcode}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 ${errors.barcode ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="Code"
            />
            {errors.barcode && <p className="text-red-400 text-sm mt-1">{errors.barcode}</p>}
          </div>

          {/* Min Stock and Selling Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Stock</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${errors.minStock ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="0"
              />
              {errors.minStock && <p className="text-red-400 text-sm mt-1">{errors.minStock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Selling Price *</label>
              <input
                type="number"
                name="sellingPrice"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${errors.sellingPrice ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="0.00"
              />
              {errors.sellingPrice && <p className="text-red-400 text-sm mt-1">{errors.sellingPrice}</p>}
            </div>
          </div>

          {/* MRP */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">MRP <span className="text-slate-500 font-normal">(Maximum Retail Price, optional)</span></label>
            <input
              type="number"
              name="mrp"
              min="0"
              value={formData.mrp}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${errors.mrp ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="e.g., 550"
            />
            {errors.mrp && <p className="text-red-400 text-sm mt-1">{errors.mrp}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-2 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                isLoading ? 'bg-blue-600 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
                isLoading ? 'bg-slate-700 opacity-70 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'
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
