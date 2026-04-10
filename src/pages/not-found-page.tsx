import { Container, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={1}>404</Title>
        <Text>We couldn't find that page.</Text>
        <Link to="/">Back to home</Link>
      </Stack>
    </Container>
  );
}