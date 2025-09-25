import React, { useState, useEffect, useRef } from 'react';
import DashboardWidget from './DashboardWidget';

type TimerMode = 'focus' | 'break' | 'stopwatch';

export default function FocusTimerWidget() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [time, setTime] = useState(25 * 60); // Default 25 minutes for focus
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = {
    focus: 25 * 60, // 25 minutes
    break: 5 * 60,  // 5 minutes
    stopwatch: 0    // Start from 0
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'stopwatch') {
            return prevTime + 1;
          } else {
            if (prevTime <= 1) {
              setIsRunning(false);
              setIsComplete(true);
              // Play notification sound (you could add this)
              return 0;
            }
            return prevTime - 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTime(presets[mode]);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsComplete(false);
    setTime(presets[newMode]);
  };

  const getProgress = () => {
    if (mode === 'stopwatch') return 0;
    const totalTime = presets[mode];
    return ((totalTime - time) / totalTime) * 100;
  };

  const getModeColor = (timerMode: TimerMode) => {
    switch (timerMode) {
      case 'focus':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      case 'break':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'stopwatch':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-100/50 dark:border-gray-700/50 p-3 md:p-4 xl:p-5 2xl:p-6 w-full h-full transition-all duration-200 hover:shadow-md hover:shadow-gray-100/25 dark:hover:shadow-black/10 hover:border-gray-200/60 dark:hover:border-gray-600/60 group flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-3 xl:mb-4 flex-shrink-0">
        <h3 className="text-xs md:text-sm xl:text-base font-medium text-gray-800 dark:text-gray-100 tracking-wide">
          Focus Timer
        </h3>
      </div>
      
      {/* Content - No scrolling, compact layout */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Mode Selection */}
        <div className="flex space-x-1 mb-2">
          {(['focus', 'break', 'stopwatch'] as TimerMode[]).map((timerMode) => (
            <button
              key={timerMode}
              onClick={() => handleModeChange(timerMode)}
              className={`px-3 py-1.5 text-[9px] md:text-[10px] font-semibold rounded-full transition-all duration-200 flex-1 ${
                mode === timerMode 
                  ? getModeColor(timerMode) + ' shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
              }`}
            >
              {timerMode.charAt(0).toUpperCase() + timerMode.slice(1)}
            </button>
          ))}
        </div>

        {/* Timer Display - Centered and flexible */}
        <div className="text-center flex-1 flex flex-col justify-center">
          {mode !== 'stopwatch' && (
            <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto mb-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={mode === 'focus' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-gray-900 dark:text-white">
                  {formatTime(time)}
                </span>
              </div>
            </div>
          )}
          
          {mode === 'stopwatch' && (
            <div className="mb-1">
              <span className="text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900 dark:text-white">
                {formatTime(time)}
              </span>
            </div>
          )}

          {isComplete && (
            <div className="mb-1 p-1 bg-green-100 dark:bg-green-900 rounded">
              <p className="text-[9px] md:text-xs text-green-800 dark:text-green-200 font-medium">
                {mode === 'focus' ? '🎉 Complete!' : '✨ Break over!'}
              </p>
            </div>
          )}
        </div>

        {/* Controls - Compact */}
        <div className="flex justify-center space-x-2 mb-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-full text-[9px] md:text-xs font-semibold hover:bg-purple-700 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8 0V9a3 3 0 013-3h2a3 3 0 013 3v5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-600 text-white rounded-full text-[9px] md:text-xs font-semibold hover:bg-yellow-700 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-full text-[9px] md:text-xs font-semibold hover:bg-gray-700 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>

        {/* Session Stats - Compact */}
        <div className="pt-1 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="grid grid-cols-2 gap-1 text-center">
            <div>
              <p className="text-[8px] md:text-[9px] text-gray-500 dark:text-gray-400">Sessions</p>
              <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">0</p>
            </div>
            <div>
              <p className="text-[8px] md:text-[9px] text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">0m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
