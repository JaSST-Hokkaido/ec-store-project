import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ポイント履歴の型定義
interface PointHistory {
  id: number;
  date: string;
  type: string; // 'earned'(獲得), 'used'(利用), 'expired'(期限切れ)
  description: string;
  points: number; // 正の値は獲得、負の値は利用
  remainingPoints: number;
  expirationDate?: string;
}

const PointsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [expirationDate, setExpirationDate] = useState('');
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'earned', 'used'
  
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login?redirect=mypage/points');
      return;
    }
    
    // 実際にはAPIからデータを取得
    // ダミーデータ作成
    const dummyPoints = 500;
    const dummyExpiringPoints = 200;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dummyExpirationDate = nextMonth.toISOString().split('T')[0];
    
    const dummyHistory: PointHistory[] = [
      {
        id: 1,
        date: '2025-05-15',
        type: 'earned',
        description: '注文 #ORD-12345 の購入',
        points: 87,
        remainingPoints: 500,
        expirationDate: '2026-05-15'
      },
      {
        id: 2,
        date: '2025-04-20',
        type: 'earned',
        description: '注文 #ORD-12340 の購入',
        points: 42,
        remainingPoints: 413,
        expirationDate: '2026-04-20'
      },
      {
        id: 3,
        date: '2025-04-01',
        type: 'earned',
        description: '新規会員登録ボーナス',
        points: 500,
        remainingPoints: 371,
        expirationDate: '2026-04-01'
      },
      {
        id: 4,
        date: '2025-03-10',
        type: 'used',
        description: '注文 #ORD-12330 のお支払い',
        points: -200,
        remainingPoints: 0
      },
      {
        id: 5,
        date: '2024-12-15',
        type: 'expired',
        description: 'ポイント有効期限切れ',
        points: -129,
        remainingPoints: 0
      }
    ];
    
    setCurrentPoints(dummyPoints);
    setExpiringPoints(dummyExpiringPoints);
    setExpirationDate(dummyExpirationDate);
    setPointHistory(dummyHistory);
    setIsLoading(false);
  }, [isAuthenticated, currentUser, navigate]);
  
  // タブに応じた履歴のフィルタリング
  const filteredHistory = pointHistory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'earned') return item.type === 'earned';
    if (activeTab === 'used') return item.type === 'used' || item.type === 'expired';
    return true;
  });
  
  // ポイント履歴の種類に応じたクラス名を返す
  const getPointTypeClass = (type: string) => {
    switch(type) {
      case 'earned':
        return 'point-earned';
      case 'used':
        return 'point-used';
      case 'expired':
        return 'point-expired';
      default:
        return '';
    }
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="points-page">
      <div className="container">
        <h1 className="page-title">ポイント</h1>
        
        <div className="points-summary-card">
          <div className="current-points">
            <div className="points-value">{currentPoints} <span className="points-unit">ポイント</span></div>
            <div className="points-label">現在の保有ポイント</div>
          </div>
          
          {expiringPoints > 0 && (
            <div className="expiring-points">
              <div className="expiring-info">
                <span className="expiring-value">{expiringPoints}ポイント</span>が
                <span className="expiring-date">{expirationDate}</span>に失効します
              </div>
            </div>
          )}
          
          <div className="points-info">
            <h3>ポイントについて</h3>
            <ul>
              <li>ポイントは商品購入時に1ポイント = 1円として利用できます</li>
              <li>ポイントの有効期限は獲得日から1年間です</li>
              <li>ポイントは注文確定時に付与されます</li>
            </ul>
          </div>
        </div>
        
        <div className="points-history-section">
          <div className="history-header">
            <h2>ポイント履歴</h2>
            <div className="history-tabs">
              <button 
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                すべて
              </button>
              <button 
                className={`tab-button ${activeTab === 'earned' ? 'active' : ''}`}
                onClick={() => setActiveTab('earned')}
              >
                獲得
              </button>
              <button 
                className={`tab-button ${activeTab === 'used' ? 'active' : ''}`}
                onClick={() => setActiveTab('used')}
              >
                利用・失効
              </button>
            </div>
          </div>
          
          {filteredHistory.length > 0 ? (
            <div className="points-history">
              <table className="points-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>内容</th>
                    <th>ポイント</th>
                    <th>有効期限</th>
                    <th>残高</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(entry => (
                    <tr key={entry.id} className={getPointTypeClass(entry.type)}>
                      <td>{entry.date}</td>
                      <td>{entry.description}</td>
                      <td className={entry.points > 0 ? 'positive' : 'negative'}>
                        {entry.points > 0 ? `+${entry.points}` : entry.points}
                      </td>
                      <td>{entry.expirationDate || '-'}</td>
                      <td>{entry.remainingPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>ポイント履歴がありません。</p>
            </div>
          )}
        </div>
        
        <div className="points-usage-section">
          <h2>ポイントを使う</h2>
          <p>ポイントは商品購入時のお支払いにご利用いただけます。</p>
          <button 
            className="btn"
            onClick={() => navigate('/products')}
          >
            商品を探す
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsPage;
