import React from 'react';

/** Clean mid-stride walking stick figure (matches classic walk mark). */
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
      <circle cx="13.5" cy="4.5" r="2.4" fill="currentColor" stroke="none" />
      {/* torso */}
      <path d="M12.8 7.2 11 13" />
      {/* rear arm (back) */}
      <path d="M12.2 9 8 8.2" />
      {/* front arm */}
      <path d="M12.2 9 15.8 11.2" />
      {/* rear leg */}
      <path d="M11 13 7.2 21" />
      {/* front leg bent at knee */}
      <path d="M11 13 13.6 17.2 17.5 20.5" />
    </svg>
  );
}
