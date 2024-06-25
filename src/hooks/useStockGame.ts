import { useState, useEffect, useCallback } from 'react';
import { Stock, News, Trade } from '@/types/types';
import { generateRandomNews, updateStockPrice } from '@/utils/stockUtils';
import { toast } from 'react-toastify';
import { exportToCSV } from '@/utils/csvExport';

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
  const [portfolioHistory, setPortfolioHistory] = useState<{ date: Date; totalValue: number }[]>([]);

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
      toast.error('現金が足りません！');
      return;
    }

    if (!isBuying && (portfolio[companyName] || 0) < amount) {
      toast.error('売却する株が足りません！');
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

    if (isBuying) {
      toast.success(`${companyName}を${amount}株購入しました！`);
    } else {
      toast.success(`${companyName}を${amount}株売却しました！`);
    }
  }, [stocks, cash, portfolio]);

  const startGame = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseGame = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetGame = useCallback(() => {
    setStocks(COMPANIES.map(name => ({ name, price: 100, history: [100] })));
    setCash(INITIAL_CASH);
    setPortfolio({});
    setTrades([]);
    setNewsHistory([]);
    setGameTime(0);
    setIsRunning(false);
    setPortfolioHistory([]);
  }, []);

  useEffect(() => {
    const totalValue = calculateTotalValue();
    setPortfolioHistory(prev => [...prev, { date: new Date(), totalValue }]);
  }, [cash, portfolio, stocks]);

  const calculateTotalValue = useCallback(() => {
    return roundToTwoDecimal(cash + Object.entries(portfolio).reduce((sum, [company, amount]) => {
      const stock = stocks.find(s => s.name === company);
      return sum + (stock ? stock.price * amount : 0);
    }, 0));
  }, [cash, portfolio, stocks]);

  const exportTrades = useCallback(() => {
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
  }, [trades]);

  const exportStockHistory = useCallback(() => {
    const data = [
      ['Time', ...stocks.map(stock => stock.name)],
      ...stocks[0].history.map((_, index) => 
        [index, ...stocks.map(stock => roundToTwoDecimal(stock.history[index]).toFixed(2))]
      )
    ];
    exportToCSV(data, 'all_stocks_history.csv');
    toast.success('株価履歴をエクスポートしました');
  }, [stocks]);

  const exportNewsHistory = useCallback(() => {
    const data = [
      ['Time', 'Content', 'Affected Company'],
      ...newsHistory.map(news => [
        formatTime(news.time ?? 0),
        news.content,
        news.company
      ])
    ];
    exportToCSV(data, 'news_history.csv');
    toast.success('ニュース履歴をエクスポートしました');
  }, [newsHistory]);

  const exportPortfolio = useCallback(() => {
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
  }, [cash, portfolio, stocks, calculateTotalValue]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const setPortfolioAndCash = useCallback((newPortfolio: Record<string, number>, newCash: number) => {
    setPortfolio(newPortfolio);
    setCash(newCash);
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
    resetGame,
    portfolioHistory,
    calculateTotalValue,
    exportTrades,
    exportStockHistory,
    exportNewsHistory,
    exportPortfolio,
    setPortfolioAndCash
  };
};