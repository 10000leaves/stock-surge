export interface Stock {
  name: string;
  price: number;
  history: number[];
}

export interface News {
  time?: number;
  content: string;
  impact: number;
  company: string;
}

export interface Trade {
  date: Date;
  company: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
}