import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Stock } from '@/types/types';

interface StockCardProps {
  stock: Stock;
  onBuy: (name: string, amount: number) => void;
  onSell: (name: string, amount: number) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onBuy, onSell }) => {
  const [tradeAmount, setTradeAmount] = useState<string>("10");

  const priceChange = stock.history[stock.history.length - 1] - stock.history[stock.history.length - 2];
  const priceChangePercent = (priceChange / stock.history[stock.history.length - 2]) * 100;
  const isHighChange = Math.abs(priceChangePercent) >= 8;

  const roundToTwoDecimal = (num: number) => Math.round(num * 100) / 100;

  return (
    <Card className={`${isHighChange ? 'border-2 border-yellow-400' : ''}`}>
      <CardHeader>
        <CardTitle>{stock.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">${roundToTwoDecimal(stock.price).toFixed(2)}</p>
        <p className={`flex items-center ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {priceChange >= 0 ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
          {roundToTwoDecimal(Math.abs(priceChange)).toFixed(2)} ({roundToTwoDecimal(Math.abs(priceChangePercent)).toFixed(2)}%)
        </p>
        <div className="my-4">
          <p  className="mb-2">売買単位（株）</p>
          <Select value={tradeAmount} onValueChange={setTradeAmount}>
            <option value="1">1</option>
            <option value="10">10</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
          </Select>
        </div>
        <div className="mt-4 flex justify-between">
          <Button onClick={() => onBuy(stock.name, parseInt(tradeAmount))}>買う</Button>
          <Button onClick={() => onSell(stock.name, parseInt(tradeAmount))} variant="outline">売る</Button>
        </div>
      </CardContent>
    </Card>
  );
};