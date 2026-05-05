import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { getApiErrorMessage } from '../../../common/api/errors';
import { useResendVerificationMutation } from '../api/use-resend-verification';

// Displays a warning banner prompting the user to verify their email, with a resend button.
export function ResendVerificationBanner() {
  const resendMutation = useResendVerificationMutation();
  const errorMessage = getApiErrorMessage(resendMutation.error, 'Failed to send verification email');

  return (
    <Alert color="rust" title="Email not verified">
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
            color="rust"
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
