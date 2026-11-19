import React from 'react';

export default function SummaryCard({ label, value, icon: Icon, color = 'blue', footer }) {
  return (
    <div className={`summary-card summary-${color}`}>
      <div className="summary-header">
        <span className="summary-label">{label}</span>
        <div className={`summary-icon-wrap icon-${color}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="summary-value">{value}</div>
      {footer && <div className="summary-footer">{footer}</div>}
    </div>
  );
}
