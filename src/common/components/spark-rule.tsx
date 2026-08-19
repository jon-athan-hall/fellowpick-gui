import { Box, Group, Text } from '@mantine/core';

/**
 * A gold spark set between two hairlines — the same mark the header puts
 * between its three descriptors, reused as a card's title divider so the two
 * read as the same family.
 *
 * Decorative: the rules flex, so the spark stays centred at any width, and the
 * whole thing is hidden from assistive tech.
 */
export function SparkRule() {
  return (
    <Group gap="xs" wrap="nowrap" align="center" aria-hidden="true">
      <Box flex={1} h={1} bg="dark.4" />
      <Text component="span" c="gold.4" lh={1}>
        ✦
      </Text>
      <Box flex={1} h={1} bg="dark.4" />
    </Group>
  );
}
