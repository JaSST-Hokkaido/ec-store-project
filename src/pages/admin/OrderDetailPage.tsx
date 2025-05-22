import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// 注文データの型定義
interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  shippingFee: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
}

// 注文商品の型定義
interface OrderItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// 住所の型定義
interface Address {
  fullName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  phoneNumber: string;
}

// 注文ステータスの定義
const ORDER_STATUSES = {
  PENDING: '支払い待ち',
  PAID: '入金済み',
  PROCESSING: '処理中',
  READY_TO_SHIP: '出荷待ち',
  SHIPPED: '発送済み',
  DELIVERED: '配達済み',
  CANCELED: 'キャンセル済み'
};

// 決済ステータスの定義
const PAYMENT_STATUSES = {
  PENDING: '未決済',
  PAID: '決済済み',
  REFUNDED: '返金済み',
  FAILED: '決済失敗'
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkPermission } = useAdminAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('view_orders') && !checkPermission('manage_orders')) {
      navigate('/admin/dashboard');
    }
  }, [checkPermission, navigate]);
  
  // 注文データの取得
  useEffect(() => {
    if (!id) {
      navigate('/admin/orders');
      return;
    }
    
    const fetchOrder = async () => {
      try {
        // 実際はAPIからデータを取得
        // ここではダミーデータ
        const dummyOrders = [
          {
            id: 'order-001',
            orderNumber: 'EC-20250510-001',
            orderDate: '2025-05-10T09:15:00Z',
            customerName: '田中 太郎',
            customerEmail: 'tanaka@example.com',
            totalAmount: 5480,
            status: 'PROCESSING',
            paymentMethod: 'クレジットカード',
            paymentStatus: 'PAID',
            shippingMethod: '宅配便',
            shippingFee: 550,
            items: [
              {
                id: 'item-001',
                productId: 1,
                productName: 'テクノベーシック Tシャツ',
                quantity: 1,
                price: 3500,
                subtotal: 3500
              },
              {
                id: 'item-002',
                productId: 2,
                productName: 'プログラマー マグカップ',
                quantity: 1,
                price: 1800,
                subtotal: 1800
              }
            ],
            shippingAddress: {
              fullName: '田中 太郎',
              postalCode: '100-0001',
              prefecture: '東京都',
              city: '千代田区',
              addressLine1: '千代田1-1-1',
              addressLine2: 'マンション101',
              phoneNumber: '03-1234-5678'
            },
            billingAddress: {
              fullName: '田中 太郎',
              postalCode: '100-0001',
              prefecture: '東京都',
              city: '千代田区',
              addressLine1: '千代田1-1-1',
              addressLine2: 'マンション101',
              phoneNumber: '03-1234-5678'
            }
          },
          {
            id: 'order-002',
            orderNumber: 'EC-20250512-001',
            orderDate: '2025-05-12T14:30:00Z',
            customerName: '佐藤 花子',
            customerEmail: 'sato@example.com',
            totalAmount: 980,
            status: 'READY_TO_SHIP',
            paymentMethod: 'コンビニ決済',
            paymentStatus: 'PAID',
            shippingMethod: 'メール便',
            shippingFee: 200,
            items: [
              {
                id: 'item-003',
                productId: 3,
                productName: 'JaSST Hokkaido ステッカーセット',
                quantity: 1,
                price: 980,
                subtotal: 980
              }
            ],
            shippingAddress: {
              fullName: '佐藤 花子',
              postalCode: '060-0001',
              prefecture: '北海道',
              city: '札幌市中央区',
              addressLine1: '北1条西1丁目',
              phoneNumber: '011-123-4567'
            },
            billingAddress: {
              fullName: '佐藤 花子',
              postalCode: '060-0001',
              prefecture: '北海道',
              city: '札幌市中央区',
              addressLine1: '北1条西1丁目',
              phoneNumber: '011-123-4567'
            }
          },
          {
            id: 'order-003',
            orderNumber: 'EC-20250515-001',
            orderDate: '2025-05-15T11:45:00Z',
            customerName: '鈴木 一郎',
            customerEmail: 'suzuki@example.com',
            totalAmount: 8400,
            status: 'PENDING',
            paymentMethod: '銀行振込',
            paymentStatus: 'PENDING',
            shippingMethod: '宅配便',
            shippingFee: 550,
            items: [
              {
                id: 'item-004',
                productId: 5,
                productName: 'デベロッパー ポロシャツ',
                quantity: 2,
                price: 4200,
                subtotal: 8400
              }
            ],
            shippingAddress: {
              fullName: '鈴木 一郎',
              postalCode: '530-0001',
              prefecture: '大阪府',
              city: '大阪市北区',
              addressLine1: '梅田1-1-1',
              addressLine2: 'グランドタワー10F',
              phoneNumber: '06-1234-5678'
            },
            billingAddress: {
              fullName: '鈴木 一郎',
              postalCode: '530-0001',
              prefecture: '大阪府',
              city: '大阪市北区',
              addressLine1: '梅田1-1-1',
              addressLine2: 'グランドタワー10F',
              phoneNumber: '06-1234-5678'
            }
          },
          {
            id: 'order-004',
            orderNumber: 'EC-20250518-001',
            orderDate: '2025-05-18T16:20:00Z',
            customerName: '山田 次郎',
            customerEmail: 'yamada@example.com',
            totalAmount: 2800,
            status: 'SHIPPED',
            paymentMethod: 'クレジットカード',
            paymentStatus: 'PAID',
            shippingMethod: '宅配便',
            shippingFee: 550,
            items: [
              {
                id: 'item-005',
                productId: 6,
                productName: 'プログラミング解説本',
                quantity: 1,
                price: 2800,
                subtotal: 2800
              }
            ],
            shippingAddress: {
              fullName: '山田 次郎',
              postalCode: '980-0001',
              prefecture: '宮城県',
              city: '仙台市青葉区',
              addressLine1: '中央1-1-1',
              phoneNumber: '022-123-4567'
            },
            billingAddress: {
              fullName: '山田 次郎',
              postalCode: '980-0001',
              prefecture: '宮城県',
              city: '仙台市青葉区',
              addressLine1: '中央1-1-1',
              phoneNumber: '022-123-4567'
            },
            notes: '配送時間指定：18-20時'
          }
        ];
        
        const foundOrder = dummyOrders.find(order => order.id === id);
        
        if (!foundOrder) {
          throw new Error('注文が見つかりません');
        }
        
        setOrder(foundOrder);
        setStatusUpdate(foundOrder.status);
      } catch (error) {
        console.error('注文データの取得エラー:', error);
        setError('指定された注文は存在しません');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, navigate]);
  
  // ステータス変更ハンドラー
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusUpdate(e.target.value);
    // エラーメッセージをクリア
    setError('');
    setSuccessMessage('');
  };
  
  // ステータス更新ハンドラー
  const handleUpdateStatus = async () => {
    if (!order) return;
    
    // 更新対象の注文IDが未指定の場合
    if (!id) {
      setError('更新対象の注文が選択されていません');
      return;
    }
    
    // 現在のステータスと同じ場合は更新しない
    if (statusUpdate === order.status) {
      return;
    }
    
    setIsUpdating(true);
    setError('');
    
    try {
      // 実際はAPIで更新処理
      // ここではダミーの処理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 注文データを更新
      setOrder(prev => {
        if (!prev) return null;
        return { ...prev, status: statusUpdate };
      });
      
      setSuccessMessage('出荷ステータスを更新しました');
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('注文ステータス更新エラー:', error);
      setError('出荷ステータスの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 注文一覧ページへ戻るハンドラー
  const handleBackToList = () => {
    navigate('/admin/orders');
  };
  
  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 注文ステータスの表示
  const renderStatus = (status: string) => {
    let statusText = '';
    let statusClass = '';
    
    switch (status) {
      case 'PENDING':
        statusText = ORDER_STATUSES.PENDING;
        statusClass = 'status-pending';
        break;
      case 'PAID':
        statusText = ORDER_STATUSES.PAID;
        statusClass = 'status-paid';
        break;
      case 'PROCESSING':
        statusText = ORDER_STATUSES.PROCESSING;
        statusClass = 'status-processing';
        break;
      case 'READY_TO_SHIP':
        statusText = ORDER_STATUSES.READY_TO_SHIP;
        statusClass = 'status-ready';
        break;
      case 'SHIPPED':
        statusText = ORDER_STATUSES.SHIPPED;
        statusClass = 'status-shipped';
        break;
      case 'DELIVERED':
        statusText = ORDER_STATUSES.DELIVERED;
        statusClass = 'status-delivered';
        break;
      case 'CANCELED':
        statusText = ORDER_STATUSES.CANCELED;
        statusClass = 'status-canceled';
        break;
      default:
        statusText = status;
        statusClass = '';
    }
    
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };
  
  // 決済ステータスの表示
  const renderPaymentStatus = (status: string) => {
    let statusText = '';
    let statusClass = '';
    
    switch (status) {
      case 'PENDING':
        statusText = PAYMENT_STATUSES.PENDING;
        statusClass = 'status-pending';
        break;
      case 'PAID':
        statusText = PAYMENT_STATUSES.PAID;
        statusClass = 'status-paid';
        break;
      case 'REFUNDED':
        statusText = PAYMENT_STATUSES.REFUNDED;
        statusClass = 'status-refunded';
        break;
      case 'FAILED':
        statusText = PAYMENT_STATUSES.FAILED;
        statusClass = 'status-failed';
        break;
      default:
        statusText = status;
        statusClass = '';
    }
    
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (!order) {
    return (
      <div className="error-message">
        <p>{error || '注文が見つかりません'}</p>
        <button className="btn" onClick={handleBackToList}>
          注文一覧に戻る
        </button>
      </div>
    );
  }
  
  return (
    <div className="order-detail-page">
      <div className="page-header">
        <button
          className="back-button"
          onClick={handleBackToList}
        >
          ← 注文一覧に戻る
        </button>
      </div>
      
      <h1>注文詳細</h1>
      
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
      
      <div className="order-detail-container">
        <div className="order-header">
          <div className="order-number">
            <h2>注文番号: {order.orderNumber}</h2>
            <p>注文日時: {formatDate(order.orderDate)}</p>
          </div>
          
          <div className="order-status-section">
            <div className="current-status">
              <h3>現在のステータス</h3>
              {renderStatus(order.status)}
            </div>
            
            {checkPermission('manage_orders') && (
              <div className="status-update">
                <h3>ステータス更新</h3>
                <div className="status-update-form">
                  <select 
                    value={statusUpdate} 
                    onChange={handleStatusChange}
                    className="form-control"
                    disabled={isUpdating}
                  >
                    <option value="PENDING">{ORDER_STATUSES.PENDING}</option>
                    <option value="PAID">{ORDER_STATUSES.PAID}</option>
                    <option value="PROCESSING">{ORDER_STATUSES.PROCESSING}</option>
                    <option value="READY_TO_SHIP">{ORDER_STATUSES.READY_TO_SHIP}</option>
                    <option value="SHIPPED">{ORDER_STATUSES.SHIPPED}</option>
                    <option value="DELIVERED">{ORDER_STATUSES.DELIVERED}</option>
                    <option value="CANCELED">{ORDER_STATUSES.CANCELED}</option>
                  </select>
                  <button
                    className="btn primary"
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || statusUpdate === order.status}
                  >
                    {isUpdating ? '更新中...' : 'ステータスを更新'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="order-info-grid">
          <div className="customer-info card">
            <h3>顧客情報</h3>
            <p><strong>名前:</strong> {order.customerName}</p>
            <p><strong>メールアドレス:</strong> {order.customerEmail}</p>
          </div>
          
          <div className="payment-info card">
            <h3>支払い情報</h3>
            <p><strong>支払い方法:</strong> {order.paymentMethod}</p>
            <p>
              <strong>支払い状況:</strong> {renderPaymentStatus(order.paymentStatus)}
            </p>
            <p><strong>合計金額:</strong> ¥{order.totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="shipping-info card">
            <h3>配送情報</h3>
            <p><strong>配送方法:</strong> {order.shippingMethod}</p>
            <p><strong>配送料:</strong> ¥{order.shippingFee.toLocaleString()}</p>
            {order.notes && (
              <p><strong>備考:</strong> {order.notes}</p>
            )}
          </div>
        </div>
        
        <div className="address-section">
          <div className="shipping-address card">
            <h3>配送先住所</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>〒{order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.prefecture}{order.shippingAddress.city}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>電話番号: {order.shippingAddress.phoneNumber}</p>
          </div>
          
          <div className="billing-address card">
            <h3>請求先住所</h3>
            <p>{order.billingAddress.fullName}</p>
            <p>〒{order.billingAddress.postalCode}</p>
            <p>{order.billingAddress.prefecture}{order.billingAddress.city}</p>
            <p>{order.billingAddress.addressLine1}</p>
            {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
            <p>電話番号: {order.billingAddress.phoneNumber}</p>
          </div>
        </div>
        
        <div className="order-items card">
          <h3>注文商品</h3>
          <div className="table-responsive">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>単価</th>
                  <th>数量</th>
                  <th>小計</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>¥{item.price.toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td>¥{item.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="total-label">商品小計</td>
                  <td>¥{order.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="total-label">配送料</td>
                  <td>¥{order.shippingFee.toLocaleString()}</td>
                </tr>
                <tr className="grand-total">
                  <td colSpan={3} className="total-label">合計</td>
                  <td>¥{order.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
