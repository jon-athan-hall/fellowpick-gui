import { PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { AuthFormPanel, useLoginMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

// Renders the sign-in form with email/password fields and login validation.
//
// The card, its heading, its spacing and its footer are all `AuthFormPanel`,
// shared with register. Everything left here is what actually differs between
// the two: which fields, which mutation, and where a success goes.
export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters')
    }
  });

  function handleSubmit(values: typeof form.values) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  return (
    <AuthFormPanel
      title="Sign in"
      error={getApiErrorMessage(loginMutation.error, 'Login failed')}
      onSubmit={form.onSubmit(handleSubmit)}
      submitLabel="Sign in"
      loading={loginMutation.isPending}
      links={[
        { to: '/register', label: 'Need an account? Register' },
        { to: '/forgot-password', label: 'Forgot your password?' }
      ]}
    >
      <TextInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        {...form.getInputProps('email')}
      />
      <PasswordInput
        label="Password"
        placeholder="••••••••"
        required
        {...form.getInputProps('password')}
      />
    </AuthFormPanel>
  );
}
