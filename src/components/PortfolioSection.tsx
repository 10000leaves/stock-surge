import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Stock } from '@/types/types';
import { toast } from 'react-toastify';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PortfolioSectionProps {
  cash: number;
  portfolio: Record<string, number>;
  stocks: Stock[];
  onExport: () => void;
  onImport: (portfolio: Record<string, number>, cash: number) => void;
  portfolioHistory: { date: Date; totalValue: number }[];
}

const DraggableAsset: React.FC<{ name: string; value: number; onDrop: (from: string, to: string) => void }> = ({ name, value, onDrop }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'asset',
    item: { name },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'asset',
    drop: (item: { name: string }, monitor: DropTargetMonitor) => onDrop(item.name, name),
  }));

  drag(drop(ref));

  return (
    <div ref={ref} className="opacity-100 hover:opacity-80 cursor-move p-2 m-1 border border-gray-300 rounded-md transition-opacity duration-200">
      {name}: ${value.toFixed(2)}
    </div>
  );
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ 
  cash, 
  portfolio, 
  stocks, 
  onExport, 
  onImport,
  portfolioHistory
}) => {
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const roundToTwoDecimal = (num: number) => Math.round(num * 100) / 100;

  const totalValue = roundToTwoDecimal(cash + Object.entries(portfolio).reduce((sum, [company, amount]) => {
    const stock = stocks.find(s => s.name === company);
    return sum + (stock ? stock.price * amount : 0);
  }, 0));

  const pieData = [
    { name: '現金', value: roundToTwoDecimal(cash) },
    ...Object.entries(portfolio).map(([company, amount]) => {
      const stock = stocks.find(s => s.name === company);
      return { name: company, value: roundToTwoDecimal(stock ? stock.price * amount : 0) };
    }),
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const calculateDiversityScore = () => {
    const totalAssets = pieData.reduce((sum, asset) => sum + asset.value, 0);
    const proportions = pieData.map(asset => asset.value / totalAssets);
    return 1 - Math.sqrt(proportions.reduce((sum, p) => sum + p * p, 0));
  };

  const calculatePerformance = () => {
    if (portfolioHistory.length < 2) return { totalProfit: 0, profitRate: 0 };
    const initialValue = portfolioHistory[0].totalValue;
    const currentValue = portfolioHistory[portfolioHistory.length - 1].totalValue;
    const totalProfit = currentValue - initialValue;
    const profitRate = (totalProfit / initialValue) * 100;
    return { totalProfit, profitRate };
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          if (fileType === 'json') {
            const data = JSON.parse(content);
            if (typeof data.cash === 'number' && typeof data.portfolio === 'object') {
              onImport(data.portfolio, data.cash);
              toast.success('ポートフォリオを正常にインポートしました');
            } else {
              throw new Error('Invalid JSON format');
            }
          } else if (fileType === 'csv') {
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            const cashIndex = headers.indexOf('Cash');
            if (cashIndex === -1) throw new Error('Cash column not found');
            
            const data = lines[1].split(',');
            const newCash = parseFloat(data[cashIndex]);
            
            const newPortfolio: Record<string, number> = {};
            headers.forEach((header, index) => {
              if (index !== cashIndex && header.trim() !== '') {
                const amount = parseFloat(data[index]);
                if (!isNaN(amount)) {
                  newPortfolio[header] = amount;
                }
              }
            });
            
            onImport(newPortfolio, newCash);
            toast.success('ポートフォリオを正常にインポートしました');
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          toast.error('ファイルの解析に失敗しました。');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (from: string, to: string) => {
    console.log(`Move from ${from} to ${to}`);
    // 実際の再配分ロジックはここに追加する必要があります
  };

  const { totalProfit, profitRate } = calculatePerformance();

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="bg-gray-800">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
          <CardTitle className="mb-2 sm:mb-0">ポートフォリオ</CardTitle>
          <div className="flex flex-wrap gap-2">
            <select value={fileType} onChange={(e) => setFileType(e.target.value as 'csv' | 'json')} className="p-2 border rounded">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <Button onClick={handleImport}>インポート</Button>
            <Button onClick={onExport}>エクスポート</Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept={fileType === 'json' ? '.json' : '.csv'}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-xl">総資産: ${totalValue.toFixed(2)}</p>
              <p>現金: ${roundToTwoDecimal(cash).toFixed(2)}</p>
              <p>多様性スコア: {calculateDiversityScore().toFixed(2)}</p>
              <p>総利益: ${totalProfit.toFixed(2)} ({profitRate.toFixed(2)}%)</p>
              <Button className="mt-2" onClick={() => setIsDialogOpen(true)}>詳細を表示</Button>
              <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>資産内訳</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {pieData.map((asset) => (
                      <DraggableAsset key={asset.name} name={asset.name} value={asset.value} onDrop={handleDrop} />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${roundToTwoDecimal(value as number).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">ポートフォリオ推移:</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalValue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
};