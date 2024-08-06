import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { upperFirst } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';

import { AuthAction, AuthFormValues, AuthRequest } from './auth-types';
import { postLogin, postRegister } from './auth-api';

const AuthForm: React.FC = () => {
  // Set up form.
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

  // Use the current route to determine which action is being used.
  const location = useLocation();

  // Set up the mutation to login.
  const loginMutation = useMutation({
    mutationFn: (auth: AuthRequest) => postLogin(auth)
  });

  // Set up mutation to register.
  const registerMutation = useMutation({
    mutationFn: (auth: AuthRequest) => postRegister(auth)
  });

  // Keep track of which authentication action will be used. Initialize according to the route.
  const [action, setAction] = useState<AuthAction>(() => 
    location.pathname === '/login' ? AuthAction.Login : AuthAction.Register
  );

  // Update the action if the navigation is clicked while this form is on the screen.
  useEffect(() => {
    setAction(location.pathname === '/login' ? AuthAction.Login : AuthAction.Register);
  }, [location]);

  // Switch between the register and login actions.
  const toggleAction = () => {
    setAction((prevAction) => prevAction === AuthAction.Login ? AuthAction.Register : AuthAction.Login);
  };

  // Decide which mutation to call after clicking submit.
  const handleSubmit = (values: AuthFormValues) => {
    console.log(values);
    console.log(action);
    if (action === AuthAction.Login) {
      loginMutation.mutate(values);
    } else {
      registerMutation.mutate(values);
    }
  };

  return (
    <Paper p="md" w="50%">
      <Title order={2}>{upperFirst(action)}</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
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
            <Anchor component="button" onClick={toggleAction} size="sm" type="button">
              {action === AuthAction.Register ? 'Already registered? Login' : 'No account yet? Register'}
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default AuthForm;
