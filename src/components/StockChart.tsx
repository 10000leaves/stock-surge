'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stock } from '@/types/types';

interface StockChartProps {
  stocks: Stock[];
  onExport: (stocks: Stock[]) => void;
}

export const StockChart: React.FC<StockChartProps> = ({ stocks, onExport }) => {
  const data = stocks[0].history.map((_, index) => {
    const entry: { [key: string]: number } = { time: index };
    stocks.forEach(stock => {
      entry[stock.name] = stock.history[index];
    });
    return entry;
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];

  return (
    <Card className="bg-gray-800">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>全銘柄の株価推移</CardTitle>
        <Button onClick={() => onExport(stocks)}>
          エクスポート
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            {stocks.map((stock, index) => (
              <Line
                key={stock.name}
                type="monotone"
                dataKey={stock.name}
                stroke={colors[index % colors.length]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};