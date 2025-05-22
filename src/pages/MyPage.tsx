import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// マイページの各サブページコンポーネント
const ProfilePage: React.FC = () => {
  // ユーザー情報（実際にはContextやAPIから取得）
  const [userData] = useState({
    name: '山田 太郎',
    email: 'yamada.taro@example.com',
    phone: '090-1234-5678',
    address: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      address1: '〇〇町1-2-3',
      address2: 'テクノアパート101'
    },
    birthdate: '1985-01-15'
  });

  return (
    <div className="mypage-section">
      <h2 className="section-title">会員情報</h2>
      <div className="profile-details">
        <table className="profile-table">
          <tbody>
            <tr>
              <th>お名前</th>
              <td>{userData.name}</td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td>{userData.email}</td>
            </tr>
            <tr>
              <th>電話番号</th>
              <td>{userData.phone}</td>
            </tr>
            <tr>
              <th>住所</th>
              <td>
                〒{userData.address.postalCode}<br />
                {userData.address.prefecture}{userData.address.city}<br />
                {userData.address.address1} {userData.address.address2}
              </td>
            </tr>
            <tr>
              <th>生年月日</th>
              <td>{userData.birthdate}</td>
            </tr>
          </tbody>
        </table>
        <div className="profile-actions">
          <Link to="/mypage/edit-profile" className="btn">
            会員情報を編集
          </Link>
          <Link to="/mypage/change-password" className="btn secondary">
            パスワード変更
          </Link>
        </div>
      </div>
    </div>
  );
};

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 注文履歴（実際にはAPIから取得）
  const [orders] = useState([
    {
      id: 'ORD-12345',
      date: '2025-05-15',
      total: 8750,
      status: '発送済み',
      items: [
        { id: 1, name: 'テクノベーシック Tシャツ', quantity: 2, price: 3500 },
        { id: 3, name: 'テクノラボ ステッカーセット', quantity: 1, price: 980 },
      ]
    },
    {
      id: 'ORD-12340',
      date: '2025-04-20',
      total: 4200,
      status: '配送完了',
      items: [
        { id: 5, name: 'デベロッパー ポロシャツ', quantity: 1, price: 4200 }
      ]
    }
  ]);

  return (
    <div className="mypage-section">
      <h2 className="section-title">注文履歴</h2>
      {orders.length > 0 ? (
        <div className="order-history-list">
          {orders.map(order => (
            <div className="order-history-item" key={order.id}>
              <div className="order-header">
                <div className="order-header-left">
                  <div className="order-id">注文番号: {order.id}</div>
                  <div className="order-date">注文日: {order.date}</div>
                </div>
                <div className="order-header-right">
                  <div className="order-status">{order.status}</div>
                  <div className="order-total">¥{order.total.toLocaleString()}</div>
                </div>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div className="order-item" key={item.id}>
                    <div className="item-name">{item.name}</div>
                    <div className="item-details">
                      {item.quantity}点 × ¥{item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-actions">
                <button 
                  className="btn small"
                  onClick={() => navigate(`/mypage/orders/${order.id}`)}
                >
                  詳細を見る
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>注文履歴はありません</p>
        </div>
      )}
    </div>
  );
};

const PointsPage: React.FC = () => {
  // ポイント情報（実際にはAPIから取得）
  const [pointsData] = useState({
    currentPoints: 500,
    history: [
      { id: 1, date: '2025-05-15', type: '購入', description: '注文 #ORD-12345', points: 88, remainingPoints: 500 },
      { id: 2, date: '2025-04-20', type: '購入', description: '注文 #ORD-12340', points: 42, remainingPoints: 412 },
      { id: 3, date: '2025-04-01', type: '付与', description: '新規会員登録ボーナス', points: 500, remainingPoints: 370 },
      { id: 4, date: '2025-03-10', type: '利用', description: '注文 #ORD-12330', points: -130, remainingPoints: 0 }
    ]
  });

  return (
    <div className="mypage-section">
      <h2 className="section-title">ポイント</h2>
      
      <div className="points-summary">
        <div className="current-points">
          <div className="points-label">現在の保有ポイント</div>
          <div className="points-value">{pointsData.currentPoints} pt</div>
        </div>
        <div className="points-info">
          <p>ポイントは商品購入時に1ポイント = 1円として利用できます</p>
          <p>ポイントの有効期限は最終ポイント獲得日から1年間です</p>
        </div>
      </div>
      
      <h3>ポイント履歴</h3>
      <div className="points-history">
        <table className="points-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>内容</th>
              <th>ポイント</th>
              <th>残高</th>
            </tr>
          </thead>
          <tbody>
            {pointsData.history.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>
                  <div>{entry.type}</div>
                  <div className="entry-description">{entry.description}</div>
                </td>
                <td className={entry.points < 0 ? 'negative-points' : 'positive-points'}>
                  {entry.points > 0 ? `+${entry.points}` : entry.points}
                </td>
                <td>{entry.remainingPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CouponsPage: React.FC = () => {
  // クーポン情報（実際にはAPIから取得）
  const [coupons] = useState([
    { 
      id: 'COUPON-123', 
      name: '初回購入10%オフ', 
      code: 'FIRSTBUY10',
      discount: '10%',
      minPurchase: 3000,
      expiry: '2025-06-30',
      isUsed: false
    },
    { 
      id: 'COUPON-124', 
      name: '夏季セール特別クーポン', 
      code: 'SUMMER2025',
      discount: '¥500',
      minPurchase: 5000,
      expiry: '2025-08-31',
      isUsed: false
    },
    { 
      id: 'COUPON-120', 
      name: 'お誕生日クーポン', 
      code: 'BDAYSP15',
      discount: '15%',
      minPurchase: 2000,
      expiry: '2025-01-31',
      isUsed: true
    }
  ]);

  return (
    <div className="mypage-section">
      <h2 className="section-title">クーポン</h2>
      
      {coupons.filter(coupon => !coupon.isUsed).length > 0 ? (
        <div className="coupons-list">
          <h3>使用可能なクーポン</h3>
          {coupons.filter(coupon => !coupon.isUsed).map(coupon => (
            <div className="coupon-card" key={coupon.id}>
              <div className="coupon-header">
                <div className="coupon-name">{coupon.name}</div>
                <div className="coupon-discount">{coupon.discount} OFF</div>
              </div>
              <div className="coupon-details">
                <div className="coupon-code">
                  <span className="label">クーポンコード:</span>
                  <span className="code">{coupon.code}</span>
                </div>
                <div className="coupon-conditions">
                  <div>
                    <span className="label">最低購入金額:</span>
                    <span>¥{coupon.minPurchase.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="label">有効期限:</span>
                    <span>{coupon.expiry}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {coupons.filter(coupon => coupon.isUsed).length > 0 && (
            <>
              <h3>使用済みクーポン</h3>
              <div className="used-coupons">
                {coupons.filter(coupon => coupon.isUsed).map(coupon => (
                  <div className="coupon-card used" key={coupon.id}>
                    <div className="coupon-header">
                      <div className="coupon-name">{coupon.name}</div>
                      <div className="coupon-status">使用済み</div>
                    </div>
                    <div className="coupon-details">
                      <div className="coupon-code">
                        <span className="label">クーポンコード:</span>
                        <span className="code">{coupon.code}</span>
                      </div>
                      <div className="coupon-conditions">
                        <div>
                          <span className="label">割引:</span>
                          <span>{coupon.discount} OFF</span>
                        </div>
                        <div>
                          <span className="label">有効期限:</span>
                          <span>{coupon.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>現在使用可能なクーポンはありません</p>
        </div>
      )}
    </div>
  );
};

// マイページのメインコンポーネント
const MyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 現在のアクティブなタブ
  const getActiveTab = () => {
    const path = window.location.pathname;
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/points')) return 'points';
    if (path.includes('/coupons')) return 'coupons';
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/mypage/${tab === 'profile' ? '' : tab}`);
  };

  return (
    <div className="mypage">
      <div className="container">
        <h1 className="page-title">マイページ</h1>
        
        <div className="mypage-container">
          <div className="mypage-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-placeholder">YT</span>
              </div>
              <div className="user-name">山田 太郎</div>
            </div>
            
            <nav className="mypage-nav">
              <ul>
                <li 
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => handleTabChange('profile')}
                >
                  <span className="nav-icon">👤</span>
                  会員情報
                </li>
                <li 
                  className={activeTab === 'orders' ? 'active' : ''}
                  onClick={() => handleTabChange('orders')}
                >
                  <span className="nav-icon">📦</span>
                  注文履歴
                </li>
                <li 
                  className={activeTab === 'points' ? 'active' : ''}
                  onClick={() => handleTabChange('points')}
                >
                  <span className="nav-icon">🎯</span>
                  ポイント
                </li>
                <li 
                  className={activeTab === 'coupons' ? 'active' : ''}
                  onClick={() => handleTabChange('coupons')}
                >
                  <span className="nav-icon">🎟️</span>
                  クーポン
                </li>
              </ul>
              
              <div className="nav-divider"></div>
              
              <ul className="sub-menu">
                <li>
                  <Link to="/favorite">
                    <span className="nav-icon">❤️</span>
                    お気に入り
                  </Link>
                </li>
                <li>
                  <Link to="/support">
                    <span className="nav-icon">🔧</span>
                    サポート
                  </Link>
                </li>
                <li className="logout-item">
                  <button 
                    onClick={() => {
                      // ログアウト処理（実際にはAuth.signOut()などを使用）
                      console.log('ログアウト');
                      navigate('/');
                    }}
                  >
                    <span className="nav-icon">🚪</span>
                    ログアウト
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="mypage-content">
            <Routes>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="points" element={<PointsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              {/* 他のマイページサブルートもここに追加 */}
              <Route path="*" element={<ProfilePage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
