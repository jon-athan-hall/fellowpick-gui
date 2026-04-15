import { Anchor, Alert, Button, PasswordInput, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/auth';
import { ApiError } from '../shared/api/errors';

// Renders the password reset form using a token from the email link.
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetMutation = useResetPasswordMutation();

  const form = useForm({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: {
      newPassword: (v) =>
        v.length >= 8 && v.length <= 100 ? null : 'Password must be 8–100 characters',
      confirmPassword: (v, values) =>
        v === values.newPassword ? null : 'Passwords do not match'
    }
  });

  function handleSubmit(values: typeof form.values) {
    if (!token) return;
    resetMutation.mutate({ token, newPassword: values.newPassword });
  }

  const errorMessage =
    resetMutation.error instanceof ApiError
      ? resetMutation.error.message
      : resetMutation.isError
        ? 'Reset failed'
        : null;

  if (!token) {
    return (
      <Stack>
        <Title order={2}>Reset your password</Title>
        <Alert color="red">
          Missing reset token. Check the link in your email or request a new one.
        </Alert>
        <Anchor component={Link} to="/forgot-password">Request a new reset link</Anchor>
      </Stack>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={2}>Choose a new password</Title>
        {resetMutation.isSuccess ? (
          <>
            <Alert color="green">Your password has been reset.</Alert>
            <Button component={Link} to="/login">
              Continue to sign in
            </Button>
          </>
        ) : (
          <>
            {errorMessage && <Alert color="red">{errorMessage}</Alert>}
            <PasswordInput
              label="New password"
              required
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirm new password"
              required
              {...form.getInputProps('confirmPassword')}
            />
            <Button type="submit" loading={resetMutation.isPending}>
              Reset password
            </Button>
          </>
        )}
      </Stack>
    </form>
  );
}