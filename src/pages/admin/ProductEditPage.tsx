import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// 商品データの型定義
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  isPublished: boolean;
  images: string[];
}

// カテゴリのダミーデータ
const DUMMY_CATEGORIES = [
  { id: 'cat-1', name: '衣類' },
  { id: 'cat-2', name: 'アクセサリー' },
  { id: 'cat-3', name: '文房具' },
  { id: 'cat-4', name: '本・メディア' },
  { id: 'cat-5', name: 'その他' }
];

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    isPublished: false
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('manage_products')) {
      navigate('/admin/dashboard');
    }
  }, [checkPermission, navigate]);
  
  // 商品データの取得
  useEffect(() => {
    if (!id) {
      navigate('/admin/products');
      return;
    }
    
    const fetchProduct = async () => {
      try {
        // 実際はAPIからデータを取得
        // ここではダミーデータを使用
        const dummyProducts: Product[] = [
          {
            id: 1,
            name: 'テクノベーシック Tシャツ',
            category: 'cat-1',
            price: 3500,
            stock: 58,
            description: '柔らかい素材で着心地の良いTシャツです。',
            isPublished: true,
            images: ['https://placehold.jp/300x300.png', 'https://placehold.jp/300x300.png']
          },
          {
            id: 2,
            name: 'プログラマー マグカップ',
            category: 'cat-2',
            price: 1800,
            stock: 15,
            description: 'プログラマーのためのマグカップです。',
            isPublished: true,
            images: ['https://placehold.jp/300x300.png']
          },
          {
            id: 3,
            name: 'JaSST Hokkaido ステッカーセット',
            category: 'cat-3',
            price: 980,
            stock: 120,
            description: 'JaSST北海道のステッカーセットです。',
            isPublished: true,
            images: ['https://placehold.jp/300x300.png', 'https://placehold.jp/300x300.png', 'https://placehold.jp/300x300.png']
          }
        ];
        
        const productId = parseInt(id);
        const foundProduct = dummyProducts.find(p => p.id === productId);
        
        if (!foundProduct) {
          throw new Error('商品が見つかりません');
        }
        
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name,
          category: foundProduct.category,
          price: foundProduct.price.toString(),
          stock: foundProduct.stock.toString(),
          description: foundProduct.description,
          isPublished: foundProduct.isPublished
        });
        setPreviewImages(foundProduct.images);
      } catch (error) {
        console.error('商品データの取得エラー:', error);
        alert('指定された商品は存在しません');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);
  
  // 入力変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // チェックボックスの場合
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    
    const newImagesArray = [...newImages];
    const newPreviewsArray = [...previewImages];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 画像ファイルのみを許可
      if (!file.type.startsWith('image/')) continue;
      
      newImagesArray.push(file);
      
      // プレビュー用URL生成
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newPreviewsArray.push(reader.result);
          setPreviewImages([...newPreviewsArray]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setNewImages(newImagesArray);
  };
  
  // 画像削除ハンドラー
  const handleRemoveImage = (index: number) => {
    const newPreviewsArray = [...previewImages];
    newPreviewsArray.splice(index, 1);
    setPreviewImages(newPreviewsArray);
    
    // 新しく追加した画像の場合は、newImagesからも削除
    if (index >= (product?.images.length || 0)) {
      const newImageIndex = index - (product?.images.length || 0);
      const newImagesArray = [...newImages];
      newImagesArray.splice(newImageIndex, 1);
      setNewImages(newImagesArray);
    }
  };
  
  // フォームバリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '商品名は必須です';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = '価格は必須です';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = '価格は0以上の数値で入力してください';
    }
    
    if (!formData.stock.trim()) {
      newErrors.stock = '在庫数は必須です';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = '在庫数は0以上の数値で入力してください';
    }
    
    if (!formData.category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product) return;
    
    setIsSubmitting(true);
    
    try {
      // 実際はAPIで更新処理
      // ここではダミーの更新処理
      
      // 更新成功メッセージを表示
      setSuccess('商品情報を更新しました');
      
      // 3秒後に商品一覧ページに遷移
      setTimeout(() => {
        navigate('/admin/products');
      }, 3000);
      
    } catch (error) {
      console.error('商品更新エラー:', error);
      setErrors({ submit: '商品情報の更新に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (!product) {
    return <div className="error-message">商品が見つかりません</div>;
  }
  
  return (
    <div className="product-edit-page">
      <div className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/admin/products')}
        >
          ← 商品一覧に戻る
        </button>
      </div>
      
      <h1>商品情報編集</h1>
      
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
                value={formData.name}
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
                value={formData.category}
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
                value={formData.price}
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
                value={formData.stock}
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
              value={formData.description}
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
              checked={formData.isPublished}
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
            {isSubmitting ? '更新中...' : '商品を更新'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;
