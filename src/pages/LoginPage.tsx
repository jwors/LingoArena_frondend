import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
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
    } catch { showToast(isRegister ? '注册失败' : '登录失败', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-bg flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-sky-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">⚔️</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
            LingoArena
          </h1>
          <p className="text-gray-500 mt-2 text-sm">英语单词实时对战平台</p>
        </div>

        {/* Form Card */}
        <div className="card animate-slide-up">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">
            {isRegister ? '创建账号' : '欢迎回来'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="input-field" placeholder="取一个酷炫的昵称" />
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

            <button type="submit" disabled={loading} className="btn-primary animate-pulse-glow">
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
