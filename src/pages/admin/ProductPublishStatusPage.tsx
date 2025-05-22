import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  unpublishReason?: string;
  lastStatusChange?: string;
}

const ProductPublishStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [unpublishReason, setUnpublishReason] = useState('');
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('manage_products')) {
      navigate('/admin/dashboard');
    }
  }, [checkPermission, navigate]);
  
  // 商品データの取得
  useEffect(() => {
    if (!id) {
      setError('商品が選択されていません');
      return;
    }
    
    const fetchProduct = async () => {
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
            unpublishReason: '',
            lastStatusChange: '2025-05-15T14:30:00Z'
          },
          {
            id: 2,
            name: 'プログラマー マグカップ',
            category: 'cat-2',
            categoryName: 'アクセサリー',
            price: 1800,
            stock: 15,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png'
          },
          {
            id: 3,
            name: 'JaSST Hokkaido ステッカーセット',
            category: 'cat-3',
            categoryName: '文房具',
            price: 980,
            stock: 0,
            isPublished: false,
            imageUrl: 'https://placehold.jp/300x300.png',
            unpublishReason: '在庫切れのため一時的に非公開',
            lastStatusChange: '2025-05-01T10:20:00Z'
          },
          {
            id: 4,
            name: 'コーディング ノート',
            category: 'cat-3',
            categoryName: '文房具',
            price: 1200,
            stock: 42,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png'
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
            unpublishReason: '次期バージョンに変更予定のため',
            lastStatusChange: '2025-05-01T10:20:00Z'
          }
        ];
        
        const productId = parseInt(id);
        const foundProduct = dummyProducts.find(p => p.id === productId);
        
        if (!foundProduct) {
          throw new Error('商品が見つかりません');
        }
        
        setProduct(foundProduct);
        setUnpublishReason(foundProduct.unpublishReason || '');
      } catch (error) {
        console.error('商品データの取得エラー:', error);
        setError('指定された商品は存在しません');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // 公開状態更新ハンドラー
  const handleStatusUpdate = async () => {
    if (!product) {
      setError('商品が選択されていません');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    
    try {
      // 実際はAPIで更新処理
      // ここではフロントエンドだけで処理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 非公開→公開の場合は理由をクリア
      const newStatus = !product.isPublished;
      const updatedReason = newStatus ? '' : unpublishReason;
      
      // 商品データを更新
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isPublished: newStatus,
          unpublishReason: updatedReason,
          lastStatusChange: new Date().toISOString()
        };
      });
      
      // 成功メッセージを設定
      if (newStatus) {
        setSuccessMessage('商品を公開しました');
      } else {
        setSuccessMessage('商品を非公開にしました');
      }
      
      // 3秒後に商品一覧ページに戻る
      setTimeout(() => {
        navigate('/admin/products');
      }, 3000);
      
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      setError('ステータス更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 理由入力ハンドラー
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUnpublishReason(e.target.value);
  };
  
  // 商品一覧ページへ戻るハンドラー
  const handleBackToList = () => {
    navigate('/admin/products');
  };
  
  // 日付フォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (!product) {
    return (
      <div className="error-message">
        <p>{error || '商品が見つかりません'}</p>
        <button className="btn" onClick={handleBackToList}>
          商品一覧に戻る
        </button>
      </div>
    );
  }
  
  return (
    <div className="product-publish-status-page">
      <div className="page-header">
        <button
          className="back-button"
          onClick={handleBackToList}
        >
          ← 商品一覧に戻る
        </button>
      </div>
      
      <h1>商品公開設定</h1>
      
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
      
      <div className="publish-status-container">
        <div className="product-info-card">
          <div className="product-header">
            <div className="product-image">
              <img src={product.imageUrl || 'https://placehold.jp/300x300.png'} alt={product.name} />
            </div>
            
            <div className="product-details">
              <h2>{product.name}</h2>
              <p className="product-id">商品ID: {product.id}</p>
              <p className="product-category">カテゴリ: {product.categoryName}</p>
              <p className="product-price">価格: ¥{product.price.toLocaleString()}</p>
              <p className="product-stock">在庫: {product.stock} 個</p>
            </div>
          </div>
          
          <div className="current-status">
            <h3>現在の公開状態</h3>
            <div className="status-display">
              <span className={`status-badge status-${product.isPublished ? '公開' : '非公開'}`}>
                {product.isPublished ? '公開中' : '非公開'}
              </span>
              {product.lastStatusChange && (
                <span className="last-update">
                  最終更新: {formatDate(product.lastStatusChange)}
                </span>
              )}
            </div>
            
            {!product.isPublished && product.unpublishReason && (
              <div className="reason-display">
                <h4>非公開理由:</h4>
                <p>{product.unpublishReason}</p>
              </div>
            )}
          </div>
          
          <div className="status-update-section">
            <h3>公開状態の変更</h3>
            
            {!product.isPublished && (
              <div className="publish-action">
                <p>この商品を公開すると、ECサイトのフロントエンドに表示されるようになります。</p>
                <button
                  className="btn primary"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? '更新中...' : '公開に変更する'}
                </button>
              </div>
            )}
            
            {product.isPublished && (
              <div className="unpublish-action">
                <p>この商品を非公開にすると、ECサイトのフロントエンドに表示されなくなります。</p>
                
                <div className="reason-input">
                  <label htmlFor="unpublishReason">非公開理由（任意）:</label>
                  <textarea
                    id="unpublishReason"
                    value={unpublishReason}
                    onChange={handleReasonChange}
                    placeholder="例: 在庫切れ、シーズンオフ、商品リニューアル中 など"
                    rows={3}
                  />
                </div>
                
                <button
                  className="btn danger"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? '更新中...' : '非公開に変更する'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPublishStatusPage;
