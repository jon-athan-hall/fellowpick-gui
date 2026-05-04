import type { RouteObject } from 'react-router-dom';
import { ForgotPasswordPage } from '../../pages/forgot-password-page';
import { LoginPage } from '../../pages/login-page';
import { RegisterPage } from '../../pages/register-page';
import { ResetPasswordPage } from '../../pages/reset-password-page';
import { VerifyEmailPage } from '../../pages/verify-email-page';

export const authPublicRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
];
