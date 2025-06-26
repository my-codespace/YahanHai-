import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMap, FaChartLine, FaBell, FaCog, FaUserEdit, FaUsers } from 'react-icons/fa';

function Sidebar({ isOpen, onClose, user }) {
  const location = useLocation();

  const menu = [
    { to: "/dashboard/map", icon: <FaMap />, label: "Map" },
    { to: "/dashboard/analytics", icon: <FaChartLine />, label: "Analytics" },
    { to: "/dashboard/notifications", icon: <FaBell />, label: "Notifications" },
    { to: "/dashboard/settings", icon: <FaCog />, label: "Settings" },
    { to: "/dashboard/edit-profile", icon: <FaUserEdit />, label: "Edit Profile" },
  ];

  if (user?.role === 'retailer') {
    menu.push({
      to: "/dashboard/interested-customers",
      icon: <FaUsers />,
      label: "Interested Customers"
    });
  }

  return (
    <div className={`sidebar${isOpen ? ' open' : ''}`}>
      <button className="close-btn" onClick={onClose} aria-label="Close Sidebar">×</button>
      <h3 style={{ marginBottom: 24, fontWeight: 700, letterSpacing: "-1px" }}>Menu</h3>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menu.map(item => (
            <li key={item.to} style={{ marginBottom: 16 }}>
              <Link
                to={item.to}
                className={`sidebar-link${location.pathname.startsWith(item.to) ? ' active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontWeight: location.pathname.startsWith(item.to) ? 600 : 500,
                  fontSize: 16,
                  borderRadius: 8,
                  padding: '8px 12px',
                  transition: 'background 0.2s'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
