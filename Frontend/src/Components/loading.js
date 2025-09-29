import React from 'react';

const BouncingDots = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center space-x-2">
        {/* We replace 'animate-pulse' with our new 'animate-bounce-slow' */}
        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce-slow"></div>
        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce-slow [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce-slow [animation-delay:-0.3s]"></div>
      </div>
       <p className="text-slate-600">Please wait</p>
    </div>
  );
};

export default BouncingDots;