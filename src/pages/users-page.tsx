import { Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { useRolesQuery } from '../features/roles';
import {
  DeleteUserConfirm,
  UserRolesModal,
  UsersTable,
  type UserResponse
} from '../features/users';

// Admin page for managing users, their roles, and account deletion.
export function UsersPage() {
  const rolesQuery = useRolesQuery();
  const [rolesUser, setRolesUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  return (
    <>
      <Stack gap="lg">
        <Title order={2}>Users</Title>
        <UsersTable onManageRoles={setRolesUser} onDelete={setDeletingUser} />
      </Stack>
      <UserRolesModal
        user={rolesUser}
        availableRoles={rolesQuery.data ?? []}
        onClose={() => setRolesUser(null)}
      />
      <DeleteUserConfirm user={deletingUser} onClose={() => setDeletingUser(null)} />
    </>
  );
}