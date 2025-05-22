import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { getCartCount } = useCart();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const cartCount = getCartCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">JaSST Hokkaidoストア</Link>
        </div>

        {/* PCナビゲーション */}
        <nav className="nav-desktop">
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">ホーム</Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">商品一覧</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">当店について</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">お問い合わせ</Link>
            </li>
          </ul>
        </nav>

        {/* 検索フォーム */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="商品を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">検索</button>
        </form>

        {/* ヘッダーアクション */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="header-action dropdown">
              <span className="icon">👤</span>
              <span className="action-text">{currentUser?.name || 'マイページ'}</span>
              <div className="dropdown-content">
                <Link to="/mypage">マイページ</Link>
                <Link to="/mypage/orders">注文履歴</Link>
                <Link to="/mypage/points">ポイント</Link>
                <button onClick={logout}>ログアウト</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="header-action">
              <span className="icon">🔑</span>
              <span className="action-text">ログイン</span>
            </Link>
          )}
          
          <Link to="/cart" className="header-action">
            <span className="icon">🛒</span>
            <span className="action-text">カート</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>

        {/* モバイルメニューボタン */}
        <button className="menu-button" onClick={toggleMenu}>
          <span className="icon">☰</span>
        </button>
      </div>

      {/* モバイルナビゲーション */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <div className="container">
            <ul className="mobile-nav-menu">
              <li className="mobile-nav-item">
                <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>ホーム</Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/products" className="mobile-nav-link" onClick={toggleMenu}>商品一覧</Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/about" className="mobile-nav-link" onClick={toggleMenu}>当店について</Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/contact" className="mobile-nav-link" onClick={toggleMenu}>お問い合わせ</Link>
              </li>
              <li className="mobile-nav-item">
                {isAuthenticated ? (
                  <Link to="/mypage" className="mobile-nav-link" onClick={toggleMenu}>マイページ</Link>
                ) : (
                  <Link to="/login" className="mobile-nav-link" onClick={toggleMenu}>ログイン</Link>
                )}
              </li>
              {isAuthenticated && (
                <li className="mobile-nav-item">
                  <button 
                    className="mobile-nav-link logout-button" 
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                  >
                    ログアウト
                  </button>
                </li>
              )}
              <li className="mobile-nav-item">
                <Link to="/cart" className="mobile-nav-link" onClick={toggleMenu}>
                  カート {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
