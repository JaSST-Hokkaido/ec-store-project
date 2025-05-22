import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ダミーデータ（後でAPI連携に置き換え）
const products = [
  {
    id: 1,
    name: 'テクノベーシック Tシャツ',
    price: 3500,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: '柔らかな肌触りの綿100%Tシャツ。テクノロジーをモチーフにしたシンプルなデザイン。',
    details: '素材: 綿100%\nサイズ: S, M, L, XL\nカラー: ホワイト, ブラック, ネイビー',
    inStock: true,
    stock: 50
  },
  {
    id: 2,
    name: 'プログラマー マグカップ',
    price: 1800,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '生活雑貨',
    description: '大容量のマグカップ。プログラマーのための至高の一品。電子レンジ対応。',
    details: '素材: セラミック\n容量: 350ml\n電子レンジ: 対応\n食洗機: 対応',
    inStock: true,
    stock: 30
  },
  {
    id: 3,
    name: 'テクノラボ ステッカーセット',
    price: 980,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'ステーショナリー',
    description: '耐水性のあるテクノラボロゴステッカー10枚セット。PCやスマホなどに貼れます。',
    details: 'サイズ: 直径3cm～8cm（種類により異なる）\n素材: 耐水性ビニール\n枚数: 10枚',
    inStock: true,
    stock: 100
  },
  {
    id: 4,
    name: 'コーディング ノート',
    price: 1200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'ステーショナリー',
    description: 'プログラミングに最適な方眼罫のノート。コードスニペットの記録に便利。',
    details: 'サイズ: B5\nページ数: 80ページ\n罫線: 5mm方眼\n素材: 再生紙',
    inStock: true,
    stock: 45
  },
  {
    id: 5,
    name: 'デベロッパー ポロシャツ',
    price: 4200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: '通気性の良いポロシャツ。仕事でもカジュアルな場でも使える一枚。',
    details: '素材: 綿60%, ポリエステル40%\nサイズ: S, M, L, XL\nカラー: グレー, ネイビー',
    inStock: true,
    stock: 20
  },
  {
    id: 6,
    name: 'エンジニア 保温ボトル',
    price: 2500,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '生活雑貨',
    description: '12時間保温、24時間保冷可能なステンレスボトル。プログラミング中の水分補給に。',
    details: '素材: ステンレス（内側）, アルミニウム（外側）\n容量: 500ml\n保温効力: 12時間\n保冷効力: 24時間',
    inStock: false,
    stock: 0
  },
  {
    id: 7,
    name: 'テクノラボ ロゴキャップ',
    price: 3200,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: 'アパレル',
    description: 'シンプルなロゴ入りキャップ。サイズ調整可能でどなたでも着用できます。',
    details: '素材: 綿100%\nサイズ: フリー（後部アジャスター付き）\nカラー: ブラック, カーキ',
    inStock: true,
    stock: 15
  },
  {
    id: 8,
    name: 'プログラミング 参考書',
    price: 3800,
    imageUrl: 'https://placehold.jp/300x200.png',
    category: '書籍',
    description: '最新のプログラミング技術を網羅した参考書。初心者から上級者まで対応。',
    details: 'ページ数: 350ページ\n出版: テクノラボ出版\n発売日: 2023年1月\n対象: 初級～上級',
    inStock: true,
    stock: 28
  },
];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    // 実際のAPIの場合はここでデータをフェッチ
    const productId = parseInt(id || '0');
    const foundProduct = products.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
      
      // 商品オプションがあれば初期値を設定
      if (foundProduct.category === 'アパレル') {
        setSelectedOptions({ size: 'M', color: 'ブラック' });
      }
    }
    
    setIsLoading(false);
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleOptionChange = (option: string, value: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [option]: value
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // ここでカートに追加するロジックを実装（後で）
    alert(`${product.name}を${quantity}個カートに追加しました。`);
    
    // カート画面に遷移
    // navigate('/cart');
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-not-found">
          <h2>商品が見つかりませんでした</h2>
          <p>指定された商品IDの商品は存在しないか、削除された可能性があります。</p>
          <button onClick={() => navigate('/products')} className="btn">
            商品一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
          </div>
          
          <div className="product-info">
            <div className="breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">ホーム</span> &gt; 
              <span onClick={() => navigate('/products')} className="breadcrumb-link">商品一覧</span> &gt; 
              <span>{product.name}</span>
            </div>
            
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">¥{product.price.toLocaleString()}</div>
            <div className="product-description">{product.description}</div>
            
            <div className="product-details">
              <h3>商品詳細</h3>
              <pre>{product.details}</pre>
            </div>
            
            {product.category === 'アパレル' && (
              <div className="product-options">
                <div className="option-group">
                  <label>サイズ:</label>
                  <div className="option-buttons">
                    {['S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        className={`option-button ${selectedOptions.size === size ? 'selected' : ''}`}
                        onClick={() => handleOptionChange('size', size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="option-group">
                  <label>カラー:</label>
                  <div className="option-buttons">
                    {['ブラック', 'ホワイト', 'ネイビー', 'グレー'].map(color => (
                      <button
                        key={color}
                        className={`option-button ${selectedOptions.color === color ? 'selected' : ''}`}
                        onClick={() => handleOptionChange('color', color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="product-actions">
              <div className="quantity-selector">
                <label>数量:</label>
                <select value={quantity} onChange={handleQuantityChange}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="stock-status">
                {product.inStock ? (
                  <span className="in-stock">在庫あり（残り{product.stock}点）</span>
                ) : (
                  <span className="out-of-stock">在庫切れ</span>
                )}
              </div>
              
              <button 
                className="btn add-to-cart-btn"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                カートに追加
              </button>
            </div>
          </div>
        </div>
        
        <div className="related-products">
          <h2>関連商品</h2>
          <div className="product-grid small">
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map(relatedProduct => (
                <div className="card product-card" key={relatedProduct.id}>
                  <div className="card-image">
                    <img src={relatedProduct.imageUrl} alt={relatedProduct.name} />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{relatedProduct.name}</h3>
                    <div className="card-price">¥{relatedProduct.price.toLocaleString()}</div>
                    <button 
                      onClick={() => navigate(`/products/${relatedProduct.id}`)} 
                      className="btn small"
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
