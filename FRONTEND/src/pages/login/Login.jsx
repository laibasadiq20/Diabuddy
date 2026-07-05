import React from 'react';
import AuthFlipCard from './AuthFlipCard';

/**
 * /login route. Renders the shared flip card starting on the Login face.
 * Switching to Register happens via an in-card 3D flip (see AuthFlipCard),
 * not a route change — this wrapper only exists so /login is a real,
 * linkable, refreshable URL.
 */
export default function Login() {
  return <AuthFlipCard startFlipped={false} />;
}