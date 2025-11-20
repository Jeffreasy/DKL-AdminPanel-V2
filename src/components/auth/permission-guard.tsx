import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { rbacService } from '@/services/auth/rbac.service';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (user && rbacService.hasPermission(user, { resource, action })) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};