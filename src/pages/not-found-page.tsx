import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

// Renders a 404 error page with a link back to the home page.
export function NotFoundPage() {
  return (
    <Stack>
      <Title order={1}>404</Title>
      <Text>We couldn't find that page.</Text>
      <Anchor component={Link} to="/">Back to home</Anchor>
    </Stack>
  );
}