
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart2, CheckSquare, Edit, Settings, LogOut, X, Menu, Sun, Moon } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  onLogout: () => void;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ to, icon, children }) => {
  const commonClasses = "flex items-center w-full px-4 py-3 text-lg transition-colors duration-200";
  const activeClasses = "bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20 dark:text-apple-blue-dark font-semibold rounded-lg";
  const inactiveClasses = "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className="mr-4">{icon}</span>
      <span>{children}</span>
    </NavLink>
  );
};


const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/attendance': return 'Mark Attendance';
      case '/edit-attendance': return 'Edit Attendance';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  }

  const SidebarContent: React.FC<{ onLogout: () => void; }> = ({ onLogout }) => (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-dark-bg p-4">
      <div className="flex items-center mb-10 px-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h1>
      </div>
      <nav className="flex-grow space-y-2">
        <NavItem to="/dashboard" icon={<BarChart2 size={24} />} >Dashboard</NavItem>
        <NavItem to="/attendance" icon={<CheckSquare size={24} />} >Attendance</NavItem>
        <NavItem to="/edit-attendance" icon={<Edit size={24} />} >Edit</NavItem>
        <NavItem to="/settings" icon={<Settings size={24} />} >Settings</NavItem>
      </nav>
      <div className="mt-auto space-y-2">
         <button onClick={toggleTheme} className="flex items-center w-full px-4 py-3 text-lg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg">
           {theme === 'light' ? <Moon className="mr-4"/> : <Sun className="mr-4"/>}
           <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-lg text-red-500 hover:bg-red-500/10 rounded-lg">
          <LogOut size={24} className="mr-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="flex h-screen bg-gray-200 dark:bg-dark-card/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-gray-100 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border">
        <SidebarContent onLogout={onLogout} />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="relative w-72 max-w-full h-full">
            <SidebarContent onLogout={onLogout} />
        </div>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 md:p-6 bg-gray-100 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-700 dark:text-dark-text">
                <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h2>
            <div className="w-8"></div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-dark-bg">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
