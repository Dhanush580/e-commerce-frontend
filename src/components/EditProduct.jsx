import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../contexts/AdminContext';
import './AddProduct.css'; // Reuse the same styles
import { resolveImageUrl } from '../utils/imageUrl';

const EditProduct = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    images: [],
    price: '',
    category: '',
    subCategory: '',
  // sizes removed
    description: '',
    inStock: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageMethod, setImageMethod] = useState('url');
  const [selectedFiles, setSelectedFiles] = useState([]); // multiple files
  const [previewUrls, setPreviewUrls] = useState([]); // multiple previews
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

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

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId || '',
        name: product.name || '',
        images: product.images || [],
        price: product.price || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
  // sizes removed
        description: product.description || '',
        inStock: product.inStock !== undefined ? product.inStock : true
      });
    }
  }, [product]);

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
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    // Create preview URLs
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPreviewUrls);
  };

  const addImageUrl = () => {
    if (currentImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), currentImageUrl.trim()] // append to array
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
        images: (prev.images || []).filter((_, i) => i !== idx)
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
      // Upload files if any and combine with existing URLs
      let uploadedImageUrls = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadImages();
      }

      // Merge images from form and any newly uploaded
      const mergedImages = [
        ...((formData.images || []).filter(Boolean)),
        ...uploadedImageUrls
      ];

      // If a URL is typed right now, include it too
      if (currentImageUrl.trim()) mergedImages.push(currentImageUrl.trim());

      // Validation
      if (!formData.productId || !formData.name || mergedImages.length === 0 || 
          !formData.price || !formData.category || !formData.description) {
        throw new Error('All fields are required and at least one image must be provided');
      }

      if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      // Call admin API to update product
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/products/${product.productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subCategory: formData.subCategory || undefined,
          images: mergedImages,
          price: parseFloat(formData.price)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

  const result = await response.json();
      
  // Success
      if (onProductUpdated) onProductUpdated(result.product);
      if (onClose) onClose();

    } catch (err) {
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-overlay">
      <div className="add-product-modal">
        <div className="add-product-header">
          <h2>Edit Product</h2>
          <button onClick={onClose} className="close-btn" disabled={loading}>×</button>
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
                required
                disabled // Product ID should not be editable
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
                required
                placeholder="Enter product name"
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
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
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
                  <span>Image URLs</span>
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
                    placeholder="Enter image URL"
                    className="url-input"
                  />
                  <button type="button" onClick={addImageUrl} className="add-url-btn">
                    Add Image
                  </button>
                </div>
                <div className="image-preview">
                  {formData.images && formData.images.length > 0 && formData.images.map((img, idx) => (
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
                  {previewUrls && previewUrls.length > 0 ? (
                    previewUrls.map((url, idx) => (
                      <div className="image-item" key={idx}>
                        <img src={url} alt="Preview" className="preview-img" />
                        <button type="button" onClick={() => removeImage(idx)} className="remove-btn">×</button>
                      </div>
                    ))
                  ) : (formData.images && formData.images.length > 0) ? (
                    formData.images.map((img, idx) => (
                      <div className="image-item" key={idx}>
                        <img src={resolveImageUrl(img)} alt="Current" className="preview-img" />
                        <small>Current image</small>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            )}
            
            {( (!formData.images || formData.images.length === 0) && (!previewUrls || previewUrls.length === 0) ) && (
              <p className="image-requirement">An image is required</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter product description"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <span>In Stock</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Updating...' : uploadingImage ? 'Uploading...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;