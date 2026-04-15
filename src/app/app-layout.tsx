import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Image,
  Menu,
  Select,
  Title,
  UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useLogoutMutation, useAuth } from '../features/auth';
import { useCardPreview } from '../features/picks/hooks/use-card-preview';
import universes from '../data/universes.json';

// Renders the application shell with header, sidebar universe selector, and routed content.
export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const { user, isAuthenticated, clearSession } = useAuth();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();

  const { imageUrl } = useCardPreview();
  const selectedUniverse = universeId ?? null;
  const universeOptions = universes.map((u) => ({ value: u.id, label: u.name }));
  const selectedUniverseData = universes.find((u) => u.id === selectedUniverse);
  const preconOptions = selectedUniverseData
    ? selectedUniverseData.precons.map((p) => ({ value: p.id, label: p.name }))
    : [];

  function handleSignOut() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearSession();
        navigate('/login');
      }
    });
  }

  function handleUniverseChange(value: string | null) {
    if (value) {
      navigate(`/universes/${value}`);
    } else {
      navigate('/');
    }
  }

  function handlePreconChange(value: string | null) {
    closeNav();
    if (selectedUniverse && value) {
      navigate(`/universes/${selectedUniverse}/precons/${value}`);
    }
  }

  return (
    <AppShell
      header={{ height: 75 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" p="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={navOpened} onClick={toggleNav} hiddenFrom="sm" size="sm" />
            <UnstyledButton component={Link} to="/" aria-label="Fellowpick home">
              <Title order={1}>Fellowpick</Title>
            </UnstyledButton>
          </Group>
          {isAuthenticated ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="User menu">
                  <Avatar color="yellow" radius="xl">
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
                  <Avatar color="gray" radius="xl" />
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

      <AppShell.Navbar p="md">
        <Select
          label="Universe"
          placeholder="Choose a universe"
          data={universeOptions}
          value={selectedUniverse}
          onChange={handleUniverseChange}
          mb="md"
        />
        <Select
          label="Precon"
          placeholder="Choose a precon"
          data={preconOptions}
          value={preconId ?? null}
          disabled={!selectedUniverse}
          onChange={handlePreconChange}
        />
        {imageUrl && (
          <Image src={imageUrl} radius="md" fit="contain" alt="Card preview" mt="md" />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}