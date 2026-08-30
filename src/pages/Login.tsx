import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, KeyRound, Lock, User, AlertCircle, Sparkles, LogIn, UserPlus } from 'lucide-react';

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

  const handleQuickLogin = async (userType: 'admin' | 'scholar' | 'user') => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let u = 'admin';
    let p = 'admin123';
    if (userType === 'scholar') {
      u = 'scholar';
      p = 'user123';
    } else if (userType === 'user') {
      u = 'demo_user';
      p = 'user123';
    }

    setUsername(u);
    setPassword(p);

    try {
      await login(u, p);
      setSuccessMessage(`已快捷登录为【${userType === 'admin' ? '系统管理员' : userType === 'scholar' ? '驻站学者' : '注册读者'}】`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || '快捷登录失败');
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
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">鉴权方式</span>
            <span className="text-zinc-700">D1 SQLite + Web Crypto SHA-256 / JWT</span>
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
          <KeyRound className="w-6 h-6 text-[#0F52BA]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-editorial-heading">
          {mode === 'login' ? '学者与管理员登录' : '创建学者通行证'}
        </h2>
        <p className="text-xs text-zinc-500">
          基于 Cloudflare D1 密码哈希认证 · 支持全文检索与私有书签同步
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'login' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>账号登录</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'register' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>注册新账号</span>
        </button>
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
            用户名 / Academic ID
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名 (如 admin / scholar)"
              className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            密码 / Passphrase
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入登录密码"
              className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA]"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              身份角色 / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA]"
            >
              <option value="user">注册读者 (General Reader)</option>
              <option value="scholar">青年学者 (Academic Scholar)</option>
              <option value="admin">系统管理员 (Administrator)</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-[#0F52BA] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? '正在验证身份...' : mode === 'login' ? '立即登录' : '立即注册'}
        </button>
      </form>

      {/* Fast Demo Login Buttons */}
      <div className="pt-4 border-t border-zinc-100 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>一键预设账号快速联调体验：</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-medium transition-colors cursor-pointer truncate text-center"
            title="admin / admin123"
          >
            🛡️ 管理员 (admin)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('scholar')}
            className="px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-medium transition-colors cursor-pointer truncate text-center"
            title="scholar / user123"
          >
            🎓 学者 (scholar)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            className="px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-medium transition-colors cursor-pointer truncate text-center"
            title="demo_user / user123"
          >
            📖 读者 (demo)
          </button>
        </div>
      </div>
    </div>
  );
};
