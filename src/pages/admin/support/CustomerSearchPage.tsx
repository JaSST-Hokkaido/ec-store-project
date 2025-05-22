import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 顧客データの型定義
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
  };
  membershipLevel: 'regular' | 'silver' | 'gold' | 'platinum';
  registeredDate: string;
  lastLoginDate?: string;
  totalOrderCount: number;
  totalSpent: number;
  availablePoints: number;
  activeCoupons: number;
  hasCancelledOrders: boolean;
  hasActiveInquiries: boolean;
}

const CustomerSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 検索パラメーター
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [hasPurchasedFilter, setHasPurchasedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('registeredDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('view_customers')) {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate, checkPermission]);
  
  // URLから検索パラメータを取得
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromParams = params.get('search');
    if (searchFromParams) {
      setSearchTerm(searchFromParams);
    }
  }, [location.search]);
  
  // 顧客データの取得
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // 実際はAPIからデータを取得
        // ダミーデータを使用
        const dummyCustomers: Customer[] = [
          {
            id: 'cust-001',
            name: '山田 太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
            address: {
              postalCode: '123-4567',
              prefecture: '東京都',
              city: '新宿区',
              address1: '新宿1-1-1',
              address2: 'マンション101'
            },
            membershipLevel: 'gold',
            registeredDate: '2024-06-15T09:30:00Z',
            lastLoginDate: '2025-05-20T10:15:00Z',
            totalOrderCount: 12,
            totalSpent: 145000,
            availablePoints: 1450,
            activeCoupons: 2,
            hasCancelledOrders: false,
            hasActiveInquiries: true
          },
          {
            id: 'cust-002',
            name: '鈴木 花子',
            email: 'suzuki@example.com',
            phone: '080-9876-5432',
            address: {
              postalCode: '234-5678',
              prefecture: '大阪府',
              city: '大阪市',
              address1: '中央区1-2-3'
            },
            membershipLevel: 'silver',
            registeredDate: '2024-08-20T14:45:00Z',
            lastLoginDate: '2025-05-19T16:30:00Z',
            totalOrderCount: 5,
            totalSpent: 42000,
            availablePoints: 420,
            activeCoupons: 1,
            hasCancelledOrders: true,
            hasActiveInquiries: false
          },
          {
            id: 'cust-003',
            name: '佐藤 健',
            email: 'sato@example.com',
            phone: '070-1122-3344',
            address: {
              postalCode: '345-6789',
              prefecture: '北海道',
              city: '札幌市',
              address1: '中央区北2条西5丁目'
            },
            membershipLevel: 'platinum',
            registeredDate: '2024-02-10T11:15:00Z',
            lastLoginDate: '2025-05-21T09:20:00Z',
            totalOrderCount: 28,
            totalSpent: 320000,
            availablePoints: 3200,
            activeCoupons: 3,
            hasCancelledOrders: false,
            hasActiveInquiries: false
          },
          {
            id: 'cust-004',
            name: '田中 美咲',
            email: 'tanaka@example.com',
            membershipLevel: 'regular',
            registeredDate: '2025-01-05T16:20:00Z',
            totalOrderCount: 0,
            totalSpent: 0,
            availablePoints: 0,
            activeCoupons: 0,
            hasCancelledOrders: false,
            hasActiveInquiries: false
          },
          {
            id: 'cust-005',
            name: '高橋 誠',
            email: 'takahashi@example.com',
            phone: '090-5566-7788',
            address: {
              postalCode: '567-8901',
              prefecture: '福岡県',
              city: '福岡市',
              address1: '博多区1-4-5',
              address2: 'ハイツ202'
            },
            membershipLevel: 'regular',
            registeredDate: '2024-11-12T10:10:00Z',
            lastLoginDate: '2025-05-18T13:45:00Z',
            totalOrderCount: 2,
            totalSpent: 15800,
            availablePoints: 158,
            activeCoupons: 1,
            hasCancelledOrders: false,
            hasActiveInquiries: true
          }
        ];
        
        setCustomers(dummyCustomers);
        setFilteredCustomers(dummyCustomers);
      } catch (error) {
        console.error('顧客データの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // 検索とフィルタリング
  useEffect(() => {
    let filtered = [...customers];
    
    // 検索フィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.phone && customer.phone.includes(term)) ||
        (customer.address && 
          (customer.address.postalCode.includes(term) ||
           customer.address.prefecture.toLowerCase().includes(term) ||
           customer.address.city.toLowerCase().includes(term) ||
           customer.address.address1.toLowerCase().includes(term) ||
           (customer.address.address2 && customer.address.address2.toLowerCase().includes(term))))
      );
    }
    
    // 会員ランクフィルタリング
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(customer => customer.membershipLevel === membershipFilter);
    }
    
    // 購入有無フィルタリング
    if (hasPurchasedFilter === 'yes') {
      filtered = filtered.filter(customer => customer.totalOrderCount > 0);
    } else if (hasPurchasedFilter === 'no') {
      filtered = filtered.filter(customer => customer.totalOrderCount === 0);
    }
    
    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'registeredDate') {
        comparison = new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
      } else if (sortField === 'lastLoginDate') {
        // 最終ログインがない場合は一番古い日付とみなす
        const aTime = a.lastLoginDate ? new Date(a.lastLoginDate).getTime() : 0;
        const bTime = b.lastLoginDate ? new Date(b.lastLoginDate).getTime() : 0;
        comparison = aTime - bTime;
      } else if (sortField === 'totalOrderCount') {
        comparison = a.totalOrderCount - b.totalOrderCount;
      } else if (sortField === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, membershipFilter, hasPurchasedFilter, sortField, sortDirection]);
  
  // ソート切り替え
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // 新しいフィールドでソートする場合はデフォルトで降順
    }
  };
  
  // 顧客詳細ページへ移動
  const handleViewCustomer = (id: string) => {
    navigate(`/admin/customers/${id}`);
  };
  
  // 会員ランクに応じたクラス名を取得
  const getMembershipClass = (level: string) => {
    switch (level) {
      case 'platinum': return 'membership-platinum';
      case 'gold': return 'membership-gold';
      case 'silver': return 'membership-silver';
      case 'regular': return 'membership-regular';
      default: return '';
    }
  };
  
  // 会員ランクに応じた表示名を取得
  const getMembershipLabel = (level: string) => {
    switch (level) {
      case 'platinum': return 'プラチナ';
      case 'gold': return 'ゴールド';
      case 'silver': return 'シルバー';
      case 'regular': return '一般';
      default: return level;
    }
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="customer-search-page">
      <div className="page-header">
        <h1>顧客情報検索</h1>
      </div>
      
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="名前、メール、電話番号、住所で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="membership-filter">会員ランク:</label>
            <select
              id="membership-filter"
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">すべて</option>
              <option value="regular">一般</option>
              <option value="silver">シルバー</option>
              <option value="gold">ゴールド</option>
              <option value="platinum">プラチナ</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="purchased-filter">購入実績:</label>
            <select
              id="purchased-filter"
              value={hasPurchasedFilter}
              onChange={(e) => setHasPurchasedFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">すべて</option>
              <option value="yes">購入あり</option>
              <option value="no">購入なし</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="customer-list">
        {filteredCustomers.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th 
                    className={`sortable ${sortField === 'name' ? 'sorted' : ''}`}
                    onClick={() => handleSort('name')}
                  >
                    顧客名
                    {sortField === 'name' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th>メールアドレス</th>
                  <th>会員ランク</th>
                  <th 
                    className={`sortable ${sortField === 'registeredDate' ? 'sorted' : ''}`}
                    onClick={() => handleSort('registeredDate')}
                  >
                    登録日
                    {sortField === 'registeredDate' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'lastLoginDate' ? 'sorted' : ''}`}
                    onClick={() => handleSort('lastLoginDate')}
                  >
                    最終ログイン
                    {sortField === 'lastLoginDate' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'totalOrderCount' ? 'sorted' : ''}`}
                    onClick={() => handleSort('totalOrderCount')}
                  >
                    注文回数
                    {sortField === 'totalOrderCount' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'totalSpent' ? 'sorted' : ''}`}
                    onClick={() => handleSort('totalSpent')}
                  >
                    累計購入額
                    {sortField === 'totalSpent' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th>ステータス</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div>{customer.name}</div>
                      {customer.phone && <div className="secondary-text">{customer.phone}</div>}
                    </td>
                    <td>{customer.email}</td>
                    <td>
                      <span className={`membership-badge ${getMembershipClass(customer.membershipLevel)}`}>
                        {getMembershipLabel(customer.membershipLevel)}
                      </span>
                    </td>
                    <td>{new Date(customer.registeredDate).toLocaleDateString('ja-JP')}</td>
                    <td>
                      {customer.lastLoginDate
                        ? new Date(customer.lastLoginDate).toLocaleDateString('ja-JP')
                        : '未ログイン'}
                    </td>
                    <td>{customer.totalOrderCount}回</td>
                    <td>¥{customer.totalSpent.toLocaleString()}</td>
                    <td>
                      {customer.hasActiveInquiries && (
                        <span className="status-indicator inquiry-active" title="未解決の問い合わせあり">📝</span>
                      )}
                      {customer.hasCancelledOrders && (
                        <span className="status-indicator cancel-history" title="キャンセル履歴あり">❌</span>
                      )}
                      {customer.activeCoupons > 0 && (
                        <span className="status-indicator has-coupons" title={`クーポン ${customer.activeCoupons}枚 保有`}>🎟️</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleViewCustomer(customer.id)}
                        title="詳細を表示"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>顧客が見つかりませんでした。検索条件を変更してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearchPage;
