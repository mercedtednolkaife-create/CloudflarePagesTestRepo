import React, { useState, useEffect, useCallback } from 'react';
import {
  AcademicEvent,
  Journal,
  WishlistItem,
  NavTab,
  JurisdictionType,
  GlobalSearchResult,
  Paper,
  Author,
  EventItem,
} from './types';
import {
  fetchWishlist,
  createWishlistItem,
  voteWishlistItem,
  fetchEvents,
  toggleBookmark,
  fetchSummary,
  clearApiCache,
  AggregationSummary,
} from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HeaderNav } from './components/HeaderNav';
import { GlobalSearch } from './components/GlobalSearch';
import { PapersFeed } from './pages/PapersFeed';
import { Authors } from './pages/Authors';
import { Bookmarks } from './pages/Bookmarks';
import { Journals } from './pages/Journals';
import { Events } from './pages/Events';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { Scale, CheckCircle, AlertTriangle, RefreshCw, X, Loader2, Lock } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('papers');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部领域');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('All');

  // Aggregation Summary & Global State (Mainstream Aggregator Pattern)
  const [summary, setSummary] = useState<AggregationSummary>({
    savedCount: 0,
    urgentEventCount: 0,
    pinnedJournalCount: 0,
    wishlistCount: 0,
    authorsCount: 0,
    papersCount: 0,
    journalsCount: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // 1. Lightweight initial load: fetch summary + events for badges
  const loadInitialData = useCallback(async (bypassCache = false) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const [summaryRes, fetchedEvents, fetchedWishlist] = await Promise.all([
        fetchSummary(bypassCache),
        fetchEvents().catch(() => []),
        fetchWishlist().catch(() => []),
      ]);

      setSummary(summaryRes);
      setWishlist(fetchedWishlist);
      setLastUpdatedTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));

      const academicEvents: AcademicEvent[] = fetchedEvents.map((e: EventItem) => ({
        id: e.id,
        title: e.title,
        host: e.hostName,
        type: e.eventType,
        deadline: e.deadline,
        eventDate: e.deadline,
        location: e.hostCountry,
        tags: ['法学征文', e.eventType],
        description: `主办方：${e.hostName} · 截稿倒计时：${e.statusText}`,
        submissionUrl: e.hostDomain ? `https://${e.hostDomain}` : 'https://lexextern.org',
      }));
      setEvents(academicEvents);
    } catch (err: any) {
      console.error('Initial summary fetch failed:', err);
      setApiError(err?.message || '无法连接至 Cloudflare D1 本地后端接口');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  // Mainstream Aggregation Refresh: Invalidate all caches and re-fetch global state
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    clearApiCache();
    await loadInitialData(true);
    showToast('已完成全网法学学术元数据增量同步');
  };

  // Sync summary after mutations
  const refreshSummaryOnly = async () => {
    try {
      const s = await fetchSummary(true);
      setSummary(s);
    } catch (e) {
      console.warn('Failed to update summary:', e);
    }
  };

  // Add Wishlist Item Handler
  const handleAddWishlistItem = async (item: Omit<WishlistItem, 'id' | 'submittedAt' | 'votes'>) => {
    try {
      const created = await createWishlistItem({
        name: item.name,
        type: item.type,
        submitter: item.submitter || user?.username,
        notes: item.notes,
      });
      setWishlist((prev) => [created, ...prev]);
      setSummary((prev) => ({ ...prev, wishlistCount: prev.wishlistCount + 1 }));
      showToast(`已成功将【${item.name}】提交至收录心愿单并持久化至 D1 数据库！`);
    } catch (err: any) {
      showToast(err?.message || '提交失败，请重试', 'error');
    }
  };

  // Vote Wishlist Item Handler
  const handleVoteWishlistItem = async (id: string) => {
    const item = wishlist.find((w) => w.id === id);
    if (!item) return;

    const delta = item.userVoted ? -1 : 1;
    const nextVotes = Math.max(0, item.votes + delta);

    // Optimistic UI
    setWishlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, votes: nextVotes, userVoted: !item.userVoted } : w))
    );

    try {
      await voteWishlistItem(id, delta);
      showToast(item.userVoted ? '已取消投票' : `为【${item.name}】投出宝贵一票！`);
    } catch {
      showToast('投票操作失败', 'error');
      // Rollback
      setWishlist((prev) =>
        prev.map((w) => (w.id === id ? { ...w, votes: item.votes, userVoted: item.userVoted } : w))
      );
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTag('全部领域');
    setSelectedJurisdiction('All');
  };

  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    if (result.entityType === 'paper' || result.entityType === 'article') {
      setActiveTab('papers');
    } else if (result.entityType === 'author') {
      setActiveTab('authors');
    } else if (result.entityType === 'journal') {
      setActiveTab('journals');
    } else if (result.entityType === 'wishlist') {
      setActiveTab('wishlist');
    }
  };

  // -------------------------------------------------------------
  // 未登录情况下展示登录页，其它内容全部隐藏
  // -------------------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F52BA]" />
        <p className="text-xs text-zinc-500 font-medium tracking-wide">
          正在核验学者通行证凭据 (Cloudflare D1)...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans text-[#09090B]">
        {/* Minimal Auth Header */}
        <header className="bg-white border-b border-zinc-200 py-3.5 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#09090B] text-white flex items-center justify-center font-serif font-black text-xs">
                LE
              </div>
              <span className="font-editorial-heading font-black text-base text-[#09090B]">
                Lex<span className="text-[#0F52BA]">Extern</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>学术访问网关 · 请先登录</span>
            </div>
          </div>
        </header>

        {/* Login Form Portal */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Login onSuccess={() => loadInitialData(true)} />
        </main>

        {/* Footer */}
        <footer className="bg-white text-zinc-400 border-t border-zinc-200 py-4 text-center text-xs">
          LexExtern Global Jurisprudence · Cloudflare Workers + D1 Powered
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 已登录状态：展示全功能学术工作台
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#09090B]">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-zinc-900 text-white border-zinc-800'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={summary.savedCount}
        urgentEventCount={summary.urgentEventCount}
        pinnedJournalCount={summary.pinnedJournalCount}
        wishlistCount={wishlist.length || summary.wishlistCount}
        authorsCount={summary.authorsCount}
        onResetFilters={handleResetFilters}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdatedTime}
      />

      {/* Global Search Bar (with FTS5 full-text integration, Enter-triggered) */}
      <GlobalSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedJurisdiction={selectedJurisdiction}
        setSelectedJurisdiction={setSelectedJurisdiction}
        totalResults={summary.papersCount}
        onClearAll={handleResetFilters}
        onSelectSearchResult={handleSelectSearchResult}
      />

      {/* Backend API Connection Alert Banner */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>后端接口连接提示：</strong>
                <span>{apiError}</span>
              </div>
            </div>
            <button
              onClick={() => loadInitialData(true)}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重试连接</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {isLoading && !apiError && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F52BA]" />
            <p className="text-sm font-medium">正在自 Cloudflare D1 数据库加载全量学术图谱概览...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* VIEW 1: PAPERS FEED (文献流 - 支持标签筛选、个人书签与标准分页) */}
            {(activeTab === 'papers' || activeTab === 'home') && (
              <PapersFeed
                onSelectAuthor={() => setActiveTab('authors')}
                onSelectJournal={() => setActiveTab('journals')}
                onShowToast={showToast}
              />
            )}

            {/* VIEW 2: AUTHORS DIRECTORY (学者画像库 - 支持搜索、关注与分页) */}
            {activeTab === 'authors' && (
              <Authors
                onSelectPaper={() => setActiveTab('papers')}
                onShowToast={showToast}
              />
            )}

            {/* VIEW 3: JOURNALS SHELF (核心期刊架 - 独立后端查询、置顶与分页) */}
            {activeTab === 'journals' && (
              <Journals
                onFilterByJournal={() => setActiveTab('papers')}
                onShowToast={(msg, type) => {
                  showToast(msg, type);
                  refreshSummaryOnly();
                }}
              />
            )}

            {/* VIEW 4: EVENTS & DEADLINES (活动与征稿) */}
            {activeTab === 'events' && <Events events={events} />}

            {/* VIEW 5: BOOKMARKS & BIBTEX EXPORT (个人收藏夹 - 纯前端 BibTeX 导出) */}
            {(activeTab === 'bookmarks' || activeTab === 'saved') && (
              <Bookmarks
                onShowToast={(msg, type) => {
                  showToast(msg, type);
                  refreshSummaryOnly();
                }}
                onNavigateToFeed={() => setActiveTab('papers')}
              />
            )}

            {/* VIEW 6: WISHLIST (收录心愿单 - 全员公开展示与投票) */}
            {activeTab === 'wishlist' && (
              <Wishlist
                wishlist={wishlist}
                onAddWishlistItem={handleAddWishlistItem}
                onVoteWishlistItem={handleVoteWishlistItem}
                isLoading={isLoading}
              />
            )}

            {/* VIEW 7: LOGIN & AUTH (鉴权中心) */}
            {activeTab === 'login' && (
              <Login
                onSuccess={() => {
                  setActiveTab('papers');
                  loadInitialData(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Academic Footer */}
      <footer className="bg-white text-zinc-500 border-t border-zinc-200 mt-16 py-7 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0F52BA]" />
            <span className="font-editorial-heading font-bold text-zinc-900 tracking-tight">
              LexExtern · 域外法学信息聚合平台
            </span>
            <span className="text-zinc-300">/</span>
            <span>Cloudflare Workers + D1 Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <span>D1 实时数据库绑定 (DB: lexextern-db)</span>
            <span>·</span>
            <span>严格遵守学术规范与引证标准</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

