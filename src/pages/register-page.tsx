import { PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { AuthFormPanel, useRegisterMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

// Renders the account registration form with name, email, and password fields.
//
// The card, its heading, its spacing and its footer are all `AuthFormPanel`,
// shared with sign-in. Everything left here is what actually differs between
// the two: which fields, which mutation, and where a success goes.
export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : 'Name is required'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters')
    }
  });

  function handleSubmit(values: typeof form.values) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate('/');
      }
    });
  }

  return (
    <AuthFormPanel
      title="Create an account"
      error={getApiErrorMessage(registerMutation.error, 'Registration failed')}
      onSubmit={form.onSubmit(handleSubmit)}
      submitLabel="Register"
      loading={registerMutation.isPending}
      links={[{ to: '/login', label: 'Already have an account? Sign in' }]}
    >
      {/* Placeholders on every field, as on sign-in: each shows the shape of
          the answer rather than repeating the label above it. The name is the
          one other people see beside your picks, so the example is a person's
          name and not an account handle. */}
      <TextInput
        label="Name"
        placeholder="Frodo Baggins"
        required
        {...form.getInputProps('name')}
      />
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
