import React from 'react';
import { NavTab } from '../types';
import { 
  BookOpen, 
  Library, 
  CalendarClock, 
  HeartHandshake, 
  Bookmark, 
  Scale
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedCount: number;
  urgentEventCount: number;
  pinnedJournalCount: number;
  wishlistCount: number;
  onResetFilters?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  urgentEventCount,
  wishlistCount,
  onResetFilters
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200 text-[#09090B] select-none">
      {/* Top Academic Motto Bar */}
      <div className="bg-zinc-50 px-4 sm:px-8 py-1 border-b border-zinc-200/80 text-[11px] font-sans tracking-wide text-zinc-500 flex justify-between items-center hidden sm:flex">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA]"></span>
          <span className="font-serif italic text-zinc-700">"Iustitia est constans et perpetua voluntas ius suum cuique tribuendi"</span>
          <span className="text-zinc-400">— 查士丁尼《法学阶梯》</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px]">
          <span>SSCI · HeinOnline · Westlaw</span>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-800">GLOBAL NODES</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Brand */}
          <div 
            id="brand-logo-btn"
            onClick={() => {
              setActiveTab('home');
              if (onResetFilters) onResetFilters();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-md bg-[#09090B] text-white flex items-center justify-center font-serif font-black text-sm tracking-tight group-hover:bg-[#0F52BA] transition-colors">
              LE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial-heading font-black text-lg text-[#09090B] tracking-tight">
                  Lex<span className="text-[#0F52BA]">Extern</span>
                </span>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200">
                  域外法学
                </span>
              </div>
              <p className="text-[10px] font-sans tracking-tight text-zinc-400 hidden md:block">
                Repository of Global Jurisprudence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 font-sans text-xs font-semibold">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'home'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>文献流</span>
            </button>

            <button
              id="nav-tab-journals"
              onClick={() => setActiveTab('journals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'events'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>活动与征稿</span>
              {urgentEventCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-sm">
                  {urgentEventCount} DDL
                </span>
              )}
            </button>

            <button
              id="nav-tab-wishlist"
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">收录心愿单</span>
              <span className="sm:hidden">心愿单</span>
              {wishlistCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-zinc-200 text-zinc-800 font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'saved'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="我的收藏书签"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden md:inline">学者书签</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#0F52BA] text-white font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

