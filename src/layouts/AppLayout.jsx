import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, FileCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './AppLayout.css';
import { mockUser } from '../data/mockData';

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const getIsActive = (itemPath) => {
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FileCheck className="logo-icon" size={28} />
            <span className="logo-text">EasyTender</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-preview">
            <div className="avatar">
              {mockUser.fullName.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{mockUser.fullName}</span>
              <span className="user-email">{mockUser.email}</span>
            </div>
          </div>
          <Link to="/login" className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-content">
        {!isSidebarOpen && (
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
