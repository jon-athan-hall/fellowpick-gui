import { Alert, Button, Container, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth';
import { ApiError } from '../shared/api/errors';

// Renders the account registration form with name, email, and password fields.
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

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.isError
        ? 'Registration failed'
        : null;

  return (
    <Container size="xs" py="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={2}>Create an account</Title>
          {errorMessage && <Alert color="red">{errorMessage}</Alert>}
          <TextInput label="Name" required {...form.getInputProps('name')} />
          <TextInput label="Email" type="email" required {...form.getInputProps('email')} />
          <PasswordInput label="Password" required {...form.getInputProps('password')} />
          <Button type="submit" loading={registerMutation.isPending}>
            Register
          </Button>
          <Link to="/login">Already have an account? Sign in</Link>
        </Stack>
      </form>
    </Container>
  );
}