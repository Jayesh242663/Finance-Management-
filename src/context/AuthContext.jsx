import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user] = useState({
    id: 'demo-admin-id',
    email: 'admin@demo.com',
    name: 'Demo Administrator',
    role: 'administrator',
    loginTime: new Date().toISOString(),
  });
  const [loading] = useState(false);

  const login = async () => {
    return { success: true };
  };

  const logout = async () => {
    // No-op for standalone demo
    console.log('Logout is disabled in demo mode');
  };

  // Helper functions for role checking
  const isAdmin = () => true;
  const isAuditor = () => false;
  const hasRole = (role) => role === 'administrator';
  const canEdit = () => true;
  const canView = () => true;

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: true,
    isAdmin,
    isAuditor,
    hasRole,
    canEdit,
    canView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
