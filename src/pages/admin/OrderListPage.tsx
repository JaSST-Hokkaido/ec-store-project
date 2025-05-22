import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
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
  SHIPPED: '発送済み',
  DELIVERED: '配達済み',
  CANCELED: 'キャンセル済み'
};

// 注文ステータスの色分け
const STATUS_COLORS = {
  'support.pending': '#f39c12', // 黄色
  'support.paid': '#3498db',    // 青
  'support.processing': '#9b59b6', // 紫
  'support.shipped': '#2ecc71', // 緑
  'support.delivered': '#27ae60', // 濃い緑
  'support.canceled': '#e74c3c', // 赤
};

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('view_orders') && !checkPermission('manage_orders')) {
      navigate('/admin/dashboard');
    }
  }, [checkPermission, navigate]);
  
  // 注文データの取得
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 実際はAPIからデータを取得
        // ここではダミーデータ
        const dummyOrders: Order[] = [
          {
            id: 'order-001',
            orderNumber: 'EC-20250510-001',
            orderDate: '2025-05-10T09:15:00Z',
            customerName: '田中 太郎',
            customerEmail: 'tanaka@example.com',
            totalAmount: 5480,
            status: 'PENDING',
            paymentMethod: 'クレジットカード',
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
            status: 'PAID',
            paymentMethod: 'コンビニ決済',
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
            status: 'PROCESSING',
            paymentMethod: '銀行振込',
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
            }
          },
          {
            id: 'order-005',
            orderNumber: 'EC-20250520-001',
            orderDate: '2025-05-20T10:00:00Z',
            customerName: '高橋 三郎',
            customerEmail: 'takahashi@example.com',
            totalAmount: 1200,
            status: 'DELIVERED',
            paymentMethod: 'コンビニ決済',
            items: [
              {
                id: 'item-006',
                productId: 4,
                productName: 'コーディング ノート',
                quantity: 1,
                price: 1200,
                subtotal: 1200
              }
            ],
            shippingAddress: {
              fullName: '高橋 三郎',
              postalCode: '810-0001',
              prefecture: '福岡県',
              city: '福岡市中央区',
              addressLine1: '天神1-1-1',
              phoneNumber: '092-123-4567'
            },
            billingAddress: {
              fullName: '高橋 三郎',
              postalCode: '810-0001',
              prefecture: '福岡県',
              city: '福岡市中央区',
              addressLine1: '天神1-1-1',
              phoneNumber: '092-123-4567'
            }
          },
          {
            id: 'order-006',
            orderNumber: 'EC-20250521-001',
            orderDate: '2025-05-21T15:30:00Z',
            customerName: '伊藤 四郎',
            customerEmail: 'ito@example.com',
            totalAmount: 4200,
            status: 'CANCELED',
            paymentMethod: '代金引換',
            items: [
              {
                id: 'item-007',
                productId: 5,
                productName: 'デベロッパー ポロシャツ',
                quantity: 1,
                price: 4200,
                subtotal: 4200
              }
            ],
            shippingAddress: {
              fullName: '伊藤 四郎',
              postalCode: '460-0001',
              prefecture: '愛知県',
              city: '名古屋市中区',
              addressLine1: '栄1-1-1',
              phoneNumber: '052-123-4567'
            },
            billingAddress: {
              fullName: '伊藤 四郎',
              postalCode: '460-0001',
              prefecture: '愛知県',
              city: '名古屋市中区',
              addressLine1: '栄1-1-1',
              phoneNumber: '052-123-4567'
            }
          }
        ];
        
        // 自店舗の注文のみを取得（本来はAPI側でフィルタリング）
        // ここではすべての注文を表示
        setOrders(dummyOrders);
        setFilteredOrders(dummyOrders);
        
      } catch (error) {
        console.error('注文データの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentAdmin]);
  
  // フィルタリング処理
  useEffect(() => {
    let result = [...orders];
    
    // 検索フィルター（注文番号、顧客名、メールアドレス）
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchLower) || 
        order.customerName.toLowerCase().includes(searchLower) || 
        order.customerEmail.toLowerCase().includes(searchLower)
      );
    }
    
    // ステータスフィルター
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }
    
    // 日付範囲フィルター（開始日）
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(order => new Date(order.orderDate) >= fromDate);
    }
    
    // 日付範囲フィルター（終了日）
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      // 終了日の23:59:59まで含める
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(order => new Date(order.orderDate) <= toDate);
    }
    
    // 金額範囲フィルター（最小）
    if (filters.minAmount) {
      const minAmount = Number(filters.minAmount);
      if (!isNaN(minAmount)) {
        result = result.filter(order => order.totalAmount >= minAmount);
      }
    }
    
    // 金額範囲フィルター（最大）
    if (filters.maxAmount) {
      const maxAmount = Number(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        result = result.filter(order => order.totalAmount <= maxAmount);
      }
    }
    
    // 最新順でソート
    result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    
    setFilteredOrders(result);
  }, [orders, filters]);
  
  // フィルター変更ハンドラー
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // フィルターリセットハンドラー
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };
  
  // 詳細ページへの遷移ハンドラー
  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
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
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="order-list-page">
      <div className="page-actions">
        <h1>注文一覧</h1>
      </div>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="注文番号、顧客名、メールアドレスで検索"
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">すべてのステータス</option>
              <option value="PENDING">支払い待ち</option>
              <option value="PAID">入金済み</option>
              <option value="PROCESSING">処理中</option>
              <option value="SHIPPED">発送済み</option>
              <option value="DELIVERED">配達済み</option>
              <option value="CANCELED">キャンセル済み</option>
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="dateFrom">注文日（開始）:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateTo">注文日（終了）:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="minAmount">金額（最小）:</label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              placeholder="0"
              min="0"
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="maxAmount">金額（最大）:</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              placeholder="100000"
              min="0"
              className="form-control"
            />
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
      
      <div className="order-list">
        {filteredOrders.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>注文番号</th>
                  <th>注文日時</th>
                  <th>顧客名</th>
                  <th>金額</th>
                  <th>ステータス</th>
                  <th>支払方法</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="order-number">
                      {order.orderNumber}
                    </td>
                    <td>
                      {formatDate(order.orderDate)}
                    </td>
                    <td>
                      <div>{order.customerName}</div>
                      <div className="email">{order.customerEmail}</div>
                    </td>
                    <td className="amount">
                      ¥{order.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      {renderStatus(order.status)}
                    </td>
                    <td>
                      {order.paymentMethod}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn small"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          詳細を表示
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>条件に一致する注文はありません。フィルターを変更してください。</p>
            <button className="btn" onClick={handleResetFilters}>
              フィルターをリセット
            </button>
          </div>
        )}
      </div>
      
      <div className="order-summary">
        <div className="summary-card">
          <h3>注文サマリー</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">総注文数:</span>
              <span className="stat-value">{filteredOrders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">総売上:</span>
              <span className="stat-value">
                ¥{filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
