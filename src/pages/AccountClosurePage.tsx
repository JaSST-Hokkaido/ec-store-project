import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccountClosurePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };
  
  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(e.target.value);
  };
  
  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmation(e.target.checked);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    
    if (!confirmation) {
      setError('確認チェックボックスにチェックを入れてください');
      return;
    }
    
    // ここで最終確認ダイアログを表示
    setShowFinalConfirmation(true);
  };
  
  const handleFinalConfirmation = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 実際のアプリでは退会処理のAPIを呼び出す
      // ここではパスワード確認のみ行う（実際はセキュリティを考慮した実装が必要）
      
      // パスワードが正しいか確認（ダミー実装）
      if (password === 'password') { // ダミーパスワード
        // 退会処理成功
        // ログアウトして退会完了ページに遷移
        logout();
        setTimeout(() => {
          navigate('/account-closure-complete');
        }, 1000);
      } else {
        setError('パスワードが正しくありません');
        setShowFinalConfirmation(false);
      }
    } catch (err: any) {
      console.error('退会処理エラー:', err);
      setError('退会処理中にエラーが発生しました。もう一度お試しください。');
      setShowFinalConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    // キャンセルしてマイページに戻る
    navigate('/mypage');
  };
  
  // 最終確認モーダル
  const FinalConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>最終確認</h2>
        <p>本当に退会しますか？この操作は取り消せません。</p>
        <div className="modal-actions">
          <button 
            className="btn secondary"
            onClick={() => setShowFinalConfirmation(false)}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button 
            className="btn danger"
            onClick={handleFinalConfirmation}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : '退会する'}
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="account-closure-page">
      <div className="container">
        <h1 className="page-title">退会手続き</h1>
        
        <div className="warning-box">
          <h2>退会される前にご確認ください</h2>
          <ul>
            <li>退会すると、アカウントに関連するすべての情報が削除されます。</li>
            <li>保有ポイントや特典はすべて失効します。</li>
            <li>注文履歴や購入データにアクセスできなくなります。</li>
            <li>退会後、同じメールアドレスで再登録することは可能ですが、以前の情報は引き継がれません。</li>
          </ul>
        </div>
        
        <div className="account-info">
          <h2>現在のアカウント情報</h2>
          <div className="info-row">
            <span className="info-label">メールアドレス:</span>
            <span className="info-value">{currentUser?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">お名前:</span>
            <span className="info-value">{currentUser?.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">会員登録日:</span>
            <span className="info-value">
              {currentUser?.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString('ja-JP') : '不明'}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form className="closure-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>退会理由</h2>
            <div className="form-group">
              <select
                id="reason"
                value={reason}
                onChange={handleReasonChange}
                className="form-select"
              >
                <option value="">選択してください（任意）</option>
                <option value="使用頻度が低い">使用頻度が低い</option>
                <option value="別のサービスを利用している">別のサービスを利用している</option>
                <option value="サービスに満足できない">サービスに満足できない</option>
                <option value="使いにくい">使いにくい</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h2>本人確認</h2>
            <div className="form-group">
              <label htmlFor="password">パスワード <span className="required">*</span></label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="現在のパスワードを入力"
                required
              />
              <small className="form-text">本人確認のため、現在のパスワードを入力してください</small>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="confirmation"
                checked={confirmation}
                onChange={handleConfirmationChange}
                required
              />
              <label htmlFor="confirmation">
                上記の注意事項を読み、退会に伴うデータの削除について同意します
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn secondary"
              onClick={handleCancel}
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn danger"
              disabled={!confirmation || isLoading}
            >
              退会手続きを進める
            </button>
          </div>
        </form>
        
        {showFinalConfirmation && <FinalConfirmationModal />}
      </div>
    </div>
  );
};

export default AccountClosurePage;
