import { useState, useEffect, useCallback } from 'react';
import { Stock, News, Trade } from '@/types/types';
import { generateRandomNews, updateStockPrice } from '@/utils/stockUtils';

const COMPANIES = ['TechCorp', 'EcoEnergy', 'HealthInc', 'FoodCo', 'MediaGiant'];
const INITIAL_CASH = 10000;

export const useStockGame = () => {
  const [stocks, setStocks] = useState<Stock[]>(
    COMPANIES.map(name => ({ name, price: 100, history: [100] }))
  );
  const [cash, setCash] = useState<number>(INITIAL_CASH);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [newsHistory, setNewsHistory] = useState<News[]>([]);
  const [gameTime, setGameTime] = useState(0);

  const roundToTwoDecimal = (num: number) => Math.round(num * 100) / 100;

  const updateStocks = useCallback(() => {
    if (!isRunning) return;

    setStocks(prevStocks => {
      const newNews = generateRandomNews(COMPANIES);
      setNewsHistory(prev => [...prev, { ...newNews, time: gameTime }]);
      
      return prevStocks.map(stock => {
        const newPrice = roundToTwoDecimal(updateStockPrice(stock.price, newNews, stock.name));
        return {
          ...stock,
          price: newPrice,
          history: [...stock.history.slice(-29), newPrice],
        };
      });
    });

    setGameTime(prev => prev + 5); // 5秒ごとに更新
  }, [isRunning, gameTime]);

  useEffect(() => {
    const interval = setInterval(updateStocks, 3000);
    return () => clearInterval(interval);
  }, [updateStocks]);

  const tradeStock = useCallback((companyName: string, amount: number, isBuying: boolean) => {
    const stock = stocks.find(s => s.name === companyName);
    if (!stock) return;

    const cost = stock.price * amount;

    if (isBuying && cost > cash) {
      alert('現金が足りません！');
      return;
    }

    if (!isBuying && (portfolio[companyName] || 0) < amount) {
      alert('売却する株が足りません！');
      return;
    }

    setCash(prevCash => roundToTwoDecimal(isBuying ? prevCash - cost : prevCash + cost));
    setPortfolio(prevPortfolio => ({
      ...prevPortfolio,
      [companyName]: (prevPortfolio[companyName] || 0) + (isBuying ? amount : -amount),
    }));

    setTrades(prevTrades => [
      ...prevTrades,
      { date: new Date(), company: companyName, amount, price: stock.price, type: isBuying ? 'buy' : 'sell' },
    ]);
  }, [stocks, cash, portfolio]);

  const startGame = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseGame = useCallback(() => {
    setIsRunning(false);
  }, []);

  const setPortfolioAndCash = useCallback((newPortfolio: Record<string, number>, newCash: number) => {
    const validPortfolio = Object.entries(newPortfolio).reduce((acc, [key, value]) => {
      if (typeof value === 'number' && !isNaN(value)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, number>);

    const validCash = typeof newCash === 'number' && !isNaN(newCash) ? newCash : 0;

    setPortfolio(validPortfolio);
    setCash(validCash);
  }, []);

  const resetGame = useCallback(() => {
    setStocks(COMPANIES.map(name => ({ name, price: 100, history: [100] })));
    setCash(INITIAL_CASH);
    setPortfolio({});
    setTrades([]);
    setNewsHistory([]);
    setGameTime(0);
    setIsRunning(false);
  }, []);

  return { 
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
  };
};