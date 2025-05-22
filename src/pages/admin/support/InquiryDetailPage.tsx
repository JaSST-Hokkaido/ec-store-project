import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 問い合わせの型定義
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

// 対応履歴の型定義
interface ResponseHistory {
  id: string;
  inquiryId: string;
  content: string;
  isCustomerResponse: boolean;
  adminId?: string;
  adminName?: string;
  createdAt: string;
}

// 管理者情報の型
interface AdminInfo {
  id: string;
  name: string;
}

const InquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [responseHistory, setResponseHistory] = useState<ResponseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [assignedAdmin, setAssignedAdmin] = useState<string>('');
  const [adminList, setAdminList] = useState<AdminInfo[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 権限チェック
  useEffect(() => {
    if (!checkPermission('view_inquiries')) {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate, checkPermission]);
  
  // 問い合わせデータの取得
  useEffect(() => {
    const fetchInquiryDetails = async () => {
      try {
        // 実際はAPIからデータを取得
        // ダミーデータを使用
        const dummyInquiry: Inquiry = {
          id: 'inq-001',
          customerName: '山田 太郎',
          customerEmail: 'yamada@example.com',
          subject: '注文商品が届きません',
          content: '先週注文した商品がまだ届いていません。注文番号はORD-123456です。配送状況を教えてください。',
          status: 'processing',
          priority: 'high',
          createdAt: '2025-05-20T09:30:00Z',
          updatedAt: '2025-05-20T10:15:00Z',
          assignedTo: 'support-001',
          category: '配送',
          relatedOrderId: 'ORD-123456'
        };
        
        // 対応履歴のダミーデータ
        const dummyResponseHistory: ResponseHistory[] = [
          {
            id: 'resp-001',
            inquiryId: 'inq-001',
            content: '先週注文した商品がまだ届いていません。注文番号はORD-123456です。配送状況を教えてください。',
            isCustomerResponse: true,
            createdAt: '2025-05-20T09:30:00Z'
          },
          {
            id: 'resp-002',
            inquiryId: 'inq-001',
            content: 'お問い合わせいただきありがとうございます。ご注文の配送状況を確認いたします。少々お待ちください。',
            isCustomerResponse: false,
            adminId: 'support-001',
            adminName: 'サポート 担当者',
            createdAt: '2025-05-20T10:15:00Z'
          }
        ];
        
        // 管理者リストのダミーデータ
        const dummyAdminList: AdminInfo[] = [
          { id: 'support-001', name: 'サポート 担当者' },
          { id: 'support-002', name: '山本 サポート' },
          { id: 'support-003', name: '鈴木 対応' }
        ];
        
        setInquiry(dummyInquiry);
        setResponseHistory(dummyResponseHistory);
        setAdminList(dummyAdminList);
        setSelectedStatus(dummyInquiry.status);
        setSelectedPriority(dummyInquiry.priority);
        setAssignedAdmin(dummyInquiry.assignedTo || '');
      } catch (error) {
        console.error('問い合わせ詳細の取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchInquiryDetails();
    }
  }, [id]);
  
  // 返信入力の処理
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewResponse(e.target.value);
  };
  
  // 返信送信の処理
  const handleSendResponse = async () => {
    if (!newResponse.trim()) return;
    
    setIsSending(true);
    
    try {
      // 実際はAPIで送信処理
      // ここではフロントエンドのみで処理
      
      const newResponseEntry: ResponseHistory = {
        id: `resp-${Date.now()}`,
        inquiryId: id || '',
        content: newResponse,
        isCustomerResponse: false,
        adminId: currentAdmin?.id,
        adminName: currentAdmin?.name,
        createdAt: new Date().toISOString()
      };
      
      // 対応履歴に追加
      setResponseHistory(prev => [...prev, newResponseEntry]);
      
      // 問い合わせのステータスを「対応中」に更新
      if (inquiry && inquiry.status === 'new') {
        setInquiry({ ...inquiry, status: 'processing', updatedAt: new Date().toISOString() });
        setSelectedStatus('processing');
      }
      
      // 入力欄をクリア
      setNewResponse('');
      
      // 成功メッセージの表示など
    } catch (error) {
      console.error('返信送信エラー:', error);
      // エラーメッセージの表示など
    } finally {
      setIsSending(false);
    }
  };
  
  // 問い合わせステータスの更新
  const handleUpdateStatus = async () => {
    if (!inquiry) return;
    
    setIsUpdating(true);
    
    try {
      // 実際はAPIで更新処理
      // ここではフロントエンドのみで処理
      
      const updatedInquiry: Inquiry = {
        ...inquiry,
        status: selectedStatus as 'new' | 'processing' | 'resolved' | 'closed',
        priority: selectedPriority as 'high' | 'medium' | 'low',
        assignedTo: assignedAdmin || undefined,
        updatedAt: new Date().toISOString()
      };
      
      setInquiry(updatedInquiry);
      
      // 成功メッセージの表示など
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      // エラーメッセージの表示など
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 注文詳細ページへ移動
  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // 顧客詳細ページへ移動
  const handleViewCustomer = (email: string) => {
    navigate(`/admin/customers?search=${encodeURIComponent(email)}`);
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (!inquiry) {
    return <div className="error-state">問い合わせが見つかりません。</div>;
  }
  
  // ステータスに応じたラベルとクラス
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return { label: '新規', className: 'status-new' };
      case 'processing': return { label: '対応中', className: 'status-processing' };
      case 'resolved': return { label: '解決済み', className: 'status-resolved' };
      case 'closed': return { label: '完了', className: 'status-closed' };
      default: return { label: status, className: '' };
    }
  };
  
  // 優先度に応じたラベルとクラス
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return { label: '高', className: 'priority-high' };
      case 'medium': return { label: '中', className: 'priority-medium' };
      case 'low': return { label: '低', className: 'priority-low' };
      default: return { label: priority, className: '' };
    }
  };
  
  const statusInfo = getStatusLabel(inquiry.status);
  const priorityInfo = getPriorityLabel(inquiry.priority);
  
  return (
    <div className="inquiry-detail-page">
      <div className="page-header">
        <div className="header-back">
          <button
            className="btn-back"
            onClick={() => navigate('/admin/support/inquiries')}
          >
            ← 問い合わせ一覧に戻る
          </button>
        </div>
        <h1>問い合わせ詳細</h1>
      </div>
      
      <div className="inquiry-container">
        <div className="inquiry-main">
          {/* 問い合わせ情報 */}
          <div className="inquiry-info-card">
            <div className="inquiry-subject">
              <h2>{inquiry.subject}</h2>
              <div className="inquiry-meta">
                <span className={`status-badge ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
                <span className={`priority-badge ${priorityInfo.className}`}>
                  優先度: {priorityInfo.label}
                </span>
              </div>
            </div>
            
            <div className="inquiry-details">
              <div className="inquiry-detail-row">
                <span className="detail-label">カテゴリ:</span>
                <span className="detail-value">{inquiry.category}</span>
              </div>
              
              <div className="inquiry-detail-row">
                <span className="detail-label">受付日時:</span>
                <span className="detail-value">
                  {new Date(inquiry.createdAt).toLocaleString('ja-JP')}
                </span>
              </div>
              
              {inquiry.relatedOrderId && (
                <div className="inquiry-detail-row">
                  <span className="detail-label">関連注文:</span>
                  <span className="detail-value">
                    {inquiry.relatedOrderId}
                    {checkPermission('view_orders') && (
                      <button
                        className="btn-link"
                        onClick={() => handleViewOrder(inquiry.relatedOrderId || '')}
                      >
                        注文詳細を表示
                      </button>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 対応履歴 */}
          <div className="response-history">
            <h3>対応履歴</h3>
            <div className="response-list">
              {responseHistory.map((response) => (
                <div
                  key={response.id}
                  className={`response-item ${
                    response.isCustomerResponse ? 'customer-response' : 'admin-response'
                  }`}
                >
                  <div className="response-header">
                    <div className="response-author">
                      {response.isCustomerResponse
                        ? `${inquiry.customerName} (顧客)`
                        : `${response.adminName} (担当者)`}
                    </div>
                    <div className="response-time">
                      {new Date(response.createdAt).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <div className="response-content">{response.content}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 新規返信 */}
          {checkPermission('manage_inquiries') && (
            <div className="new-response-section">
              <h3>返信</h3>
              <div className="response-form">
                <textarea
                  className="response-input"
                  value={newResponse}
                  onChange={handleResponseChange}
                  placeholder="返信内容を入力してください..."
                  rows={5}
                />
                <div className="response-actions">
                  <button
                    className="btn primary"
                    onClick={handleSendResponse}
                    disabled={!newResponse.trim() || isSending}
                  >
                    {isSending ? '送信中...' : '返信を送信'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="inquiry-sidebar">
          {/* 顧客情報 */}
          <div className="customer-info-card">
            <h3>顧客情報</h3>
            <div className="customer-details">
              <div className="customer-detail-row">
                <span className="detail-label">名前:</span>
                <span className="detail-value">{inquiry.customerName}</span>
              </div>
              
              <div className="customer-detail-row">
                <span className="detail-label">メール:</span>
                <span className="detail-value">{inquiry.customerEmail}</span>
              </div>
              
              {checkPermission('view_customers') && (
                <div className="customer-actions">
                  <button
                    className="btn secondary small"
                    onClick={() => handleViewCustomer(inquiry.customerEmail)}
                  >
                    顧客詳細を表示
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 問い合わせ管理 */}
          {checkPermission('manage_inquiries') && (
            <div className="inquiry-management-card">
              <h3>問い合わせ管理</h3>
              <div className="management-form">
                <div className="form-group">
                  <label htmlFor="status">ステータス</label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="new">新規</option>
                    <option value="processing">対応中</option>
                    <option value="resolved">解決済み</option>
                    <option value="closed">完了</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">優先度</label>
                  <select
                    id="priority"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="assigned">担当者</label>
                  <select
                    id="assigned"
                    value={assignedAdmin}
                    onChange={(e) => setAssignedAdmin(e.target.value)}
                  >
                    <option value="">未割当</option>
                    {adminList.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="management-actions">
                  <button
                    className="btn primary"
                    onClick={handleUpdateStatus}
                    disabled={
                      isUpdating ||
                      (selectedStatus === inquiry.status &&
                        selectedPriority === inquiry.priority &&
                        assignedAdmin === (inquiry.assignedTo || ''))
                    }
                  >
                    {isUpdating ? '更新中...' : '設定を更新'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;
