import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors";
  const variants = {
    primary: "bg-palette-leaf text-palette-mist hover:bg-palette-pine focus:ring-palette-meadow",
    secondary: "bg-palette-mist text-palette-pine hover:bg-palette-lichen/35 focus:ring-palette-sage",
    outline: "border border-palette-lichen bg-transparent text-palette-pine hover:bg-palette-lichen/25 focus:ring-palette-sage",
    danger: "bg-palette-pine text-palette-mist hover:bg-palette-fern focus:ring-palette-moss"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
