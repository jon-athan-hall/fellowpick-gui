import { Alert, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useCreateRoleMutation } from '../api/use-create-role';
import { useUpdateRoleMutation } from '../api/use-update-role';
import type { RoleResponse } from '../types';

export interface RoleFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** When set, the modal edits this role. When null, it creates a new one. */
  role: RoleResponse | null;
}

// Renders a modal form for creating or editing a role.
export function RoleFormModal({ opened, onClose, role }: RoleFormModalProps) {
  const isEditing = role !== null;
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const activeMutation = isEditing ? updateMutation : createMutation;

  const form = useForm({
    initialValues: { name: role?.name ?? '' },
    validate: {
      name: (v) => (v.trim().length > 0 && v.length <= 50 ? null : 'Name is required (≤50 chars)')
    }
  });

  // Reset form + mutation state whenever the modal opens or the target role
  // changes — otherwise stale errors and old field values bleed across uses.
  useEffect(() => {
    if (opened) {
      form.setValues({ name: role?.name ?? '' });
      form.resetDirty({ name: role?.name ?? '' });
      createMutation.reset();
      updateMutation.reset();
    }
    // form / mutations are stable references from their respective hooks;
    // re-running this effect on their identity would loop infinitely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, role]);

  function handleSubmit(values: typeof form.values) {
    if (isEditing && role) {
      updateMutation.mutate(
        { id: role.id, body: { name: values.name } },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate({ name: values.name }, { onSuccess: () => onClose() });
    }
  }

  const errorMessage =
    activeMutation.error instanceof ApiError
      ? activeMutation.error.message
      : activeMutation.isError
        ? isEditing
          ? 'Update failed'
          : 'Create failed'
        : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? `Edit role: ${role?.name}` : 'Create role'}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {errorMessage && <Alert color="red">{errorMessage}</Alert>}
          <TextInput label="Name" required {...form.getInputProps('name')} />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={activeMutation.isPending}>
              {isEditing ? 'Save changes' : 'Create role'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}