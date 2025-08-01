
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initializeDatabase, getPassword, saveLastLogin } from './services/db';
import { ThemeProvider } from './hooks/useTheme';
import { StoreProvider } from './hooks/useStore';
import { DEFAULT_PASSWORD } from './constants';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import EditAttendance from './pages/EditAttendance';
import Settings from './pages/Settings';
import Spinner from './components/ui/Spinner';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    initializeDatabase();
    // Simple session check. In a real app, use a token.
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    if (sessionAuth) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (password: string): Promise<boolean> => {
    const storedPassword = await getPassword();
    // Allow login with either the stored password or the default password as a fallback.
    if (password === storedPassword || password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      await saveLastLogin(new Date().toISOString());
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-bg"><Spinner /></div>;
  }

  return (
    <ThemeProvider>
      <StoreProvider>
        <ReactRouterDOM.HashRouter>
          <ReactRouterDOM.Routes>
            {!isAuthenticated ? (
              <ReactRouterDOM.Route path="/login" element={<Login onLogin={handleLogin} />} />
            ) : null}
            
            {isAuthenticated ? (
               <ReactRouterDOM.Route path="/" element={<Layout onLogout={handleLogout} />}>
                  <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
                  <ReactRouterDOM.Route path="dashboard" element={<Dashboard />} />
                  <ReactRouterDOM.Route path="attendance" element={<Attendance />} />
                  <ReactRouterDOM.Route path="edit-attendance" element={<EditAttendance />} />
                  <ReactRouterDOM.Route path="settings" element={<Settings />} />
                  <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
               </ReactRouterDOM.Route>
            ) : null}
            <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </ReactRouterDOM.Routes>
        </ReactRouterDOM.HashRouter>
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: 'bg-gray-800 text-white dark:bg-dark-card dark:text-dark-text',
            style: {
              borderRadius: '10px',
            },
          }}
        />
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
