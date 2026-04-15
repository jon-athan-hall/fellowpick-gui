import { Button, Group, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import {
  DeleteRoleConfirm,
  RoleFormModal,
  RolesTable,
  type RoleResponse
} from '../features/roles';

// Admin page for creating, editing, and deleting roles.
export function RolesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);

  function openCreate() {
    setEditingRole(null);
    setFormOpen(true);
  }

  function openEdit(role: RoleResponse) {
    setEditingRole(role);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Roles</Title>
          <Button onClick={openCreate}>New role</Button>
        </Group>
        <RolesTable onEdit={openEdit} onDelete={setDeletingRole} />
      </Stack>
      <RoleFormModal opened={formOpen} onClose={closeForm} role={editingRole} />
      <DeleteRoleConfirm role={deletingRole} onClose={() => setDeletingRole(null)} />
    </>
  );
}