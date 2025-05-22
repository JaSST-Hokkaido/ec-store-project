import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // 特集商品
  const featuredProducts = [
    {
      id: 1,
      name: 'テクノベーシック Tシャツ',
      price: 3500,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: 'アパレル'
    },
    {
      id: 5,
      name: 'デベロッパー ポロシャツ',
      price: 4200,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: 'アパレル'
    },
    {
      id: 2,
      name: 'プログラマー マグカップ',
      price: 1800,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: '生活雑貨'
    },
    {
      id: 8,
      name: 'プログラミング 参考書',
      price: 3800,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: '書籍'
    }
  ];

  // 新着商品
  const newProducts = [
    {
      id: 3,
      name: 'テクノラボ ステッカーセット',
      price: 980,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: 'ステーショナリー'
    },
    {
      id: 4,
      name: 'コーディング ノート',
      price: 1200,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: 'ステーショナリー'
    },
    {
      id: 7,
      name: 'テクノラボ ロゴキャップ',
      price: 3200,
      imageUrl: 'https://placehold.jp/300x200.png',
      category: 'アパレル'
    }
  ];

  // カテゴリー
  const categories = [
    { id: 1, name: 'アパレル', icon: '👕', path: '/products?category=アパレル' },
    { id: 2, name: '生活雑貨', icon: '🏠', path: '/products?category=生活雑貨' },
    { id: 3, name: 'ステーショナリー', icon: '📝', path: '/products?category=ステーショナリー' },
    { id: 4, name: '書籍', icon: '📚', path: '/products?category=書籍' }
  ];

  return (
    <div className="home-page">
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>テクノロジーを<br />身近に感じるライフスタイル</h1>
            <p>テクノラボストアは、テクノロジーの力で日常をもっと便利に、もっと楽しくする商品を提供します。</p>
            <Link to="/products" className="btn btn-primary">商品を見る</Link>
          </div>
          <div className="hero-image">
            <img src="https://placehold.jp/600x400.png" alt="テクノラボストア" />
          </div>
        </div>
      </section>

      {/* カテゴリーナビゲーション */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">カテゴリーから探す</h2>
          <div className="category-grid">
            {categories.map(category => (
              <Link to={category.path} className="category-card" key={category.id}>
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特集商品 */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">特集商品</h2>
          <div className="product-grid">
            {featuredProducts.map(product => (
              <div className="card product-card" key={product.id}>
                <div className="card-image">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="card-body">
                  <div className="product-category">{product.category}</div>
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-price">¥{product.price.toLocaleString()}</div>
                  <Link to={`/products/${product.id}`} className="btn">
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* プロモーションバナー */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-content">
              <h2>新規会員登録で10%オフ</h2>
              <p>今すぐ会員登録して、初回購入時に使える10%オフクーポンをゲット！</p>
              <Link to="/register" className="btn btn-secondary">会員登録する</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 新着商品 */}
      <section className="new-arrival-section">
        <div className="container">
          <h2 className="section-title">新着商品</h2>
          <div className="product-grid">
            {newProducts.map(product => (
              <div className="card product-card" key={product.id}>
                <div className="card-image">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="new-badge">NEW</div>
                </div>
                <div className="card-body">
                  <div className="product-category">{product.category}</div>
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-price">¥{product.price.toLocaleString()}</div>
                  <Link to={`/products/${product.id}`} className="btn">
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-container">
            <Link to="/products" className="view-all-link">
              すべての商品を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>送料無料</h3>
              <p>5,000円以上のご購入で送料無料</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>安全な決済</h3>
              <p>SSL暗号化で個人情報を保護</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💬</div>
              <h3>サポート</h3>
              <p>平日10時〜18時のカスタマーサポート</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔄</div>
              <h3>簡単返品</h3>
              <p>30日以内なら返品・交換可能</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
