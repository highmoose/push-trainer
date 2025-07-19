import React from "react";
import { Loader2 } from "lucide-react";

const DataLoadingScreen = ({
  progress = 0,
  status = "Loading Data...",
  error = null,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        {/* Logo/Brand Area */}
        <div className="mb-8">
          <h1 className="text-3xl font-thin text-white mb-2">Push</h1>
          <p className="text-zinc-400 text-sm">Preparing your workspace</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
            {/* Progress ring background */}
            <div className="absolute inset-0 w-8 h-8">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 32 32"
              >
                {/* Background circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="rgb(63 63 70)" // zinc-700
                  strokeWidth="2"
                />
                {/* Progress circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="rgb(132 204 22)" // lime-500
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 12}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 12 * (1 - progress / 100)
                  }`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-white">Loading Data</h2>
          <p className="text-zinc-400 text-sm">{status}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Initializing workspace</span>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-zinc-500 text-xs mt-2">Retrying connection...</p>
          </div>
        )}

        {/* Tips or messages */}
        <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-zinc-400 text-xs">
            💡 We're loading all your data upfront for lightning-fast
            performance
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataLoadingScreen;
