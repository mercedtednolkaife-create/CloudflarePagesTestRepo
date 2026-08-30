import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Article,
  AcademicEvent,
  Journal,
  Author,
  WishlistItem,
  JurisdictionType,
  GlobalSearchResult,
  NavTab,
} from '../types';
import { TOPIC_TAGS, JURISDICTIONS } from '../constants/academic';
import { fetchGlobalSearch } from '../services/api';
import {
  Search,
  X,
  Filter,
  BookOpen,
  Library,
  Users,
  CalendarClock,
  ArrowRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  RotateCcw,
  CornerDownLeft,
  Loader2,
  Quote,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  Clock,
  Award,
  Globe,
  Building,
} from 'lucide-react';
import { generateBluebook } from '../lib/citationGenerator';

interface HomeProps {
  articles: Article[];
  events: AcademicEvent[];
  journals: Journal[];
  authors?: Author[];
  wishlists?: WishlistItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedJurisdiction: JurisdictionType;
  setSelectedJurisdiction: (j: JurisdictionType) => void;
  onOpenArticleDetail?: (article: Article) => void;
  onToggleSave?: (id: string, type?: 'paper' | 'author' | 'journal' | 'article') => void;
  onFilterByJournal: (journalName: string) => void;
  onViewAuthorPapers: (authorName: string) => void;
  onViewPaperInFeed?: (paperTitle: string, journalName?: string) => void;
  onNavigateToTab: (tab: NavTab) => void;
  onResetFilters: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const Home: React.FC<HomeProps> = ({
  articles,
  events,
  journals,
  authors = [],
  wishlists = [],
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  selectedJurisdiction,
  setSelectedJurisdiction,
  onOpenArticleDetail,
  onToggleSave,
  onFilterByJournal,
  onViewAuthorPapers,
  onViewPaperInFeed,
  onNavigateToTab,
  onResetFilters,
  onShowToast,
}) => {
  // Local input state for the search bar
  const [localSearchInput, setLocalSearchInput] = useState<string>(searchQuery);
  const [isSearchingFts, setIsSearchingFts] = useState<boolean>(false);
  const [ftsResults, setFtsResults] = useState<GlobalSearchResult[]>([]);
  const [showFtsDropdown, setShowFtsDropdown] = useState<boolean>(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  // Pagination for Weekly Updated Articles
  const [weeklyArticlesPage, setWeeklyArticlesPage] = useState<number>(1);
  const weeklyArticlesPageSize = 5;

  // Search Results Entity Filter Tab ('all' | 'papers' | 'authors' | 'journals' | 'events' | 'wishlist')
  const [searchEntityFilter, setSearchEntityFilter] = useState<string>('all');
  const [searchResultsPage, setSearchResultsPage] = useState<number>(1);
  const searchResultsPageSize = 8;

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync external search query
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowFtsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if Search Mode is active
  const isSearchActive =
    searchQuery.trim().length > 0 ||
    selectedTag !== '全部领域' ||
    selectedJurisdiction !== 'All';

  // Perform search commit
  const handlePerformSearch = async () => {
    const trimmed = localSearchInput.trim();
    setSearchQuery(trimmed);
    setSearchResultsPage(1);

    if (!trimmed) {
      setFtsResults([]);
      setShowFtsDropdown(false);
      return;
    }

    setIsSearchingFts(true);
    try {
      const results = await fetchGlobalSearch(trimmed);
      setFtsResults(results);
    } catch (err) {
      console.error('FTS search failed in Home:', err);
    } finally {
      setIsSearchingFts(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePerformSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchInput('');
    setSearchQuery('');
    setFtsResults([]);
    setShowFtsDropdown(false);
    onResetFilters();
  };

  const handleCopyCitation = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    const citation = generateBluebook(article);
    navigator.clipboard.writeText(citation);
    setCopiedCitationId(article.id);
    if (onShowToast) onShowToast('已复制 Bluebook 引证格式至剪贴板！', 'success');
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  // --- SEARCH MODE: Multi-Entity Filtering ---
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        a.titleCn.toLowerCase().includes(q) ||
        a.titleOriginal.toLowerCase().includes(q) ||
        a.journalName.toLowerCase().includes(q) ||
        a.authors.some((author) => author.toLowerCase().includes(q)) ||
        a.abstractCn.toLowerCase().includes(q);

      const matchesTag =
        selectedTag === '全部领域' ||
        (a.tags && a.tags.some((t) => t.includes(selectedTag) || selectedTag.includes(t)));

      const matchesJurisdiction =
        selectedJurisdiction === 'All' || a.jurisdiction === selectedJurisdiction;

      return matchesQuery && matchesTag && matchesJurisdiction;
    });
  }, [articles, searchQuery, selectedTag, selectedJurisdiction]);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim() && selectedTag === '全部领域') return authors;
    const q = searchQuery.toLowerCase().trim();
    return authors.filter((a) => {
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.institution?.name || '').toLowerCase().includes(q) ||
        (a.ssrnId || '').toLowerCase().includes(q);

      const matchesTag =
        selectedTag === '全部领域' ||
        (a.tags && a.tags.some((t) => t.includes(selectedTag) || selectedTag.includes(t)));

      return matchesQuery && matchesTag;
    });
  }, [authors, searchQuery, selectedTag]);

  const filteredJournals = useMemo(() => {
    if (!searchQuery.trim() && selectedTag === '全部领域' && selectedJurisdiction === 'All')
      return journals;
    const q = searchQuery.toLowerCase().trim();
    return journals.filter((j) => {
      const matchesQuery =
        !q ||
        j.nameCn.toLowerCase().includes(q) ||
        j.nameOriginal.toLowerCase().includes(q) ||
        j.abbreviation.toLowerCase().includes(q) ||
        j.institution.toLowerCase().includes(q);

      const matchesJurisdiction =
        selectedJurisdiction === 'All' || j.jurisdiction === selectedJurisdiction;

      return matchesQuery && matchesJurisdiction;
    });
  }, [journals, searchQuery, selectedTag, selectedJurisdiction]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim() && selectedTag === '全部领域') return events;
    const q = searchQuery.toLowerCase().trim();
    return events.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchesTag =
        selectedTag === '全部领域' ||
        (e.tags && e.tags.some((t) => t.includes(selectedTag) || selectedTag.includes(t)));

      return matchesQuery && matchesTag;
    });
  }, [events, searchQuery, selectedTag]);

  const filteredWishlists = useMemo(() => {
    if (!searchQuery.trim()) return wishlists;
    const q = searchQuery.toLowerCase().trim();
    return wishlists.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.submitter.toLowerCase().includes(q) ||
        (w.notes && w.notes.toLowerCase().includes(q))
    );
  }, [wishlists, searchQuery]);

  // Combined Search Result Items
  type UnifiedResultItem =
    | { type: 'article'; data: Article }
    | { type: 'author'; data: Author }
    | { type: 'journal'; data: Journal }
    | { type: 'event'; data: AcademicEvent }
    | { type: 'wishlist'; data: WishlistItem };

  const unifiedSearchResults: UnifiedResultItem[] = useMemo(() => {
    let list: UnifiedResultItem[] = [];

    if (searchEntityFilter === 'all' || searchEntityFilter === 'papers') {
      filteredArticles.forEach((item) => list.push({ type: 'article', data: item }));
    }
    if (searchEntityFilter === 'all' || searchEntityFilter === 'authors') {
      filteredAuthors.forEach((item) => list.push({ type: 'author', data: item }));
    }
    if (searchEntityFilter === 'all' || searchEntityFilter === 'journals') {
      filteredJournals.forEach((item) => list.push({ type: 'journal', data: item }));
    }
    if (searchEntityFilter === 'all' || searchEntityFilter === 'events') {
      filteredEvents.forEach((item) => list.push({ type: 'event', data: item }));
    }
    if (searchEntityFilter === 'all' || searchEntityFilter === 'wishlist') {
      filteredWishlists.forEach((item) => list.push({ type: 'wishlist', data: item }));
    }

    return list;
  }, [
    searchEntityFilter,
    filteredArticles,
    filteredAuthors,
    filteredJournals,
    filteredEvents,
    filteredWishlists,
  ]);

  const totalSearchCount =
    filteredArticles.length +
    filteredAuthors.length +
    filteredJournals.length +
    filteredEvents.length +
    filteredWishlists.length;

  const totalSearchPages = Math.ceil(unifiedSearchResults.length / searchResultsPageSize) || 1;
  const paginatedSearchResults = useMemo(() => {
    const start = (searchResultsPage - 1) * searchResultsPageSize;
    return unifiedSearchResults.slice(start, start + searchResultsPageSize);
  }, [unifiedSearchResults, searchResultsPage, searchResultsPageSize]);

  // --- DEFAULT MODE: This Week's Updates ---
  // Articles: slice paginated
  const totalWeeklyArticlesPages = Math.ceil(articles.length / weeklyArticlesPageSize) || 1;
  const paginatedWeeklyArticles = useMemo(() => {
    const start = (weeklyArticlesPage - 1) * weeklyArticlesPageSize;
    return articles.slice(start, start + weeklyArticlesPageSize);
  }, [articles, weeklyArticlesPage, weeklyArticlesPageSize]);

  // Upcoming Events (next 14 days or sort by deadline)
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.deadline).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4);
  }, [events]);

  // Pinned/Featured Journals
  const featuredJournals = useMemo(() => {
    const pinned = journals.filter((j) => j.isPinned);
    return pinned.length > 0 ? pinned.slice(0, 5) : journals.slice(0, 5);
  }, [journals]);

  // Recent Scholar Highlights
  const recentAuthors = useMemo(() => {
    return authors.slice(0, 4);
  }, [authors]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP PROMINENT SEARCH HERO (置顶搜索框) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LexExtern Knowledge Engine · 全网法学图谱检索</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-zinc-900 tracking-tight">
              域外法学前沿检索与动态 (Jurisprudence Hub)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans">
              直连 SSCI 法学一区期刊、SSRN 顶尖学者论著、征稿启事 (CFP) 与引证数据库。
            </p>
          </div>
        </div>

        {/* Integrated Search Input Strip */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Main Input Box */}
          <div className="relative flex-1 group" ref={searchContainerRef}>
            <div className="relative flex items-center bg-zinc-50 hover:bg-white rounded-xl border border-zinc-200 focus-within:border-[#0F52BA] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F52BA]/10 shadow-xs transition-all">
              <div className="pl-3.5 pr-2 text-zinc-400">
                {isSearchingFts ? (
                  <Loader2 className="w-4 h-4 text-[#0F52BA] animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <input
                id="home-main-search-input"
                type="text"
                value={localSearchInput}
                onKeyDown={handleKeyDown}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                placeholder="检索全球法学文献、学者名、DOI、期刊或裁判要旨 (输入后按 Enter 或点击【检索】)..."
                className="w-full py-3 pr-24 text-xs sm:text-sm text-[#09090B] placeholder-zinc-400 bg-transparent focus:outline-none font-sans"
              />

              {/* Action Buttons inside Input */}
              <div className="absolute right-2 flex items-center gap-1.5">
                {localSearchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
                    title="清空检索"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={handlePerformSearch}
                  disabled={isSearchingFts}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  title="按 Enter 或点击发起检索"
                >
                  <span>检索</span>
                  <CornerDownLeft className="w-3 h-3 opacity-70" />
                </button>
              </div>
            </div>

            {/* Dropdown Quick Results if user triggers quick match */}
            {showFtsDropdown && ftsResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-zinc-100 max-h-80 overflow-y-auto">
                <div className="bg-zinc-50 px-3.5 py-2 flex items-center justify-between text-[11px] text-zinc-500 font-sans border-b border-zinc-100">
                  <span className="flex items-center gap-1 font-semibold text-zinc-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F52BA]" />
                    全文索引快速匹配 ({ftsResults.length})
                  </span>
                  <span className="font-mono text-[10px]">点击可直接定位</span>
                </div>
                {ftsResults.map((item, idx) => (
                  <div
                    key={`${item.entityType}-${item.entityId}-${idx}`}
                    onClick={() => {
                      setShowFtsDropdown(false);
                      if (item.entityType === 'paper' || item.entityType === 'article') {
                        if (onViewPaperInFeed) {
                          onViewPaperInFeed(item.rawTitle);
                        } else {
                          onNavigateToTab('papers');
                        }
                      } else if (item.entityType === 'author') {
                        onViewAuthorPapers(item.rawTitle);
                      } else if (item.entityType === 'journal') {
                        onFilterByJournal(item.rawTitle);
                      } else if (item.entityType === 'wishlist') {
                        onNavigateToTab('wishlist');
                      }
                    }}
                    className="p-3 hover:bg-zinc-50 cursor-pointer transition-colors space-y-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {item.entityType === 'author'
                          ? '学者'
                          : item.entityType === 'journal'
                          ? '期刊'
                          : item.entityType === 'wishlist'
                          ? '心愿'
                          : '文献'}
                      </span>
                      <div
                        className="text-xs font-semibold text-zinc-900 truncate"
                        dangerouslySetInnerHTML={{ __html: item.titleHighlighted || item.rawTitle }}
                      />
                    </div>
                    <div
                      className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: item.contentHighlighted || item.rawContent,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jurisdiction Filter Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0 overflow-x-auto">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setSelectedJurisdiction(j.id as JurisdictionType);
                  setSearchResultsPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedJurisdiction === j.id
                    ? 'bg-white text-[#09090B] shadow-xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tag Pills */}
        <div className="pt-4 border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-zinc-500 text-[11px] whitespace-nowrap flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#0F52BA]" />
            领域细分:
          </span>
          {TOPIC_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setSearchResultsPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BODY DISPLAY: SEARCH RESULTS MODE vs. THIS WEEK'S UPDATES */}
      {/* ============================================================ */}

      {isSearchActive ? (
        /* --- MODE A: SEARCH RESULTS VIEW (取代本周更新信息) --- */
        <section className="space-y-5">
          {/* Search Result Status & Sub-filters */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-900">
                检索关键词: <strong className="text-[#0F52BA]">「{searchQuery || '全部'}」</strong>
              </span>
              {selectedTag !== '全部领域' && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                  #{selectedTag}
                </span>
              )}
              {selectedJurisdiction !== 'All' && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                  法域: {selectedJurisdiction}
                </span>
              )}
              <span className="text-xs text-zinc-500 font-mono">
                · 共匹配 <strong>{totalSearchCount}</strong> 条实体
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSearch}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清除检索，返回本周更新</span>
              </button>
            </div>
          </div>

          {/* Search Entity Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: '全部匹配', count: totalSearchCount },
              { id: 'papers', label: '法学文献', count: filteredArticles.length },
              { id: 'authors', label: '学者画像', count: filteredAuthors.length },
              { id: 'journals', label: '核心期刊', count: filteredJournals.length },
              { id: 'events', label: '学术活动', count: filteredEvents.length },
              { id: 'wishlist', label: '收录心愿', count: filteredWishlists.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSearchEntityFilter(tab.id);
                  setSearchResultsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  searchEntityFilter === tab.id
                    ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    searchEntityFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {paginatedSearchResults.length > 0 ? (
              <>
                <div className="space-y-3.5">
                  {paginatedSearchResults.map((item, idx) => {
                    if (item.type === 'article') {
                      const article = item.data;
                      return (
                        <div
                          key={`article-${article.id}-${idx}`}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0F52BA] border border-blue-200">
                                  法学文献
                                </span>
                                <button
                                  onClick={() => onFilterByJournal(article.journalName)}
                                  className="text-xs font-semibold text-zinc-800 hover:text-[#0F52BA] underline cursor-pointer"
                                >
                                  {article.journalName} ({article.journalAbbr})
                                </button>
                                <span className="text-[11px] text-zinc-400 font-mono">
                                  {article.volumeIssue} · {article.publishDate}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-zinc-900 font-editorial-heading leading-snug">
                                <span
                                  onClick={() => onOpenArticleDetail && onOpenArticleDetail(article)}
                                  className="hover:text-[#0F52BA] cursor-pointer"
                                >
                                  {article.titleOriginal}
                                </span>
                              </h3>
                              <p className="text-xs text-zinc-600 font-serif italic">
                                {article.titleCn}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e) => handleCopyCitation(e, article)}
                                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                                title="复制 Bluebook 引证"
                              >
                                {copiedCitationId === article.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Quote className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {onToggleSave && (
                                <button
                                  onClick={() => onToggleSave(article.id, 'article')}
                                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                    article.saved
                                      ? 'bg-blue-50 text-[#0F52BA] border-blue-200'
                                      : 'border-zinc-200 text-zinc-400 hover:text-zinc-700'
                                  }`}
                                  title="收藏"
                                >
                                  {article.saved ? (
                                    <BookmarkCheck className="w-3.5 h-3.5 fill-[#0F52BA]" />
                                  ) : (
                                    <Bookmark className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600">
                            <span className="font-medium text-zinc-800">著者:</span>
                            {article.authors.map((authorName) => (
                              <button
                                key={authorName}
                                onClick={() => onViewAuthorPapers(authorName)}
                                className="hover:text-[#0F52BA] hover:underline cursor-pointer"
                              >
                                {authorName}
                              </button>
                            ))}
                            {article.authorAffiliation && (
                              <span className="text-[11px] text-zinc-400">
                                ({article.authorAffiliation})
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                            {article.abstractCn}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {article.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px]"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                if (onViewPaperInFeed) {
                                  onViewPaperInFeed(article.titleOriginal, article.journalName);
                                } else {
                                  onNavigateToTab('papers');
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[#0F52BA] hover:underline font-semibold text-xs cursor-pointer"
                            >
                              <span>在文献流中查看</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (item.type === 'author') {
                      const author = item.data;
                      return (
                        <div
                          key={`author-${author.id}-${idx}`}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {author.name.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    学者画像
                                  </span>
                                  <h3 className="text-base font-bold text-zinc-900 font-editorial-heading">
                                    {author.name}
                                  </h3>
                                </div>
                                {author.institution && (
                                  <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                    <Building className="w-3 h-3 text-zinc-400" />
                                    <span>{author.institution.name}</span>
                                    {author.institution.country && (
                                      <span className="text-zinc-400">
                                        · {author.institution.country}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => onViewAuthorPapers(author.name)}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>查看该学者全部文献</span>
                            </button>
                          </div>

                          {author.tags && author.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {author.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px]"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          {author.papers && author.papers.length > 0 && (
                            <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-xs text-zinc-700 space-y-1">
                              <span className="text-[11px] font-semibold text-zinc-500">
                                代表论著:
                              </span>
                              {author.papers.slice(0, 3).map((p) => (
                                <div key={p.id} className="truncate text-zinc-800">
                                  • {p.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (item.type === 'journal') {
                      const journal = item.data;
                      return (
                        <div
                          key={`journal-${journal.id}-${idx}`}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  核心期刊
                                </span>
                                <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded">
                                  {journal.abbreviation}
                                </span>
                                <span className="text-xs text-zinc-500">{journal.country}</span>
                              </div>
                              <h3 className="text-base font-bold text-zinc-900 font-editorial-heading">
                                {journal.nameCn} ·{' '}
                                <span className="italic font-serif font-normal text-zinc-600">
                                  {journal.nameOriginal}
                                </span>
                              </h3>
                              <p className="text-xs text-zinc-500">
                                {journal.institution} · {journal.impactRank}
                              </p>
                            </div>

                            <button
                              onClick={() => onFilterByJournal(journal.nameOriginal)}
                              className="px-3 py-1.5 bg-[#0F52BA] hover:bg-[#093d94] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>查看收录文献</span>
                            </button>
                          </div>

                          <p className="text-xs text-zinc-600 line-clamp-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                            {journal.description}
                          </p>
                        </div>
                      );
                    }

                    if (item.type === 'event') {
                      const evt = item.data;
                      return (
                        <div
                          key={`event-${evt.id}-${idx}`}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  学术活动与征稿
                                </span>
                                <span className="text-xs font-semibold text-zinc-600">
                                  {evt.type}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-zinc-900 font-editorial-heading">
                                {evt.title}
                              </h3>
                              <p className="text-xs text-zinc-500">
                                主办方: {evt.host} · 地点: {evt.location}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-semibold text-rose-600 font-mono">
                                截止: {evt.deadline}
                              </div>
                              <button
                                onClick={() => onNavigateToTab('events')}
                                className="mt-1.5 px-3 py-1 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                查看活动
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-600 line-clamp-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                            {evt.description}
                          </p>
                        </div>
                      );
                    }

                    if (item.type === 'wishlist') {
                      const wish = item.data;
                      return (
                        <div
                          key={`wishlist-${wish.id}-${idx}`}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-xs transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  心愿收录
                                </span>
                                <span className="text-xs text-zinc-500">{wish.type}</span>
                              </div>
                              <h3 className="text-base font-bold text-zinc-900 font-editorial-heading mt-1">
                                {wish.name}
                              </h3>
                              <p className="text-xs text-zinc-500">
                                提交学者: {wish.submitter} · 状态: <strong>{wish.status}</strong> ·{' '}
                                {wish.votes} 票支持
                              </p>
                            </div>

                            <button
                              onClick={() => onNavigateToTab('wishlist')}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              前往心愿单
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Search Results Pagination */}
                {totalSearchPages > 1 && (
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
                    <div className="text-xs text-zinc-500 font-mono">
                      第 {searchResultsPage} / {totalSearchPages} 页 (共 {unifiedSearchResults.length}{' '}
                      条)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSearchResultsPage((p) => Math.max(p - 1, 1))}
                        disabled={searchResultsPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>上一页</span>
                      </button>
                      <button
                        onClick={() =>
                          setSearchResultsPage((p) => Math.min(p + 1, totalSearchPages))
                        }
                        disabled={searchResultsPage === totalSearchPages}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                      >
                        <span>下一页</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 space-y-3">
                <Search className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="font-editorial-heading font-bold text-base text-zinc-900">
                  未检索到与「{searchQuery}」相关的法学实体
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  您可以尝试更换检索词，或前往“收录心愿单”提议新增该期刊或学者论著。
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleClearSearch}
                    className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    返回本周更新
                  </button>
                  <button
                    onClick={() => onNavigateToTab('wishlist')}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>提交收录心愿</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* --- MODE B: DEFAULT THIS WEEK'S UPDATES (本周更新陈列) --- */
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 2/3 Column: 本周更新文章 (Weekly Updated Articles) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-editorial-heading font-bold text-lg text-zinc-900 tracking-tight flex items-center gap-2">
                      <span>本周最新更新文章</span>
                      <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0F52BA] border border-blue-200">
                        {articles.length} 篇收录
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                      聚合顶刊最新出版专栏、判例解析与核心论述
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('papers')}
                  className="text-xs text-[#0F52BA] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>查看全部文献流</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weekly Articles List */}
              <div className="space-y-4">
                {paginatedWeeklyArticles.length > 0 ? (
                  <>
                    {paginatedWeeklyArticles.map((article) => (
                      <article
                        key={article.id}
                        className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all p-5 sm:p-6 space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            {/* Journal Info & Metadata */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => onFilterByJournal(article.journalName)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-semibold hover:bg-[#0F52BA] transition-colors cursor-pointer"
                              >
                                <span>{article.journalName}</span>
                                {article.journalAbbr && (
                                  <span className="opacity-70 text-[10px]">
                                    ({article.journalAbbr})
                                  </span>
                                )}
                              </button>

                              <span className="text-[11px] text-zinc-400 font-mono">
                                {article.volumeIssue} · {article.publishDate}
                              </span>

                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                {article.jurisdiction}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900 font-editorial-heading leading-snug hover:text-[#0F52BA] transition-colors">
                              <span
                                onClick={() => onOpenArticleDetail && onOpenArticleDetail(article)}
                                className="cursor-pointer"
                              >
                                {article.titleOriginal}
                              </span>
                            </h3>

                            <p className="text-xs text-zinc-600 font-serif italic">
                              {article.titleCn}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => handleCopyCitation(e, article)}
                              className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                              title="复制 Bluebook 标准引证"
                            >
                              {copiedCitationId === article.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Quote className="w-4 h-4" />
                              )}
                            </button>
                            {onToggleSave && (
                              <button
                                onClick={() => onToggleSave(article.id, 'article')}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  article.saved
                                    ? 'bg-blue-50 text-[#0F52BA] border-blue-200'
                                    : 'border-zinc-200 text-zinc-400 hover:text-zinc-700'
                                }`}
                                title={article.saved ? '取消收藏' : '加入个人收藏夹'}
                              >
                                {article.saved ? (
                                  <BookmarkCheck className="w-4 h-4 fill-[#0F52BA]" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Authors */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600">
                          <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-800">著者:</span>
                          {article.authors.map((author) => (
                            <button
                              key={author}
                              onClick={() => onViewAuthorPapers(author)}
                              className="hover:text-[#0F52BA] hover:underline cursor-pointer"
                            >
                              {author}
                            </button>
                          ))}
                          {article.authorAffiliation && (
                            <span className="text-[11px] text-zinc-400">
                              · {article.authorAffiliation}
                            </span>
                          )}
                        </div>

                        {/* Abstract */}
                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed bg-zinc-50/80 p-3 rounded-xl border border-zinc-100">
                          {article.abstractCn}
                        </p>

                        {/* Footer Tags & Links */}
                        <div className="flex items-center justify-between gap-2 pt-1 text-xs border-t border-zinc-100">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {article.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            {article.doi && (
                              <a
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-[#0F52BA]"
                              >
                                <span>DOI</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => onOpenArticleDetail && onOpenArticleDetail(article)}
                              className="inline-flex items-center gap-1 font-semibold text-[#0F52BA] hover:underline cursor-pointer text-xs"
                            >
                              <span>详情</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}

                    {/* Pagination for weekly updated papers */}
                    {totalWeeklyArticlesPages > 1 && (
                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
                        <span className="text-xs text-zinc-500 font-mono">
                          第 {weeklyArticlesPage} / {totalWeeklyArticlesPages} 页 (本周共{' '}
                          {articles.length} 篇)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWeeklyArticlesPage((p) => Math.max(p - 1, 1))}
                            disabled={weeklyArticlesPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>上一页</span>
                          </button>
                          <button
                            onClick={() =>
                              setWeeklyArticlesPage((p) =>
                                Math.min(p + 1, totalWeeklyArticlesPages)
                              )
                            }
                            disabled={weeklyArticlesPage === totalWeeklyArticlesPages}
                            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                          >
                            <span>下一页</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-zinc-300 mx-auto" />
                    <h3 className="text-sm font-bold text-zinc-800">暂无本周更新文章</h3>
                    <p className="text-xs text-zinc-500">
                      当前队列中暂无本周收录新文章，您可以前往文献流查看历史馆藏。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 1/3 Column: 3 Structured Vertical Widgets */}
            <div className="lg:col-span-4 space-y-5">
              {/* Widget 1: 本周更新学者 (Recent Scholar Highlights) */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-zinc-900">
                      本周更新学者
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('authors')}
                    className="text-xs text-[#0F52BA] hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>全部学者</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentAuthors.length > 0 ? (
                  <div className="space-y-3">
                    {recentAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-colors space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-xs text-zinc-900">{author.name}</div>
                          <button
                            onClick={() => onViewAuthorPapers(author.name)}
                            className="text-[11px] text-[#0F52BA] hover:underline font-medium shrink-0 cursor-pointer"
                          >
                            查看论文
                          </button>
                        </div>
                        {author.institution && (
                          <div className="text-[11px] text-zinc-500 truncate">
                            {author.institution.name}
                          </div>
                        )}
                        {author.tags && author.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {author.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded bg-white text-zinc-600 text-[10px] border border-zinc-200"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-3 text-center">暂无学者更新</p>
                )}
              </div>

              {/* Widget 2: 即将截止学术活动与征稿 (Upcoming Academic Deadlines) */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      <CalendarClock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-zinc-900">
                      即将截止活动与征稿
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('events')}
                    className="text-xs text-[#0F52BA] hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>全部活动</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((evt) => {
                      const days = Math.ceil(
                        (new Date(evt.deadline).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = days <= 5;
                      return (
                        <div
                          key={evt.id}
                          className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-colors space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-zinc-900 line-clamp-1">
                              {evt.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 font-mono ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {days <= 0 ? '今日截止' : `剩余 ${days} 天`}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                            <span className="truncate">{evt.host}</span>
                            <span className="font-mono text-zinc-400">{evt.deadline}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-3 text-center">暂无临期征稿活动</p>
                )}
              </div>

              {/* Widget 3: 最新核心期刊动态 (Core Law Reviews & Pinned Journals) */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      <Library className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-zinc-900">
                      核心期刊动态
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('journals')}
                    className="text-xs text-[#0F52BA] hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>核心期刊架</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {featuredJournals.length > 0 ? (
                  <div className="space-y-2.5">
                    {featuredJournals.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-zinc-200 text-zinc-800 rounded">
                              {j.abbreviation}
                            </span>
                            <span className="text-xs font-semibold text-zinc-900 truncate">
                              {j.nameCn}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {j.currentIssue}
                          </div>
                        </div>

                        <button
                          onClick={() => onFilterByJournal(j.nameOriginal)}
                          className="px-2.5 py-1 bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-[11px] font-semibold rounded-md shrink-0 transition-colors cursor-pointer"
                        >
                          查看收录
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-3 text-center">暂无核心期刊更新</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
