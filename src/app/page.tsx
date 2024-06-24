'use client';

import React,{ useRef } from 'react';
import { useStockGame } from '@/hooks/useStockGame';
import { StockCard } from '@/components/StockCard';
import { NewsSection } from '@/components/NewsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { StockChart } from '@/components/StockChart';
import { GameTimer } from '@/components/GameTimer';
import { TradeHistory } from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/utils/csvExport';

function App() {
  const { 
    stocks, 
    cash, 
    portfolio, 
    newsHistory, 
    trades, 
    tradeStock, 
    isRunning, 
    startGame, 
    pauseGame, 
    gameTime,
    setPortfolioAndCash 
  } = useStockGame();

  const roundToTwoDecimal = (num: number) => Math.round(num * 100) / 100;

  const exportTrades = () => {
    const data = [
      ['Date', 'Company', 'Amount', 'Price', 'Type'],
      ...trades.map(trade => [
        trade.date.toISOString(),
        trade.company,
        trade.amount,
        roundToTwoDecimal(trade.price).toFixed(2),
        trade.type
      ])
    ];
    exportToCSV(data, 'trades.csv');
  };

  const exportStockHistory = (stock: { name: string; history: number[] }) => {
    const data = [
      ['Time', 'Price'],
      ...stock.history.map((price, index) => [index, roundToTwoDecimal(price).toFixed(2)])
    ];
    exportToCSV(data, `${stock.name}_history.csv`);
  };

  // 新しい関数: ニュース履歴のエクスポート
  const exportNewsHistory = () => {
    const data = [
      ['Time', 'Content', 'Affected Company'],
      ...newsHistory.map(news => [
        formatTime(news.time ? news.time : 0),
        news.content,
        news.company
      ])
    ];
    exportToCSV(data, 'news_history.csv');
  };

  // 新しい関数: ポートフォリオのエクスポート
  const exportPortfolio = () => {
    const totalValue = roundToTwoDecimal(cash + Object.entries(portfolio).reduce((sum, [company, amount]) => {
      const stock = stocks.find(s => s.name === company);
      return sum + (stock ? stock.price * amount : 0);
    }, 0));

    const data = [
      ['Asset', 'Amount', 'Value'],
      ['Cash', '-', roundToTwoDecimal(cash).toFixed(2)],
      ...Object.entries(portfolio).map(([company, amount]) => {
        const stock = stocks.find(s => s.name === company);
        const value = stock ? roundToTwoDecimal(stock.price * amount) : 0;
        return [company, amount.toString(), value.toFixed(2)];
      }),
      ['Total', '-', totalValue.toFixed(2)]
    ];
    exportToCSV(data, 'portfolio.csv');
  };

  // formatTime 関数の定義（既に定義されている場合は不要）
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importPortfolio = () => {
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
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content);
            if (typeof data.cash === 'number' && !isNaN(data.cash) && typeof data.portfolio === 'object') {
              setPortfolioAndCash(data.portfolio, data.cash);
            } else {
              throw new Error('Invalid JSON format');
            }
          } else if (file.name.endsWith('.csv')) {
            const lines = content.split('\n');
            const header = lines[0].split(',');
            const cashIndex = header.indexOf('Value');
            const data = lines.slice(1).reduce((acc: { portfolio: Record<string, number>, cash: number }, line) => {
              const values = line.split(',');
              if (values[0] !== 'Cash' && values[0] !== 'Total') {
                const amount = parseInt(values[1]);
                if (!isNaN(amount)) {
                  acc.portfolio[values[0]] = amount;
                }
              } else if (values[0] === 'Cash') {
                acc.cash = parseFloat(values[cashIndex]);
              }
              return acc;
            }, { portfolio: {}, cash: 0 });
            setPortfolioAndCash(data.portfolio, data.cash);
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('ファイルの解析に失敗しました。');
        }
      };
      if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        alert('JSONまたはCSVファイルをアップロードしてください。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-white font-bold">Stock Surge 株取引ゲーム</h1>
        <div className="flex items-center">
          <GameTimer gameTime={gameTime} />
          <Button onClick={isRunning? pauseGame : startGame }>
            {isRunning ? '一時停止' : 'スタート'}
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".json,.csv"
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <NewsSection newsHistory={newsHistory} onExport={exportNewsHistory} />
        <PortfolioSection 
          cash={cash} 
          portfolio={portfolio} 
          stocks={stocks} 
          onExport={exportPortfolio}
          onImport={importPortfolio} 
        />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map(stock => (
          <StockCard 
            key={stock.name} 
            stock={stock} 
            onBuy={(name, amount) => tradeStock(name, amount, true)}
            onSell={(name, amount) => tradeStock(name, amount, false)}
          />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map(stock => (
          <StockChart 
            key={stock.name} 
            stock={stock} 
            onExport={exportStockHistory}
          />
        ))}
      </div>
      <div className="mt-8">
        <TradeHistory trades={trades} onExport={exportTrades} />
      </div>
    </div>
  );
}

export default App;