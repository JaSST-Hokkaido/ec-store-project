import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Auth } from 'aws-amplify';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URLからリダイレクト先を取得
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // AWS Amplify Authでの認証を実装予定
      // await Auth.signIn(email, password);
      
      // 認証成功（開発中はダミーデータで代用）
      console.log('ログイン成功:', email);
      
      // リダイレクト先に遷移
      navigate(redirectTo === 'checkout' ? '/checkout' : `/${redirectTo}`);
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

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
          
          <form className="auth-form" onSubmit={handleSubmit}>
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
              <Link to="/password-reset" className="password-reset-link">
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
