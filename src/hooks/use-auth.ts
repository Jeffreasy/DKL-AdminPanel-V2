import { useContext } from 'react';
import { AuthContext } from '../context/auth-context-internal';
import { AuthContextType } from '../context/auth-context';

// Hook voor gebruik in componenten
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Extra hook voor makkelijke permission checks in UI
export const usePermission = (resource: string, action: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(resource, action);
};