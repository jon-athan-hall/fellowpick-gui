import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';

import { AuthAction, AuthFormValues } from './auth-types';

interface AuthFormProps {
  initialAction: AuthAction;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialAction = AuthAction.Register }) => {
  const form = useForm<AuthFormValues>({
    initialValues: {
      email: '',
      password: ''
    },
    validate: {
      email: (value: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => (value.length >= 8 ? null : 'Password should be at least 8 characters')
    }
  });

  /**
   * Initialize the toggle options. Make sure the first option is set to the initialAction prop.
   * Mantine uses the first option in the array as the initial value.
   */
  const [action, toggleAction] = useToggle([
    initialAction,
    ...Object.values(AuthAction).filter(action => (typeof action === 'string'))
  ] as const);

  return (
    <Paper p="md" w="50%">
      <Title order={2}>{upperFirst(action)}</Title>

      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Stack>
          <TextInput
            key={form.key('email')}
            label="Email"
            placeholder="whatever@email.com"
            value={form.values.email}
            withAsterisk={true}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            key={form.key('password')}
            label="Password"
            placeholder="whatever"
            value={form.values.password}
            withAsterisk={true}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between">
            <Button type="submit">
              {upperFirst(action)}
            </Button>
            <Anchor component="button" onClick={() => toggleAction()} type="button">
              {action === AuthAction.Register ? 'Already registered? Login' : 'No account yet? Register'}
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default AuthForm;
