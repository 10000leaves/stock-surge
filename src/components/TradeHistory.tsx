import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trade } from '@/types/types';

interface TradeHistoryProps {
  trades: Trade[];
  onExport: () => void;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, onExport }) => {
  return (
    <Card className="bg-gray-800">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>取引履歴</CardTitle>
        <Button onClick={onExport}>エクスポート</Button>
      </CardHeader>
      <CardContent>
        <div className="h-64 lg:h-96 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">日時</th>
                <th className="px-4 py-2 text-left">企業</th>
                <th className="px-4 py-2 text-right">数量</th>
                <th className="px-4 py-2 text-right">価格</th>
                <th className="px-4 py-2 text-center">取引</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice().reverse().map((trade, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-4 py-2">{trade.date.toLocaleString()}</td>
                  <td className="px-4 py-2">{trade.company}</td>
                  <td className="px-4 py-2 text-right">{trade.amount}</td>
                  <td className="px-4 py-2 text-right">${trade.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-white ${trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {trade.type === 'buy' ? '買' : '売'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};