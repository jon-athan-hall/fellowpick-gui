import { Alert, Button, PasswordInput, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../../shared/api/errors';
import { useChangePasswordMutation } from '../api/use-change-password';

export interface ChangePasswordFormProps {
  userId: string;
}

// Renders a form for changing the current user's password.
export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const changeMutation = useChangePasswordMutation();

  const form = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: (v) => (v.length > 0 ? null : 'Current password is required'),
      newPassword: (v) =>
        v.length >= 8 && v.length <= 100 ? null : 'Password must be 8–100 characters',
      confirmPassword: (v, values) =>
        v === values.newPassword ? null : 'Passwords do not match'
    }
  });

  function handleSubmit(values: typeof form.values) {
    changeMutation.mutate(
      {
        id: userId,
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword }
      },
      {
        onSuccess: () => {
          form.reset();
        }
      }
    );
  }

  const errorMessage =
    changeMutation.error instanceof ApiError
      ? changeMutation.error.message
      : changeMutation.isError
        ? 'Password change failed'
        : null;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Title order={4}>Change password</Title>
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
        {changeMutation.isSuccess && <Alert color="green">Password updated.</Alert>}
        <PasswordInput
          label="Current password"
          required
          {...form.getInputProps('currentPassword')}
        />
        <PasswordInput label="New password" required {...form.getInputProps('newPassword')} />
        <PasswordInput
          label="Confirm new password"
          required
          {...form.getInputProps('confirmPassword')}
        />
        <Button type="submit" loading={changeMutation.isPending}>
          Update password
        </Button>
      </Stack>
    </form>
  );
}