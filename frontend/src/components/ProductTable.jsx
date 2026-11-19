import React from 'react';
import { Edit2, Trash2, Sliders, AlertTriangle } from 'lucide-react';

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
  onAdjustStock,
  showActions = true,
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Selling Price</th>
            <th>Stock Status</th>
            {showActions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isOutOfStock = p.quantityOnHand <= 0;
            const isLow = p.lowStock || p.quantityOnHand <= (p.effectiveThreshold ?? 5);

            return (
              <tr key={p.id} className={isLow ? 'row-low-stock' : ''}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                  {p.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.description.length > 55 ? `${p.description.slice(0, 55)}...` : p.description}
                    </div>
                  )}
                </td>
                <td>
                  <span className="sku-tag">{p.sku}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{p.quantityOnHand}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    (min: {p.effectiveThreshold ?? 5})
                  </span>
                </td>
                <td>{formatCurrency(p.sellingPrice)}</td>
                <td>
                  {isOutOfStock ? (
                    <span className="badge badge-danger">Out of Stock</span>
                  ) : isLow ? (
                    <span className="badge badge-warning">
                      <AlertTriangle size={12} />
                      Low Stock
                    </span>
                  ) : (
                    <span className="badge badge-success">In Stock</span>
                  )}
                </td>
                {showActions && (
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {onAdjustStock && (
                        <button
                          onClick={() => onAdjustStock(p)}
                          className="btn btn-secondary btn-sm"
                          title="Adjust Stock Quantity"
                        >
                          <Sliders size={14} />
                          <span>Adjust</span>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(p)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
