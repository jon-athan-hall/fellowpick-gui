import { Paper, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { useRolesQuery } from '../features/role';
import {
  DeleteUserConfirm,
  UserRolesModal,
  UsersTable,
  type UserResponse
} from '../features/user';

// Admin page for managing users, their roles, and account deletion.
export function UsersPage() {
  const rolesQuery = useRolesQuery();
  const [rolesUser, setRolesUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  return (
    <>
      <Paper>
        <Stack gap="lg">
          <Title order={2}>Users</Title>
          <UsersTable onManageRoles={setRolesUser} onDelete={setDeletingUser} />
        </Stack>
      </Paper>
      <UserRolesModal
        user={rolesUser}
        availableRoles={rolesQuery.data ?? []}
        onClose={() => setRolesUser(null)}
      />
      <DeleteUserConfirm user={deletingUser} onClose={() => setDeletingUser(null)} />
    </>
  );
}