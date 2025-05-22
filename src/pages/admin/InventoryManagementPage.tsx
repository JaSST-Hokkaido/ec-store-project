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

// 在庫更新用の型
interface StockUpdate {
  productId: number;
  newStock: number;
  isUpdating: boolean;
}

const InventoryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [stockUpdate, setStockUpdate] = useState<StockUpdate | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // カテゴリのダミーデータ
  const DUMMY_CATEGORIES = [
    { id: 'cat-1', name: '衣類' },
    { id: 'cat-2', name: 'アクセサリー' },
    { id: 'cat-3', name: '文房具' },
    { id: 'cat-4', name: '本・メディア' },
    { id: 'cat-5', name: 'その他' }
  ];
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('manage_inventory') && !checkPermission('manage_products')) {
      navigate('/admin/dashboard');
    }
  }, [checkPermission, navigate]);
  
  // 商品データの取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 実際はAPIからデータを取得
        // ここではダミーデータ
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
            stock: 3,
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
  
  // フィルタリング処理
  useEffect(() => {
    let result = [...products];
    
    // 検索
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.id.toString().includes(searchLower)
      );
    }
    
    // カテゴリフィルタ
    if (categoryFilter) {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // 在庫フィルタ
    if (stockFilter) {
      if (stockFilter === 'low') {
        result = result.filter(product => product.stock <= 10);
      } else if (stockFilter === 'medium') {
        result = result.filter(product => product.stock > 10 && product.stock <= 50);
      } else if (stockFilter === 'high') {
        result = result.filter(product => product.stock > 50);
      } else if (stockFilter === 'out') {
        result = result.filter(product => product.stock === 0);
      }
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, stockFilter]);
  
  // 検索入力ハンドラー
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // カテゴリ選択ハンドラー
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };
  
  // 在庫フィルタ選択ハンドラー
  const handleStockFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStockFilter(e.target.value);
  };
  
  // 在庫数入力開始ハンドラー
  const handleStockUpdateStart = (productId: number, currentStock: number) => {
    setStockUpdate({
      productId,
      newStock: currentStock,
      isUpdating: false
    });
    
    // メッセージをクリア
    setSuccessMessage('');
    setError('');
  };
  
  // 在庫数入力ハンドラー
  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (stockUpdate) {
      setStockUpdate({
        ...stockUpdate,
        newStock: value === '' ? 0 : parseInt(value)
      });
    }
    
    // エラーをクリア
    if (error) {
      setError('');
    }
  };
  
  // 在庫数更新キャンセルハンドラー
  const handleStockUpdateCancel = () => {
    setStockUpdate(null);
    setError('');
  };
  
  // 在庫数更新ハンドラー
  const handleStockUpdate = async () => {
    if (!stockUpdate) return;
    
    // バリデーション
    if (isNaN(stockUpdate.newStock) || stockUpdate.newStock < 0) {
      setError('在庫数には0以上の数値を入力してください');
      return;
    }
    
    setStockUpdate({
      ...stockUpdate,
      isUpdating: true
    });
    
    try {
      // 実際はAPIで更新処理
      // ここではフロントエンドだけで処理
      
      // 更新完了を待つ（API呼び出しを模倣）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 商品データを更新
      const updatedProducts = products.map(product => {
        if (product.id === stockUpdate.productId) {
          return {
            ...product,
            stock: stockUpdate.newStock,
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      setSuccessMessage(`商品ID: ${stockUpdate.productId}の在庫数を${stockUpdate.newStock}に更新しました`);
      setStockUpdate(null);
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('在庫更新エラー:', error);
      setError('在庫更新に失敗しました');
    }
  };
  
  // フィルターリセットハンドラー
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStockFilter('');
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="inventory-management-page">
      <div className="page-actions">
        <h1>在庫管理</h1>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="商品名またはIDで検索"
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category-filter">カテゴリ:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="form-control"
            >
              <option value="">すべて</option>
              {DUMMY_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="stock-filter">在庫状況:</label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={handleStockFilterChange}
              className="form-control"
            >
              <option value="">すべて</option>
              <option value="out">在庫なし (0)</option>
              <option value="low">在庫少 (1-10)</option>
              <option value="medium">在庫中 (11-50)</option>
              <option value="high">在庫多 (51以上)</option>
            </select>
          </div>
          
          <button
            className="btn secondary"
            onClick={handleResetFilters}
          >
            リセット
          </button>
        </div>
      </div>
      
      <div className="inventory-list">
        {filteredProducts.length > 0 ? (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>商品画像</th>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>価格</th>
                  <th>在庫数</th>
                  <th>ステータス</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      <div className="product-image">
                        <img src={product.imageUrl || 'https://placehold.jp/300x300.png'} alt={product.name} />
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>{product.categoryName}</td>
                    <td>¥{product.price.toLocaleString()}</td>
                    <td className={
                      product.stock === 0
                        ? 'stock-out'
                        : product.stock <= 10
                        ? 'stock-low'
                        : ''
                    }>
                      {stockUpdate && stockUpdate.productId === product.id ? (
                        <div className="stock-update-form">
                          <input
                            type="number"
                            min="0"
                            value={stockUpdate.newStock}
                            onChange={handleStockInputChange}
                            className="form-control"
                            autoFocus
                          />
                        </div>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <span className={`product-status status-${product.isPublished ? '公開' : '非公開'}`}>
                        {product.isPublished ? '公開' : '非公開'}
                      </span>
                    </td>
                    <td>
                      {stockUpdate && stockUpdate.productId === product.id ? (
                        <div className="action-buttons">
                          <button
                            className="btn-icon primary"
                            onClick={handleStockUpdate}
                            disabled={stockUpdate.isUpdating}
                          >
                            {stockUpdate.isUpdating ? '...' : '✓'}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={handleStockUpdateCancel}
                            disabled={stockUpdate.isUpdating}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn small"
                          onClick={() => handleStockUpdateStart(product.id, product.stock)}
                        >
                          在庫数変更
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>該当する商品がありません。フィルターを変更してください。</p>
            <button className="btn" onClick={handleResetFilters}>
              フィルターをリセット
            </button>
          </div>
        )}
      </div>
      
      <div className="inventory-summary">
        <div className="summary-card">
          <h3>在庫サマリー</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">総商品数:</span>
              <span className="stat-value">{products.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">在庫なし:</span>
              <span className="stat-value">{products.filter(p => p.stock === 0).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">在庫少:</span>
              <span className="stat-value">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
