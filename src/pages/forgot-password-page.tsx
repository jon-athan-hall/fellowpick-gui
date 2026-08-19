import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AuthFormPanel, useForgotPasswordMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

// Renders a form to request a password reset link via email.
//
// The card, its heading, its spacing and its footer are all `AuthFormPanel`,
// shared with the other three auth pages.
export function ForgotPasswordPage() {
  const forgotMutation = useForgotPasswordMutation();

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email')
    }
  });

  function handleSubmit(values: typeof form.values) {
    forgotMutation.mutate(values.email);
  }

  return (
    <AuthFormPanel
      title="Reset your password"
      error={getApiErrorMessage(forgotMutation.error, 'Request failed')}
      // Deliberately says nothing about whether the address is registered:
      // a different answer for a known address would turn this form into a way
      // of testing whether someone has an account here.
      success={
        forgotMutation.isSuccess
          ? 'If an account exists for that email, a reset link is on its way.'
          : undefined
      }
      onSubmit={form.onSubmit(handleSubmit)}
      submitLabel="Send reset link"
      loading={forgotMutation.isPending}
      links={[{ to: '/login', label: 'Back to sign in' }]}
    >
      <TextInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        {...form.getInputProps('email')}
      />
    </AuthFormPanel>
  );
}
