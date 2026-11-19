import React, { useState, useEffect } from 'react';
import { Save, Sliders, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import settingsService from '../services/settingsService';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { user, updateOrgThreshold } = useAuth();
  const { addToast } = useToast();

  const [threshold, setThreshold] = useState('5');
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setOrgData(data);
        setThreshold(data.defaultLowStockThreshold?.toString() || '5');
      } catch (err) {
        addToast('Failed to load organization settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const threshNum = parseInt(threshold, 10);
    if (isNaN(threshNum) || threshNum < 0) {
      setError('Threshold must be a non-negative whole number (0 or greater)');
      return;
    }

    setSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        defaultLowStockThreshold: threshNum,
      });
      setOrgData(updated);
      updateOrgThreshold(updated.defaultLowStockThreshold);
      addToast('Default low-stock threshold updated successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading organization settings..." />;
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Organization Settings</h1>
        <p className="dashboard-subtitle">
          Configure default inventory alert rules and parameters for{' '}
          <strong>{orgData?.organizationName || user?.organizationName}</strong>
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Tenant Information</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Data isolation is enforced for this business account
            </p>
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Organization Name</label>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
              {orgData?.organizationName || user?.organizationName}
            </div>
          </div>
          <div>
            <label className="form-label">Account Owner</label>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              {user?.fullName} ({user?.email})
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Inventory Alert Rules</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Define the fallback minimum quantity before stock alerts are triggered
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ maxWidth: '340px' }}>
            <label className="form-label" htmlFor="threshold">
              Default Low-Stock Threshold *
            </label>
            <input
              id="threshold"
              type="number"
              min="0"
              className="form-input"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
            />
            <span className="form-hint">
              Used automatically for any product that doesn't have an individual threshold defined.
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <strong>How this works:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
              <li>
                If a product has its own custom threshold (e.g. 10), that value is always used.
              </li>
              <li>
                If a product has no custom threshold set, this organization default ({threshold}) is applied dynamically.
              </li>
              <li>
                Updating this setting immediately updates low-stock warnings across your dashboard and product lists.
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving Settings...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
