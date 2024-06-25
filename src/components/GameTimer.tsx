import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface GameTimerProps {
  gameTime: number;
}

export const GameTimer: React.FC<GameTimerProps> = ({ gameTime }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white mx-2 px-2 py-1 rounded-lg">
      <p className="text-2xl font-bold whitespace-nowrap">{`経過時間：${formatTime(gameTime)}`}</p>
    </div>
  );
};
