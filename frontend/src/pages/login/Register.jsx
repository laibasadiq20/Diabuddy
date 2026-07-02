import React from 'react';
import AuthFlipCard from './AuthFlipCard';

/**
 * /register route. Renders the shared flip card starting already on the
 * Register face (no animation plays on initial load — only on in-card
 * switches), so a direct link or page refresh on /register still shows
 * the right form immediately.
 */
export default function Register() {
  return <AuthFlipCard startFlipped={true} />;
}