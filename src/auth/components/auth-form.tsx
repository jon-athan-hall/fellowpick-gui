// Import third party libraries.
import {
  Alert,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

// Import local stuff.
import { postLogin, postRegister } from '../auth-api.ts';
import { AuthAction, AuthFormValues, AuthRequest } from '../auth-types';
import { capitalize, validateEmail, validatePassword } from '../auth-utils';


const AuthForm: React.FC = () => {
  const location = useLocation();

  // Keep track of which authentication action will be used. Initialize according to the route.
  const [action, setAction] = useState<AuthAction>(() =>
    location.pathname === '/login' ? AuthAction.Login : AuthAction.Register
  )

  // Keep track of a successful registration to show the alert.
  const [isNowRegistered, setIsNowRegistered] = useState<boolean>(false);

  // Set up form.
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<AuthFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Set up the mutation to login. Store the token in the response. 
  const loginMutation = useMutation({
    mutationFn: (auth: AuthRequest) => postLogin(auth),
    onSuccess: () => {
      setIsNowRegistered(false);
    }
  });

  // Set up mutation to register. Switch over to login on success, and show the alert.
  const registerMutation = useMutation({
    mutationFn: (auth: AuthRequest) => postRegister(auth),
    onSuccess: () => {
      setAction(AuthAction.Login);
      setIsNowRegistered(true);
    }
  });

  // Update the action if the navigation is clicked while this form is on the screen.
  useEffect(() => {
    setAction(location.pathname === '/login' ? AuthAction.Login : AuthAction.Register);
  }, [location]);

  // Switch between the register and login actions.
  const toggleAction = () => {
    setAction((prevAction) =>
      prevAction === AuthAction.Login ? AuthAction.Register : AuthAction.Login
    );
  };

  // Decide which mutation to call after clicking submit.
  const onSubmit: SubmitHandler<AuthFormValues> = (values) => {
    if (action === AuthAction.Login) {
      loginMutation.mutate(values);
    } else {
      registerMutation.mutate(values);
    }
  };

  return (
    <Paper>
      <Stack>
        {isNowRegistered && (
          <Alert severity="success">
            You have successfully registered. Please login to make your fellowpicks.
          </Alert>
        )}
        <Typography variant="h2">{capitalize(action)}</Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextField
            error={!!errors.email}
            fullWidth={true}
            helperText={errors.email?.message}
            label="Email"
            placeholder="whatever@email.com"
            required={true}
            {...register('email', {
              required: 'Email is required',
              validate: validateEmail
            })}
          />

          <TextField
            error={!!errors.password}
            fullWidth={true}
            helperText={errors.password?.message}
            label="Password"
            placeholder="••••••••"
            required={true}
            {...register('password', {
              required: 'Password is required',
              validate: validatePassword
            })}
          />

          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Button type="submit">
              {capitalize(action)}
            </Button>
            <Link
              component="button"
              variant="body2"
              onClick={toggleAction}
            >
              {action === AuthAction.Register
                ? 'Already registered? Login'
                : 'No account yet? Register'}
            </Link>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

export default AuthForm;
