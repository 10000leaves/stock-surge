import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { News } from '@/types/types';

interface NewsSectionProps {
  newsHistory: News[];
  onExport: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ newsHistory, onExport }) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>ニュース履歴</CardTitle>
        <Button onClick={onExport}>エクスポート</Button>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-96 overflow-y-auto">
          {newsHistory.slice().reverse().map((news, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">{formatTime(news.time ? news.time : 0)}</p>
              <p>{news.content} - 影響: {news.company}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
