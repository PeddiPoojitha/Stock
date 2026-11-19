import React, { useState, useEffect } from 'react';
import { Package, Boxes, AlertTriangle, DollarSign, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import productService from '../services/productService';
import SummaryCard from '../components/SummaryCard';
import ProductTable from '../components/ProductTable';
import Loading from '../components/Loading';
import AdjustStockModal from '../components/AdjustStockModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err) {
      addToast('Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAdjustStock = async (productId, adjustment, note) => {
    await productService.adjustStock(productId, { adjustment, note });
    addToast('Stock level updated successfully', 'success');
    fetchDashboardData(true);
  };

  if (loading) {
    return <Loading message="Loading inventory overview..." />;
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="page-container">
      <div className="page-header-row dashboard-header">
        <div>
          <h1 className="dashboard-title">Inventory Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user?.fullName}</strong> &bull; Showing live analytics for{' '}
            <strong>{data?.organizationName || user?.organizationName}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchDashboardData(true)}
            className="btn btn-secondary"
            disabled={refreshing}
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/products/new" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="metrics-grid">
        <SummaryCard
          label="Total Products"
          value={data?.totalProducts || 0}
          icon={Package}
          color="blue"
          footer="Active catalog items"
        />
        <SummaryCard
          label="Total Stock Quantity"
          value={(data?.totalStockQuantity || 0).toLocaleString()}
          icon={Boxes}
          color="emerald"
          footer="Units across all products"
        />
        <SummaryCard
          label="Low Stock Items"
          value={data?.lowStockProductsCount || 0}
          icon={AlertTriangle}
          color="amber"
          footer={`At or below threshold (${data?.defaultLowStockThreshold ?? 5} default)`}
        />
        <SummaryCard
          label="Total Inventory Value"
          value={formatCurrency(data?.totalInventoryValue)}
          icon={DollarSign}
          color="purple"
          footer="Sum of (quantity × cost price)"
        />
      </div>

      {/* Low Stock Items Section */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <AlertTriangle size={20} color="#d97706" />
              <span>Low Stock Alerts</span>
            </h2>
            <p className="section-description">
              Products needing replenishment based on configured thresholds.
            </p>
          </div>
          {data?.lowStockItems?.length > 0 && (
            <span className="badge badge-warning">
              {data.lowStockItems.length} {data.lowStockItems.length === 1 ? 'item requires attention' : 'items require attention'}
            </span>
          )}
        </div>

        {data?.totalProducts === 0 ? (
          <div className="state-box">
            <div className="state-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Package size={28} />
            </div>
            <h3 className="state-title">No Products in Catalog Yet</h3>
            <p className="state-description">
              Your inventory catalog is currently empty. Add your first product to start tracking quantities, stock values, and automated replenishment alerts.
            </p>
            <Link to="/products/new" className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              <span>Add Your First Product</span>
            </Link>
          </div>
        ) : data?.lowStockItems?.length === 0 ? (
          <div className="state-box">
            <div className="state-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 className="state-title">Stock Levels are Healthy</h3>
            <p className="state-description">
              None of your products are currently at or below their low-stock alert thresholds.
            </p>
            <Link to="/products" className="btn btn-secondary btn-sm">
              View All Products
            </Link>
          </div>
        ) : (
          <ProductTable
            products={data?.lowStockItems || []}
            onAdjustStock={(prod) => setAdjustingProduct(prod)}
            onEdit={(prod) => navigate(`/products/edit/${prod.id}`)}
            showActions={true}
          />
        )}
      </div>

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
