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
    <Card className="bg-gray-800">
      <CardHeader className="flex justify-between items-center bg-gray-50">
        <CardTitle className="text-xl font-bold">ニュース履歴</CardTitle>
        <Button onClick={onExport} className="bg-blue-500 hover:bg-blue-600 text-white">
          エクスポート
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-32 lg:h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {newsHistory.slice().reverse().map((news, index) => (
            <NewsItem key={index} news={news} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface NewsItemProps {
  news: News;
}

const NewsItem: React.FC<NewsItemProps> = React.memo(({ news }) => (
  <div className="mb-2 p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200">
    <p className="text-sm text-gray-600 mb-1">{formatTime(news.time ?? 0)}</p>
    <p className="text-gray-800">
      {news.content} - <span className="font-semibold">影響: {news.company}</span>
    </p>
  </div>
));

NewsItem.displayName = 'NewsItem';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default NewsSection;