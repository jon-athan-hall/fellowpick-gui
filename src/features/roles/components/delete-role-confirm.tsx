import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useDeleteRoleMutation } from '../api/use-delete-role';
import type { RoleResponse } from '../types';

export interface DeleteRoleConfirmProps {
  /** When set, the modal is open and confirming deletion of this role. */
  role: RoleResponse | null;
  onClose: () => void;
}

export function DeleteRoleConfirm({ role, onClose }: DeleteRoleConfirmProps) {
  const deleteMutation = useDeleteRoleMutation();

  // Reset stale mutation state every time a new role is targeted, so a
  // previous failure doesn't leak into the next confirmation.
  useEffect(() => {
    if (role) deleteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  function handleConfirm() {
    if (!role) return;
    deleteMutation.mutate(role.id, { onSuccess: () => onClose() });
  }

  const errorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.isError
        ? 'Delete failed'
        : null;

  return (
    <Modal opened={role !== null} onClose={onClose} title="Delete role" centered>
      <Stack gap="md">
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
        <Text>
          Are you sure you want to delete <strong>{role?.name}</strong>? This cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={deleteMutation.isPending} onClick={handleConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}