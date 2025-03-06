export const validateEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email';

export const validatePassword = (value: string) =>
  value.length >= 8 || 'Password should be at least 8 characters';

export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
