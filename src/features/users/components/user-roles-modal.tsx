import { Alert, Badge, Button, CloseButton, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api/errors';
import { useAssignRoleMutation } from '../api/use-assign-role';
import { useRemoveRoleMutation } from '../api/use-remove-role';
import type { UserResponse } from '../types';

/**
 * Local structural type for an assignable role. Defined here (instead of
 * imported from the roles feature) to keep the users feature decoupled —
 * features cross-talk only through the page layer.
 */
export interface RoleOption {
  id: string;
  name: string;
}

export interface UserRolesModalProps {
  /** When set, the modal is open and managing roles for this user. */
  user: UserResponse | null;
  availableRoles: RoleOption[];
  onClose: () => void;
}

export function UserRolesModal({ user, availableRoles, onClose }: UserRolesModalProps) {
  const assignMutation = useAssignRoleMutation();
  const removeMutation = useRemoveRoleMutation();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Reset stale mutation state and selection on every (re)open so a previous
  // failure or selection doesn't bleed into the next user.
  useEffect(() => {
    if (user) {
      assignMutation.reset();
      removeMutation.reset();
      setSelectedRoleId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return <Modal opened={false} onClose={onClose} title="" />;
  }

  const currentRoleNames = new Set(user.roles);
  const currentRoles = availableRoles.filter((r) => currentRoleNames.has(r.name));
  const addableRoles = availableRoles.filter((r) => !currentRoleNames.has(r.name));

  function handleAdd() {
    if (!user || !selectedRoleId) return;
    assignMutation.mutate(
      { userId: user.id, roleId: selectedRoleId },
      { onSuccess: () => setSelectedRoleId(null) }
    );
  }

  function handleRemove(roleId: string) {
    if (!user) return;
    removeMutation.mutate({ userId: user.id, roleId });
  }

  const errorMessage = (() => {
    const err = assignMutation.error ?? removeMutation.error;
    if (err instanceof ApiError) return err.message;
    if (assignMutation.isError) return 'Failed to assign role';
    if (removeMutation.isError) return 'Failed to remove role';
    return null;
  })();

  return (
    <Modal opened={true} onClose={onClose} title={`Manage roles: ${user.name}`} centered>
      <Stack gap="md">
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}

        <Stack gap="xs">
          <Text fw={500}>Current roles</Text>
          {currentRoles.length === 0 ? (
            <Text size="sm" c="dimmed">
              No roles assigned.
            </Text>
          ) : (
            <Group gap="xs">
              {currentRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant="light"
                  rightSection={
                    <CloseButton
                      size="xs"
                      aria-label={`Remove ${role.name}`}
                      onClick={() => handleRemove(role.id)}
                    />
                  }
                >
                  {role.name}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>Add a role</Text>
          {addableRoles.length === 0 ? (
            <Text size="sm" c="dimmed">
              No more roles available to assign.
            </Text>
          ) : (
            <Group gap="sm" align="flex-end">
              <Select
                placeholder="Select role"
                data={addableRoles.map((r) => ({ value: r.id, label: r.name }))}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                style={{ flex: 1 }}
              />
              <Button
                onClick={handleAdd}
                disabled={!selectedRoleId}
                loading={assignMutation.isPending}
              >
                Add
              </Button>
            </Group>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Done
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}