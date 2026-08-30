import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Article,
  AcademicEvent,
  Journal,
  WishlistItem,
  NavTab,
  JurisdictionType,
  GlobalSearchResult,
} from './types';
import {
  fetchJournals,
  fetchWishlist,
  createWishlistItem,
  voteWishlistItem,
  fetchArticles,
  fetchAcademicEvents,
} from './services/api';
import { HeaderNav } from './components/HeaderNav';
import { GlobalSearch } from './components/GlobalSearch';
import { ArticleModal } from './components/ArticleModal';
import { Home } from './pages/Home';
import { Journals } from './pages/Journals';
import { Wishlist } from './pages/Wishlist';
import { Events } from './pages/Events';
import { Saved } from './pages/Saved';
import { getRemainingTime } from './lib/dateUtils';
import { Scale, CheckCircle, AlertTriangle, RefreshCw, X, Loader2 } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部领域');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('All');

  // Data State - Initialized purely as empty arrays, populated strictly from Cloudflare D1 Backend
  const [articles, setArticles] = useState<Article[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Initial Data Fetching from Cloudflare Worker & D1 APIs
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [loadedJournals, loadedWishlist, loadedArticles, loadedEvents] = await Promise.all([
        fetchJournals(),
        fetchWishlist(),
        fetchArticles(),
        fetchAcademicEvents(),
      ]);
      setJournals(loadedJournals);
      setWishlist(loadedWishlist);
      setArticles(loadedArticles);
      setEvents(loadedEvents);
    } catch (err: any) {
      console.error('Failed to load data from Cloudflare Worker / D1:', err);
      setApiError(err?.message || '未能连接到 Cloudflare Worker 后端服务。请确认本地后端已通过 wrangler dev 启动。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Urgent Events calculation (< 7 days)
  const urgentEventCount = useMemo(() => {
    return events.filter((e) => getRemainingTime(e.deadline).isUrgent).length;
  }, [events]);

  // Saved Articles Count
  const savedCount = useMemo(() => {
    return articles.filter((a) => a.saved).length;
  }, [articles]);

  // Pinned Journals Count
  const pinnedJournalCount = useMemo(() => {
    return journals.filter((j) => j.isPinned).length;
  }, [journals]);

  // Toggle Bookmark for Article
  const handleToggleSave = (id: string) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          const nextSaved = !art.saved;
          showToast(nextSaved ? '已收藏文献至学者书签' : '已取消收藏该文献');
          return { ...art, saved: nextSaved };
        }
        return art;
      })
    );
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle((prev) => (prev ? { ...prev, saved: !prev.saved } : null));
    }
  };

  // Toggle Pin for Journal
  const handleTogglePin = (id: string) => {
    setJournals((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const nextPinned = !j.isPinned;
          showToast(nextPinned ? `已置顶关注《${j.nameCn}》` : `已取消《${j.nameCn}》的置顶`);
          return { ...j, isPinned: nextPinned };
        }
        return j;
      })
    );
  };

  // Filter by tag
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('home');
    showToast(`已筛选标签：#${tag}`);
  };

  // Add new Wishlist Item with strict HTTP response check
  const handleAddWishlistItem = async (
    item: Omit<WishlistItem, 'id' | 'submittedAt' | 'votes' | 'status'>
  ): Promise<boolean> => {
    try {
      const created = await createWishlistItem(item);
      setWishlist((prev) => [created, ...prev]);
      showToast('收录心愿单已成功写入 Cloudflare D1 数据库！', 'success');
      return true;
    } catch (err: any) {
      console.error('Error submitting wishlist item:', err);
      showToast(`提交失败: ${err?.message || '请检查后端 Worker 连接'}`, 'error');
      throw err;
    }
  };

  // Vote on Wishlist Item with D1 POST API
  const handleVoteWishlistItem = async (id: string) => {
    const target = wishlist.find((w) => w.id === id);
    if (!target) return;

    const alreadyVoted = target.userVoted;
    const delta = alreadyVoted ? -1 : 1;

    // Optimistic UI update
    setWishlist((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            votes: Math.max(0, w.votes + delta),
            userVoted: !alreadyVoted,
          };
        }
        return w;
      })
    );

    try {
      await voteWishlistItem(id, delta);
      showToast(alreadyVoted ? '已取消点赞' : '点赞催更成功！+1');
    } catch (err: any) {
      console.error('Vote failed:', err);
      showToast('投票失败，请检查网络或后端状态', 'error');
      // Rollback
      setWishlist((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              votes: Math.max(0, w.votes - delta),
              userVoted: alreadyVoted,
            };
          }
          return w;
        })
      );
    }
  };

  // Filter from Journal shelf to articles
  const handleFilterByJournal = (journalName: string) => {
    setSearchQuery(journalName);
    setActiveTab('home');
    showToast(`正在查阅《${journalName}》相关文献`);
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTag('全部领域');
    setSelectedJurisdiction('All');
  };

  // Handle Selection from FTS5 Search Dropdown
  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    if (result.entityType === 'article') {
      const matched = articles.find((a) => a.id === result.entityId);
      if (matched) {
        setSelectedArticle(matched);
      } else {
        setSearchQuery(result.rawTitle.split('|')[0].trim());
        setActiveTab('home');
      }
    } else if (result.entityType === 'journal') {
      setActiveTab('journals');
      setSearchQuery(result.rawTitle.split('(')[0].trim());
    } else if (result.entityType === 'wishlist') {
      setActiveTab('wishlist');
    }
  };

  // Filtered Articles based on Search & Tags & Jurisdiction
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        art.titleCn.toLowerCase().includes(q) ||
        art.titleOriginal.toLowerCase().includes(q) ||
        art.journalName.toLowerCase().includes(q) ||
        art.journalAbbr.toLowerCase().includes(q) ||
        art.authors.some((a) => a.toLowerCase().includes(q)) ||
        art.authorAffiliation.toLowerCase().includes(q) ||
        art.abstractCn.toLowerCase().includes(q) ||
        art.abstractOriginal.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        art.doi.toLowerCase().includes(q);

      const matchesTag = selectedTag === '全部领域' || art.tags.includes(selectedTag);
      const matchesJurisdiction =
        selectedJurisdiction === 'All' || art.jurisdiction === selectedJurisdiction;

      return matchesSearch && matchesTag && matchesJurisdiction;
    });
  }, [articles, searchQuery, selectedTag, selectedJurisdiction]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-[#09090B] font-sans selection:bg-[#0F52BA]/15 selection:text-[#0F52BA]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-[#09090B] text-white border-zinc-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#0F52BA] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Header & Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedCount}
        urgentEventCount={urgentEventCount}
        pinnedJournalCount={pinnedJournalCount}
        wishlistCount={wishlist.length}
        onResetFilters={handleResetFilters}
      />

      {/* Global Search Bar with Cloudflare D1 FTS5 Trigram Search */}
      <GlobalSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedJurisdiction={selectedJurisdiction}
        setSelectedJurisdiction={setSelectedJurisdiction}
        totalResults={filteredArticles.length}
        onClearAll={handleResetFilters}
        onSelectSearchResult={handleSelectSearchResult}
      />

      {/* Backend API Connection Alert Banner (if disconnected) */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>后端连接异常：</strong>
                <span>{apiError}</span>
              </div>
            </div>
            <button
              onClick={loadAllData}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新加载数据</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {isLoading && !apiError && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F52BA]" />
            <p className="text-sm font-medium">正在从 Cloudflare D1 数据库加载实时学术数据...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* VIEW 1: HOME */}
            {activeTab === 'home' && (
              <Home
                articles={filteredArticles}
                events={events}
                journals={journals}
                searchQuery={searchQuery}
                selectedTag={selectedTag}
                onTagSelect={handleTagClick}
                onToggleSave={handleToggleSave}
                onOpenDetail={(art) => setSelectedArticle(art)}
                onNavigateToJournals={() => setActiveTab('journals')}
                onNavigateToEvents={() => setActiveTab('events')}
                onFilterByJournal={handleFilterByJournal}
                onResetFilters={handleResetFilters}
              />
            )}

            {/* VIEW 2: JOURNALS */}
            {activeTab === 'journals' && (
              <Journals
                journals={journals}
                onTogglePin={handleTogglePin}
                onFilterByJournal={handleFilterByJournal}
              />
            )}

            {/* VIEW 3: EVENTS */}
            {activeTab === 'events' && <Events events={events} />}

            {/* VIEW 4: WISHLIST */}
            {activeTab === 'wishlist' && (
              <Wishlist
                wishlist={wishlist}
                onAddWishlistItem={handleAddWishlistItem}
                onVoteWishlistItem={handleVoteWishlistItem}
                isLoading={isLoading}
              />
            )}

            {/* VIEW 5: SAVED ARTICLES */}
            {activeTab === 'saved' && (
              <Saved
                articles={articles}
                onTagClick={handleTagClick}
                onToggleSave={handleToggleSave}
                onOpenDetail={(art) => setSelectedArticle(art)}
                onDiscover={() => setActiveTab('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Deep Read Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onToggleSave={handleToggleSave}
      />

      {/* Footer */}
      <footer className="bg-white text-zinc-500 border-t border-zinc-200 mt-16 py-7 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0F52BA]" />
            <span className="font-editorial-heading font-bold text-zinc-900 tracking-tight">
              LexExtern · 域外法学信息聚合平台
            </span>
            <span className="text-zinc-300">/</span>
            <span>Cloudflare Workers + D1 Powered</span>
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
