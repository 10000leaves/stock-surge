import { News } from '@/types/types';

export const generateRandomNews = (companies: string[]): News => {
  const events: Omit<News, 'company'>[] = [
    { content: '四半期決算発表', impact: 0.15 },
    { content: '新製品発表', impact: 0.10 },
    { content: '業績予想上方修正', impact: 0.08 },
    { content: 'M&A発表', impact: 0.12 },
    { content: '株式分割', impact: 0.05 },
    { content: '自社株買い発表', impact: 0.06 },
    { content: '新技術開発成功', impact: 0.09 },
    { content: '大口顧客との契約締結', impact: 0.07 },
    { content: '株主優待の拡充', impact: 0.03 },
    { content: '海外展開の加速', impact: 0.08 },
    { content: 'CEO交代', impact: -0.06 },
    { content: '業績予想下方修正', impact: -0.10 },
    { content: '会計不正発覚', impact: -0.20 },
    { content: '製品リコール', impact: -0.15 },
    { content: '特許侵害訴訟', impact: -0.12 },
    { content: '自然災害による被害', impact: -0.08 },
    { content: '主要取引先の倒産', impact: -0.09 },
    { content: '競合他社の新製品発表', impact: -0.05 },
    { content: '原材料価格の高騰', impact: -0.04 },
    { content: '為替変動（円高）', impact: -0.07 },
    { content: '金利上昇', impact: -0.03 },
    { content: '業界規制の強化', impact: -0.06 },
    { content: '市場シェアの低下', impact: -0.08 },
    { content: '株式市場全体の下落', impact: -0.10 },
    { content: '政治的不安定', impact: -0.05 },
    { content: '新規事業の成功', impact: 0.11 },
    { content: 'コスト削減策の実施', impact: 0.06 },
    { content: 'アナリスト評価の上昇', impact: 0.04 },
    { content: 'ESG評価の向上', impact: 0.05 },
    { content: '大型補助金の獲得', impact: 0.07 }
  ];

  const event = events[Math.floor(Math.random() * events.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];

  return { ...event, company };
};

export const updateStockPrice = (currentPrice: number, news: News | null, companyName: string): number => {
  let change = (Math.random() - 0.5) * 0.02; // ±1%のランダムな変動

  if (news && news.company === companyName) {
    change += news.impact;
  }

  return Math.max(0.01, currentPrice * (1 + change));
};
