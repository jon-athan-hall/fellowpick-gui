import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Image,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useLogoutMutation, useAuth } from '../features/auth';
import { useCardPreview } from '../features/pick';
import universes from '../data/universes.json';
import classes from './app-layout.module.css';

// Renders a Scryfall set icon recolorable to match the surrounding text via
// CSS masking. Pass no `code` to render an identically-shaped *empty* slot;
// the inner span renders unconditionally so universe and precon rows have
// byte-for-byte the same DOM structure and labels align column-down.
function SetIcon({ code }: { code?: string }) {
  const url = code ? `url(https://svgs.scryfall.io/sets/${code.toLowerCase()}.svg)` : 'none';
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5rem',
        height: '1.5rem',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '1.25rem',
          height: '1.25rem',
          backgroundColor: code ? 'currentColor' : 'transparent',
          maskImage: url,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: url,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </span>
  );
}

// Joins truthy class names with spaces; small helper to avoid awkward template
// strings sprinkled throughout JSX.
function cx(...classNames: (string | false | undefined | null)[]): string {
  return classNames.filter(Boolean).join(' ');
}

// Renders the application shell with header, sidebar universe nav, and routed content.
export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const { user, isAuthenticated, clearSession } = useAuth();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();
  const { imageUrl } = useCardPreview();

  function handleSignOut() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearSession();
        navigate('/login');
      }
    });
  }

  return (
    <AppShell
      header={{ height: { base: 80, sm: 112 }}}
      navbar={{ width: 291, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
      padding="md"
      withBorder={false}
    >
      <AppShell.Header bg="dark.6" className={classes.header}>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap" align="center">
          <Group gap="md" wrap="nowrap" align="center">
            <Burger opened={navOpened} onClick={toggleNav} hiddenFrom="sm" size="sm" />
            <Text component="span" aria-hidden="true" className={classes.wizard} fz={{ base: '2rem', sm: '2.75rem' }} lh={1}>
              🧙
            </Text>
            <Stack gap={6}>
              <UnstyledButton
                component={Link}
                to="/"
                aria-label="Fellowpick home"
                className={classes.brandLink}
              >
                <Title
                  order={2}
                  component="div"
                  fz={{ base: '1.875rem', sm: '2.75rem' }}
                  lh={1.1}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Fellowpick
                </Title>
              </UnstyledButton>
              {/* Hidden rather than wrapped on mobile: three descriptors cannot
                  share a phone row. The gold diamonds are what make this read as
                  three items instead of one long string. */}
              <Group gap="xs" visibleFrom="sm" fz="sm" lts="0.06em" lh={1.3} tt="uppercase" c="dimmed">
                <Text component="span" inherit>
                  Community-driven
                </Text>
                <Text component="span" aria-hidden="true" c="gold.4" inherit>
                  ✦
                </Text>
                <Text component="span" inherit>
                  in-universe only
                </Text>
                <Text component="span" aria-hidden="true" c="gold.4" inherit>
                  ✦
                </Text>
                <Text component="span" inherit>
                  precon upgrades
                </Text>
              </Group>
            </Stack>
          </Group>

          {isAuthenticated ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="User menu">
                  <Avatar color="sapphire" radius="xl">
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) ?? '?'}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user?.email}</Menu.Label>
                <Menu.Item component={Link} to="/profile">
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" onClick={handleSignOut}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="Guest menu">
                  <Avatar color="sapphire" radius="xl" />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to="/login">
                  Sign in
                </Menu.Item>
                <Menu.Item component={Link} to="/register">
                  Register
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="dark.6" className={classes.navbar}>
        <Stack h="100%" gap="md">
          <ScrollArea style={{ flex: 1 }} type="auto">
            <div className={classes.navList}>
              {universes.map((u) => {
                // Universe row only highlights when on the universe's own page
                // (precons-page); on a deck-detail page the precon owns the
                // active state and the universe row stays neutral.
                const universeActive = universeId === u.id && !preconId;
                return (
                  <div key={u.id} className={classes.universeGroup}>
                    <Link
                      to={`/universes/${u.id}`}
                      className={cx(
                        classes.navItem,
                        classes.universe,
                        universeActive && classes.active
                      )}
                      onClick={closeNav}
                    >
                      {/* `sets` is ordered by printing preference — commander
                          decks first — so index 0 is the Commander set, whose
                          symbol is the one we want beside a universe of decks. */}
                      <SetIcon code={u.sets[0]} />
                      <span className={classes.label}>{u.name}</span>
                    </Link>
                    {u.precons.map((p) => {
                      const preconActive = preconId === p.id;
                      return (
                        <Link
                          key={p.id}
                          to={`/universes/${u.id}/precons/${p.id}`}
                          className={cx(
                            classes.navItem,
                            classes.precon,
                            preconActive && classes.active
                          )}
                          onClick={closeNav}
                        >
                          <SetIcon />
                          <span className={classes.label}>{p.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          {imageUrl && (
            <Image src={imageUrl} radius="md" fit="contain" alt="Card preview" />
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
