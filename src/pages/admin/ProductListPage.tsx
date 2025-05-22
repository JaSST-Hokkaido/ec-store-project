import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// 商品データの型定義
interface Product {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  stock: number;
  isPublished: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// フィルタの型定義
interface FilterState {
  search: string;
  category: string;
  status: string;
  sort: string;
}

// カテゴリのダミーデータ
const DUMMY_CATEGORIES = [
  { id: 'cat-1', name: '衣類' },
  { id: 'cat-2', name: 'アクセサリー' },
  { id: 'cat-3', name: '文房具' },
  { id: 'cat-4', name: '本・メディア' },
  { id: 'cat-5', name: 'その他' }
];

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    sort: 'newest'
  });
  
  // 商品データの取得
  useEffect(() => {
    // 実際はAPIからデータを取得
    const fetchProducts = async () => {
      try {
        // ダミーデータ
        const dummyProducts: Product[] = [
          {
            id: 1,
            name: 'テクノベーシック Tシャツ',
            category: 'cat-1',
            categoryName: '衣類',
            price: 3500,
            stock: 58,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-04-01T10:00:00Z',
            updatedAt: '2025-05-15T14:30:00Z'
          },
          {
            id: 2,
            name: 'プログラマー マグカップ',
            category: 'cat-2',
            categoryName: 'アクセサリー',
            price: 1800,
            stock: 15,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-04-05T11:20:00Z',
            updatedAt: '2025-05-10T09:15:00Z'
          },
          {
            id: 3,
            name: 'JaSST Hokkaido ステッカーセット',
            category: 'cat-3',
            categoryName: '文房具',
            price: 980,
            stock: 120,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-04-10T13:45:00Z',
            updatedAt: '2025-04-10T13:45:00Z'
          },
          {
            id: 4,
            name: 'コーディング ノート',
            category: 'cat-3',
            categoryName: '文房具',
            price: 1200,
            stock: 42,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-04-15T16:10:00Z',
            updatedAt: '2025-05-05T11:40:00Z'
          },
          {
            id: 5,
            name: 'デベロッパー ポロシャツ',
            category: 'cat-1',
            categoryName: '衣類',
            price: 4200,
            stock: 32,
            isPublished: false,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-04-20T09:30:00Z',
            updatedAt: '2025-05-01T10:20:00Z'
          },
          {
            id: 6,
            name: 'プログラミング解説本',
            category: 'cat-4',
            categoryName: '本・メディア',
            price: 2800,
            stock: 8,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png',
            createdAt: '2025-05-01T14:20:00Z',
            updatedAt: '2025-05-01T14:20:00Z'
          }
        ];
        
        setProducts(dummyProducts);
        setFilteredProducts(dummyProducts);
      } catch (error) {
        console.error('商品データの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // フィルタリングとソート処理
  useEffect(() => {
    let result = [...products];
    
    // 検索
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower)
      );
    }
    
    // カテゴリフィルタ
    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }
    
    // ステータスフィルタ
    if (filters.status) {
      if (filters.status === 'published') {
        result = result.filter(product => product.isPublished);
      } else if (filters.status === 'unpublished') {
        result = result.filter(product => !product.isPublished);
      } else if (filters.status === 'low-stock') {
        result = result.filter(product => product.stock < 20);
      }
    }
    
    // ソート
    if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters.sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredProducts(result);
  }, [products, filters]);
  
  // フィルター変更ハンドラー
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // フィルターリセットハンドラー
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      sort: 'newest'
    });
  };
  
  // 新規商品登録ページへ移動
  const handleCreateProduct = () => {
    navigate('/admin/products/new');
  };
  
  // 商品編集ページへ移動
  const handleEditProduct = (id: number) => {
    navigate(`/admin/products/edit/${id}`);
  };
  
  // 商品削除確認
  const handleDeleteProduct = (id: number, name: string) => {
    if (window.confirm(`「${name}」を削除してもよろしいですか？`)) {
      // 実際はAPIで削除処理
      // ここではフロントエンドだけで削除
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };
  
  // 公開状態の切り替え
  const handleTogglePublish = (id: number, currentStatus: boolean) => {
    // 実際はAPIで更新処理
    // ここではフロントエンドだけで更新
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, isPublished: !currentStatus } : product
      )
    );
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="product-list-page">
      <div className="page-actions">
        <h1>商品一覧</h1>
        {checkPermission('manage_products') && (
          <button 
            className="btn primary"
            onClick={handleCreateProduct}
          >
            新規商品登録
          </button>
        )}
      </div>
      
      <div className="product-filters">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="商品名で検索"
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">すべてのカテゴリ</option>
              {DUMMY_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">すべてのステータス</option>
              <option value="published">公開</option>
              <option value="unpublished">非公開</option>
              <option value="low-stock">在庫少（20個以下）</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="newest">登録日（新しい順）</option>
              <option value="oldest">登録日（古い順）</option>
              <option value="price-asc">価格（安い順）</option>
              <option value="price-desc">価格（高い順）</option>
              <option value="name-asc">商品名（A-Z）</option>
              <option value="name-desc">商品名（Z-A）</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button
              className="btn secondary"
              onClick={handleResetFilters}
            >
              リセット
            </button>
          </div>
        </div>
      </div>
      
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          <div className="table-responsive">
            <table className="product-table">
              <thead>
                <tr>
                  <th>画像</th>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>価格</th>
                  <th>在庫</th>
                  <th>ステータス</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-image">
                        <img src={product.imageUrl || 'https://placehold.jp/300x300.png'} alt={product.name} />
                      </div>
                    </td>
                    <td>
                      <div className="product-name">{product.name}</div>
                      <div className="product-id">ID: {product.id}</div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>¥{product.price.toLocaleString()}</td>
                    <td className={product.stock < 20 ? 'low-stock' : ''}>
                      {product.stock}
                    </td>
                    <td>
                      <span className={`product-status status-${product.isPublished ? '公開' : '非公開'}`}>
                        {product.isPublished ? '公開' : '非公開'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {checkPermission('manage_products') && (
                          <>
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => handleEditProduct(product.id)}
                              title="編集"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleTogglePublish(product.id, product.isPublished)}
                              title={product.isPublished ? '非公開にする' : '公開する'}
                            >
                              {product.isPublished ? '🔒' : '🔓'}
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              title="削除"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {!checkPermission('manage_products') && checkPermission('view_products') && (
                          <button
                            className="btn-icon"
                            onClick={() => handleEditProduct(product.id)}
                            title="詳細"
                          >
                            👁️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>商品が見つかりませんでした。検索条件を変更してください。</p>
            <button className="btn" onClick={handleResetFilters}>
              フィルターをリセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
