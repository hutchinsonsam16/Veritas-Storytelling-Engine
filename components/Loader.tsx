
import React from 'react';
import { SparklesIcon } from './Icons';

export const Loader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <SparklesIcon className="w-12 h-12 text-cyan-400 animate-pulse" />
      <p className="mt-4 text-lg text-cyan-300 font-semibold">{text}</p>
      <p className="text-sm text-gray-400">The Director is consulting the agents...</p>
    </div>
  );
};
