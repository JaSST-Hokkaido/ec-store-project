import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 問い合わせデータの型定義
interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  content: string;
  status: 'new' | 'processing' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  category: string;
  relatedOrderId?: string;
}

const InquiryListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 権限チェック
  useEffect(() => {
    if (!checkPermission('view_inquiries')) {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate, checkPermission]);

  // 問い合わせデータの取得
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // 実際はAPIからデータを取得
        // ダミーデータを使用
        const dummyInquiries: Inquiry[] = [
          {
            id: 'inq-001',
            customerName: '山田 太郎',
            customerEmail: 'yamada@example.com',
            subject: '注文商品が届きません',
            content: '先週注文した商品がまだ届いていません。注文番号はORD-123456です。配送状況を教えてください。',
            status: 'new',
            priority: 'high',
            createdAt: '2025-05-20T09:30:00Z',
            updatedAt: '2025-05-20T09:30:00Z',
            category: '配送',
            relatedOrderId: 'ORD-123456'
          },
          {
            id: 'inq-002',
            customerName: '鈴木 花子',
            customerEmail: 'suzuki@example.com',
            subject: '商品の返品について',
            content: 'サイズが合わないため、返品したいです。返品手続きの方法を教えてください。',
            status: 'processing',
            priority: 'medium',
            createdAt: '2025-05-19T14:45:00Z',
            updatedAt: '2025-05-19T15:20:00Z',
            assignedTo: 'support-001',
            category: '返品・交換',
            relatedOrderId: 'ORD-789012'
          },
          {
            id: 'inq-003',
            customerName: '佐藤 健',
            customerEmail: 'sato@example.com',
            subject: 'ポイントが反映されていません',
            content: '昨日の購入でポイントが付与されるはずですが、まだ反映されていません。確認をお願いします。',
            status: 'resolved',
            priority: 'low',
            createdAt: '2025-05-18T11:15:00Z',
            updatedAt: '2025-05-18T13:40:00Z',
            assignedTo: 'support-002',
            category: 'ポイント・クーポン'
          },
          {
            id: 'inq-004',
            customerName: '田中 美咲',
            customerEmail: 'tanaka@example.com',
            subject: '商品の詳細について質問',
            content: '商品ID: PROD-5678の素材について詳しく教えていただけますか？アレルギーがあるため、成分を確認したいです。',
            status: 'closed',
            priority: 'medium',
            createdAt: '2025-05-17T16:20:00Z',
            updatedAt: '2025-05-17T17:45:00Z',
            assignedTo: 'support-001',
            category: '商品詳細'
          },
          {
            id: 'inq-005',
            customerName: '高橋 誠',
            customerEmail: 'takahashi@example.com',
            subject: '会員登録ができません',
            content: '会員登録しようとすると、「このメールアドレスは既に使用されています」というエラーが表示されますが、登録した覚えがありません。',
            status: 'new',
            priority: 'high',
            createdAt: '2025-05-16T10:10:00Z',
            updatedAt: '2025-05-16T10:10:00Z',
            category: 'アカウント'
          }
        ];

        setInquiries(dummyInquiries);
        setFilteredInquiries(dummyInquiries);
      } catch (error) {
        console.error('問い合わせデータの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let filtered = [...inquiries];

    // 検索フィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inquiry => 
        inquiry.customerName.toLowerCase().includes(term) ||
        inquiry.customerEmail.toLowerCase().includes(term) ||
        inquiry.subject.toLowerCase().includes(term) ||
        inquiry.content.toLowerCase().includes(term) ||
        (inquiry.relatedOrderId && inquiry.relatedOrderId.toLowerCase().includes(term))
      );
    }

    // ステータスフィルタリング
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // 優先度フィルタリング
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.priority === priorityFilter);
    }

    // カテゴリフィルタリング
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.category === categoryFilter);
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        comparison = priorityValues[a.priority as keyof typeof priorityValues] - priorityValues[b.priority as keyof typeof priorityValues];
      } else if (sortField === 'status') {
        const statusValues = { new: 4, processing: 3, resolved: 2, closed: 1 };
        comparison = statusValues[a.status as keyof typeof statusValues] - statusValues[b.status as keyof typeof statusValues];
      } else if (sortField === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredInquiries(filtered);
  }, [inquiries, searchTerm, statusFilter, priorityFilter, categoryFilter, sortField, sortDirection]);

  // ソート切り替え
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // 新しいフィールドでソートする場合はデフォルトで降順
    }
  };

  // 問い合わせの詳細ページへ移動
  const handleViewInquiry = (id: string) => {
    navigate(`/admin/support/inquiries/${id}`);
  };

  // カテゴリオプション
  const categoryOptions = ['配送', '返品・交換', 'ポイント・クーポン', '商品詳細', 'アカウント', '支払い', 'その他'];

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="inquiry-list-page">
      <div className="page-header">
        <h1>問い合わせ管理</h1>
        <div className="page-actions">
          <button
            className="btn primary"
            onClick={() => navigate('/admin/support/inquiries/new')}
            disabled={!checkPermission('manage_inquiries')}
          >
            新規問い合わせ作成
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="顧客名、メール、キーワード、注文番号で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">ステータス:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">すべて</option>
              <option value="new">新規</option>
              <option value="processing">対応中</option>
              <option value="resolved">解決済み</option>
              <option value="closed">完了</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">優先度:</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">すべて</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">カテゴリ:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">すべて</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="inquiry-list">
        {filteredInquiries.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th 
                    className={`sortable ${sortField === 'createdAt' ? 'sorted' : ''}`}
                    onClick={() => handleSort('createdAt')}
                  >
                    日時
                    {sortField === 'createdAt' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'customerName' ? 'sorted' : ''}`}
                    onClick={() => handleSort('customerName')}
                  >
                    顧客名
                    {sortField === 'customerName' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th>件名</th>
                  <th>カテゴリ</th>
                  <th 
                    className={`sortable ${sortField === 'status' ? 'sorted' : ''}`}
                    onClick={() => handleSort('status')}
                  >
                    ステータス
                    {sortField === 'status' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'priority' ? 'sorted' : ''}`}
                    onClick={() => handleSort('priority')}
                  >
                    優先度
                    {sortField === 'priority' && (
                      <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th>担当者</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry.id} className={inquiry.status === 'new' ? 'new-inquiry' : ''}>
                    <td>{new Date(inquiry.createdAt).toLocaleString('ja-JP')}</td>
                    <td>
                      <div>{inquiry.customerName}</div>
                      <div className="email-text">{inquiry.customerEmail}</div>
                    </td>
                    <td>
                      <div className="subject-text">{inquiry.subject}</div>
                      {inquiry.relatedOrderId && (
                        <div className="order-id-text">注文ID: {inquiry.relatedOrderId}</div>
                      )}
                    </td>
                    <td>{inquiry.category}</td>
                    <td>
                      <span className={`status-badge status-${inquiry.status}`}>
                        {inquiry.status === 'new' && '新規'}
                        {inquiry.status === 'processing' && '対応中'}
                        {inquiry.status === 'resolved' && '解決済み'}
                        {inquiry.status === 'closed' && '完了'}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${inquiry.priority}`}>
                        {inquiry.priority === 'high' && '高'}
                        {inquiry.priority === 'medium' && '中'}
                        {inquiry.priority === 'low' && '低'}
                      </span>
                    </td>
                    <td>{inquiry.assignedTo ? '担当者あり' : '未割当'}</td>
                    <td>
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleViewInquiry(inquiry.id)}
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
            <p>問い合わせが見つかりませんでした。検索条件を変更してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryListPage;
