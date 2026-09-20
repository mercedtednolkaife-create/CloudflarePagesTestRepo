import React, { useState, useEffect, useCallback } from 'react';
import { Journal, JurisdictionType, PaginationMeta } from '../types';
import { Pagination } from './Pagination';
import { 
  Pin, 
  PinOff, 
  ExternalLink, 
  Search, 
  Award, 
  Layers, 
  BookOpenCheck,
  Building,
  CornerDownLeft,
  RefreshCw,
  Loader2,
  BookmarkCheck,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { JURISDICTIONS } from '../constants/academic';
import { fetchJournals, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JournalShelfProps {
  journals?: Journal[];
  onTogglePin?: (id: string) => void;
  onFilterByJournal?: (journalName: string, issueOrVolume?: string) => void;
  onShowToast?: (text: string, type?: 'success' | 'error') => void;
}

export const JournalShelf: React.FC<JournalShelfProps> = ({
  journals: initialJournals,
  onTogglePin: externalTogglePin,
  onFilterByJournal,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>(initialJournals || []);
  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('All');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const loadData = useCallback(
    async (targetPage = page, bypassCache = false) => {
      setIsLoading(true);
      try {
        const res = await fetchJournals({
          jurisdiction: selectedJurisdiction,
          search: searchQuery,
          page: targetPage,
          pageSize,
          bypassCache,
        });
        setJournals(res.journals);
        setPagination(res.pagination);
        setLastSyncTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
      } catch (err: any) {
        console.error('Failed to load journals:', err);
        if (onShowToast) {
          onShowToast(err?.message || '加载核心期刊架失败，请重试', 'error');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedJurisdiction, searchQuery, page, pageSize, onShowToast]
  );

  useEffect(() => {
    loadData(page);
  }, [selectedJurisdiction, searchQuery, page, pageSize, loadData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData(page, true);
  };

  const handleTriggerSearch = () => {
    setSearchQuery(localSearch.trim());
    setPage(1);
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setSearchQuery('');
    setSelectedJurisdiction('All');
    setPage(1);
  };

  const handleTogglePin = async (id: string) => {
    const target = journals.find((j) => j.id === id);
    if (!target) return;

    const nextState = !target.isPinned;

    // 1. Optimistic Update (置顶优先排在前面)
    setJournals((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, isPinned: nextState } : j));
      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return a.nameCn.localeCompare(b.nameCn, 'zh-CN');
      });
    });

    if (externalTogglePin) {
      externalTogglePin(id);
    }

    // 2. Remote D1 Bookmark persistence
    try {
      await toggleBookmark('journal', id, user?.id);
      if (onShowToast) {
        onShowToast(
          nextState
            ? `已将《${target.nameCn}》置顶至个人核心期刊架`
            : `已取消《${target.nameCn}》置顶`
        );
      }
    } catch (err: any) {
      console.error('Failed to toggle pin:', err);
      // Rollback
      setJournals((prev) =>
        prev.map((j) => (j.id === id ? { ...j, isPinned: !nextState } : j))
      );
      if (onShowToast) {
        onShowToast('期刊置顶状态同步失败，请检查网络或登录状态', 'error');
      }
    }
  };

  const pinnedCount = journals.filter((j) => j.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Curated Core Law Reviews · D1 Registry</span>
            </div>
            <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              域外法学核心期刊架 (Journal Shelf)
            </h1>
          </div>

          {/* Quick Stats & Refresh Button */}
          <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#0F52BA]" />
              <span>已置顶 <strong className="text-[#0F52BA] font-bold font-mono">{pinnedCount}</strong> 本</span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="增量同步最新期刊元数据"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0F52BA]' : ''}`} />
              <span>{isRefreshing ? '同步中...' : '刷新期刊'}</span>
              {lastSyncTime && (
                <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                  ({lastSyncTime})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Jurisdiction Filter */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTriggerSearch();
              }}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索期刊名称、缩写或主办机构 (按 Enter 检索)..."
              className="w-full pl-9 pr-20 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA]"
            />
            <button
              onClick={handleTriggerSearch}
              className="absolute right-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <span>搜索</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setSelectedJurisdiction(j.id as JurisdictionType);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedJurisdiction === j.id
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 animate-pulse">
              <div className="h-20 bg-zinc-100 rounded-xl" />
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
              <div className="h-16 bg-zinc-50 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && journals.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900">未找到符合条件的法学期刊</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              当前法域或关键词检索无结果。您可以尝试重置筛选条件或前往“心愿单”提议新增收录。
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置所有筛选条件</span>
          </button>
        </div>
      )}

      {/* Grid of Journals */}
      {!isLoading && journals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {journals.map((journal) => (
            <div
              key={journal.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-sm ${
                journal.isPinned ? 'border-[#0F52BA] ring-2 ring-[#0F52BA]/10' : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div>
                {/* Card Banner Header */}
                <div className={`p-4 bg-gradient-to-r ${journal.coverColor} text-white flex items-start justify-between relative`}>
                  {journal.isPinned && (
                    <div className="absolute top-2 right-12 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>已置顶</span>
                    </div>
                  )}
                  <div className="space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded">
                        {journal.abbreviation}
                      </span>
                      {journal.tier && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 font-bold">
                          {journal.tier}
                        </span>
                      )}
                      <span className="text-[11px] opacity-80 font-sans">
                        {journal.country}
                      </span>
                    </div>
                    <h2 className="font-bold text-base font-editorial-heading tracking-tight leading-snug">
                      {journal.nameCn}
                    </h2>
                  </div>

                  {/* Pin Action Button */}
                  <button
                    onClick={() => handleTogglePin(journal.id)}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      journal.isPinned
                        ? 'bg-white text-[#0F52BA] shadow-xs hover:bg-zinc-100'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={journal.isPinned ? '取消置顶' : '置顶到书架顶部'}
                  >
                    {journal.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                </div>

                {/* Journal Info Body */}
                <div className="p-5 space-y-3 font-sans text-xs">
                  <div className="text-zinc-500 italic font-serif text-[11px]">
                    {journal.nameOriginal}
                  </div>

                  <div className="space-y-1.5 text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{journal.institution}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-semibold text-zinc-800">{journal.impactRank}</span>
                      </div>
                      {(journal.issn || journal.issnPrint || journal.issnElectronic) && (
                        <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                          ISSN: {journal.issn || journal.issnPrint || journal.issnElectronic}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-600 text-xs leading-relaxed line-clamp-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                    {journal.description}
                  </p>

                  {(journal.tagsCn || journal.tags) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(journal.tagsCn && journal.tagsCn.length > 0 ? journal.tagsCn : journal.tags || []).map((t) => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {journal.currentIssue}
                </span>

                <div className="flex items-center gap-2">
                  {onFilterByJournal && (
                    <button
                      onClick={() => onFilterByJournal(journal.nameOriginal, journal.currentIssue)}
                      className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 text-[#0F52BA]" />
                      <span>查看收录</span>
                    </button>
                  )}

                  <a
                    href={journal.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                    title="访问期刊官方主页"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <Pagination
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          itemName="本期刊"
        />
      )}
    </div>
  );
};
