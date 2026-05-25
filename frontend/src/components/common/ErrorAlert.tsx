import React from 'react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md my-4">
      <div className="flex items-center">
        <div className="ml-3 text-sm text-red-700 font-medium">
          {message}
        </div>
      </div>
    </div>
  );
};
