import React from 'react';
import { NavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
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
  RefreshCw,
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
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  urgentEventCount,
  wishlistCount,
  onResetFilters,
  onRefreshAll,
  isRefreshing,
  lastUpdated,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] text-[#1D1D1F] select-none transition-all">
      {/* Top Academic Motto Bar */}
      <div className="bg-[#F5F5F7]/90 px-4 sm:px-8 py-1.5 border-b border-black/[0.04] text-[11px] font-sans tracking-tight text-[#6E6E73] flex justify-between items-center hidden sm:flex">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
          <span className="font-serif italic text-[#1D1D1F]">
            "Iustitia est constans et perpetua voluntas ius suum cuique tribuendi"
          </span>
          <span className="text-[#86868B]">— 查士丁尼《法学阶梯》</span>
        </div>
        <div className="flex items-center gap-3 text-[#86868B] font-mono text-[10px]">
          <span>SSCI · SSRN Graph · LawGlobal Academic Cloud</span>
          <span className="text-black/10">/</span>
          <span className="font-medium text-[#1D1D1F]">LAWGLOBAL CLOUD</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => {
              setActiveTab('home');
              if (onResetFilters) onResetFilters();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#1D1D1F] text-white flex items-center justify-center font-serif font-black text-sm tracking-tight group-hover:bg-[#0071E3] transition-colors shadow-xs">
              LG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial-heading font-black text-lg text-[#1D1D1F] tracking-tight">
                  Law<span className="text-[#0071E3]">Global</span>
                </span>
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.04] text-[#6E6E73] border border-black/[0.04]">
                  全球学术情报版
                </span>
              </div>
              <p className="text-[10px] font-sans tracking-tight text-[#86868B] hidden md:block">
                Repository of Global Jurisprudence
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Apple Segmented Style) */}
          <nav className="flex items-center gap-1 font-sans text-xs font-medium overflow-x-auto py-1 bg-black/[0.03] p-1 rounded-full border border-black/[0.04]">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>首页</span>
            </button>

            <button
              id="nav-tab-papers"
              onClick={() => setActiveTab('papers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'papers'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>文献库</span>
            </button>

            <button
              id="nav-tab-authors"
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'authors'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>学者画像库</span>
            </button>

            <button
              id="nav-tab-journals"
              onClick={() => setActiveTab('journals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'journals'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>核心期刊架</span>
            </button>

            <button
              id="nav-tab-events"
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'events'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>活动与DDL</span>
              {urgentEventCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FF3B30] text-white text-[9px] font-bold rounded-full">
                  {urgentEventCount} 临期
                </span>
              )}
            </button>

            <button
              id="nav-tab-bookmarks"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bookmarks' || activeTab === 'saved'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="个人学术书签与 BibTeX 导出"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>个人收藏夹</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0071E3] text-white font-mono font-medium">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-wishlist"
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">心愿单</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 text-[#1D1D1F] font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>
          </nav>

          {/* Refresh & User Auth Section */}
          <div className="flex items-center gap-2 shrink-0">
            {onRefreshAll && isAuthenticated && (
              <button
                onClick={onRefreshAll}
                disabled={isRefreshing}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6E6E73] hover:text-[#1D1D1F] bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-all cursor-pointer disabled:opacity-50"
                title="全量刷新学术图谱缓存"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0071E3]' : 'text-[#86868B]'}`} />
                <span>{isRefreshing ? '同步中' : '刷新'}</span>
                {lastUpdated && <span className="text-[10px] text-[#86868B] font-mono">({lastUpdated})</span>}
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-black/[0.06]">
                <div
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] text-xs font-medium cursor-pointer transition-colors"
                  title="查看用户档案"
                >
                  <User className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span className="max-w-20 truncate">{user.username}</span>
                  {isAdmin && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      ADM
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-[#86868B] hover:text-[#FF3B30] rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  title="登出账号"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'bg-[#1D1D1F] text-white hover:bg-[#0071E3]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>学者通行证登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
