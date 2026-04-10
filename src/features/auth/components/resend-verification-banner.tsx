import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { ApiError } from '../../../shared/api/errors';
import { useResendVerificationMutation } from '../api/use-resend-verification';

export function ResendVerificationBanner() {
  const resendMutation = useResendVerificationMutation();

  const errorMessage =
    resendMutation.error instanceof ApiError
      ? resendMutation.error.message
      : resendMutation.isError
        ? 'Failed to send verification email'
        : null;

  return (
    <Alert color="yellow" title="Email not verified">
      <Stack gap="sm">
        <Text size="sm">
          Check your inbox for a verification link. If you don't see it, you can request a new
          one.
        </Text>
        {resendMutation.isSuccess && (
          <Text size="sm" c="green">
            A new verification email has been sent.
          </Text>
        )}
        {errorMessage && (
          <Text size="sm" c="red">
            {errorMessage}
          </Text>
        )}
        <Group>
          <Button
            size="xs"
            variant="light"
            color="yellow"
            loading={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            Resend verification email
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
