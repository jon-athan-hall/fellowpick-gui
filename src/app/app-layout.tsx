import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Collapse,
  Group,
  Image,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Title,
  UnstyledButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useLogoutMutation, useAuth } from '../features/auth';
import { useCardPreview } from '../features/pick';
import universes from '../data/universes.json';

// Renders a Scryfall set icon recolorable to match the surrounding text. The
// SVG is used as a CSS mask so its painted color comes from `currentColor`,
// which lets the icon swap between the inactive nav text color and the active
// state's contrast color without us shipping multiple icon variants.
function SetIcon({ code }: { code: string }) {
  const url = `https://svgs.scryfall.io/sets/${code.toLowerCase()}.svg`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '1.25rem',
        backgroundColor: 'currentColor',
        maskImage: `url(${url})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${url})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

// Renders the application shell with header, sidebar universe nav, and routed content.
export function AppLayout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const { user, isAuthenticated, clearSession } = useAuth();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const { universeId, preconId } = useParams<{ universeId: string; preconId: string }>();
  const { imageUrl } = useCardPreview();

  // All universes start expanded — there are few enough to fit and most users
  // probably want the whole tree at a glance. Users can collapse any one
  // manually via the chevron, and the active universe is force-opened on
  // route change so a deep link doesn't land on a closed branch.
  const [openedUniverses, setOpenedUniverses] = useState<Set<string>>(
    () => new Set(universes.map((u) => u.id))
  );

  useEffect(() => {
    if (universeId) {
      setOpenedUniverses((prev) => {
        if (prev.has(universeId)) return prev;
        const next = new Set(prev);
        next.add(universeId);
        return next;
      });
    }
  }, [universeId]);

  function toggleOpened(id: string) {
    setOpenedUniverses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
      // navbar.width = 300 visible + 16 left inset = 316; Main offsets by full width.
      header={{ height: 75 }}
      navbar={{ width: 316, breakpoint: 'sm', collapsed: { mobile: !navOpened } }}
      padding="md"
      withBorder={false}
    >
      <AppShell.Header bg="dark.6">
        <Group h="100%" p="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={navOpened} onClick={toggleNav} hiddenFrom="sm" size="sm" />
            <UnstyledButton component={Link} to="/" aria-label="Fellowpick home">
              <Title order={2} size="h1" component="div">Fellowpick</Title>
            </UnstyledButton>
          </Group>
          {isAuthenticated ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton aria-label="User menu">
                  <Avatar color="rust" radius="xl">
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
                  <Avatar color="secondary" radius="xl" />
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

      <AppShell.Navbar
        p="md"
        bg="dark.6"
        style={{
          top: 'calc(var(--app-shell-header-offset) + 16px)',
          left: 16,
          bottom: 16,
          width: 300,
          height: 'auto',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Stack h="100%" gap="md">
          <ScrollArea style={{ flex: 1 }} type="auto">
            <Stack gap={0}>
              {universes.map((u) => {
                const universeActive = universeId === u.id;
                const opened = openedUniverses.has(u.id);
                return (
                  <Stack key={u.id} gap={0}>
                    <Group gap={0} wrap="nowrap">
                      <NavLink
                        component={Link}
                        to={`/universes/${u.id}`}
                        active={universeActive}
                        label={u.name}
                        leftSection={<SetIcon code={u.sets[0]} />}
                        onClick={closeNav}
                        style={{ flex: 1 }}
                      />
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="md"
                        onClick={() => toggleOpened(u.id)}
                        aria-label={`${opened ? 'Collapse' : 'Expand'} ${u.name} decks`}
                      >
                        <span aria-hidden="true">{opened ? '▾' : '▸'}</span>
                      </ActionIcon>
                    </Group>
                    <Collapse in={opened}>
                      <Stack pl="lg" gap={0}>
                        {u.precons.map((p) => (
                          <NavLink
                            key={p.id}
                            component={Link}
                            to={`/universes/${u.id}/precons/${p.id}`}
                            active={preconId === p.id}
                            label={p.name}
                            onClick={closeNav}
                          />
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                );
              })}
            </Stack>
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
