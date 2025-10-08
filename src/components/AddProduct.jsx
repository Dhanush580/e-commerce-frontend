import React, { useState, useContext } from 'react';
import { AdminContext } from '../contexts/AdminContext';
import './AddProduct.css';
import { resolveImageUrl } from '../utils/imageUrl';

const AddProduct = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    images: [], // Will contain single image
    price: '',
    category: '',
    subCategory: '',
  // sizes removed
    description: '',
    inStock: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageMethod, setImageMethod] = useState('url'); // 'url' or 'upload'
  const [selectedFiles, setSelectedFiles] = useState([]); // Multiple files
  const [previewUrls, setPreviewUrls] = useState([]); // Multiple preview URLs
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // For adding URL

  const { adminApiCall } = useContext(AdminContext);

  const categories = [
    { value: 'earrings', label: 'Earrings' },
    { value: 'necklaces', label: 'Necklaces' },
    { value: 'pendants', label: 'Pendants' },
    { value: 'rings', label: 'Rings' },
    { value: 'temple-jewellery', label: 'Temple Jewellery' },
    { value: 'bangles', label: 'Bangles' },
    { value: 'sarees', label: 'Sarees' },
    { value: 'dresses', label: 'Dresses' }
  ];

  const subCategories = [
    { value: 'victorian', label: 'Victorian' },
    { value: 'cz-stone', label: 'CZ Stone' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold-plated', label: 'Gold Plated' }
  ];

  // Size selection removed

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // No size reset needed
  };

  // No size toggle needed

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    // Create preview URLs
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(urls => setPreviewUrls(urls));
  };

  const addImageUrl = () => {
    if (currentImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, currentImageUrl.trim()]
      }));
      setCurrentImageUrl('');
    }
  };

  const removeImage = (idx) => {
    if (imageMethod === 'upload') {
      setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
      setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== idx)
      }));
    }
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return [];
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      selectedFiles.forEach(file => uploadFormData.append('images', file));
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/upload-images`, {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData
      });
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      const result = await response.json();
      return result.imageUrls || [];
    } catch (error) {
      throw new Error('Image upload failed: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload files if any
      let uploadedImageUrls = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadImages();
      }

      // Combine URLs from both methods
      const allImages = [...formData.images, ...uploadedImageUrls];

      // Validation
      if (!formData.productId || !formData.name || allImages.length === 0 ||
          !formData.price || !formData.category || !formData.description) {
        setError('All fields are required and at least one image must be provided');
        setLoading(false);
        return;
      }

      if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        setError('Price must be a valid positive number');
        setLoading(false);
        return;
      }

      // Call admin API to add product
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/products`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subCategory: formData.subCategory || undefined,
          images: allImages,
          price: parseFloat(formData.price)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setError(errorData.errors.map(e => e.msg).join(', '));
        } else {
          setError(errorData.error || 'Failed to add product');
        }
        setLoading(false);
        return;
      }

  const result = await response.json();
  // Success
      if (onProductAdded) onProductAdded(result.product);
      if (onClose) onClose();
      
      // Reset form
      setFormData({
        productId: '',
        name: '',
        images: [],
        price: '',
        category: '',
        subCategory: '',
        description: '',
        inStock: true
      });
  setSelectedFiles([]);
  setPreviewUrls([]);
      setCurrentImageUrl('');

    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-overlay">
      <div className="add-product-modal">
        <div className="add-product-header">
          <h2>Add New Product</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productId">Product ID</label>
              <input
                type="text"
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                placeholder="e.g., RING001"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Gold Diamond Ring"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 25000"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Size selection removed */}
          </div>

          {/* Subcategory selector for accessories categories */}
          {(formData.category && ['earrings','necklaces','pendants','rings','temple-jewellery','bangles'].includes(formData.category)) && (
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label htmlFor="subCategory">Subcategory (optional)</label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                >
                  <option value="">All/None</option>
                  {subCategories.map(sc => (
                    <option key={sc.value} value={sc.value}>{sc.label}</option>
                  ))}
                </select>
                <small className="hint">Choose one if applicable: Victorian, CZ Stone, Silver, Gold Plated</small>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Product Images</label>
            <div className="image-method-selector">
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="imageMethod"
                    value="url"
                    checked={imageMethod === 'url'}
                    onChange={(e) => setImageMethod(e.target.value)}
                  />
                  <span>Enter URLs</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="imageMethod"
                    value="upload"
                    checked={imageMethod === 'upload'}
                    onChange={(e) => setImageMethod(e.target.value)}
                  />
                  <span>Upload Files</span>
                </label>
              </div>
            </div>

            {imageMethod === 'url' ? (
              <div className="url-input-container">
                <div className="url-input-row">
                  <input
                    type="url"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    placeholder="https://example.com/product-image.jpg"
                    className="url-input"
                  />
                  <button type="button" onClick={addImageUrl} className="add-url-btn">
                    Add Image
                  </button>
                </div>
                <div className="image-preview">
                  {formData.images.length > 0 && formData.images.map((img, idx) => (
                    <div className="image-item" key={idx}>
                      <img src={resolveImageUrl(img)} alt="Product" className="preview-img" />
                      <button type="button" onClick={() => removeImage(idx)} className="remove-btn">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="file-upload-container">
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <label htmlFor="imageFile" className="file-upload-label">
                  Choose Image Files
                </label>
                <div className="image-preview">
                  {previewUrls.length > 0 && previewUrls.map((url, idx) => (
                    <div className="image-item" key={idx}>
                      <img src={url} alt="Preview" className="preview-img" />
                      <button type="button" onClick={() => removeImage(idx)} className="remove-btn">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(formData.images.length === 0 && previewUrls.length === 0) && (
              <p className="image-requirement">At least one image is required</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed product description..."
              rows="4"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              In Stock
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;