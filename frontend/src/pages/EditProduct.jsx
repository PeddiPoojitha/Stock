import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import productService from '../services/productService';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantityOnHand: '0',
    costPrice: '0.00',
    sellingPrice: '0.00',
    lowStockThreshold: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultThreshold = user?.defaultLowStockThreshold ?? 5;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const prod = await productService.getById(id);
        setFormData({
          name: prod.name || '',
          sku: prod.sku || '',
          description: prod.description || '',
          quantityOnHand: prod.quantityOnHand?.toString() || '0',
          costPrice: prod.costPrice?.toString() || '0.00',
          sellingPrice: prod.sellingPrice?.toString() || '0.00',
          lowStockThreshold:
            prod.lowStockThreshold !== null && prod.lowStockThreshold !== undefined
              ? prod.lowStockThreshold.toString()
              : '',
        });
      } catch (err) {
        addToast(err.response?.data?.message || 'Product not found', 'error');
        navigate('/products');
      } finally {
        setInitialLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    const qty = parseInt(formData.quantityOnHand, 10);
    if (isNaN(qty) || qty < 0) newErrors.quantityOnHand = 'Quantity cannot be negative';

    const cost = parseFloat(formData.costPrice);
    if (isNaN(cost) || cost < 0) newErrors.costPrice = 'Cost price cannot be negative';

    const selling = parseFloat(formData.sellingPrice);
    if (isNaN(selling) || selling < 0) newErrors.sellingPrice = 'Selling price cannot be negative';

    if (formData.lowStockThreshold !== '') {
      const thresh = parseInt(formData.lowStockThreshold, 10);
      if (isNaN(thresh) || thresh < 0) newErrors.lowStockThreshold = 'Threshold cannot be negative';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim() || null,
        quantityOnHand: parseInt(formData.quantityOnHand, 10),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        lowStockThreshold:
          formData.lowStockThreshold !== ''
            ? parseInt(formData.lowStockThreshold, 10)
            : null,
      };

      const updated = await productService.update(id, payload);
      addToast(`Product "${updated.name}" updated successfully!`, 'success');
      navigate('/products');
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <Loading message="Loading product details..." />;
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/products"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, marginBottom: '0.75rem', display: 'inline-flex' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <h1 className="dashboard-title">Edit Product</h1>
        <p className="dashboard-subtitle">
          Update product specifications, inventory, and threshold for {formData.sku}
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {generalError && (
          <div className="auth-alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sku">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                className={`form-input ${errors.sku ? 'input-error' : ''}`}
                value={formData.sku}
                onChange={handleChange}
                required
              />
              {errors.sku && <span className="form-error">{errors.sku}</span>}
              <span className="form-hint">Must remain unique within your organization.</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="costPrice">
                Cost Price ($) *
              </label>
              <input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.costPrice ? 'input-error' : ''}`}
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
              {errors.costPrice && <span className="form-error">{errors.costPrice}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sellingPrice">
                Selling Price ($) *
              </label>
              <input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.sellingPrice ? 'input-error' : ''}`}
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
              {errors.sellingPrice && <span className="form-error">{errors.sellingPrice}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="quantityOnHand">
                Quantity on Hand *
              </label>
              <input
                id="quantityOnHand"
                name="quantityOnHand"
                type="number"
                min="0"
                className={`form-input ${errors.quantityOnHand ? 'input-error' : ''}`}
                value={formData.quantityOnHand}
                onChange={handleChange}
                required
              />
              {errors.quantityOnHand && (
                <span className="form-error">{errors.quantityOnHand}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lowStockThreshold">
                Low Stock Alert Threshold
              </label>
              <input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                className={`form-input ${errors.lowStockThreshold ? 'input-error' : ''}`}
                placeholder={`Leave blank to use org default (${defaultThreshold})`}
                value={formData.lowStockThreshold}
                onChange={handleChange}
              />
              {errors.lowStockThreshold && (
                <span className="form-error">{errors.lowStockThreshold}</span>
              )}
              <span className="form-hint">
                Threshold for low stock warnings. Blank falls back to {defaultThreshold}.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
