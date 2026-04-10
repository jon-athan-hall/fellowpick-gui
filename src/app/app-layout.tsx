import {
  AppShell,
  Burger,
  Button,
  Divider,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  Title,
  UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../features/auth';
import { useAuth } from '../features/auth/hooks/use-auth';

export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const { user, isAuthenticated, clearSession } = useAuth();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  function handleSignOut() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearSession();
        navigate('/login');
      }
    });
  }

  function isActive(path: string): boolean {
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  }

  function navTo(path: string) {
    closeNav();
    navigate(path);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      // Navbar config is omitted entirely when not signed in so the shell
      // doesn't reserve a column or render the burger toggle.
      navbar={
        isAuthenticated
          ? { width: 240, breakpoint: 'sm', collapsed: { mobile: !navOpened } }
          : undefined
      }
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            {isAuthenticated && (
              <Burger opened={navOpened} onClick={toggleNav} hiddenFrom="sm" size="sm" />
            )}
            <UnstyledButton component={Link} to="/" aria-label="Trailhead home">
              <Title order={4}>Trailhead</Title>
            </UnstyledButton>
          </Group>
          {isAuthenticated ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="User menu">
                  <Text size="sm" fw={500}>
                    {user?.name ?? 'Account'}
                  </Text>
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
            <Group gap="sm">
              <Button component={Link} to="/login" variant="subtle" size="sm">
                Sign in
              </Button>
              <Button component={Link} to="/register" size="sm">
                Register
              </Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {isAuthenticated && (
        <AppShell.Navbar p="md">
          <Stack gap="xs">
            <NavLink label="Home" active={isActive('/')} onClick={() => navTo('/')} />
            <NavLink
              label="Profile"
              active={isActive('/profile')}
              onClick={() => navTo('/profile')}
            />
            {isAdmin && (
              <>
                <Divider label="Admin" labelPosition="center" my="sm" />
                <NavLink
                  label="Users"
                  active={isActive('/admin/users')}
                  onClick={() => navTo('/admin/users')}
                />
                <NavLink
                  label="Roles"
                  active={isActive('/admin/roles')}
                  onClick={() => navTo('/admin/roles')}
                />
              </>
            )}
          </Stack>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}