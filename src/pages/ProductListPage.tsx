import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTitle from '../utils/PageTitle';
import { getProducts, getCategories, checkProductStock, Product, Category } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
  }, [selectedCategory, searchQuery, sortOption, products]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>商品を読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <PageTitle title="商品一覧" description="JaSST Hokkaidoストアの商品をご覧いただけます。" />
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
                <option value="すべて">すべて</option>
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
          {filteredProducts.map(product => {
            const stock = checkProductStock(product.id);
            const inStock = stock > 0;
            const displayPrice = currentUser ? product.memberPrice : product.price;

            return (
              <div className="card product-card" key={product.id}>
                <div className="card-image">
                  <img src={product.imageUrl} alt={product.name} />
                  {!inStock && <div className="out-of-stock">売切れ</div>}
                  {product.new && <div className="product-badge new">新着</div>}
                  {product.featured && <div className="product-badge featured">注目</div>}
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
                  {inStock && stock <= 5 && (
                    <div className="stock-warning">残り{stock}点</div>
                  )}
                  <Link to={`/products/${product.id}`} className="btn">
                    詳細を見る
                  </Link>
                </div>
              </div>
            );
          })}
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
