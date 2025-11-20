export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  permissions?: Permission[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  expires_at?: string;
  role?: Role;
}

export interface User {
  id: string;
  naam: string;
  email: string;
  is_actief: boolean;
  laatste_login?: string;
  created_at: string;
  roles?: Role[]; // Simplified view from backend
  user_roles?: UserRole[]; // Detailed view if needed
}

export interface CreateUserRequest {
  naam: string;
  email: string;
  wachtwoord: string;
  is_actief: boolean;
}

export interface UpdateUserRequest {
  naam?: string;
  email?: string;
  is_actief?: boolean;
  wachtwoord?: string; // Optional password reset
}