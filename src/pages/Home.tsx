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
import { copyToClipboard } from '../lib/clipboard';
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
  ChevronDown,
  ChevronUp,
  FileText,
  HeartHandshake,
  Clock,
  Award,
  Globe,
  Building,
  SlidersHorizontal,
  Layers,
  Star,
} from 'lucide-react';
import { generateBluebook } from '../lib/citationGenerator';
import { ArticleModal } from '../components/ArticleModal';

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
  const [selectedArticleModal, setSelectedArticleModal] = useState<Article | null>(null);

  const handleOpenArticleDetail = (article: Article) => {
    setSelectedArticleModal(article);
    if (onOpenArticleDetail) {
      onOpenArticleDetail(article);
    }
  };

  // Pagination for Weekly Updated Articles
  const [weeklyArticlesPage, setWeeklyArticlesPage] = useState<number>(1);
  const weeklyArticlesPageSize = 5;

  // Personalized Updates Tracking Configuration
  // Dynamic article count per journal: 1 | 2 | 3 | 'all' (default 2)
  const [articlesPerJournal, setArticlesPerJournal] = useState<1 | 2 | 3 | 'all'>(2);
  // Set of journal IDs that have been manually expanded to show all articles
  const [expandedJournalIds, setExpandedJournalIds] = useState<Set<string>>(new Set());
  // Set of article IDs whose abstracts are expanded
  const [expandedAbstractIds, setExpandedAbstractIds] = useState<Set<string>>(new Set());
  // Active update feed tab: 'personalized' (user bookmarks) | 'all' (editorial stream)
  const [updateFeedTab, setUpdateFeedTab] = useState<'personalized' | 'all'>('personalized');

  const toggleJournalExpanded = (journalId: string) => {
    setExpandedJournalIds((prev) => {
      const next = new Set(prev);
      if (next.has(journalId)) {
        next.delete(journalId);
      } else {
        next.add(journalId);
      }
      return next;
    });
  };

  const toggleAbstractExpanded = (articleId: string) => {
    setExpandedAbstractIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

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

  const handleCopyCitation = async (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    const citation = generateBluebook(article);
    await copyToClipboard(citation);
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
        a.authors.some((author) => {
          const authorStr = typeof author === 'string' ? author : ((author as any)?.name || (author as any)?.nameCn || '');
          return authorStr.toLowerCase().includes(q);
        }) ||
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

  // --- PERSONALIZED JOURNAL & AUTHOR UPDATES TRACKING ---
  // 1. Pinned/Bookmarked Journals with recent updates
  const pinnedJournals = useMemo(() => {
    return journals.filter((j) => j.isPinned);
  }, [journals]);

  const updatedPinnedJournals = useMemo(() => {
    return pinnedJournals
      .map((journal) => {
        const matching = articles.filter((art) => {
          const jName = (art.journalName || '').toLowerCase().trim();
          const jAbbr = (art.journalAbbr || '').toLowerCase().trim();
          const targetName = (journal.nameOriginal || '').toLowerCase().trim();
          const targetCn = (journal.nameCn || '').toLowerCase().trim();
          const targetAbbr = (journal.abbreviation || '').toLowerCase().trim();

          return (
            jName === targetName ||
            jName === targetCn ||
            (targetAbbr && (jAbbr === targetAbbr || jName === targetAbbr))
          );
        });

        // Determine latest volume and issue
        const latestIssue = matching[0]?.volumeIssue || journal.currentIssue || '最新卷期';
        const latestDate = matching[0]?.publishDate || '';

        return {
          journal,
          articles: matching,
          latestIssue,
          latestDate,
        };
      })
      .filter((entry) => entry.articles.length > 0); // 如没有更新则不做展示
  }, [pinnedJournals, articles]);

  const totalPinnedArticlesCount = useMemo(() => {
    return updatedPinnedJournals.reduce((acc, curr) => acc + curr.articles.length, 0);
  }, [updatedPinnedJournals]);

  // 2. Bookmarked Authors with recent published articles
  const bookmarkedAuthors = useMemo(() => {
    return authors.filter((a) => a.isBookmarked);
  }, [authors]);

  const followedAuthorUpdates = useMemo(() => {
    if (!bookmarkedAuthors || bookmarkedAuthors.length === 0) return [];

    const updates: { author: Author; article: Article }[] = [];
    const seen = new Set<string>();

    bookmarkedAuthors.forEach((author) => {
      const authorLower = author.name.toLowerCase().trim();
      const authorCnLower = author.nameCn ? author.nameCn.toLowerCase().trim() : '';

      articles.forEach((art) => {
        const matchesAuthor = (art.authors || []).some((authName) => {
          const rawName = typeof authName === 'string' ? authName : ((authName as any)?.name || (authName as any)?.nameCn || (authName as any)?.name_cn || '');
          const an = rawName.toLowerCase().trim();
          if (!an) return false;
          return (
            an === authorLower ||
            an.includes(authorLower) ||
            (authorCnLower && (an === authorCnLower || an.includes(authorCnLower)))
          );
        });

        if (matchesAuthor) {
          const key = `${author.id}-${art.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            updates.push({ author, article: art });
          }
        }
      });
    });

    return updates;
  }, [bookmarkedAuthors, articles]);

  // Upcoming Events (next 14 days or sort by deadline)
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.deadline).getTime() >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4);
  }, [events]);

  // Pinned/Featured Journals with latest issue updated this week
  const featuredJournals = useMemo(() => {
    return journals.map((j) => {
      const matchingArticles = articles.filter(
        (a) =>
          a.journalName.toLowerCase() === j.nameOriginal.toLowerCase() ||
          (a.journalAbbr && j.abbreviation && a.journalAbbr.toLowerCase() === j.abbreviation.toLowerCase())
      );
      const updatedIssue = matchingArticles[0]?.volumeIssue || j.currentIssue || '最新卷期';
      return {
        ...j,
        updatedIssue,
        hasWeeklyUpdate: matchingArticles.length > 0,
        weeklyCount: matchingArticles.length,
      };
    })
    .sort((a, b) => {
      if (a.hasWeeklyUpdate && !b.hasWeeklyUpdate) return -1;
      if (!a.hasWeeklyUpdate && b.hasWeeklyUpdate) return 1;
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    })
    .slice(0, 5);
  }, [journals, articles]);

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
                                  onClick={() => onFilterByJournal(article.journalName, article.volumeIssue)}
                                  className="text-xs font-semibold text-zinc-800 hover:text-[#0F52BA] underline cursor-pointer"
                                >
                                  {article.journalName} ({article.journalAbbr})
                                </button>
                                <span className="text-[11px] text-zinc-400 font-mono">
                                  {article.volumeIssue} · {article.publishDate}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-[#1D1D1F] font-editorial-heading leading-snug">
                                <span
                                  onClick={() => onOpenArticleDetail && onOpenArticleDetail(article)}
                                  className="hover:text-[#0071E3] cursor-pointer"
                                >
                                  {article.titleCn || article.titleOriginal}
                                </span>
                              </h3>
                              {article.titleCn && article.titleOriginal && article.titleCn !== article.titleOriginal && (
                                <p className="text-xs text-[#6E6E73] font-serif mt-0.5">
                                  {article.titleOriginal}
                                </p>
                              )}
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
                            {article.authors.map((authorName, idx) => {
                              const nameStr = typeof authorName === 'string' ? authorName : ((authorName as any)?.name || (authorName as any)?.nameCn || '学者');
                              return (
                                <button
                                  key={`${nameStr}-${idx}`}
                                  onClick={() => onViewAuthorPapers(nameStr)}
                                  className="hover:text-[#0F52BA] hover:underline cursor-pointer"
                                >
                                  {nameStr}
                                </button>
                              );
                            })}
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
                              className="inline-flex items-center gap-1 text-[#0071E3] hover:underline font-semibold text-xs cursor-pointer"
                            >
                              <span>在文献库中查看</span>
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
                                  <h3 className="text-base font-bold text-zinc-900 font-editorial-heading flex items-baseline gap-1.5 flex-wrap">
                                    <span>{author.name}</span>
                                    {author.nameCn && (
                                      <span className="text-xs text-zinc-500 font-normal font-sans">
                                        ({author.nameCn})
                                      </span>
                                    )}
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
            {/* Left 2/3 Column: 用户专属本周更新追踪 (Personalized Weekly Updates) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Header & Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3.5 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-editorial-heading font-bold text-lg text-[#1D1D1F] tracking-tight">
                        本周更新追踪
                      </h2>
                      {pinnedJournals.length > 0 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/15">
                          已标星 {pinnedJournals.length} 本期刊
                        </span>
                      )}
                      {followedAuthorUpdates.length > 0 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/15">
                          {followedAuthorUpdates.length} 篇关注学者新作
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Switcher: 我的关注追踪 vs 全库文献库 */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7] border border-black/[0.04] text-xs">
                    <button
                      onClick={() => setUpdateFeedTab('personalized')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        updateFeedTab === 'personalized'
                          ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                          : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 text-[#0071E3] fill-[#0071E3]" />
                      <span>我的关注更新</span>
                    </button>
                    <button
                      onClick={() => setUpdateFeedTab('all')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        updateFeedTab === 'all'
                          ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                          : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>全库文献库</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* VIEW 1: PERSONALIZED UPDATES (我的专属追踪) */}
              {updateFeedTab === 'personalized' ? (
                <div className="space-y-6">
                  {/* MODULE 1: 收藏的作者更新了哪些文章（如没有更新则不显示这一模块） */}
                  {followedAuthorUpdates.length > 0 && (
                    <div className="bg-white rounded-[22px] border border-black/[0.06] p-5 sm:p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-editorial-heading font-bold text-base text-[#1D1D1F]">
                                重点关注学者发刊动态
                              </h3>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
                                {followedAuthorUpdates.length} 篇新刊发表
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onNavigateToTab('authors')}
                          className="text-xs text-[#0071E3] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>关注学者库</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Author Updates Cards List */}
                      <div className="space-y-3">
                        {followedAuthorUpdates.map(({ author, article }) => {
                          const isAbstractExpanded = expandedAbstractIds.has(article.id);
                          return (
                            <div
                              key={`author-update-${author.id}-${article.id}`}
                              className="p-4 rounded-[18px] bg-[#F5F5F7]/60 hover:bg-[#F5F5F7] border border-black/[0.04] transition-all space-y-2.5"
                            >
                              {/* Scholar Header Bar */}
                              <div className="flex items-center justify-between gap-3 pb-2 border-b border-black/[0.04]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                    {author.name.slice(0, 2)}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-[#1D1D1F] font-editorial-heading">
                                      {author.name}
                                    </span>
                                    {author.nameCn && (
                                      <span className="text-xs text-[#6E6E73] font-medium bg-black/[0.04] px-1.5 py-0.2 rounded">
                                        {author.nameCn}
                                      </span>
                                    )}
                                    {author.institution && (
                                      <span className="text-xs text-[#86868B] truncate">
                                        · {author.institution.name}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => onViewAuthorPapers(author.name)}
                                  className="text-xs text-[#0071E3] hover:underline font-medium shrink-0 cursor-pointer"
                                >
                                  查看学者论文
                                </button>
                              </div>

                              {/* Article Details */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md bg-[#1D1D1F] text-white text-[10px] font-semibold">
                                    {article.journalName}
                                  </span>
                                  <span className="text-[11px] text-[#86868B] font-mono">
                                    {article.volumeIssue} · {article.publishDate}
                                  </span>
                                  {article.jurisdiction && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-black/[0.04] text-[#6E6E73]">
                                      {article.jurisdiction}
                                    </span>
                                  )}
                                </div>

                                <h4
                                  onClick={() => handleOpenArticleDetail(article)}
                                  className="text-sm font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors cursor-pointer leading-snug"
                                >
                                  {article.titleCn || article.titleOriginal}
                                </h4>

                                {article.titleCn && article.titleOriginal && article.titleCn !== article.titleOriginal && (
                                  <p className="text-xs text-[#6E6E73] font-serif mt-0.5">
                                    {article.titleOriginal}
                                  </p>
                                )}
                              </div>

                              {/* Actions & Abstract Preview */}
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/[0.04] text-xs">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => handleCopyCitation(e, article)}
                                    className="p-1 rounded-md border border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                                    title="复制 Bluebook 标准引证"
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
                                      className={`p-1 rounded-md border transition-colors cursor-pointer ${
                                        article.saved
                                          ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20'
                                          : 'border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F]'
                                      }`}
                                      title={article.saved ? '已收藏' : '加入收藏'}
                                    >
                                      {article.saved ? (
                                        <BookmarkCheck className="w-3.5 h-3.5 fill-[#0071E3]" />
                                      ) : (
                                        <Bookmark className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {article.abstractCn && (
                                    <button
                                      onClick={() => toggleAbstractExpanded(article.id)}
                                      className="text-[11px] text-[#6E6E73] hover:text-[#1D1D1F] flex items-center gap-0.5 cursor-pointer font-medium"
                                    >
                                      <span>{isAbstractExpanded ? '收起摘要' : '摘要预览'}</span>
                                      {isAbstractExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenArticleDetail(article)}
                                    className="inline-flex items-center gap-0.5 font-semibold text-[#0071E3] hover:underline cursor-pointer text-xs"
                                  >
                                    <span>详情</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {isAbstractExpanded && article.abstractCn && (
                                <div className="text-xs text-[#1D1D1F] leading-relaxed bg-white p-3 rounded-xl border border-black/[0.04]">
                                  <p>{article.abstractCn}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MODULE 2: 收藏的期刊更新到了哪一期以及对应的更新的文章流 */}
                  {/* 为了所有收藏期刊都能有效展示，可以动态选择每个期刊展示的文章数，如没有更新则不做展示 */}
                  {updatedPinnedJournals.length > 0 ? (
                    <div className="space-y-4">
                      {/* Control Bar: Pinned Journals Count + Dynamic Article Count Switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F5F7] p-3 rounded-2xl border border-black/[0.04]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
                            <Library className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#1D1D1F]">
                              已收藏期刊更新 ({updatedPinnedJournals.length} 本期刊有新刊发表)
                            </span>
                            <span className="text-[11px] text-[#86868B] ml-2 hidden md:inline">
                              共收录 {totalPinnedArticlesCount} 篇新刊文献
                            </span>
                          </div>
                        </div>

                        {/* Segmented Controller for articles per journal */}
                        <div className="flex items-center gap-1 self-start sm:self-auto">
                          <span className="text-[11px] text-[#86868B] px-1.5 flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>每刊展示:</span>
                          </span>
                          {[1, 2, 3, 'all'].map((val) => (
                            <button
                              key={val}
                              onClick={() => setArticlesPerJournal(val as any)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                articlesPerJournal === val
                                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                              }`}
                            >
                              {val === 'all' ? '全部' : `${val} 篇`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stream of Updated Pinned Journals */}
                      {updatedPinnedJournals.map(({ journal, articles: journalArticles, latestIssue }) => {
                        const isFullyExpanded = expandedJournalIds.has(journal.id);
                        const displayedArticles =
                          articlesPerJournal === 'all' || isFullyExpanded
                            ? journalArticles
                            : journalArticles.slice(0, articlesPerJournal);
                        const remainingCount = journalArticles.length - displayedArticles.length;

                        return (
                          <div
                            key={journal.id}
                            className="bg-white rounded-[22px] border border-black/[0.06] p-5 sm:p-6 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:border-black/[0.1]"
                          >
                            {/* Journal Header & Latest Issue Badge */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-base text-[#1D1D1F] font-editorial-heading">
                                    {journal.nameOriginal}
                                  </span>
                                  {journal.nameCn && (
                                    <span className="text-xs text-[#6E6E73] font-medium">
                                      {journal.nameCn}
                                    </span>
                                  )}
                                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-black/[0.05] text-[#1D1D1F] rounded-md">
                                    {journal.abbreviation}
                                  </span>
                                </div>
                                <div className="text-xs text-[#86868B] flex items-center gap-1.5">
                                  <span>{journal.institution}</span>
                                  <span>·</span>
                                  <span>{journal.tier || 'SSCI 法学一区'}</span>
                                </div>
                              </div>

                              {/* Issue Updated & Direct Action */}
                              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20 text-[#0071E3] text-xs font-bold shadow-2xs">
                                  <Layers className="w-3 h-3" />
                                  <span>更新至：{latestIssue}</span>
                                </div>
                                <button
                                  onClick={() => onFilterByJournal(journal.nameOriginal, latestIssue)}
                                  className="text-xs text-[#0071E3] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                  title={`前往文献库查看【${journal.nameCn || journal.nameOriginal}】${latestIssue} 收录文章`}
                                >
                                  <span>查看本期 ({journalArticles.length})</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Stream of Articles for This Journal */}
                            <div className="space-y-3">
                              {displayedArticles.map((article) => {
                                const isAbstractExpanded = expandedAbstractIds.has(article.id);
                                return (
                                  <article
                                    key={article.id}
                                    className="p-4 rounded-[16px] bg-[#F5F5F7]/60 hover:bg-[#F5F5F7] border border-black/[0.04] transition-all space-y-2 relative group"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#86868B] font-mono">
                                          <span>{article.volumeIssue}</span>
                                          <span>·</span>
                                          <span>{article.publishDate}</span>
                                          {article.jurisdiction && (
                                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-black/[0.04] text-[#6E6E73]">
                                              {article.jurisdiction}
                                            </span>
                                          )}
                                        </div>

                                        <h4
                                          onClick={() => handleOpenArticleDetail(article)}
                                          className="text-sm sm:text-base font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors cursor-pointer leading-snug"
                                        >
                                          {article.titleCn || article.titleOriginal}
                                        </h4>

                                        {article.titleCn && article.titleOriginal && article.titleCn !== article.titleOriginal && (
                                          <p className="text-xs text-[#6E6E73] font-serif mt-0.5">
                                            {article.titleOriginal}
                                          </p>
                                        )}
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                        <button
                                          onClick={(e) => handleCopyCitation(e, article)}
                                          className="p-1.5 rounded-lg border border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white transition-colors cursor-pointer"
                                          title="复制 Bluebook 标准引证"
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
                                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                              article.saved
                                                ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20'
                                                : 'border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white'
                                            }`}
                                            title={article.saved ? '已收藏' : '加入收藏'}
                                          >
                                            {article.saved ? (
                                              <BookmarkCheck className="w-3.5 h-3.5 fill-[#0071E3]" />
                                            ) : (
                                              <Bookmark className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Chinese Abstract Display on Card */}
                                    {article.abstractCn && (
                                      <p className="text-xs text-[#6E6E73] leading-relaxed line-clamp-2 select-text font-sans">
                                        {article.abstractCn}
                                      </p>
                                    )}

                                    {/* Authors & Details Action Bar */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1.5 border-t border-black/[0.04]">
                                      <div className="flex items-center gap-1.5 flex-wrap text-[#6E6E73] text-[11px]">
                                        <Users className="w-3 h-3 text-[#86868B] shrink-0" />
                                        <span className="font-medium text-[#1D1D1F]">著者:</span>
                                        {article.authors.map((author, idx) => {
                                          const nameStr = typeof author === 'string' ? author : ((author as any)?.name || (author as any)?.nameCn || '学者');
                                          return (
                                            <button
                                              key={`${nameStr}-${idx}`}
                                              onClick={() => onViewAuthorPapers(nameStr)}
                                              className="hover:text-[#0071E3] hover:underline cursor-pointer"
                                            >
                                              {nameStr}
                                            </button>
                                          );
                                        })}
                                        {article.authorAffiliation && (
                                          <span className="text-[10px] text-[#86868B]">
                                            · {article.authorAffiliation}
                                          </span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => handleOpenArticleDetail(article)}
                                        className="inline-flex items-center gap-1 font-semibold text-[#0071E3] hover:text-[#005bb5] transition-colors cursor-pointer text-xs ml-auto shrink-0"
                                        title="点击查看完整学术信息卡片（含完整双语摘要与预计研读时间）"
                                      >
                                        <span>详情</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>

                            {/* Expand Remaining Articles Button */}
                            {articlesPerJournal !== 'all' && journalArticles.length > articlesPerJournal && (
                              <div className="pt-1 text-center">
                                <button
                                  onClick={() => toggleJournalExpanded(journal.id)}
                                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  {isFullyExpanded ? (
                                    <>
                                      <span>收起其余文章</span>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </>
                                  ) : (
                                    <>
                                      <span>展开本刊其余 {remainingCount} 篇发刊文章</span>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* When user has no bookmarked journals OR none have updates */
                    <div className="bg-white rounded-[22px] border border-black/[0.06] p-8 text-center space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                      <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto">
                        <Library className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-base font-bold text-[#1D1D1F] font-editorial-heading">
                          {pinnedJournals.length === 0
                            ? '定制您的专属核心期刊更新追踪'
                            : '您收藏的核心期刊本周暂无新卷期发表'}
                        </h3>
                        <p className="text-xs text-[#6E6E73] leading-relaxed">
                          {pinnedJournals.length === 0
                            ? '您尚未在「核心期刊架」标星收藏期刊。标星后，系统将在此处专为呈现您所关注的法学期刊最新卷期与发刊动态。'
                            : `您已标星关注的 ${pinnedJournals.length} 本期刊本周暂无新发文献。您可以探索更多期刊或切换至全库文献库浏览最新论文。`}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => onNavigateToTab('journals')}
                          className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>前往核心期刊架标星</span>
                        </button>
                        <button
                          onClick={() => setUpdateFeedTab('all')}
                          className="px-4 py-2 bg-[#F5F5F7] hover:bg-black/[0.06] text-[#1D1D1F] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>浏览全库文献库</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: ALL EDITORIAL ARTICLES (全库本周文章总流) */
                <div className="space-y-4">
                  {paginatedWeeklyArticles.length > 0 ? (
                    <>
                      {paginatedWeeklyArticles.map((article) => {
                        const isAbstractExpanded = expandedAbstractIds.has(article.id);
                        return (
                          <article
                            key={article.id}
                            className="bg-white rounded-[18px] border border-black/[0.06] hover:border-black/[0.12] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all p-4 sm:p-5 space-y-2.5 relative group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => onFilterByJournal(article.journalName, article.volumeIssue)}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1D1D1F] text-white text-[11px] font-semibold hover:bg-[#0071E3] transition-colors cursor-pointer"
                                  >
                                    <span>{article.journalName}</span>
                                    {article.journalAbbr && (
                                      <span className="opacity-70 text-[10px]">
                                        ({article.journalAbbr})
                                      </span>
                                    )}
                                  </button>

                                  <span className="text-[11px] text-[#86868B] font-mono">
                                    {article.volumeIssue} · {article.publishDate}
                                  </span>

                                  {article.jurisdiction && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/[0.04] text-[#6E6E73]">
                                      {article.jurisdiction}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-base font-bold text-[#1D1D1F] font-editorial-heading leading-snug hover:text-[#0071E3] transition-colors">
                                  <span
                                    onClick={() => handleOpenArticleDetail(article)}
                                    className="cursor-pointer"
                                  >
                                    {article.titleCn || article.titleOriginal}
                                  </span>
                                </h3>

                                {article.titleCn && article.titleOriginal && article.titleCn !== article.titleOriginal && (
                                  <p className="text-xs text-[#6E6E73] font-serif mt-0.5">
                                    {article.titleOriginal}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                <button
                                  onClick={(e) => handleCopyCitation(e, article)}
                                  className="p-1.5 rounded-lg border border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition-colors cursor-pointer"
                                  title="复制 Bluebook 标准引证"
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
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      article.saved
                                        ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20'
                                        : 'border-black/[0.06] text-[#86868B] hover:text-[#1D1D1F]'
                                    }`}
                                    title={article.saved ? '取消收藏' : '加入个人收藏夹'}
                                  >
                                    {article.saved ? (
                                      <BookmarkCheck className="w-3.5 h-3.5 fill-[#0071E3]" />
                                    ) : (
                                      <Bookmark className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Chinese Abstract Display on Card */}
                            {article.abstractCn && (
                              <p className="text-xs text-[#6E6E73] leading-relaxed line-clamp-2 select-text font-sans">
                                {article.abstractCn}
                              </p>
                            )}

                            {/* Authors & Details Action Bar */}
                            <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1.5 border-t border-black/[0.04]">
                              <div className="flex items-center gap-1.5 flex-wrap text-[#6E6E73] text-[11px]">
                                <Users className="w-3 h-3 text-[#86868B] shrink-0" />
                                <span className="font-semibold text-[#1D1D1F]">著者:</span>
                                {article.authors.map((author, idx) => {
                                  const nameStr = typeof author === 'string' ? author : ((author as any)?.name || (author as any)?.nameCn || '学者');
                                  return (
                                    <button
                                      key={`${nameStr}-${idx}`}
                                      onClick={() => onViewAuthorPapers(nameStr)}
                                      className="hover:text-[#0071E3] hover:underline cursor-pointer"
                                    >
                                      {nameStr}
                                    </button>
                                  );
                                })}
                                {article.authorAffiliation && (
                                  <span className="text-[10px] text-[#86868B]">
                                    · {article.authorAffiliation}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleOpenArticleDetail(article)}
                                className="inline-flex items-center gap-1 font-semibold text-[#0071E3] hover:text-[#005bb5] transition-colors cursor-pointer text-xs ml-auto shrink-0"
                                title="点击查看完整学术信息卡片（含完整双语摘要与预计研读时间）"
                              >
                                <span>详情</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </article>
                        );
                      })}

                      {/* Pagination for weekly updated papers */}
                      {totalWeeklyArticlesPages > 1 && (
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-black/[0.06]">
                          <span className="text-xs text-[#6E6E73] font-mono">
                            第 {weeklyArticlesPage} / {totalWeeklyArticlesPages} 页 (本周共{' '}
                            {articles.length} 篇)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setWeeklyArticlesPage((p) => Math.max(p - 1, 1))}
                              disabled={weeklyArticlesPage === 1}
                              className="px-3 py-1.5 rounded-lg border border-black/[0.06] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-40 cursor-pointer flex items-center gap-1"
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
                              className="px-3 py-1.5 rounded-lg border border-black/[0.06] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                            >
                              <span>下一页</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-[22px] border border-black/[0.06] p-8 text-center space-y-2">
                      <BookOpen className="w-8 h-8 text-zinc-300 mx-auto" />
                      <h3 className="text-sm font-bold text-[#1D1D1F]">暂无本周更新文章</h3>
                      <p className="text-xs text-[#6E6E73]">
                        当前队列中暂无本周收录新文章，您可以前往文献库查看历史馆藏。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 1/3 Column: 3 Structured Vertical Widgets */}
            <div className="lg:col-span-4 space-y-5">
              {/* Widget 1: 本周更新学者 (Recent Scholar Highlights) */}
              <div className="bg-white rounded-[22px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-[#1D1D1F]">
                      本周更新学者
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('authors')}
                    className="text-xs text-[#0071E3] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>全部学者</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentAuthors.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="p-3 rounded-[16px] bg-[#F5F5F7]/70 hover:bg-[#F5F5F7] border border-black/[0.04] transition-colors space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-xs text-[#1D1D1F] flex items-center gap-1.5 flex-wrap">
                            <span>{author.name}</span>
                            {author.nameCn && (
                              <span className="text-[10px] text-[#6E6E73] font-normal">({author.nameCn})</span>
                            )}
                          </div>
                          <button
                            onClick={() => onViewAuthorPapers(author.name)}
                            className="text-[11px] text-[#0071E3] hover:underline font-medium shrink-0 cursor-pointer"
                          >
                            查看论文
                          </button>
                        </div>
                        {author.institution && (
                          <div className="text-[11px] text-[#6E6E73] truncate">
                            {author.institution.name}
                          </div>
                        )}
                        {author.tags && author.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {author.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded bg-white text-[#6E6E73] text-[10px] border border-black/[0.06]"
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
                  <p className="text-xs text-[#86868B] py-3 text-center">暂无学者更新</p>
                )}
              </div>

              {/* Widget 2: 即将截止学术活动与征稿 (Upcoming Academic Deadlines) */}
              <div className="bg-white rounded-[22px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600">
                      <CalendarClock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-[#1D1D1F]">
                      即将截止活动与征稿
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('events')}
                    className="text-xs text-[#0071E3] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>全部活动</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2.5">
                    {upcomingEvents.map((evt) => {
                      const days = Math.ceil(
                        (new Date(evt.deadline).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = days <= 5;
                      return (
                        <div
                          key={evt.id}
                          className="p-3 rounded-[16px] bg-[#F5F5F7]/70 hover:bg-[#F5F5F7] border border-black/[0.04] transition-colors space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-[#1D1D1F] line-clamp-1">
                              {evt.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 font-mono ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-black/[0.05] text-[#1D1D1F]'
                              }`}
                            >
                              {days <= 0 ? '今日截止' : `剩余 ${days} 天`}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6E6E73] flex items-center justify-between">
                            <span className="truncate">{evt.host}</span>
                            <span className="font-mono text-[#86868B]">{evt.deadline}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#86868B] py-3 text-center">暂无临期征稿活动</p>
                )}
              </div>

              {/* Widget 3: 最新核心期刊动态 (Core Law Reviews & Pinned Journals) */}
              <div className="bg-white rounded-[22px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-[#0071E3]/10 text-[#0071E3]">
                      <Library className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-editorial-heading font-bold text-sm text-[#1D1D1F]">
                      核心期刊动态
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('journals')}
                    className="text-xs text-[#0071E3] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>核心期刊架</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {featuredJournals.length > 0 ? (
                  <div className="space-y-2">
                    {featuredJournals.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-[14px] bg-[#F5F5F7]/70 hover:bg-[#F5F5F7] border border-black/[0.04] transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-black/[0.05] text-[#1D1D1F] rounded">
                              {j.abbreviation}
                            </span>
                            <span className="text-xs font-semibold text-[#1D1D1F] truncate">
                              {j.nameCn}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#0071E3] font-mono font-medium flex items-center gap-1">
                            <span>本周更新：{j.updatedIssue}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onFilterByJournal(j.nameOriginal, j.updatedIssue)}
                          className="px-2.5 py-1 bg-white hover:bg-[#0071E3]/5 border border-black/[0.06] hover:border-[#0071E3]/30 text-[#0071E3] text-[11px] font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
                          title={`跳转到文献库筛选 ${j.nameCn} ${j.updatedIssue}`}
                        >
                          查看收录
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#86868B] py-3 text-center">暂无核心期刊更新</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Detail Card Modal */}
      {selectedArticleModal && (
        <ArticleModal
          article={selectedArticleModal}
          onClose={() => setSelectedArticleModal(null)}
          onToggleSave={onToggleSave ? (id) => onToggleSave(id, 'article') : () => {}}
        />
      )}
    </div>
  );
};
