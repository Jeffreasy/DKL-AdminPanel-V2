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

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description: string;
}

export interface AssignPermissionRequest {
  roleId: string;
  permissionId: string;
}

export interface MenuPermission {
  id: string;
  menu_item: string;
  permission: string;
}

export interface MenuMatrix {
  [roleId: string]: {
    [menuItem: string]: boolean;
  };
}

export interface UpdateMenuPermissionsRequest {
  menu_permissions: string[];
}