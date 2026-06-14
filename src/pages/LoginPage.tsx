import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Logo } from '../components/shared/Logo';
import { showToast } from '../components/shared/Toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated()) navigate('/lobby', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !nickname)) return;
    setLoading(true);
    try {
      if (isRegister) { await register(email, password, nickname); showToast('注册成功', 'success'); }
      else { await login(email, password); showToast('登录成功', 'success'); }
      navigate('/lobby');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || (isRegister ? '注册失败' : '登录失败'), 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="page-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-gray-500 text-sm">英语单词实时对战平台</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">
            {isRegister ? '创建账号' : '欢迎回来'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="input-field" placeholder="取一个昵称" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="输入密码" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : (isRegister ? '注册' : '登录')}
            </button>

            <p className="text-center text-sm text-gray-500">
              {isRegister ? '已有账号？' : '还没有账号？'}{' '}
              <button type="button" onClick={() => setIsRegister(!isRegister)}
                className="text-violet-600 font-medium hover:text-violet-700 transition-colors">
                {isRegister ? '去登录' : '免费注册'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
