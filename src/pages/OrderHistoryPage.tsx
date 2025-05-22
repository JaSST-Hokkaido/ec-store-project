import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 注文の型定義
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  options?: {
    size?: string;
    color?: string;
  };
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
    phone: string;
  };
  items: OrderItem[];
  pointsUsed?: number;
  pointsEarned?: number;
}

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('すべて');
  
  // ダミーの注文データを作成
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login?redirect=mypage/orders');
      return;
    }
    
    // 実際にはAPIからデータを取得
    const dummyOrders: Order[] = [
      {
        id: 'ORD-12345',
        date: '2025-05-15',
        total: 8750,
        status: '発送済み',
        paymentMethod: 'クレジットカード',
        shippingAddress: {
          name: currentUser.name,
          postalCode: currentUser.address?.postalCode || '123-4567',
          prefecture: currentUser.address?.prefecture || '東京都',
          city: currentUser.address?.city || '渋谷区',
          address1: currentUser.address?.address1 || '〇〇町1-2-3',
          address2: currentUser.address?.address2,
          phone: currentUser.phone || '090-1234-5678'
        },
        items: [
          { id: 1, name: 'テクノベーシック Tシャツ', quantity: 2, price: 3500, options: { size: 'M', color: 'ブラック' } },
          { id: 3, name: 'JaSST Hokkaido ステッカーセット', quantity: 1, price: 980 },
        ],
        pointsUsed: 0,
        pointsEarned: 87
      },
      {
        id: 'ORD-12340',
        date: '2025-04-20',
        total: 4200,
        status: '配送完了',
        paymentMethod: '銀行振込',
        shippingAddress: {
          name: currentUser.name,
          postalCode: currentUser.address?.postalCode || '123-4567',
          prefecture: currentUser.address?.prefecture || '東京都',
          city: currentUser.address?.city || '渋谷区',
          address1: currentUser.address?.address1 || '〇〇町1-2-3',
          address2: currentUser.address?.address2,
          phone: currentUser.phone || '090-1234-5678'
        },
        items: [
          { id: 5, name: 'デベロッパー ポロシャツ', quantity: 1, price: 4200, options: { size: 'L', color: 'ネイビー' } }
        ],
        pointsUsed: 0,
        pointsEarned: 42
      },
      {
        id: 'ORD-12330',
        date: '2025-03-10',
        total: 2670,
        status: 'キャンセル',
        paymentMethod: 'コンビニ決済',
        shippingAddress: {
          name: currentUser.name,
          postalCode: currentUser.address?.postalCode || '123-4567',
          prefecture: currentUser.address?.prefecture || '東京都',
          city: currentUser.address?.city || '渋谷区',
          address1: currentUser.address?.address1 || '〇〇町1-2-3',
          address2: currentUser.address?.address2,
          phone: currentUser.phone || '090-1234-5678'
        },
        items: [
          { id: 2, name: 'プログラマー マグカップ', quantity: 1, price: 1800 },
          { id: 4, name: 'コーディング ノート', quantity: 1, price: 1200 }
        ],
        pointsUsed: 200,
        pointsEarned: 0
      }
    ];
    
    setOrders(dummyOrders);
    
    // URLにIDがある場合は詳細表示
    if (id) {
      const order = dummyOrders.find(o => o.id === id);
      setCurrentOrder(order || null);
    }
    
    setIsLoading(false);
  }, [isAuthenticated, currentUser, navigate, id]);
  
  // 検索とフィルタリングの適用
  const filteredOrders = orders.filter(order => {
    // ステータスフィルター
    if (statusFilter !== 'すべて' && order.status !== statusFilter) {
      return false;
    }
    
    // 検索語句
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      
      // 注文IDか商品名に検索語句が含まれるか
      const matchesOrderId = order.id.toLowerCase().includes(term);
      const matchesItems = order.items.some(item => 
        item.name.toLowerCase().includes(term)
      );
      
      return matchesOrderId || matchesItems;
    }
    
    return true;
  });
  
  // 注文詳細ページ
  if (currentOrder) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="page-header">
            <button 
              className="back-button"
              onClick={() => {
                setCurrentOrder(null);
                navigate('/mypage/orders');
              }}
            >
              ← 注文履歴一覧へ戻る
            </button>
            <h1 className="page-title">注文詳細</h1>
          </div>
          
          <div className="order-detail-container">
            <div className="order-summary">
              <h2>注文情報</h2>
              <div className="info-group">
                <div className="info-row">
                  <span className="info-label">注文番号:</span>
                  <span className="info-value">{currentOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">注文日:</span>
                  <span className="info-value">{currentOrder.date}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ステータス:</span>
                  <span className={`info-value status-${currentOrder.status}`}>{currentOrder.status}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">支払方法:</span>
                  <span className="info-value">{currentOrder.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <div className="shipping-info">
              <h2>配送先情報</h2>
              <div className="info-group">
                <div className="info-row">
                  <span className="info-label">お名前:</span>
                  <span className="info-value">{currentOrder.shippingAddress.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">住所:</span>
                  <span className="info-value">
                    〒{currentOrder.shippingAddress.postalCode}<br />
                    {currentOrder.shippingAddress.prefecture}
                    {currentOrder.shippingAddress.city}<br />
                    {currentOrder.shippingAddress.address1}
                    {currentOrder.shippingAddress.address2 && ` ${currentOrder.shippingAddress.address2}`}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">電話番号:</span>
                  <span className="info-value">{currentOrder.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="order-items">
              <h2>注文商品</h2>
              <div className="items-list">
                {currentOrder.items.map(item => (
                  <div className="order-item" key={item.id}>
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      {item.options && (
                        <div className="item-options">
                          {item.options.size && <span>サイズ: {item.options.size}</span>}
                          {item.options.color && <span>カラー: {item.options.color}</span>}
                        </div>
                      )}
                      <div className="item-quantity">数量: {item.quantity}</div>
                    </div>
                    <div className="item-price">¥{item.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-total">
              <h2>合計金額</h2>
              <div className="total-breakdown">
                <div className="total-row">
                  <span>小計:</span>
                  <span>¥{currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                {currentOrder.pointsUsed && currentOrder.pointsUsed > 0 && (
                  <div className="total-row discount">
                    <span>ポイント利用:</span>
                    <span>-¥{currentOrder.pointsUsed.toLocaleString()}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>合計:</span>
                  <span>¥{currentOrder.total.toLocaleString()}</span>
                </div>
                {currentOrder.pointsEarned && currentOrder.pointsEarned > 0 && (
                  <div className="points-earned">
                    <span>獲得ポイント:</span>
                    <span>{currentOrder.pointsEarned} pt</span>
                  </div>
                )}
              </div>
            </div>
            
            {currentOrder.status !== 'キャンセル' && (
              <div className="order-actions">
                <button className="btn">注文をキャンセルする</button>
                <button className="btn">お問い合わせをする</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // 注文履歴一覧ページ
  return (
    <div className="order-history-page">
      <div className="container">
        <h1 className="page-title">注文履歴</h1>
        
        <div className="filter-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="注文番号、商品名で検索"
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <label>ステータス:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="すべて">すべて</option>
              <option value="発送済み">発送済み</option>
              <option value="配送完了">配送完了</option>
              <option value="キャンセル">キャンセル</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">読み込み中...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="order-list">
            {filteredOrders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-id">注文番号: {order.id}</div>
                    <div className="order-date">注文日: {order.date}</div>
                  </div>
                  <div className="order-status-info">
                    <div className={`order-status status-${order.status}`}>{order.status}</div>
                    <div className="order-total">¥{order.total.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="order-items-preview">
                  {order.items.map(item => (
                    <div className="item-row" key={item.id}>
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        {item.quantity}点 × ¥{item.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-actions">
                  <button 
                    className="btn view-details-btn"
                    onClick={() => {
                      setCurrentOrder(order);
                      navigate(`/mypage/orders/${order.id}`);
                    }}
                  >
                    詳細を見る
                  </button>
                  
                  {order.status !== 'キャンセル' && (
                    <button className="btn secondary">再注文する</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>注文履歴がありません。</p>
            <button 
              className="btn"
              onClick={() => navigate('/products')}
            >
              商品を探す
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

function setSearchQuery(value: string): void {
  throw new Error('Function not implemented.');
}
