import { Alert, Button, Container, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/auth/api/use-forgot-password';
import { ApiError } from '../shared/api/errors';

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

  const errorMessage =
    forgotMutation.error instanceof ApiError
      ? forgotMutation.error.message
      : forgotMutation.isError
        ? 'Request failed'
        : null;

  return (
    <Container size="xs" py="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={2}>Reset your password</Title>
          {forgotMutation.isSuccess ? (
            <Alert color="green">
              If an account exists for that email, a reset link is on its way.
            </Alert>
          ) : (
            <>
              {errorMessage && <Alert color="red">{errorMessage}</Alert>}
              <TextInput
                label="Email"
                type="email"
                required
                {...form.getInputProps('email')}
              />
              <Button type="submit" loading={forgotMutation.isPending}>
                Send reset link
              </Button>
            </>
          )}
          <Link to="/login">Back to sign in</Link>
        </Stack>
      </form>
    </Container>
  );
}