import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, Check, Layers, PackageCheck } from 'lucide-react';

export default function AuthShowcase() {
  return (
    <aside className="auth-showcase">
      <Link to="/login" className="auth-showcase-brand" aria-label="StockFlow home">
        <span className="auth-showcase-logo"><Layers size={20} /></span>
        <span>StockFlow</span>
      </Link>

      <div className="auth-showcase-content">
        <span className="auth-showcase-kicker">
          <span className="auth-showcase-kicker-dot" />
          INVENTORY, IN A BETTER FLOW
        </span>
        <h1>
          Less guesswork.<br />
          <span>More good stock.</span>
        </h1>
        <p>
          A calmer way to keep products organized, spot low stock, and stay ready for what&apos;s next.
        </p>

        <div className="auth-visual-window" aria-hidden="true">
          <div className="auth-visual-window-top">
            <span className="auth-window-dots"><i /><i /><i /></span>
            <span className="auth-window-label">STOCKFLOW / OVERVIEW</span>
            <ArrowUpRight size={15} />
          </div>
          <div className="auth-visual-window-body">
            <div className="auth-visual-cube"><Boxes size={25} /></div>
            <div className="auth-visual-copy">
              <span>YOUR INVENTORY</span>
              <strong>All in one place.</strong>
            </div>
            <span className="auth-visual-status"><i /> IN SYNC</span>
          </div>
          <div className="auth-visual-rule" />
          <div className="auth-visual-feature">
            <span className="auth-visual-feature-icon"><PackageCheck size={17} /></span>
            <span><strong>Stock at a glance</strong><small>Know what needs your attention</small></span>
            <Check size={16} className="auth-visual-check" />
          </div>
          <div className="auth-visual-feature auth-visual-feature-last">
            <span className="auth-visual-feature-icon auth-visual-feature-alert"><Boxes size={17} /></span>
            <span><strong>Fewer surprises</strong><small>Low-stock alerts that keep you ready</small></span>
            <Check size={16} className="auth-visual-check" />
          </div>
        </div>
      </div>

      <div className="auth-showcase-footer">
        <span>BUILT FOR BUSINESSES THAT KEEP MOVING</span>
        <span className="auth-showcase-footer-mark"><Layers size={14} /> STOCKFLOW</span>
      </div>
    </aside>
  );
}
