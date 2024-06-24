'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stock } from '@/types/types';

interface StockChartProps {
  stock: Stock;
  onExport: (stock: Stock) => void;
}

export const StockChart: React.FC<StockChartProps> = ({ stock, onExport }) => {
  const data = stock.history.map((price, index) => ({ time: index, price }));

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{stock.name}の株価推移</CardTitle>
        <Button onClick={() => onExport(stock)}>
          エクスポート
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};