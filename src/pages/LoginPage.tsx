import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  resetMode?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ resetMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // URLからリダイレクト先とリセットトークンを取得
  const redirectTo = searchParams.get('redirect') || '/';
  const resetToken = searchParams.get('token');
  const resetEmail = searchParams.get('email');
  
  // リセットトークンがある場合はパスワードリセットモードにする
  useEffect(() => {
    if (resetToken && resetEmail) {
      setEmail(resetEmail);
    }
  }, [resetToken, resetEmail]);

  // ログインフォーム送信処理
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        // ログイン成功
        if (redirectTo === 'checkout') {
          navigate('/checkout');
        } else if (redirectTo === '/' || redirectTo === '') {
          navigate('/');
        } else {
          navigate(`/${redirectTo}`);
        }
      } else {
        // ログイン失敗
        setError(result.message || 'ログインに失敗しました');
      }
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // パスワードリセット処理（その場でリセット）
  const [newPassword, setNewPassword] = useState<string | null>(null);
  
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setNewPassword(null);
    
    try {
      const result = await resetPassword(email) as { 
        success: boolean; 
        message?: string; 
        newPassword?: string 
      };
      
      if (result.success) {
        setSuccessMessage(result.message || 'パスワードをリセットしました');
        if (result.newPassword) {
          setNewPassword(result.newPassword);
        }
      } else {
        setError(result.message || 'パスワードリセットに失敗しました');
      }
    } catch (err: any) {
      console.error('パスワードリセットエラー:', err);
      setError(err.message || 'パスワードリセットに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // パスワードリセットページをレンダリング
  if (resetMode) {
    return (
      <div className="auth-page reset-password-page">
        <div className="container">
          <div className="auth-container">
            <div className="auth-header">
              <h1>パスワードリセット</h1>
              <p>登録したメールアドレスを入力してください</p>
            </div>
            
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="auth-success">
                {successMessage}
              </div>
            )}
            
            {newPassword ? (
              <div className="password-reset-result">
                <div className="new-password-container">
                  <h3>新しいパスワード:</h3>
                  <div className="new-password-display">
                    {newPassword}
                  </div>
                  <p className="password-note">
                    このパスワードをコピーして保存してください。<br />
                    ログイン後、マイページからパスワードを変更できます。
                  </p>
                </div>
                <button 
                  className="btn auth-btn" 
                  onClick={() => navigate('/login')}
                >
                  ログインページへ
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleResetSubmit}>
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
                  {isLoading ? 'リセット中...' : 'パスワードをリセット'}
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
  }

  // ログインページをレンダリング
  return (
    <div className="auth-page login-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>ログイン</h1>
            <p>アカウントにログインして、お買い物を続けましょう</p>
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleLoginSubmit}>
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
            
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            
            <div className="form-actions">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">ログイン状態を保持する</label>
              </div>
              
              <Link to="/reset-password" className="password-reset-link">
                パスワードをお忘れですか？
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="btn auth-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
            
            <div className="auth-divider">
              <span>または</span>
            </div>
            
            {/* ソーシャルログインボタン（後で実装） */}
            <div className="social-login">
              <button type="button" className="btn social-btn google">
                <span className="social-icon">G</span>
                Googleでログイン
              </button>
              <button type="button" className="btn social-btn facebook">
                <span className="social-icon">f</span>
                Facebookでログイン
              </button>
            </div>
          </form>
          
          <div className="auth-footer">
            <p>
              アカウントをお持ちでないですか？{' '}
              <Link to={`/register${redirectTo ? `?redirect=${redirectTo}` : ''}`}>
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
