import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 実装したサブページコンポーネントをインポート
import ProfileEditPage from './ProfileEditPage';
import OrderHistoryPage from './OrderHistoryPage';
import PointsPage from './PointsPage';
import CouponsPage from './CouponsPage';
import AccountClosurePage from './AccountClosurePage';

// マイページの各サブページコンポーネント
const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="mypage-section">
      <h2 className="section-title">会員情報</h2>
      <div className="profile-details">
        <table className="profile-table">
          <tbody>
            <tr>
              <th>お名前</th>
              <td>{currentUser.name}</td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td>{currentUser.email}</td>
            </tr>
            <tr>
              <th>電話番号</th>
              <td>{currentUser.phone || '未設定'}</td>
            </tr>
            <tr>
              <th>住所</th>
              <td>
                {currentUser.address ? (
                  <>
                    〒{currentUser.address.postalCode || '未設定'}<br />
                    {currentUser.address.prefecture || ''}{currentUser.address.city || ''}<br />
                    {currentUser.address.address1 || ''} {currentUser.address.address2 || ''}
                  </>
                ) : (
                  '未設定'
                )}
              </td>
            </tr>
            <tr>
              <th>会員登録日</th>
              <td>{currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString('ja-JP') : '不明'}</td>
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

// アカウント設定ページ
const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mypage-section">
      <h2 className="section-title">アカウント設定</h2>
      <div className="account-settings">
        <div className="settings-card">
          <h3>パスワード変更</h3>
          <p>セキュリティのため、定期的にパスワードを変更することをお勧めします。</p>
          <button 
            className="btn"
            onClick={() => navigate('/mypage/change-password')}
          >
            パスワードを変更する
          </button>
        </div>
        
        <div className="settings-card danger-zone">
          <h3>退会手続き</h3>
          <p>退会するとアカウントに関連するすべての情報が削除されます。</p>
          <button 
            className="btn danger"
            onClick={() => navigate('/mypage/account-closure')}
          >
            退会手続きへ
          </button>
        </div>
      </div>
    </div>
  );
};

// マイページのメインコンポーネント
const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  // ログインしていない場合はログインページにリダイレクト
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=mypage');
    }
  }, [isAuthenticated, navigate]);
  
  // 現在のアクティブなタブ
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/points')) return 'points';
    if (path.includes('/coupons')) return 'coupons';
    if (path.includes('/settings')) return 'settings';
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/mypage/${tab === 'profile' ? '' : tab}`);
  };
  
  if (!currentUser) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="mypage">
      <div className="container">
        <h1 className="page-title">マイページ</h1>
        
        <div className="mypage-container">
          <div className="mypage-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-placeholder">
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
                </span>
              </div>
              <div className="user-name">{currentUser.name}</div>
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
                <li 
                  className={activeTab === 'settings' ? 'active' : ''}
                  onClick={() => handleTabChange('settings')}
                >
                  <span className="nav-icon">⚙️</span>
                  アカウント設定
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
                      logout();
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
              <Route path="edit-profile" element={<ProfileEditPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:id" element={<OrderHistoryPage />} />
              <Route path="points" element={<PointsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
              <Route path="account-closure" element={<AccountClosurePage />} />
              <Route path="*" element={<ProfilePage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
