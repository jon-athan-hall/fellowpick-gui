import {
  AppShell,
  Avatar,
  Burger,
  Group,
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
import classes from './app-layout.module.css';
import { UniverseDrawerNav } from './universe-drawer-nav';
import { UniverseNav } from './universe-nav';

// Renders the application shell: header, the two universe navigations, and the
// routed content.
//
// The two navs are separate components, not one responsive one. On desktop
// `UniverseNav` is a two-tier bar under the header; on mobile the burger opens
// `UniverseDrawerNav`, a vertical list in the AppShell navbar. The navbar is
// collapsed outright on desktop, so only one of the two is ever mounted.
export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const { user, isAuthenticated, clearSession } = useAuth();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();

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
      navbar={{ width: 291, breakpoint: 'sm', collapsed: { mobile: !navOpened, desktop: true } }}
      padding="md"
      withBorder={false}
    >
      <AppShell.Header bg="dark.6" className={classes.header}>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap" align="center">
          <Group gap="md" wrap="nowrap" align="center">
            <Burger
              opened={navOpened}
              onClick={toggleNav}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
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

      {/* Mounted only while the drawer is actually open. AppShell keeps a
          collapsed navbar in the DOM, which would put a second copy of every
          universe and deck link into the accessibility tree behind the desktop
          bar. */}
      <AppShell.Navbar p="md" bg="dark.6" className={classes.navbar}>
        {navOpened && (
          <ScrollArea h="100%" type="auto">
            <UniverseDrawerNav universeId={universeId} preconId={preconId} onNavigate={closeNav} />
          </ScrollArea>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <UniverseNav universeId={universeId} preconId={preconId} />
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
