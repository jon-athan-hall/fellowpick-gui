import { Alert, Button, Container, Loader, Stack, Title } from '@mantine/core';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailQuery } from '../features/auth/api/use-verify-email';
import { ApiError } from '../shared/api/errors';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyQuery = useVerifyEmailQuery(token);

  const errorMessage =
    verifyQuery.error instanceof ApiError
      ? verifyQuery.error.message
      : verifyQuery.isError
        ? 'Verification failed'
        : null;

  return (
    <Container size="xs" py="xl">
      <Stack>
        <Title order={2}>Verify your email</Title>
        {!token && (
          <Alert color="red">Missing verification token. Check the link in your email.</Alert>
        )}
        {token && verifyQuery.isPending && <Loader />}
        {verifyQuery.isSuccess && (
          <>
            <Alert color="green">Your email has been verified.</Alert>
            <Button component={Link} to="/login">
              Continue to sign in
            </Button>
          </>
        )}
        {errorMessage && <Alert color="red">{errorMessage}</Alert>}
      </Stack>
    </Container>
  );
}
