import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// カテゴリのダミーデータ
const DUMMY_CATEGORIES = [
  { id: 'cat-1', name: '衣類' },
  { id: 'cat-2', name: 'アクセサリー' },
  { id: 'cat-3', name: '文房具' },
  { id: 'cat-4', name: '本・メディア' },
  { id: 'cat-5', name: 'その他' }
];

// 初期状態の商品データ
const initialProductState = {
  name: '',
  price: '',
  stock: '',
  description: '',
  category: '',
  images: [] as File[],
  isPublished: false
};

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [product, setProduct] = useState(initialProductState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  
  // 権限チェック
  if (!checkPermission('manage_products')) {
    return (
      <div className="permission-denied">
        <h2>権限がありません</h2>
        <p>この操作を行うには商品管理権限が必要です。</p>
        <button onClick={() => navigate('/admin/dashboard')} className="btn">
          ダッシュボードに戻る
        </button>
      </div>
    );
  }
  
  // 入力変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // チェックボックスの場合
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 画像アップロードハンドラー
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages = [...product.images];
    const newPreviews = [...previewImages];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 画像ファイルのみを許可
      if (!file.type.startsWith('image/')) continue;
      
      newImages.push(file);
      
      // プレビュー用URL生成
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newPreviews.push(reader.result);
          setPreviewImages([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setProduct(prev => ({ ...prev, images: newImages }));
  };
  
  // 画像削除ハンドラー
  const handleRemoveImage = (index: number) => {
    const newImages = [...product.images];
    const newPreviews = [...previewImages];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setProduct(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };
  
  // フォームバリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!product.name.trim()) {
      newErrors.name = '商品名は必須です';
    }
    
    if (!product.price.trim()) {
      newErrors.price = '価格は必須です';
    } else if (isNaN(Number(product.price)) || Number(product.price) < 0) {
      newErrors.price = '価格は0以上の数値で入力してください';
    }
    
    if (!product.stock.trim()) {
      newErrors.stock = '在庫数は必須です';
    } else if (isNaN(Number(product.stock)) || Number(product.stock) < 0) {
      newErrors.stock = '在庫数は0以上の数値で入力してください';
    }
    
    if (!product.category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 実際のAPIでは商品登録処理を行う
      // ここではダミーのデータ処理
      
      // 成功メッセージを表示
      setSuccess('商品が正常に登録されました');
      
      // フォームをリセット
      setProduct(initialProductState);
      setPreviewImages([]);
      
      // 3秒後に商品一覧ページに遷移
      setTimeout(() => {
        navigate('/admin/products');
      }, 3000);
      
    } catch (error) {
      console.error('商品登録エラー:', error);
      setErrors({ submit: '商品の登録に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="product-create-page">
      <div className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/admin/products')}
        >
          ← 商品一覧に戻る
        </button>
      </div>
      
      <h1>商品登録</h1>
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}
      
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>基本情報</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                商品名 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="商品名を入力"
                required
              />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="category">
                カテゴリ <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                required
              >
                <option value="">カテゴリを選択</option>
                {DUMMY_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <div className="error-text">{errors.category}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">
                価格 (円) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
              {errors.price && <div className="error-text">{errors.price}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="stock">
                在庫数 <span className="required">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
              {errors.stock && <div className="error-text">{errors.stock}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">商品説明</label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleInputChange}
              placeholder="商品の説明を入力"
              rows={5}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>商品画像</h3>
          
          <div className="image-upload-container">
            <label htmlFor="images" className="dropzone">
              <div className="upload-icon">📷</div>
              <div className="dropzone-text">
                クリックして画像をアップロード<br />
                <small>（複数選択可能）</small>
              </div>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            
            {previewImages.length > 0 && (
              <div className="thumbnail-list">
                {previewImages.map((preview, index) => (
                  <div className="thumbnail" key={index}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="thumbnail-remove"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>公開設定</h3>
          
          <div className="form-check">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={product.isPublished}
              onChange={handleInputChange}
            />
            <label htmlFor="isPublished">
              この商品を公開する（チェックしない場合は非公開として保存されます）
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate('/admin/products')}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '商品を登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreatePage;
