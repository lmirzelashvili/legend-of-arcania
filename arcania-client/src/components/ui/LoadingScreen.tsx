import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Pulsing orb */}
        <div className="w-16 h-16 rounded-full bg-purple-600 animate-pulse shadow-lg shadow-purple-500/50" />
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-400 animate-ping opacity-20" />
      </div>
      <p className="mt-6 font-pixel text-purple-300 text-xs tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default LoadingScreen;
