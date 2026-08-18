// Joins truthy class names with spaces; small helper to avoid awkward template
// strings sprinkled throughout JSX.
export function cx(...classNames: (string | false | undefined | null)[]): string {
  return classNames.filter(Boolean).join(' ');
}
