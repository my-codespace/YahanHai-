import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { io } from 'socket.io-client';

function DashboardLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    const socket = io('http://localhost:5000');
    socket.emit('manual-logout', user._id);
    onLogout();
  };

  // Ensure dark mode class is set on body/root
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDark);
  });

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} user={user} />
      <div className="main-content">
        <TopBar user={user} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;
