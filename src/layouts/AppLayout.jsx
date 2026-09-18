import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Settings, LogOut, FileCheck } from 'lucide-react';
import './AppLayout.css';
import { mockUser } from '../data/mockData';

const AppLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FileCheck className="logo-icon" size={28} />
            <span className="logo-text">EasyTender</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
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
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
