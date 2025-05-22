import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// ダミーデータ（後でAPI連携に置き換え）
const products = [
  {
    id: 1,
    name: 'テクノベーシック Tシャツ',
    price: 3500,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: '柔らかな肌触りの綿100%Tシャツ。テクノロジーをモチーフにしたシンプルなデザイン。',
    inStock: true
  },
  {
    id: 2,
    name: 'プログラマー マグカップ',
    price: 1800,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '生活雑貨',
    description: '大容量のマグカップ。プログラマーのための至高の一品。電子レンジ対応。',
    inStock: true
  },
  {
    id: 3,
    name: 'JaSST Hokkaido ステッカーセット',
    price: 980,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'ステーショナリー',
    description: '耐水性のあるJaSST Hokkaidoロゴステッカー10枚セット。PCやスマホなどに貼れます。',
    inStock: true
  },
  {
    id: 4,
    name: 'コーディング ノート',
    price: 1200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'ステーショナリー',
    description: 'プログラミングに最適な方眼罫のノート。コードスニペットの記録に便利。',
    inStock: true
  },
  {
    id: 5,
    name: 'デベロッパー ポロシャツ',
    price: 4200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: '通気性の良いポロシャツ。仕事でもカジュアルな場でも使える一枚。',
    inStock: true
  },
  {
    id: 6,
    name: 'エンジニア 保温ボトル',
    price: 2500,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '生活雑貨',
    description: '12時間保温、24時間保冷可能なステンレスボトル。プログラミング中の水分補給に。',
    inStock: false
  },
  {
    id: 7,
    name: 'JaSST Hokkaido ロゴキャップ',
    price: 3200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: 'シンプルなロゴ入りキャップ。サイズ調整可能でどなたでも着用できます。',
    inStock: true
  },
  {
    id: 8,
    name: 'プログラミング 参考書',
    price: 3800,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '書籍',
    description: '最新のプログラミング技術を網羅した参考書。初心者から上級者まで対応。',
    inStock: true
  },
];

const categories = [
  { id: 1, name: 'すべて' },
  { id: 2, name: 'アパレル' },
  { id: 3, name: '生活雑貨' },
  { id: 4, name: 'ステーショナリー' },
  { id: 5, name: '書籍' },
];

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  
  // URLからパラメータを取得して状態を設定
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    if (category) {
      setSelectedCategory(category);
    }
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (sort) {
      setSortOption(sort);
    }
  }, [searchParams]);

  // フィルターや検索が変更されたらURLを更新
  const updateSearchParams = (params: {
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (params.category) {
      if (params.category === 'すべて') {
        newSearchParams.delete('category');
      } else {
        newSearchParams.set('category', params.category);
      }
    }
    
    if (params.search !== undefined) {
      if (params.search === '') {
        newSearchParams.delete('search');
      } else {
        newSearchParams.set('search', params.search);
      }
    }
    
    if (params.sort) {
      if (params.sort === 'default') {
        newSearchParams.delete('sort');
      } else {
        newSearchParams.set('sort', params.sort);
      }
    }
    
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    let result = [...products];

    // カテゴリーフィルタリング
    if (selectedCategory !== 'すべて') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // 検索フィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // ソート
    switch(sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // デフォルトは何もしない
        break;
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, sortOption]);

  return (
    <div className="product-list-page">
      <div className="container">
        <h1 className="page-title">商品一覧</h1>

        <div className="product-filters">
          <div className="search-container">
            <form onSubmit={(e) => {
              e.preventDefault();
              updateSearchParams({ search: searchQuery });
            }}>
              <input
                type="text"
                placeholder="商品名、カテゴリーなどで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">検索</button>
            </form>
          </div>

          <div className="filter-options">
            <div className="category-filter">
              <label>カテゴリー:</label>
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  updateSearchParams({ category: newCategory });
                }}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-filter">
              <label>並び替え:</label>
              <select 
                value={sortOption}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortOption(newSort);
                  updateSearchParams({ sort: newSort });
                }}
                className="filter-select"
              >
                <option value="default">おすすめ順</option>
                <option value="price-asc">価格の安い順</option>
                <option value="price-desc">価格の高い順</option>
                <option value="name-asc">名前 (A-Z)</option>
                <option value="name-desc">名前 (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="product-count">
          {filteredProducts.length}件の商品が見つかりました
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => (
            <div className="card product-card" key={product.id}>
              <div className="card-image">
                <img src={product.imageUrl} alt={product.name} />
                {!product.inStock && <div className="out-of-stock">売切れ</div>}
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

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>お探しの商品が見つかりませんでした。</p>
            <p>検索条件を変更して再度お試しください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
