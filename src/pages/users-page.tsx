import { Container, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { useRolesQuery } from '../features/roles';
import {
  DeleteUserConfirm,
  UserRolesModal,
  UsersTable,
  type UserResponse
} from '../features/users';

export function UsersPage() {
  const rolesQuery = useRolesQuery();
  const [rolesUser, setRolesUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  return (
    <Container size="xl" py="xl">
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
    </Container>
  );
}