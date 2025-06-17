import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen, onClose, user }) {
  return (
    <div className={`sidebar${isOpen ? ' open' : ''}`}>
      <button className="close-btn" onClick={onClose} aria-label="Close Sidebar">×</button>
      <h3 style={{ marginBottom: 24 }}>Menu</h3>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: 16 }}>
            <Link to="/dashboard/map" className="sidebar-link">Map</Link>
          </li>
          <li style={{ marginBottom: 16 }}>
            <Link to="/dashboard/analytics" className="sidebar-link">Analytics</Link>
          </li>
          <li style={{ marginBottom: 16 }}>
            <Link to="/dashboard/notifications" className="sidebar-link">Notifications</Link>
          </li>
          <li style={{ marginBottom: 16 }}>
            <Link to="/dashboard/settings" className="sidebar-link">Settings</Link>
          </li>
          <li style={{ marginBottom: 16 }}>
            <Link to="/dashboard/edit-profile" className="sidebar-link">Edit Profile</Link>
          </li>
          {/* Retailer-only menu item */}
          {user?.role === 'retailer' && (
            <li style={{ marginBottom: 16 }}>
              <Link to="/dashboard/interested-customers" className="sidebar-link">
                Interested Customers
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
