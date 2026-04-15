import { Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireRole } from '../features/auth';
import { ForgotPasswordPage } from '../pages/forgot-password-page';
import { HomePage } from '../pages/home-page';
import { LoginPage } from '../pages/login-page';
import { NotFoundPage } from '../pages/not-found-page';
import { PreconDetailPage } from '../pages/precon-detail-page';
import { PreconsPage } from '../pages/precons-page';
import { ProfilePage } from '../pages/profile-page';
import { RegisterPage } from '../pages/register-page';
import { ResetPasswordPage } from '../pages/reset-password-page';
import { RolesPage } from '../pages/roles-page';
import { UniversesPage } from '../pages/universes-page';
import { UsersPage } from '../pages/users-page';
import { VerifyEmailPage } from '../pages/verify-email-page';
import { AppLayout } from './app-layout';

export function AppRouter() {
  return (
    <Routes>
      {/* AppLayout wraps every route — public and authenticated alike. */}
      <Route element={<AppLayout />}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Public browse routes — guests can view picks, auth required to make picks */}
        <Route path="/universes" element={<UniversesPage />} />
        <Route path="/universes/:universeId" element={<PreconsPage />} />
        <Route path="/universes/:universeId/precons/:preconId" element={<PreconDetailPage />} />

        {/* Authenticated routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin-only subtree */}
          <Route element={<RequireRole role="ROLE_ADMIN" />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/roles" element={<RolesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}