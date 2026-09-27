import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, KeyRound, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, register, user, isAuthenticated, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'scholar' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
        setSuccessMessage('登录成功！正在跳转...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        await register(username.trim(), password, role);
        setSuccessMessage('注册成功并已自动登录！');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || '鉴权失败，请检查用户名与密码');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
          <UserCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">当前已登录</h2>
          <p className="text-sm text-zinc-500 mt-1">
            欢迎回来，<strong className="text-zinc-800">{user.username}</strong>
          </p>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">用户 ID</span>
            <span className="font-mono font-medium text-zinc-800">{user.id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">权限角色</span>
            <span className="font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0F52BA]">
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-[#0F52BA] transition-colors cursor-pointer"
          >
            进入文献主页
          </button>
          <button
            onClick={() => logout()}
            className="px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm font-sans space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-2 shadow-xs">
          <KeyRound className="w-6 h-6 text-[#0071E3]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-editorial-heading">
          {mode === 'login' ? '账号登录' : '创建账号'}
        </h2>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            用户名
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            密码
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              身份角色
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
            >
              <option value="user">读者用户</option>
              <option value="scholar">青年学者</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-[#0071E3] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? '正在验证身份...' : mode === 'login' ? '立即登录' : '立即注册'}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-[#0071E3] hover:underline cursor-pointer font-medium"
          >
            {mode === 'login' ? '还没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </form>
    </div>
  );
};
