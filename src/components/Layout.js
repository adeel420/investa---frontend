import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import './Layout.css';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="container-fluid">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="row">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="col-lg-10 col-md-9 p-0 main-content">
          <Header title={title} onHamburgerClick={() => setSidebarOpen(prev => !prev)} />
          <div className="p-4 p-md-4 p-sm-2">
            {children}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
