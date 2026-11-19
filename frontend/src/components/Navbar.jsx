import React from 'react';
import { Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="top-navbar">
      <div className="navbar-tenant">
        <Building2 size={16} />
        <span>Organization:</span>
        <span className="tenant-badge">{user?.organizationName || 'My Organization'}</span>
      </div>

      <div className="navbar-user">
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.fullName || 'User'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
        </div>
        <div className="user-avatar" title={user?.fullName}>
          {initials}
        </div>
      </div>
    </header>
  );
}
