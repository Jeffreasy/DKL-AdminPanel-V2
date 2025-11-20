import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  requiredPermission?: {
    resource: string;
    action: string;
  };
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRole,
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // 1. Wacht tot we weten of de gebruiker ingelogd is (bijv. refresh token check)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Laden...</p>
        </div>
      </div>
    );
  }

  // 2. Check of gebruiker ingelogd is
  if (!isAuthenticated) {
    // Sla de huidige locatie op zodat we na login terug kunnen keren
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 3. Check specifieke Rol (optioneel)
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Check specifieke Permissie (optioneel)
  // Bijvoorbeeld: resource="event", action="read"
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. Alles goed? Render de child routes (de pagina)
  return <Outlet />;
};