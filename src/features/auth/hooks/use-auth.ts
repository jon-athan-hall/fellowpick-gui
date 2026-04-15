import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './auth-state';

// Returns the current auth context, throwing if used outside an AuthProvider.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
