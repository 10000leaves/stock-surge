'use client';

import React from 'react';
import { useStockGame } from '@/hooks/useStockGame';
import { StockCard } from '@/components/StockCard';
import { NewsSection } from '@/components/NewsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { StockChart } from '@/components/StockChart';
import { GameTimer } from '@/components/GameTimer';
import { TradeHistory } from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { ToastContainer } from 'react-toastify';
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
    resetGame,
    portfolioHistory,
    exportTrades,
    exportStockHistory,
    exportNewsHistory,
    exportPortfolio,
    setPortfolioAndCash
  } = useStockGame();

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
            onImport={setPortfolioAndCash}
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