import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  BookOpen,
} from 'lucide-react';
import { JURISDICTIONS } from '../constants/academic';
import { fetchJournals, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';

// 经典法学核心法评院校定制装帧配色（高校官方法评色彩与精装皮质光泽）
const JOURNAL_THEMES: Record<string, { bg: string; accent: string; spine: string }> = {
  'harvard-law-rev': {
    bg: 'linear-gradient(135deg, #7C1425 0%, #A51C30 55%, #500812 100%)',
    accent: '#FAD2D8',
    spine: '#3D050C',
  },
  'yale-law-j': {
    bg: 'linear-gradient(135deg, #072B54 0%, #0F4D92 55%, #051D3A 100%)',
    accent: '#CCE0F5',
    spine: '#031224',
  },
  'stanford-law-rev': {
    bg: 'linear-gradient(135deg, #6E0E0E 0%, #8C1515 55%, #460606 100%)',
    accent: '#FBD8D8',
    spine: '#310303',
  },
  'columbia-law-rev': {
    bg: 'linear-gradient(135deg, #132C4F 0%, #1D3C6A 55%, #0A192E 100%)',
    accent: '#C5D8F2',
    spine: '#07101E',
  },
  'uclrev': {
    bg: 'linear-gradient(135deg, #590000 0%, #800000 55%, #380000 100%)',
    accent: '#F5CCCC',
    spine: '#240000',
  },
  'nyu-law-rev': {
    bg: 'linear-gradient(135deg, #370C57 0%, #57068C 55%, #220536 100%)',
    accent: '#E6CCFA',
    spine: '#170324',
  },
  'penn-law-rev': {
    bg: 'linear-gradient(135deg, #011847 0%, #0A2F7D 55%, #7A0000 100%)',
    accent: '#D0E0FF',
    spine: '#000E2B',
  },
  'virginia-law-rev': {
    bg: 'linear-gradient(135deg, #182842 0%, #233B63 55%, #0D1726 100%)',
    accent: '#D5E2F7',
    spine: '#080E1A',
  },
  'california-law-rev': {
    bg: 'linear-gradient(135deg, #002244 0%, #003262 55%, #B8760A 100%)',
    accent: '#FDE4B0',
    spine: '#00152B',
  },
  'duke-law-j': {
    bg: 'linear-gradient(135deg, #00164A 0%, #012169 55%, #000B29 100%)',
    accent: '#CAD8F8',
    spine: '#00071C',
  },
  'northwestern-law-rev': {
    bg: 'linear-gradient(135deg, #2D144A 0%, #4E2A84 55%, #1C0A30 100%)',
    accent: '#E2D4F5',
    spine: '#130521',
  },
  'cornell-law-rev': {
    bg: 'linear-gradient(135deg, #7A1111 0%, #B31B1B 55%, #520808 100%)',
    accent: '#FCD4D4',
    spine: '#380505',
  },
  'georgetown-law-j': {
    bg: 'linear-gradient(135deg, #031836 0%, #0C2340 55%, #4C565E 100%)',
    accent: '#CFDCEB',
    spine: '#020D1D',
  },
  'ucla-law-rev': {
    bg: 'linear-gradient(135deg, #15466B 0%, #2774AE 55%, #0B2940 100%)',
    accent: '#D4EBFB',
    spine: '#071A29',
  },
  'michigan-law-rev': {
    bg: 'linear-gradient(135deg, #002140 0%, #0A3D73 55%, #001429 100%)',
    accent: '#FFCB05',
    spine: '#000D1C',
  },
  'hofstra-law-rev': {
    bg: 'linear-gradient(135deg, #00362B 0%, #005A49 55%, #00211A 100%)',
    accent: '#BFEADB',
    spine: '#001410',
  },
};

function getJournalTheme(journal: Journal) {
  if (JOURNAL_THEMES[journal.id]) {
    return JOURNAL_THEMES[journal.id];
  }
  const defaultHex = journal.coverColor && journal.coverColor.startsWith('#')
    ? journal.coverColor
    : '#1e3a8a';
  return {
    bg: `linear-gradient(135deg, ${defaultHex} 0%, #0f172a 100%)`,
    accent: '#E2E8F0',
    spine: '#090d16',
  };
}

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

    // 2. Remote Bookmark persistence
    try {
      await toggleBookmark('journal', id, user?.id);
      if (onShowToast) {
        onShowToast(
          nextState
            ? `已将《${target.nameCn}》置顶至核心期刊架`
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

  const pinnedCount = useMemo(() => journals.filter((j) => j.isPinned).length, [journals]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner (Apple-style frosted card) */}
      <div className="bg-white rounded-2xl sm:rounded-[22px] p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20 text-[#0071E3] text-[11px] font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Curated Core Law Reviews · 国际核心法评总览</span>
            </div>
            <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              域外法学核心期刊架 (Journal Shelf)
            </h1>
            <p className="text-xs text-[#86868B] leading-relaxed">
              汇聚全球知名法学院旗舰法学评论（Law Reviews），追踪最新卷期发布进展，支持个性化置顶与全文深度检索。
            </p>
          </div>

          {/* Quick Stats & Refresh Button */}
          <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.04] text-xs font-semibold text-[#1D1D1F]">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>已置顶 <strong className="text-[#0071E3] font-bold font-mono">{pinnedCount}</strong> 本</span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="增量同步最新期刊元数据"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0071E3]' : 'text-[#86868B]'}`} />
              <span>{isRefreshing ? '同步中...' : '刷新期刊'}</span>
              {lastSyncTime && (
                <span className="text-[10px] text-[#86868B] font-mono hidden md:inline">
                  ({lastSyncTime})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Jurisdiction Filter Bar */}
        <div className="mt-6 pt-6 border-t border-black/[0.04] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTriggerSearch();
              }}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索期刊中文名、英文名、缩写或主办学院..."
              className="w-full pl-9 pr-20 py-2 bg-[#F5F5F7] border border-black/[0.04] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            />
            <button
              onClick={handleTriggerSearch}
              className="absolute right-1.5 px-2.5 py-1 bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span>搜索</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
          </div>

          {/* Jurisdiction Pills */}
          <div className="flex items-center gap-1 overflow-x-auto bg-[#F5F5F7] p-1 rounded-xl border border-black/[0.04] shrink-0">
            {JURISDICTIONS.map((j) => {
              const isSelected = selectedJurisdiction === j.id;
              // 标注各法域当前收录状态
              const badgeText = j.id === 'All' ? '16' : j.id === 'US' ? '16' : '筹备中';
              return (
                <button
                  key={j.id}
                  onClick={() => {
                    setSelectedJurisdiction(j.id as JurisdictionType);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  <span>{j.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/[0.06] text-[#1D1D1F]' : 'bg-black/[0.03] text-[#86868B]'
                  }`}>
                    {badgeText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] border border-black/[0.06] p-5 space-y-4 animate-pulse">
              <div className="h-24 bg-zinc-100 rounded-xl" />
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
              <div className="h-16 bg-zinc-50 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && journals.length === 0 && (
        <div className="bg-white rounded-[22px] border border-black/[0.06] p-12 text-center space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 rounded-full bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#1D1D1F] font-editorial-heading">
              {selectedJurisdiction !== 'All' && selectedJurisdiction !== 'US'
                ? '该法域期刊收录建设中'
                : '未找到符合条件的法学期刊'}
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              {selectedJurisdiction !== 'All' && selectedJurisdiction !== 'US'
                ? '目前平台已全量覆盖美国 T14 顶级法学评论。英联邦、欧盟法与国际法期刊正在抓取入库中，欢迎前往【心愿单】提名您希望优先收录的法学期刊！'
                : '当前法域或关键词检索无匹配结果。您可以尝试重置筛选条件或前往【心愿单】提交收录心愿。'}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置所有筛选条件</span>
          </button>
        </div>
      )}

      {/* Grid of Journals with Apple Bookbinding Styling */}
      {!isLoading && journals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {journals.map((journal) => {
            const theme = getJournalTheme(journal);
            return (
              <div
                key={journal.id}
                className={`bg-white rounded-[20px] border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 ${
                  journal.isPinned ? 'border-[#0071E3] ring-2 ring-[#0071E3]/15' : 'border-black/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div>
                  {/* Card Banner Header (Authentic Leather & Cloth Bookbinding) */}
                  <div
                    style={{ background: theme.bg }}
                    className="p-5 text-white flex items-start justify-between relative overflow-hidden select-none"
                  >
                    {/* Visual Spine Accent on left */}
                    <div
                      style={{ background: theme.spine }}
                      className="absolute top-0 left-0 bottom-0 w-2.5 opacity-60 shadow-inner"
                    />

                    {journal.isPinned && (
                      <div className="absolute top-2.5 right-12 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>已置顶</span>
                      </div>
                    )}

                    <div className="space-y-1.5 pr-6 pl-2 z-10">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 bg-black/25 backdrop-blur-md rounded-md border border-white/10 shadow-xs">
                          {journal.abbreviation || journal.nameOriginal.slice(0, 15)}
                        </span>
                        {journal.tier && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-bold shadow-xs">
                            {journal.tier}
                          </span>
                        )}
                        <span className="text-[11px] opacity-80 font-sans tracking-tight">
                          {journal.country === 'US' ? '美国' : journal.country || 'Global'}
                        </span>
                      </div>
                      <h2 className="font-bold text-base font-editorial-heading tracking-tight leading-snug drop-shadow-xs">
                        {journal.nameCn}
                      </h2>
                    </div>

                    {/* Pin Action Button */}
                    <button
                      onClick={() => handleTogglePin(journal.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer z-10 ${
                        journal.isPinned
                          ? 'bg-white text-[#0071E3] shadow-xs hover:bg-[#F5F5F7]'
                          : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs'
                      }`}
                      title={journal.isPinned ? '取消置顶' : '置顶至核心期刊架'}
                    >
                      {journal.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Journal Info Body */}
                  <div className="p-5 space-y-3 font-sans text-xs">
                    <div className="text-[#86868B] italic font-serif text-[11px] line-clamp-1">
                      {journal.nameOriginal}
                    </div>

                    <div className="space-y-1.5 text-[#6E6E73]">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                        <span className="truncate text-[#1D1D1F] font-medium">{journal.institution}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-[#1D1D1F]">{journal.impactRank}</span>
                        </div>
                        {(journal.issn || journal.issnPrint || journal.issnElectronic) && (
                          <span className="font-mono text-[10px] text-[#6E6E73] bg-[#F5F5F7] px-1.5 py-0.5 rounded-md border border-black/[0.04]">
                            ISSN: {journal.issn || journal.issnPrint || journal.issnElectronic}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[#6E6E73] text-xs leading-relaxed line-clamp-3 bg-[#F5F5F7]/70 p-3 rounded-xl border border-black/[0.03]">
                      {journal.description}
                    </p>

                    {/* Discipline Tags */}
                    {(journal.tagsCn || journal.tags) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(journal.tagsCn && journal.tagsCn.length > 0 ? journal.tagsCn : journal.tags || []).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#6E6E73] text-[10px] border border-black/[0.04]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-[#F5F5F7]/50 border-t border-black/[0.04] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-[#86868B] font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>{journal.currentIssue || '最新卷期'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onFilterByJournal && (
                      <button
                        onClick={() => onFilterByJournal(journal.nameOriginal, journal.currentIssue)}
                        className="px-3 py-1.5 bg-white hover:bg-[#0071E3] text-[#1D1D1F] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-black/[0.06] shadow-2xs hover:border-transparent"
                      >
                        <BookOpenCheck className="w-3.5 h-3.5" />
                        <span>查看收录</span>
                      </button>
                    )}

                    {journal.officialUrl && (
                      <a
                        href={journal.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-lg transition-colors cursor-pointer"
                        title="访问期刊官方主页"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
