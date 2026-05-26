import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-lg border border-palette-lichen/45 bg-palette-mist text-palette-pine shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
};
