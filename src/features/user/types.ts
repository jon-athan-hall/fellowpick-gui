/**
 * Mirrors the fellowpick-api user DTOs.
 */

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  roles: string[];
  createdAt: string;
}

/**
 * Spring Data's Page<T> envelope. Only the fields the frontend needs are
 * declared; the backend ships more (pageable, sort, first/last, etc.) which
 * are ignored.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ListUsersParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  /** Required when a non-admin is changing their own password. */
  currentPassword?: string;
  newPassword: string;
}