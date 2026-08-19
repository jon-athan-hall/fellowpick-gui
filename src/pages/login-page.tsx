import {
  Alert,
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';
import { CenteredGlowPanel } from '../common/components/centered-glow-panel';
import { SparkRule } from '../common/components/spark-rule';

// Renders the sign-in form with email/password fields and login validation.
//
// The card, its centring and its glow are `CenteredGlowPanel`. Input and button
// sizing, the h1 size and the error tint are all theme defaults, so nothing
// here re-states them either.
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

  const errorMessage = getApiErrorMessage(loginMutation.error, 'Login failed');

  return (
    <CenteredGlowPanel>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>Sign in</Title>
            <SparkRule />
          </Stack>

          {errorMessage && (
            <Alert color="red" p="sm">
              {errorMessage}
            </Alert>
          )}

          <Stack gap="md">
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
          </Stack>

          <Stack gap="md">
            <Button type="submit" fullWidth loading={loginMutation.isPending}>
              Sign in
            </Button>
            <Group justify="space-between">
              <Anchor component={Link} to="/register" fz="sm">
                Need an account? Register
              </Anchor>
              <Anchor component={Link} to="/forgot-password" fz="sm">
                Forgot your password?
              </Anchor>
            </Group>
          </Stack>
        </Stack>
      </form>
    </CenteredGlowPanel>
  );
}
