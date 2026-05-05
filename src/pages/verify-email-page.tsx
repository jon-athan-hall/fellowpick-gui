import { Alert, Button, Loader, Paper, Stack, Title } from '@mantine/core';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailQuery } from '../features/auth';
import { getApiErrorMessage } from '../common/api/errors';

// Handles email verification by consuming the token from the URL query string.
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyQuery = useVerifyEmailQuery(token);

  const errorMessage = getApiErrorMessage(verifyQuery.error, 'Verification failed');

  return (
    <Paper>
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
    </Paper>
  );
}
