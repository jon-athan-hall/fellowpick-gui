/**
 * Mirrors the trailhead-api role DTOs.
 */

export interface RoleResponse {
  id: string;
  name: string;
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}