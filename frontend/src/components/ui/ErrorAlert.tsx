import React from 'react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="bg-palette-mist border-l-4 border-palette-fern p-4 rounded-r-md my-4">
      <div className="flex items-center">
        <div className="ml-3 text-sm text-palette-pine font-medium">
          {message}
        </div>
      </div>
    </div>
  );
};
