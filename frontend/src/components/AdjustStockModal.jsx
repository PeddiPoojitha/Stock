import React, { useState } from 'react';
import { Sliders, AlertCircle } from 'lucide-react';

export default function AdjustStockModal({ isOpen, product, onClose, onSave }) {
  const [adjustment, setAdjustment] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const currentQty = product.quantityOnHand || 0;
  const adjNum = parseInt(adjustment, 10) || 0;
  const resultingQty = currentQty + adjNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adjustment || isNaN(adjNum) || adjNum === 0) {
      setError('Please enter a non-zero adjustment amount (e.g. +10 or -5)');
      return;
    }

    if (resultingQty < 0) {
      setError(`Cannot reduce quantity below zero. Current quantity is ${currentQty}.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave(product.id, adjNum, note);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Adjust Stock</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {product.name} (SKU: {product.sku})
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Quantity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentQty}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resulting Quantity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: resultingQty < 0 ? '#ef4444' : '#2563eb' }}>
                {resultingQty}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Adjustment (+ or -)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 10 (received) or -5 (sold/damaged)"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              required
            />
            <span className="form-hint">Enter positive number to add stock, negative to deduct.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Note / Reason (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Supplier delivery PO-4091"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
