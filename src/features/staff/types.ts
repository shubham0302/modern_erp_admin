export type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export const PERMISSION_MODULES = [
  "dashboard",
  "designs",
  "inventory",
  "production",
  "order",
  "finance",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  designs: "Designs",
  inventory: "Inventory",
  production: "Production",
  order: "Order",
  finance: "Finance",
};

export type Permission = {
  module: PermissionModule;
  canRead: boolean;
  canWrite: boolean;
};

export type CreateStaffRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
};

export type UpdateStaffRequest = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  roleId: string;
};

export type CreateRoleRequest = {
  name: string;
  description?: string;
  permissions: Permission[];
};

export type RoleDetail = {
  role: Role;
  permissions: Permission[];
};

export type UpdateRoleRequest = CreateRoleRequest;
