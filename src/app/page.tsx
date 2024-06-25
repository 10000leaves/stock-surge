'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useStockGame } from '@/hooks/useStockGame';
import { StockCard } from '@/components/StockCard';
import { NewsSection } from '@/components/NewsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { StockChart } from '@/components/StockChart';
import { GameTimer } from '@/components/GameTimer';
import { TradeHistory } from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/utils/csvExport';
import { Stock } from '@/types/types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    setPortfolioAndCash,
    resetGame
  } = useStockGame();

  const [portfolioHistory, setPortfolioHistory] = useState<{ date: Date; totalValue: number }[]>([]);

  useEffect(() => {
    const totalValue = calculateTotalValue();
    setPortfolioHistory(prev => [...prev, { date: new Date(), totalValue }]);
  }, [cash, portfolio, stocks]);

  const calculateTotalValue = () => {
    return roundToTwoDecimal(cash + Object.entries(portfolio).reduce((sum, [company, amount]) => {
      const stock = stocks.find(s => s.name === company);
      return sum + (stock ? stock.price * amount : 0);
    }, 0));
  };

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
    toast.success('取引履歴をエクスポートしました');
  };

  const exportStockHistory = (stocks: Stock[]) => {
    const data = [
      ['Time', ...stocks.map(stock => stock.name)],
      ...stocks[0].history.map((_, index) => 
        [index, ...stocks.map(stock => roundToTwoDecimal(stock.history[index]).toFixed(2))]
      )
    ];
    exportToCSV(data, 'all_stocks_history.csv');
    toast.success('株価履歴をエクスポートしました');
  };

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
    toast.success('ニュース履歴をエクスポートしました');
  };

  const exportPortfolio = () => {
    const totalValue = calculateTotalValue();

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
    toast.success('ポートフォリオをエクスポートしました');
  };

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

  return (
    <div className="min-h-screen bg-slate-500 p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h1 className="text-3xl text-white font-bold">Stock Surge 株取引ゲーム</h1>
        <div className="flex items-center space-x-4">
          <GameTimer gameTime={gameTime} />
          <Button onClick={isRunning ? pauseGame : startGame}>
            {isRunning ? '一時停止' : 'スタート'}
          </Button>
          <Button onClick={resetGame}>リセット</Button>
        </div>
      </div>
      <div className="mt-4">
        <NewsSection newsHistory={newsHistory} onExport={exportNewsHistory} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="mt-4">
          <PortfolioSection 
            cash={cash} 
            portfolio={portfolio} 
            stocks={stocks} 
            onExport={exportPortfolio}
            onImport={importPortfolio}
            portfolioHistory={portfolioHistory}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {stocks.map(stock => (
            <StockCard 
              key={stock.name} 
              stock={stock} 
              onBuy={(name, amount) => tradeStock(name, amount, true)}
              onSell={(name, amount) => tradeStock(name, amount, false)}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="mt-4">
          <StockChart 
            stocks={stocks} 
            onExport={exportStockHistory}
          />
        </div>
        <div className="mt-4">
          <TradeHistory trades={trades} onExport={exportTrades} />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;