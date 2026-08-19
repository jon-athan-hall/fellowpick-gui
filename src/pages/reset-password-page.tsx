import { PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSearchParams } from 'react-router-dom';
import { AuthFormPanel, useResetPasswordMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

// Renders the password reset form using a token from the email link.
//
// The card, its heading, its spacing and its footer are all `AuthFormPanel`,
// shared with the other three auth pages.
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

  // A link that arrived without its token. There is nothing to submit and no
  // field worth filling in, so the panel gets no form at all — only the reason
  // and the way to get a working link.
  if (!token) {
    return (
      <AuthFormPanel
        title="Reset your password"
        error="Missing reset token. Check the link in your email or request a new one."
        links={[{ to: '/forgot-password', label: 'Request a new reset link' }]}
      />
    );
  }

  const done = resetMutation.isSuccess;

  return (
    <AuthFormPanel
      title="Choose a new password"
      error={getApiErrorMessage(resetMutation.error, 'Reset failed')}
      success={done ? 'Your password has been reset.' : undefined}
      onSubmit={form.onSubmit(handleSubmit)}
      submitLabel="Reset password"
      loading={resetMutation.isPending}
      // Takes the submit button's place once the reset lands, so the way onward
      // sits where the way forward just was.
      action={done ? { to: '/login', label: 'Continue to sign in' } : undefined}
    >
      <PasswordInput
        label="New password"
        placeholder="••••••••"
        required
        {...form.getInputProps('newPassword')}
      />
      <PasswordInput
        label="Confirm new password"
        placeholder="••••••••"
        required
        {...form.getInputProps('confirmPassword')}
      />
    </AuthFormPanel>
  );
}
