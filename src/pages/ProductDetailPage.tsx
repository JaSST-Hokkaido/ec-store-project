import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageTitle from '../utils/PageTitle';
import { getProductById, checkProductStock, getRelatedProducts, Product } from '../services/productService';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [stock, setStock] = useState(0);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productId = parseInt(id || '0');
        const foundProduct = await getProductById(productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // 在庫数を取得
          const currentStock = checkProductStock(productId);
          setStock(currentStock);
          
          // 商品オプションがあれば初期値を設定
          if (foundProduct.category === 'アパレル') {
            // オプションの初期値を設定
            const defaultSize = foundProduct.options.sizes?.[0] || 'M';
            const defaultColor = foundProduct.options.colors?.[0] || 'ブラック';
            setSelectedOptions({ size: defaultSize, color: defaultColor });
          }
          
          // 関連商品を取得
          const related = await getRelatedProducts(productId);
          setRelatedProducts(related);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('商品データの取得に失敗しました:', error);
        setIsLoading(false);
      }
    };
    
    loadProduct();
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

  const handleAddToCart = async () => {
    if (!product) return;
    
    const success = await addToCart({
      id: product.id,
      name: product.name,
      price: currentUser ? product.memberPrice : product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      options: product.category === 'アパレル' ? selectedOptions : undefined
    });
    
    if (success) {
      alert(`${product.name}を${quantity}個カートに追加しました。`);
      
      // 在庫を再チェック
      const newStock = checkProductStock(product.id);
      setStock(newStock);
    } else {
      alert('在庫が不足しています。');
    }
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!product) {
    return (
      <div className="container">
        <PageTitle title="商品が見つかりません" />
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

  const displayPrice = currentUser ? product.memberPrice : product.price;
  const inStock = stock > 0;

  return (
    <div className="product-detail-page">
      <PageTitle 
        title={product.name} 
        description={product.description}
      />
      <div className="container">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            {product.new && <div className="product-badge new">NEW</div>}
            {product.featured && <div className="product-badge featured">注目</div>}
          </div>
          
          <div className="product-info">
            <div className="breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">ホーム</span> &gt; 
              <span onClick={() => navigate('/products')} className="breadcrumb-link">商品一覧</span> &gt; 
              <span>{product.name}</span>
            </div>
            
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price">
              {currentUser && displayPrice < product.price && (
                <>
                  <span className="original-price">通常価格: ¥{product.price.toLocaleString()}</span>
                  <br />
                  <span className="member-price-label">会員価格: </span>
                </>
              )}
              <span className="current-price">¥{displayPrice.toLocaleString()}</span>
            </div>
            
            <div className="product-description">{product.description}</div>
            
            <div className="product-details">
              <h3>商品詳細</h3>
              <pre>{product.details}</pre>
            </div>
            
            {product.category === 'アパレル' && (
              <div className="product-options">
                {product.options.sizes && (
                  <div className="option-group">
                    <label>サイズ:</label>
                    <div className="option-buttons">
                      {product.options.sizes.map(size => (
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
                )}
                
                {product.options.colors && (
                  <div className="option-group">
                    <label>カラー:</label>
                    <div className="option-buttons">
                      {product.options.colors.map(color => (
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
                )}
              </div>
            )}
            
            <div className="product-actions">
              <div className="quantity-selector">
                <label>数量:</label>
                <select value={quantity} onChange={handleQuantityChange}>
                  {[...Array(Math.min(stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="stock-status">
                {inStock ? (
                  <>
                    <span className="in-stock">在庫あり</span>
                    {stock <= 5 && <span className="stock-warning">（残り{stock}点）</span>}
                  </>
                ) : (
                  <span className="out-of-stock">在庫切れ</span>
                )}
              </div>
              
              <button 
                className="btn add-to-cart-btn"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                カートに追加
              </button>
            </div>
            
            <div className="product-tags">
              {product.tags.map(tag => (
                <span key={tag} className="product-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>関連商品</h2>
            <div className="product-grid small">
              {relatedProducts.slice(0, 4).map(relatedProduct => {
                const relatedStock = checkProductStock(relatedProduct.id);
                const relatedPrice = currentUser ? relatedProduct.memberPrice : relatedProduct.price;
                
                return (
                  <div className="card product-card" key={relatedProduct.id}>
                    <div className="card-image">
                      <img src={relatedProduct.imageUrl} alt={relatedProduct.name} />
                      {relatedStock === 0 && <div className="out-of-stock">売切れ</div>}
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">{relatedProduct.name}</h3>
                      <div className="card-price">
                        {currentUser && relatedPrice < relatedProduct.price && (
                          <span className="member-discount">会員価格 </span>
                        )}
                        ¥{relatedPrice.toLocaleString()}
                      </div>
                      <button 
                        onClick={() => navigate(`/products/${relatedProduct.id}`)} 
                        className="btn small"
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
