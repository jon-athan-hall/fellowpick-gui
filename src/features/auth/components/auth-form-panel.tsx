import { Alert, Anchor, Button, Group, Stack, Title } from '@mantine/core';
import type { FormEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CenteredGlowPanel } from '../../../common/components/centered-glow-panel';
import { SparkRule } from '../../../common/components/spark-rule';

export interface AuthFormLink {
  to: string;
  label: string;
}

interface AuthFormPanelProps {
  /** The h1. One per page, so it is an order-1 heading and not a styled order-2. */
  title: string;
  /** Message from a failed submit, or null/undefined when the last one was fine. */
  error?: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  loading?: boolean;
  /** The form's fields. Spaced by the panel, not by the caller. */
  children: ReactNode;
  /**
   * Destinations rather than rendered anchors, so their size and placement stay
   * the panel's business — a page that handed over its own `<Anchor>` would be
   * free to size it differently, which is the drift this component exists to
   * prevent.
   */
  links?: AuthFormLink[];
}

/**
 * The shape every auth form takes: a glowing centred card, an h1 over a spark
 * rule, an error slot, the fields, then a full-width submit with its links
 * beneath.
 *
 * It exists because sign-in and register had drifted into two different designs
 * of the same thing — one a glowing centred card with an h1 and a spark rule,
 * the other a bare Paper with an order-2 title and a button sized to its text.
 * Every rule that made sign-in look the way it does now lives here, so the two
 * cannot part company again.
 *
 * Nothing here restates a theme default. Input and button sizing, the h1's
 * size, the Paper's padding and the error tint all come from `theme.ts`, which
 * is this project's global style layer; the only reason this component exists
 * is the *arrangement*, which a theme cannot express.
 *
 * The three gaps are the layout rule and the one thing worth reading twice:
 * `lg` between the card's regions, `md` inside a region, `xs` between the title
 * and its rule — so the heading reads as one object and the regions read as
 * three.
 */
export function AuthFormPanel({
  title,
  error,
  onSubmit,
  submitLabel,
  loading,
  children,
  links,
}: AuthFormPanelProps) {
  return (
    <CenteredGlowPanel>
      <form onSubmit={onSubmit}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>{title}</Title>
            <SparkRule />
          </Stack>

          {error && (
            <Alert color="red" p="sm">
              {error}
            </Alert>
          )}

          <Stack gap="md">{children}</Stack>

          <Stack gap="md">
            <Button type="submit" fullWidth loading={loading}>
              {submitLabel}
            </Button>
            {links && links.length > 0 && (
              // Space-between so a pair sits at the two edges; a lone link then
              // falls to the left, which is where it belongs anyway.
              <Group justify="space-between">
                {links.map((link) => (
                  <Anchor key={link.to} component={Link} to={link.to} fz="sm">
                    {link.label}
                  </Anchor>
                ))}
              </Group>
            )}
          </Stack>
        </Stack>
      </form>
    </CenteredGlowPanel>
  );
}
