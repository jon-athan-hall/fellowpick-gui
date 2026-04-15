import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useDeleteUserMutation } from '../api/use-delete-user';
import type { UserResponse } from '../types';

export interface DeleteUserConfirmProps {
  user: UserResponse | null;
  onClose: () => void;
}

// Renders a confirmation modal for soft-deleting a user.
export function DeleteUserConfirm({ user, onClose }: DeleteUserConfirmProps) {
  const deleteMutation = useDeleteUserMutation();

  useEffect(() => {
    if (user) deleteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleConfirm() {
    if (!user) return;
    deleteMutation.mutate(user.id, { onSuccess: () => onClose() });
  }

  const errorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.isError
        ? 'Delete failed'
        : null;

  return (
    <Modal opened={user !== null} onClose={onClose} title="Delete user" centered>
      <Stack gap="md">
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
        <Text>
          Are you sure you want to delete <strong>{user?.name}</strong> ({user?.email})? They
          will be soft-deleted and can be restored later.
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