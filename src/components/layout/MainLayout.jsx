import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="main-layout-container">
      <div className="demo-running-banner">
        <div className="marquee-content">
          <span>⚠️ DEMO VERSION • THIS IS JUST A DEMO • ALL TRANSACTIONS ARE SIMULATED • ⚠️</span>
          <span>⚠️ DEMO VERSION • THIS IS JUST A DEMO • ALL TRANSACTIONS ARE SIMULATED • ⚠️</span>
          <span>⚠️ DEMO VERSION • THIS IS JUST A DEMO • ALL TRANSACTIONS ARE SIMULATED • ⚠️</span>
          <span>⚠️ DEMO VERSION • THIS IS JUST A DEMO • ALL TRANSACTIONS ARE SIMULATED • ⚠️</span>
        </div>
      </div>
      <div className="main-layout">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="main-layout-content">
          <Navbar 
            onMenuClick={() => setSidebarOpen(true)}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="main-layout-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
