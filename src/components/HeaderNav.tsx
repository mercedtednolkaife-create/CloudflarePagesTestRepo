import React from 'react';
import { NavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Library,
  CalendarClock,
  HeartHandshake,
  Bookmark,
  Users,
  User,
  Shield,
  LogIn,
  LogOut,
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedCount: number;
  urgentEventCount: number;
  pinnedJournalCount: number;
  wishlistCount: number;
  authorsCount?: number;
  onResetFilters?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  urgentEventCount,
  wishlistCount,
  onResetFilters,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200 text-[#09090B] select-none">
      {/* Top Academic Motto Bar */}
      <div className="bg-zinc-50 px-4 sm:px-8 py-1 border-b border-zinc-200/80 text-[11px] font-sans tracking-wide text-zinc-500 flex justify-between items-center hidden sm:flex">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA]"></span>
          <span className="font-serif italic text-zinc-700">
            "Iustitia est constans et perpetua voluntas ius suum cuique tribuendi"
          </span>
          <span className="text-zinc-400">— 查士丁尼《法学阶梯》</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px]">
          <span>SSCI · SSRN Graph · Cloudflare D1</span>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-800">LEXEXTERN CLOUD</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => {
              setActiveTab('papers');
              if (onResetFilters) onResetFilters();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#09090B] text-white flex items-center justify-center font-serif font-black text-sm tracking-tight group-hover:bg-[#0F52BA] transition-colors">
              LE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial-heading font-black text-lg text-[#09090B] tracking-tight">
                  Lex<span className="text-[#0F52BA]">Extern</span>
                </span>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200">
                  D1 架构版
                </span>
              </div>
              <p className="text-[10px] font-sans tracking-tight text-zinc-400 hidden md:block">
                Repository of Global Jurisprudence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 font-sans text-xs font-semibold overflow-x-auto py-1">
            <button
              id="nav-tab-papers"
              onClick={() => setActiveTab('papers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'papers' || activeTab === 'home'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>文献流</span>
            </button>

            <button
              id="nav-tab-authors"
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'authors'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>学者画像库</span>
            </button>

            <button
              id="nav-tab-journals"
              onClick={() => setActiveTab('journals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'journals'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>核心期刊架</span>
            </button>

            <button
              id="nav-tab-events"
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'events'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>活动与DDL</span>
              {urgentEventCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-sm">
                  {urgentEventCount} 临期
                </span>
              )}
            </button>

            <button
              id="nav-tab-bookmarks"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bookmarks' || activeTab === 'saved'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="个人学术书签与 BibTeX 导出"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>个人收藏夹</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#0F52BA] text-white font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-wishlist"
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">心愿单</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-zinc-200 text-zinc-800 font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <div
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
                  title="查看用户档案"
                >
                  <User className="w-3.5 h-3.5 text-[#0F52BA]" />
                  <span className="max-w-20 truncate">{user.username}</span>
                  {isAdmin && (
                    <span className="text-[9px] uppercase px-1 rounded bg-amber-200 text-amber-900 font-bold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      ADM
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="登出账号"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#0F52BA] text-white shadow-2xs'
                    : 'bg-zinc-900 text-white hover:bg-[#0F52BA]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登录 / 注册</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
