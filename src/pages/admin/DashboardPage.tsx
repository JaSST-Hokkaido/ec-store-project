import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockItems: number;
  customerCount: number;
  averageOrderValue: number;
}

interface RecentOrder {
  id: string;
  date: string;
  customer: string;
  total: number;
  status: string;
}

interface PopularProduct {
  id: number;
  name: string;
  sales: number;
  stock: number;
  price: number;
}

const DashboardPage: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    ordersToday: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    customerCount: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  
  // ダッシュボードデータのロード
  useEffect(() => {
    // 実際はAPIからデータを取得
    const loadDashboardData = async () => {
      try {
        // ダミーデータ
        // 本番環境では実際のAPIからデータを取得する
        const dummyStats: DashboardStats = {
          totalSales: 1250000,
          ordersToday: 15,
          pendingOrders: 8,
          lowStockItems: 5,
          customerCount: 432,
          averageOrderValue: 8500
        };
        
        const dummyRecentOrders: RecentOrder[] = [
          { id: 'ORD-12345', date: '2025-05-21', customer: '山田 太郎', total: 12800, status: '発送済み' },
          { id: 'ORD-12344', date: '2025-05-21', customer: '鈴木 花子', total: 5400, status: '準備中' },
          { id: 'ORD-12343', date: '2025-05-20', customer: '佐藤 次郎', total: 8900, status: '発送済み' },
          { id: 'ORD-12342', date: '2025-05-20', customer: '高橋 明', total: 3200, status: '配送中' },
          { id: 'ORD-12341', date: '2025-05-19', customer: '田中 裕子', total: 15400, status: '完了' }
        ];
        
        const dummyPopularProducts: PopularProduct[] = [
          { id: 1, name: 'テクノベーシック Tシャツ', sales: 42, stock: 58, price: 3500 },
          { id: 3, name: 'JaSST Hokkaido ステッカーセット', sales: 35, stock: 120, price: 980 },
          { id: 5, name: 'デベロッパー ポロシャツ', sales: 28, stock: 32, price: 4200 },
          { id: 2, name: 'プログラマー マグカップ', sales: 25, stock: 15, price: 1800 },
          { id: 4, name: 'コーディング ノート', sales: 18, stock: 42, price: 1200 }
        ];
        
        setStats(dummyStats);
        setRecentOrders(dummyRecentOrders);
        setPopularProducts(dummyPopularProducts);
        
      } catch (error) {
        console.error('ダッシュボードデータの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="admin-dashboard">
      <div className="welcome-section">
        <h2>ようこそ、{currentAdmin?.name}さん</h2>
        <p>最終ログイン: {currentAdmin?.lastLogin ? new Date(currentAdmin.lastLogin).toLocaleString('ja-JP') : '不明'}</p>
      </div>
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon sales-icon">💹</div>
          <div className="stat-info">
            <div className="stat-value">¥{stats.totalSales.toLocaleString()}</div>
            <div className="stat-label">総売上</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.ordersToday}</div>
            <div className="stat-label">今日の注文</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">処理待ち注文</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stock-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.lowStockItems}</div>
            <div className="stat-label">在庫少商品</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* 最近の注文 */}
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h3>最近の注文</h3>
            <button className="view-all-btn" onClick={() => window.location.href = '/admin/orders'}>すべて表示</button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>注文番号</th>
                  <th>日付</th>
                  <th>顧客名</th>
                  <th>金額</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.customer}</td>
                    <td>¥{order.total.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 人気商品 */}
        <div className="dashboard-card popular-products">
          <div className="card-header">
            <h3>人気商品</h3>
            <button className="view-all-btn" onClick={() => window.location.href = '/admin/products'}>すべて表示</button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>販売数</th>
                  <th>在庫</th>
                  <th>価格</th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sales}</td>
                    <td className={product.stock < 20 ? 'low-stock' : ''}>{product.stock}</td>
                    <td>¥{product.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* 顧客統計 */}
        <div className="dashboard-card customer-stats">
          <div className="card-header">
            <h3>顧客統計</h3>
          </div>
          
          <div className="stat-summary">
            <div className="summary-item">
              <div className="summary-label">会員数</div>
              <div className="summary-value">{stats.customerCount}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">平均注文額</div>
              <div className="summary-value">¥{stats.averageOrderValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* タスク */}
        <div className="dashboard-card tasks">
          <div className="card-header">
            <h3>未処理タスク</h3>
          </div>
          
          <ul className="task-list">
            <li className="task-item">
              <div className="task-icon urgent">🔴</div>
              <div className="task-info">
                <div className="task-title">在庫切れが近い商品があります</div>
                <div className="task-description">5つの商品が残り20個以下です</div>
              </div>
              <button className="task-action-btn">確認</button>
            </li>
            <li className="task-item">
              <div className="task-icon normal">🔵</div>
              <div className="task-info">
                <div className="task-title">新規問い合わせ</div>
                <div className="task-description">3件の未回答の問い合わせがあります</div>
              </div>
              <button className="task-action-btn">確認</button>
            </li>
            <li className="task-item">
              <div className="task-icon normal">🔵</div>
              <div className="task-info">
                <div className="task-title">注文キャンセルリクエスト</div>
                <div className="task-description">注文 #ORD-12344 のキャンセル依頼</div>
              </div>
              <button className="task-action-btn">確認</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
