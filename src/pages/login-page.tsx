import { Anchor, Alert, Button, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth';
import { ApiError } from '../shared/api/errors';

// Renders the sign-in form with email/password fields and login validation.
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

  const errorMessage =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.isError
        ? 'Login failed'
        : null;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={2}>Sign in</Title>
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
        <TextInput label="Email" type="email" required {...form.getInputProps('email')} />
        <PasswordInput label="Password" required {...form.getInputProps('password')} />
        <Button type="submit" loading={loginMutation.isPending}>
          Sign in
        </Button>
        <Anchor component={Link} to="/register">Need an account? Register</Anchor>
        <Anchor component={Link} to="/forgot-password">Forgot your password?</Anchor>
      </Stack>
    </form>
  );
}
