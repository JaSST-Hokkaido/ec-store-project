import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTitle from '../utils/PageTitle';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  
  // メールアドレス送信処理
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // デモ版では実際にメールを送信せず、直接パスワード設定画面に遷移
      // 実際のアプリケーションではここでメール送信APIを呼ぶ
      setVerifiedEmail(email);
      setShowPasswordForm(true);
      setError('');
    } catch (err: any) {
      console.error('メール送信エラー:', err);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // パスワード設定処理
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('新しいパスワードを入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // userServiceのresetPasswordを呼び出して、新しいパスワードを設定
      const result = await resetPassword(verifiedEmail, newPassword);
      
      if (result.success) {
        // パスワードリセット成功
        alert('パスワードがリセットされました。新しいパスワードでログインしてください。');
        navigate('/login');
      } else {
        setError(result.message || 'パスワードリセットに失敗しました');
      }
    } catch (err: any) {
      console.error('パスワードリセットエラー:', err);
      setError('パスワードリセットに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page reset-password-page">
      <PageTitle title="パスワードリセット" />
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>パスワードリセット</h1>
            {!showPasswordForm ? (
              <p>登録したメールアドレスを入力してください</p>
            ) : (
              <p>新しいパスワードを設定してください</p>
            )}
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          {!showPasswordForm ? (
            <>
              <div className="demo-notice">
                パスワードリセットメールを送信しました（デモ版のため実際には送信されません）
              </div>
              
              <form className="auth-form" onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label htmlFor="email">メールアドレス</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn auth-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? '送信中...' : 'パスワードをリセット'}
                </button>
              </form>
            </>
          ) : (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="form-info">
                <p>メールアドレス: <strong>{verifiedEmail}</strong></p>
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">新しいパスワード</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8文字以上"
                  minLength={8}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">パスワード（確認）</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  minLength={8}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn auth-btn" 
                disabled={isLoading}
              >
                {isLoading ? '設定中...' : 'パスワードを設定'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <p>
              <Link to="/login">
                ログインページに戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
