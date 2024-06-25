import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Stock } from '@/types/types';

interface PortfolioSectionProps {
  cash: number;
  portfolio: Record<string, number>;
  stocks: Stock[];
  onExport: () => void;
  onImport: () => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ 
  cash, 
  portfolio, 
  stocks, 
  onExport, 
  onImport 
}) => {
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
        fontSize="16"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle className="mb-2 sm:mb-0">ポートフォリオ</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onImport}>インポート</Button>
          <Button onClick={onExport}>エクスポート</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <p className="font-bold">総資産: ${totalValue.toFixed(2)}</p>
          <p>現金: ${roundToTwoDecimal(cash).toFixed(2)}</p>
          <ul className="mt-2">
            {Object.entries(portfolio).map(([company, amount]) => {
              const stock = stocks.find(s => s.name === company);
              const value = stock ? roundToTwoDecimal(stock.price * amount) : 0;
              return (
                <li key={company} className="flex justify-between">
                  <span>{company}: {amount}株</span>
                  <span>${value.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-2">
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
      </CardContent>
    </Card>
  );
};