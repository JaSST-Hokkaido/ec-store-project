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
  memberPrice?: number;
  memberPriceStart?: string;
  memberPriceEnd?: string;
  stock: number;
  isPublished: boolean;
  imageUrl?: string;
}

const MemberPriceSettingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    memberPrice: '',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({
    memberPrice: '',
    dates: ''
  });
  
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
            memberPrice: 2800,
            memberPriceStart: '2025-05-01',
            memberPriceEnd: '2025-06-30',
            stock: 58,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png'
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
            memberPrice: 780,
            memberPriceStart: '2025-05-15',
            memberPriceEnd: '2025-05-31',
            stock: 120,
            isPublished: true,
            imageUrl: 'https://placehold.jp/300x300.png'
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
            imageUrl: 'https://placehold.jp/300x300.png'
          }
        ];
        
        const productId = parseInt(id);
        const foundProduct = dummyProducts.find(p => p.id === productId);
        
        if (!foundProduct) {
          throw new Error('商品が見つかりません');
        }
        
        setProduct(foundProduct);
        
        // フォームデータを初期化
        setFormData({
          memberPrice: foundProduct.memberPrice?.toString() || '',
          startDate: foundProduct.memberPriceStart || '',
          endDate: foundProduct.memberPriceEnd || ''
        });
        
      } catch (error) {
        console.error('商品データの取得エラー:', error);
        setError('指定された商品は存在しません');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // 入力フォーム変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (name === 'memberPrice') {
      setFormErrors(prev => ({ ...prev, memberPrice: '' }));
    } else if (name === 'startDate' || name === 'endDate') {
      setFormErrors(prev => ({ ...prev, dates: '' }));
    }
  };
  
  // 特典価格削除ハンドラー
  const handleRemoveMemberPrice = async () => {
    if (!product) return;
    
    setIsUpdating(true);
    setError('');
    
    try {
      // 実際はAPIで更新処理
      // ここではダミーの処理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 商品データを更新
      setProduct(prev => {
        if (!prev) return null;
        
        const updatedProduct = { ...prev };
        delete updatedProduct.memberPrice;
        delete updatedProduct.memberPriceStart;
        delete updatedProduct.memberPriceEnd;
        
        return updatedProduct;
      });
      
      // フォームデータをリセット
      setFormData({
        memberPrice: '',
        startDate: '',
        endDate: ''
      });
      
      setSuccessMessage('会員特典価格を削除しました');
      
      // 3秒後に商品一覧ページに戻る
      setTimeout(() => {
        navigate('/admin/products');
      }, 3000);
      
    } catch (error) {
      console.error('特典価格削除エラー:', error);
      setError('特典価格の削除に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    // バリデーション
    let isValid = true;
    const newErrors = {
      memberPrice: '',
      dates: ''
    };
    
    // 特典価格のバリデーション
    const memberPriceValue = Number(formData.memberPrice);
    if (!formData.memberPrice) {
      newErrors.memberPrice = '特典価格を入力してください';
      isValid = false;
    } else if (isNaN(memberPriceValue) || memberPriceValue <= 0) {
      newErrors.memberPrice = '特典価格は0より大きい数値で入力してください';
      isValid = false;
    } else if (memberPriceValue >= product.price) {
      newErrors.memberPrice = '特典価格は通常価格以下に設定してください';
      isValid = false;
    }
    
    // 日付のバリデーション（どちらか片方のみ設定されている場合）
    if ((formData.startDate && !formData.endDate) || (!formData.startDate && formData.endDate)) {
      newErrors.dates = '開始日と終了日の両方を設定するか、両方を空にしてください';
      isValid = false;
    }
    
    // 日付の範囲チェック
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.dates = '終了日は開始日以降に設定してください';
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    
    if (!isValid) return;
    
    setIsUpdating(true);
    setError('');
    
    try {
      // 実際はAPIで更新処理
      // ここではダミーの処理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 商品データを更新
      setProduct(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          memberPrice: memberPriceValue,
          memberPriceStart: formData.startDate || undefined,
          memberPriceEnd: formData.endDate || undefined
        };
      });
      
      setSuccessMessage('会員特典価格を設定しました');
      
      // 3秒後に商品一覧ページに戻る
      setTimeout(() => {
        navigate('/admin/products');
      }, 3000);
      
    } catch (error) {
      console.error('特典価格設定エラー:', error);
      setError('特典価格の登録に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 商品一覧ページへ戻るハンドラー
  const handleBackToList = () => {
    navigate('/admin/products');
  };
  
  // 割引率の計算
  const calculateDiscountRate = () => {
    if (!product || !formData.memberPrice) return null;
    
    const memberPriceValue = Number(formData.memberPrice);
    if (isNaN(memberPriceValue) || memberPriceValue <= 0) return null;
    
    const discountRate = ((product.price - memberPriceValue) / product.price) * 100;
    return Math.round(discountRate * 10) / 10; // 小数点第一位まで表示
  };
  
  // 特典価格が設定されているかの判定
  const hasMemberPrice = !!product?.memberPrice;
  
  // 適用期間のフォーマット
  const formatDateRange = () => {
    if (!product || !product.memberPriceStart || !product.memberPriceEnd) return '設定なし（無期限）';
    
    const startDate = new Date(product.memberPriceStart);
    const endDate = new Date(product.memberPriceEnd);
    
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    };
    
    return `${formatDate(startDate)} 〜 ${formatDate(endDate)}`;
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
    <div className="member-price-setting-page">
      <div className="page-header">
        <button
          className="back-button"
          onClick={handleBackToList}
        >
          ← 商品一覧に戻る
        </button>
      </div>
      
      <h1>会員特典価格設定</h1>
      
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
      
      <div className="member-price-container">
        <div className="product-info-card">
          <div className="product-header">
            <div className="product-image">
              <img src={product.imageUrl || 'https://placehold.jp/300x300.png'} alt={product.name} />
            </div>
            
            <div className="product-details">
              <h2>{product.name}</h2>
              <p className="product-id">商品ID: {product.id}</p>
              <p className="product-category">カテゴリ: {product.categoryName}</p>
              <p className="product-price">通常価格: <strong>¥{product.price.toLocaleString()}</strong></p>
              {hasMemberPrice && (
                <>
                  <p className="member-price">会員価格: <strong>¥{product.memberPrice?.toLocaleString()}</strong></p>
                  <p className="discount-rate">
                    （{(((product.price - (product.memberPrice || 0)) / product.price) * 100).toFixed(1)}% OFF）
                  </p>
                  <p className="date-range">適用期間: {formatDateRange()}</p>
                </>
              )}
              <p className="product-stock">在庫: {product.stock} 個</p>
              <p className="product-status">公開状態: {product.isPublished ? '公開中' : '非公開'}</p>
            </div>
          </div>
          
          <div className="member-price-form-container">
            <h3>{hasMemberPrice ? '会員特典価格の変更' : '会員特典価格の設定'}</h3>
            
            <form className="member-price-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="memberPrice">
                  会員価格 (円) <span className="required">*</span>
                </label>
                <div className="price-input-group">
                  <input
                    type="number"
                    id="memberPrice"
                    name="memberPrice"
                    value={formData.memberPrice}
                    onChange={handleInputChange}
                    placeholder={`通常価格 ¥${product.price.toLocaleString()} より低い価格`}
                    min="1"
                    max={product.price - 1}
                    required
                    disabled={isUpdating}
                  />
                  <span className="price-info">
                    {formData.memberPrice && !formErrors.memberPrice && (
                      <>
                        <span className="discount-value">
                          {calculateDiscountRate()}% OFF
                        </span>
                        <span className="price-diff">
                          (通常価格から ¥{(product.price - Number(formData.memberPrice)).toLocaleString()} 引き)
                        </span>
                      </>
                    )}
                  </span>
                </div>
                {formErrors.memberPrice && (
                  <div className="error-text">{formErrors.memberPrice}</div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">適用開始日（任意）</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endDate">適用終了日（任意）</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              
              {formErrors.dates && (
                <div className="error-text">{formErrors.dates}</div>
              )}
              
              <div className="date-note">
                <p>※ 開始日と終了日を両方入力すると、その期間のみ特典価格が適用されます。</p>
                <p>※ 期間を設定しない場合は、無期限で適用されます。</p>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleBackToList}
                  disabled={isUpdating}
                >
                  キャンセル
                </button>
                
                {hasMemberPrice && (
                  <button
                    type="button"
                    className="btn danger"
                    onClick={handleRemoveMemberPrice}
                    disabled={isUpdating}
                  >
                    {isUpdating ? '処理中...' : '特典価格を削除'}
                  </button>
                )}
                
                <button
                  type="submit"
                  className="btn primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? '設定中...' : (hasMemberPrice ? '特典価格を更新' : '特典価格を設定')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPriceSettingPage;
