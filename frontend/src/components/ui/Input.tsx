import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-palette-lichen/80 bg-palette-mist px-3 py-2 text-sm text-palette-pine placeholder:text-palette-moss focus:outline-none focus:ring-2 focus:ring-palette-leaf focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};
