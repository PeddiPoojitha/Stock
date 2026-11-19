import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Package, RefreshCw } from 'lucide-react';
import productService from '../services/productService';
import ProductTable from '../components/ProductTable';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import AdjustStockModal from '../components/AdjustStockModal';
import { useToast } from '../context/ToastContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async (searchTerm = search) => {
    try {
      const data = await productService.getAll(searchTerm);
      setProducts(data);
    } catch (err) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchProducts(val);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.delete(productToDelete.id);
      addToast(`Product "${productToDelete.name}" deleted successfully`, 'success');
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const handleAdjustStock = async (productId, adjustment, note) => {
    await productService.adjustStock(productId, { adjustment, note });
    addToast('Stock level updated successfully', 'success');
    fetchProducts();
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="dashboard-title">Product Catalog</h1>
          <p className="dashboard-subtitle">
            Manage your store items, pricing, inventory quantities, and thresholds
          </p>
        </div>

        <Link to="/products/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="card">
        {/* Search Toolbar */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {/* Content table / states */}
        {loading ? (
          <Loading message="Loading product catalog..." />
        ) : products.length === 0 ? (
          <div className="state-box">
            <div className="state-icon">
              <Package size={28} />
            </div>
            <h3 className="state-title">
              {search ? 'No products match your search' : 'No products found'}
            </h3>
            <p className="state-description">
              {search
                ? `No products found matching "${search}". Try checking for spelling errors or clear the filter.`
                : 'Get started by adding your first product to this organization.'}
            </p>
            {search ? (
              <button
                onClick={() => {
                  setSearch('');
                  fetchProducts('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear Search
              </button>
            ) : (
              <Link to="/products/new" className="btn btn-primary btn-sm">
                <PlusCircle size={14} />
                <span>Add Your First Product</span>
              </Link>
            )}
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={(p) => navigate(`/products/edit/${p.id}`)}
            onDelete={(p) => setProductToDelete(p)}
            onAdjustStock={(p) => setAdjustingProduct(p)}
            showActions={true}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" (SKU: ${productToDelete?.sku})? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
        isDangerous={true}
      />

      {/* Stock Adjustment Modal */}
      <AdjustStockModal
        isOpen={!!adjustingProduct}
        product={adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
        onSave={handleAdjustStock}
      />
    </div>
  );
}
