import React, { useEffect, useState, useCallback } from 'react';
import { User, LoginCredentials } from '@/api/types/auth.types';
import { authService } from '@/services/auth/auth.service';
import apiClient from '@/api/axios.client';
import { AuthContext } from './auth-context-internal';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper om token in te stellen op de API client
  const setAxiosToken = (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  // 3. Logout Functie
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Probeer server-side logout (best effort)
      await authService.logout().catch(() => {});
    } finally {
      // Client-side cleanup (altijd uitvoeren)
      setToken(null);
      setUser(null);
      setAxiosToken(null);
      localStorage.removeItem('refresh_token');
      setIsLoading(false);
    }
  }, []);

  // 1. Initialisatie bij laden pagina
  useEffect(() => {
    const initAuth = async () => {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (!storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Probeer access token te verversen
        const refreshResponse = await authService.refreshToken(storedRefreshToken);
        const newToken = refreshResponse.token;
        const newRefreshToken = refreshResponse.refresh_token;

        // Opslaan
        setToken(newToken);
        setAxiosToken(newToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        // Profiel ophalen
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        await logout(); // Opschonen als refresh faalt
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  // 2. Login Functie
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      const { token, refresh_token, user } = response;

      // State updaten
      setToken(token);
      setUser(user);
      
      // API client configureren
      setAxiosToken(token);

      // Refresh token veilig bewaren voor page reloads
      localStorage.setItem('refresh_token', refresh_token);
    } finally {
      setIsLoading(false);
    }
  };


  // 4. Permission Check (RBAC)
  const hasPermission = useCallback((resource: string, action: string) => {
    if (!user || !user.permissions) return false;

    // Admin rol check (optioneel, vaak heeft admin alles)
    if (user.roles && user.roles.some(r => r.name === 'admin')) return true;

    return user.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }, [user]);

  // 5. Role Check (Helper)
  const hasRole = useCallback((roleName: string) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === roleName);
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};