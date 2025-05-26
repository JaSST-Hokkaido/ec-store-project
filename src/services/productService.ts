// 商品データ管理サービス
import { getItem, setItem, KEYS } from './storageService';
import { getCurrentUser } from './userService';
import { logUserActivity } from './demoService';

// 型定義
export interface Product {
  id: number;
  name: string;
  price: number;
  memberPrice: number;
  description: string;
  details: string;
  initialStock: number;
  category: string;
  tags: string[];
  imageUrl: string;
  thumbnails: string[];
  options: {
    sizes?: string[];
    colors?: string[];
  };
  related: number[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  new: boolean;
  dateAdded: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
  order: number;
}

export interface StockData {
  lastUpdated: string;
  stocks: Record<string, number>; // 商品ID: 在庫数
}

// キャッシュ
let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;

// 商品データ取得
export const getProducts = async (): Promise<Product[]> => {
  if (productsCache) return productsCache;
  
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
      throw new Error('商品データの取得に失敗しました');
    }
    productsCache = await response.json();
    return productsCache || [];
  } catch (error) {
    console.error('商品データの読み込みに失敗しました', error);
    return [];
  }
};

// 商品詳細取得
export const getProductById = async (id: number): Promise<Product | undefined> => {
  const products = await getProducts();
  return products.find(product => product.id === id);
};

// カテゴリーデータ取得
export const getCategories = async (): Promise<Category[]> => {
  if (categoriesCache) return categoriesCache;
  
  try {
    const response = await fetch('/data/categories.json');
    if (!response.ok) {
      throw new Error('カテゴリーデータの取得に失敗しました');
    }
    categoriesCache = await response.json();
    return categoriesCache || [];
  } catch (error) {
    console.error('カテゴリーデータの読み込みに失敗しました', error);
    return [];
  }
};

// カテゴリー詳細取得
export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const categories = await getCategories();
  return categories.find(category => category.slug === slug);
};

// 在庫データ操作
export const getStockData = (): StockData => {
  return getItem<StockData>(KEYS.SHARED_STOCK, { 
    lastUpdated: new Date().toISOString(), 
    stocks: {} 
  });
};

// 在庫データ初期化
export const initializeStockData = async (): Promise<void> => {
  try {
    const response = await fetch('/data/initial-stock.json');
    if (!response.ok) {
      throw new Error('在庫初期データの取得に失敗しました');
    }
    const initialStock = await response.json();
    setItem(KEYS.SHARED_STOCK, {
      lastUpdated: new Date().toISOString(),
      stocks: initialStock.stocks
    });
  } catch (error) {
    console.error('在庫初期データの読み込みに失敗しました', error);
    // フォールバック：商品データから初期在庫を設定
    const products = await getProducts();
    const stocks: Record<string, number> = {};
    products.forEach(product => {
      stocks[product.id.toString()] = product.initialStock;
    });
    setItem(KEYS.SHARED_STOCK, {
      lastUpdated: new Date().toISOString(),
      stocks
    });
  }
};

// 商品在庫の確認
export const checkProductStock = (productId: number): number => {
  const stockData = getStockData();
  return stockData.stocks[productId.toString()] || 0;
};

// 在庫の更新（購入時）
export const updateProductStock = (productId: number, quantity: number): boolean => {
  const stockData = getStockData();
  const currentStock = stockData.stocks[productId.toString()] || 0;
  
  if (currentStock < quantity) return false;
  
  stockData.stocks[productId.toString()] = currentStock - quantity;
  stockData.lastUpdated = new Date().toISOString();
  setItem(KEYS.SHARED_STOCK, stockData);
  
  // 在庫変更をログに記録
  const user = getCurrentUser();
  if (user) {
    logUserActivity(user.id, 'STOCK_UPDATED', { 
      productId, 
      quantity: -quantity, 
      newStock: stockData.stocks[productId.toString()] 
    });
  }
  
  return true;
};

// 在庫の復元（キャンセル時）
export const restoreProductStock = (productId: number, quantity: number): boolean => {
  const stockData = getStockData();
  
  stockData.stocks[productId.toString()] = (stockData.stocks[productId.toString()] || 0) + quantity;
  stockData.lastUpdated = new Date().toISOString();
  setItem(KEYS.SHARED_STOCK, stockData);
  
  // 在庫変更をログに記録
  const user = getCurrentUser();
  if (user) {
    logUserActivity(user.id, 'STOCK_RESTORED', { 
      productId, 
      quantity: quantity, 
      newStock: stockData.stocks[productId.toString()] 
    });
  }
  
  return true;
};

// 商品検索
export const searchProducts = async (query: string): Promise<Product[]> => {
  const products = await getProducts();
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// 関連商品取得
export const getRelatedProducts = async (productId: number): Promise<Product[]> => {
  const product = await getProductById(productId);
  if (!product) return [];
  
  const products = await getProducts();
  const relatedProducts: Product[] = [];
  
  // 明示的に関連付けられた商品
  for (const relatedId of product.related) {
    const relatedProduct = products.find(p => p.id === relatedId);
    if (relatedProduct) {
      relatedProducts.push(relatedProduct);
    }
  }
  
  // 同じカテゴリーの商品を追加（最大4つまで）
  const sameCategoryProducts = products
    .filter(p => p.category === product.category && p.id !== productId && !product.related.includes(p.id))
    .slice(0, 4 - relatedProducts.length);
  
  return [...relatedProducts, ...sameCategoryProducts];
};

// 特集商品取得
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => product.featured);
};

// 新着商品取得
export const getNewProducts = async (): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => product.new);
};

// カテゴリー別商品取得
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => product.category === category);
};

// 価格での商品価格計算（会員価格対応）
export const calculateProductPrice = (product: Product, isMember: boolean = false): number => {
  return isMember ? product.memberPrice : product.price;
};

// 在庫状況のチェック（複数商品対応）
export const checkMultipleProductsStock = (items: { productId: number; quantity: number }[]): boolean => {
  const stockData = getStockData();
  
  for (const item of items) {
    const currentStock = stockData.stocks[item.productId.toString()] || 0;
    if (currentStock < item.quantity) {
      return false;
    }
  }
  
  return true;
};
