import React from 'react';

const ParentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-palette-pine">Parent Dashboard</h2>
      <p className="text-palette-moss">Welcome to the parent portal. Here you can view your children's progress and grades.</p>
    </div>
  );
};

export default ParentDashboard;
