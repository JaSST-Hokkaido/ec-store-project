import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../utils/PageTitle';
import { getFeaturedProducts, getNewProducts, getCategories, checkProductStock, Product, Category } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, newProds, cats] = await Promise.all([
          getFeaturedProducts(),
          getNewProducts(),
          getCategories()
        ]);
        
        // 最大4つずつ表示
        setFeaturedProducts(featured.slice(0, 4));
        setNewProducts(newProds.slice(0, 3));
        setCategories(cats);
        setIsLoading(false);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <PageTitle title="ホーム" description="JaSST Hokkaidoストアへようこそ。テクノロジーの力で日常をもっと便利に、もっと楽しくする商品をご提供します。" />
      
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>JaSST Hokkaidoを<br />身近に感じるライフスタイル</h1>
            <p>JaSST Hokkaidoストアは、エンジニアライフをもっと便利に、もっと楽しくする商品を提供します。</p>
            <Link to="/products" className="btn btn-primary">商品を見る</Link>
          </div>
          <div className="hero-image">
            <img src="https://placehold.jp/600x400.png" alt="JaSST Hokkaidoストア" />
          </div>
        </div>
      </section>

      {/* カテゴリーナビゲーション */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">カテゴリーから探す</h2>
          <div className="category-grid">
            {categories.map(category => (
              <Link to={`/products?category=${category.name}`} className="category-card" key={category.id}>
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
            {featuredProducts.map(product => {
              const stock = checkProductStock(product.id);
              const inStock = stock > 0;
              const displayPrice = currentUser ? product.memberPrice : product.price;

              return (
                <div className="card product-card" key={product.id}>
                  <div className="card-image">
                    <img src={product.imageUrl} alt={product.name} />
                    {!inStock && <div className="out-of-stock">売切れ</div>}
                  </div>
                  <div className="card-body">
                    <div className="product-category">{product.category}</div>
                    <h3 className="card-title">{product.name}</h3>
                    <div className="card-price">
                      {currentUser && displayPrice < product.price && (
                        <>
                          <span className="original-price">¥{product.price.toLocaleString()}</span>
                          <span className="member-price">会員価格: </span>
                        </>
                      )}
                      ¥{displayPrice.toLocaleString()}
                    </div>
                    <Link to={`/products/${product.id}`} className="btn">
                      詳細を見る
                    </Link>
                  </div>
                </div>
              );
            })}
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
            {newProducts.map(product => {
              const stock = checkProductStock(product.id);
              const inStock = stock > 0;
              const displayPrice = currentUser ? product.memberPrice : product.price;

              return (
                <div className="card product-card" key={product.id}>
                  <div className="card-image">
                    <img src={product.imageUrl} alt={product.name} />
                    <div className="new-badge">NEW</div>
                    {!inStock && <div className="out-of-stock">売切れ</div>}
                  </div>
                  <div className="card-body">
                    <div className="product-category">{product.category}</div>
                    <h3 className="card-title">{product.name}</h3>
                    <div className="card-price">
                      {currentUser && displayPrice < product.price && (
                        <>
                          <span className="original-price">¥{product.price.toLocaleString()}</span>
                          <span className="member-price">会員価格: </span>
                        </>
                      )}
                      ¥{displayPrice.toLocaleString()}
                    </div>
                    <Link to={`/products/${product.id}`} className="btn">
                      詳細を見る
                    </Link>
                  </div>
                </div>
              );
            })}
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
