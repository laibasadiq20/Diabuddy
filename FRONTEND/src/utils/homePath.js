/** Post-login / default home path by role */
export function homePathFor(user) {
  if (user?.role === 'admin') return '/admin';
  return '/dashboard';
}
