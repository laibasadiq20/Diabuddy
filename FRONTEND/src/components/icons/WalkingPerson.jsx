import React from 'react';

/** Clean mid-stride walking stick figure (matches classic outline Lucide style). */
export default function WalkingPerson({ size = 24, strokeWidth = 2, className, style, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
      {...rest}
    >
      {/* Head */}
      <circle cx="12" cy="4" r="2" />
      {/* Torso */}
      <path d="M12 6v6" />
      {/* Rear arm */}
      <path d="M12 8l-3.5 1.5" />
      {/* Front arm */}
      <path d="M12 8l4 3.5" />
      {/* Rear leg */}
      <path d="M12 12l-3.5 8.5" />
      {/* Front leg */}
      <path d="M12 12l2.5 4.5l-2.5 4" />
    </svg>
  );
}
