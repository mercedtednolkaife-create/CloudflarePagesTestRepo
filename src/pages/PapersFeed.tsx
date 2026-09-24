import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Journal, PaginationMeta } from '../types';
import { fetchPapers, fetchJournals, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/Pagination';
import { copyToClipboard } from '../lib/clipboard';
import {
  BookOpen,
  Star,
  ExternalLink,
  Tag,
  Users,
  Calendar,
  Search,
  Filter,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  BookmarkCheck,
  CornerDownLeft,
  ChevronDown,
  ChevronUp,
  Layers,
  Languages,
  FileDown,
  Quote,
  Clock,
  Globe,
  Award,
  ArrowRight,
} from 'lucide-react';
import { PaperDetailCardModal } from '../components/PaperDetailCardModal';
import { CANONICAL_LEGAL_TAGS } from '../constants/academic';

export interface PapersFeedProps {
  journals?: Journal[];
  filterAuthor?: string | null;
  filterJournal?: string | null;
  filterVolume?: string | null;
  filterIssue?: string | null;
  filterPaperTitle?: string | null;
  onClearAuthorFilter?: () => void;
  onClearJournalFilter?: () => void;
  onClearVolumeFilter?: () => void;
  onClearIssueFilter?: () => void;
  onClearPaperTitleFilter?: () => void;
  onSelectAuthor?: (authorName: string) => void;
  onSelectJournal?: (journalName: string) => void;
  onSelectVolume?: (volume: string) => void;
  onSelectIssue?: (issue: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

const POPULAR_TAGS = CANONICAL_LEGAL_TAGS;

// Helper to extract volume and issue from paper
function extractVolAndIssue(paper: Paper): { volume: string; issue: string } {
  let vol = (paper.volume || '').trim();
  let iss = (paper.issue || '').trim();

  if ((!vol || !iss) && paper.volumeIssue) {
    if (!vol) {
      const volMatch = paper.volumeIssue.match(/(Vol\.?\s*\d+)/i);
      if (volMatch) vol = volMatch[1].trim();
    }
    if (!iss) {
      const issMatch = paper.volumeIssue.match(/(Issue\s*\d+|No\.?\s*\d+)/i);
      if (issMatch) iss = issMatch[1].trim();
    }
  }

  return { volume: vol, issue: iss };
}

export const PapersFeed: React.FC<PapersFeedProps> = ({
  journals,
  filterAuthor,
  filterJournal,
  filterVolume,
  filterIssue,
  filterPaperTitle,
  onClearAuthorFilter,
  onClearJournalFilter,
  onClearVolumeFilter,
  onClearIssueFilter,
  onClearPaperTitleFilter,
  onSelectAuthor,
  onSelectJournal,
  onSelectVolume,
  onSelectIssue,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [allJournalsList, setAllJournalsList] = useState<Journal[]>(journals || []);
  const [selectedTag, setSelectedTag] = useState<string>('全部领域');
  const [localSearchInput, setLocalSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown states (synchronized with props)
  const [selectedJournal, setSelectedJournal] = useState<string>(filterJournal || '全部期刊');
  const [selectedVolume, setSelectedVolume] = useState<string>(filterVolume || '全部卷');
  const [selectedIssue, setSelectedIssue] = useState<string>(filterIssue || '全部期');

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [langMode, setLangMode] = useState<'bilingual' | 'zh' | 'en'>('bilingual');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const [selectedPaperForCard, setSelectedPaperForCard] = useState<Paper | null>(null);

  // Sync props to state if props change externally
  useEffect(() => {
    if (filterJournal) {
      setSelectedJournal(filterJournal);
    } else {
      setSelectedJournal('全部期刊');
    }
  }, [filterJournal]);

  useEffect(() => {
    if (filterVolume) {
      setSelectedVolume(filterVolume);
    } else {
      setSelectedVolume('全部卷');
    }
  }, [filterVolume]);

  useEffect(() => {
    if (filterIssue) {
      setSelectedIssue(filterIssue);
    } else {
      setSelectedIssue('全部期');
    }
  }, [filterIssue]);

  // Load Journals for Dropdown Options (prioritize passed-down journals prop)
  useEffect(() => {
    if (journals && journals.length > 0) {
      setAllJournalsList(journals);
    } else {
      let isMounted = true;
      fetchJournals({ page: 1, pageSize: 100 })
        .then((res) => {
          if (isMounted && res.journals.length > 0) setAllJournalsList(res.journals);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [journals]);

  // Load Papers from GET /api/papers (Server-Side Pagination & Filter Pushdown)
  const loadPapers = useCallback(async (
    tag = selectedTag,
    targetPage = page,
    targetSize = pageSize,
    journal = selectedJournal,
    volume = selectedVolume,
    issue = selectedIssue,
    search = searchQuery,
    authorProp = filterAuthor,
    paperTitleProp = filterPaperTitle
  ) => {
    setIsLoading(true);
    try {
      const activeTag = tag && tag !== '全部领域' ? tag : undefined;
      const activeJournal = journal && journal !== '全部期刊' ? journal : undefined;
      const activeVolume = volume && volume !== '全部卷' ? volume : undefined;
      const activeIssue = issue && issue !== '全部期' ? issue : undefined;
      const combinedSearch = [search, authorProp, paperTitleProp].filter(Boolean).join(' ').trim() || undefined;

      const res = await fetchPapers(activeTag, targetPage, targetSize, {
        journal: activeJournal,
        volume: activeVolume,
        issue: activeIssue,
        search: combinedSearch,
      });
      setPapers(res.papers);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load papers:', err);
      if (onShowToast) onShowToast(err?.message || '获取文献列表失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTag, page, pageSize, selectedJournal, selectedVolume, selectedIssue, searchQuery, filterAuthor, filterPaperTitle, onShowToast]);

  useEffect(() => {
    loadPapers(
      selectedTag,
      page,
      pageSize,
      selectedJournal,
      selectedVolume,
      selectedIssue,
      searchQuery,
      filterAuthor,
      filterPaperTitle
    );
  }, [
    selectedTag,
    page,
    pageSize,
    selectedJournal,
    selectedVolume,
    selectedIssue,
    searchQuery,
    filterAuthor,
    filterPaperTitle,
    loadPapers,
  ]);

  // Handle Search Trigger on Enter or Click
  const handleTriggerSearch = () => {
    setSearchQuery(localSearchInput.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTriggerSearch();
    }
  };

  // Journal Dropdown Change Handler
  const handleJournalChange = (journalName: string) => {
    setSelectedJournal(journalName);
    setSelectedVolume('全部卷');
    setSelectedIssue('全部期');
    setPage(1);

    if (journalName === '全部期刊') {
      if (onClearJournalFilter) onClearJournalFilter();
    } else {
      if (onSelectJournal) onSelectJournal(journalName);
    }
    if (onClearVolumeFilter) onClearVolumeFilter();
    if (onClearIssueFilter) onClearIssueFilter();
  };

  // Volume Dropdown Change Handler
  const handleVolumeChange = (volume: string) => {
    setSelectedVolume(volume);
    setSelectedIssue('全部期');
    setPage(1);

    if (volume === '全部卷') {
      if (onClearVolumeFilter) onClearVolumeFilter();
    } else {
      if (onSelectVolume) onSelectVolume(volume);
    }
    if (onClearIssueFilter) onClearIssueFilter();
  };

  // Issue Dropdown Change Handler
  const handleIssueChange = (issue: string) => {
    setSelectedIssue(issue);
    setPage(1);

    if (issue === '全部期') {
      if (onClearIssueFilter) onClearIssueFilter();
    } else {
      if (onSelectIssue) onSelectIssue(issue);
    }
  };

  // Compute available journals list for dropdown
  const journalOptions = useMemo(() => {
    const journalMap = new Map<string, { name: string; nameCn?: string; abbr?: string }>();
    const effectiveJournals = journals && journals.length > 0 ? journals : allJournalsList;

    // From loaded journals endpoint or parent prop
    effectiveJournals.forEach((j) => {
      const originalName = j.nameOriginal || (j as any).name;
      if (originalName) {
        journalMap.set(originalName, {
          name: originalName,
          nameCn: j.nameCn,
          abbr: j.abbreviation,
        });
      }
    });

    // Also supplement with any journal from current papers
    papers.forEach((p) => {
      if (p.journalName && !journalMap.has(p.journalName)) {
        journalMap.set(p.journalName, {
          name: p.journalName,
          nameCn: p.journalNameCn,
          abbr: p.journalAbbr,
        });
      }
    });

    return Array.from(journalMap.values());
  }, [journals, allJournalsList, papers]);

  // Compute available Volumes for currently selected journal
  const availableVolumes = useMemo(() => {
    if (selectedJournal === '全部期刊') return [];

    const jf = selectedJournal.toLowerCase();
    const vols = new Set<string>();

    papers.forEach((p) => {
      const match =
        p.journalName.toLowerCase() === jf ||
        (p.journalNameCn && p.journalNameCn.toLowerCase() === jf) ||
        (p.journalAbbr && p.journalAbbr.toLowerCase() === jf);

      if (match) {
        const { volume } = extractVolAndIssue(p);
        if (volume) vols.add(volume);
      }
    });

    return Array.from(vols).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });
  }, [papers, selectedJournal]);

  // Compute available Issues for currently selected journal & volume
  const availableIssues = useMemo(() => {
    if (selectedJournal === '全部期刊' || selectedVolume === '全部卷') return [];

    const jf = selectedJournal.toLowerCase();
    const vf = selectedVolume.toLowerCase();
    const issues = new Set<string>();

    papers.forEach((p) => {
      const matchJournal =
        p.journalName.toLowerCase() === jf ||
        (p.journalNameCn && p.journalNameCn.toLowerCase() === jf) ||
        (p.journalAbbr && p.journalAbbr.toLowerCase() === jf);

      if (matchJournal) {
        const { volume, issue } = extractVolAndIssue(p);
        if (volume.toLowerCase() === vf && issue) {
          issues.add(issue);
        }
      }
    });

    return Array.from(issues).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });
  }, [papers, selectedJournal, selectedVolume]);

  // Reset all filters helper
  const handleResetAllFilters = () => {
    const hasAnyFilterActive =
      selectedTag !== '全部领域' ||
      searchQuery !== '' ||
      localSearchInput !== '' ||
      selectedJournal !== '全部期刊' ||
      selectedVolume !== '全部卷' ||
      selectedIssue !== '全部期' ||
      page !== 1 ||
      Boolean(filterAuthor) ||
      Boolean(filterJournal) ||
      Boolean(filterVolume) ||
      Boolean(filterIssue) ||
      Boolean(filterPaperTitle);

    setSelectedTag('全部领域');
    setLocalSearchInput('');
    setSearchQuery('');
    setSelectedJournal('全部期刊');
    setSelectedVolume('全部卷');
    setSelectedIssue('全部期');

    if (onClearAuthorFilter) onClearAuthorFilter();
    if (onClearJournalFilter) onClearJournalFilter();
    if (onClearVolumeFilter) onClearVolumeFilter();
    if (onClearIssueFilter) onClearIssueFilter();
    if (onClearPaperTitleFilter) onClearPaperTitleFilter();

    setPage(1);

    // 仅在无任何筛选条件变动时（此时 React State 无变化，useEffect 不会触发）显式调用 loadPapers
    // 避免正常重置状态时触发两次重复的网络与 D1 查询
    if (!hasAnyFilterActive) {
      loadPapers('全部领域', 1, pageSize, '全部期刊', '全部卷', '全部期', '', null, null);
    }
  };

  // Toggle Bookmark Handler
  const handleToggleBookmark = async (paper: Paper) => {
    const nextState = !paper.isBookmarked;

    // Optimistic UI Update
    setPapers((prev) =>
      prev.map((p) => (p.id === paper.id ? { ...p, isBookmarked: nextState } : p))
    );

    try {
      const res = await toggleBookmark('paper', paper.id, user?.id);
      if (onShowToast) {
        onShowToast(res.bookmarked ? `已收藏文献《${paper.title}》至个人书签` : `已取消文献收藏`, 'success');
      }
    } catch (err: any) {
      console.error('Bookmark toggle failed:', err);
      if (onShowToast) onShowToast('收藏状态更新失败', 'error');
      // Rollback
      setPapers((prev) =>
        prev.map((p) => (p.id === paper.id ? { ...p, isBookmarked: !nextState } : p))
      );
    }
  };

  // Copy BibTeX citation helper
  const handleCopyBibTeX = async (paper: Paper) => {
    const firstAuthor = paper.authors[0]?.split(' ').pop() || 'Scholar';
    const year = paper.publishedAt ? paper.publishedAt.split('-')[0] : '2026';
    const bibtex = `@article{${firstAuthor.toLowerCase()}${year},\n  author = {${paper.authors.join(' and ')}},\n  title = {${paper.title}},\n  journal = {${paper.journalName}},\n  year = {${year}},\n  url = {${paper.url}}\n}`;

    await copyToClipboard(bibtex);
    setCopiedId(paper.id);
    if (onShowToast) onShowToast('已复制标准 BibTeX 引证格式到剪贴板！', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy Bluebook citation helper (utilizing firstPage for citation, strictly without DOI)
  const handleCopyCitation = async (paper: Paper) => {
    const volNum = paper.volume ? paper.volume.replace(/Vol\.?\s*/i, '').trim() : '';
    const pagePart = paper.firstPage ? ` ${paper.firstPage}` : '';
    const year = paper.publicationYear || (paper.publishedAt ? paper.publishedAt.slice(0, 4) : '2026');
    const authorsStr = paper.authors && paper.authors.length > 0 ? paper.authors.join(' & ') : 'Anonymous';
    const citation =
      (paper.recommendedCitation
        ? paper.recommendedCitation.replace(/,\s*DOI:.*$/i, '').replace(/https?:\/\/doi\.org\/[^\s)]+/i, '').trim()
        : null) ||
      `${authorsStr}, ${paper.title}, ${volNum ? `${volNum} ` : ''}${paper.journalAbbr || paper.journalName}${pagePart} (${year}).`;

    await copyToClipboard(citation);
    setCopiedCitationId(paper.id);
    if (onShowToast) onShowToast('已复制 Bluebook 规范引注格式到剪贴板！', 'success');
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  // Toggle abstract expansion
  const toggleAbstract = (paperId: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  // Filtered papers (strictly driven by server-side pushdown query)
  const displayedPapers = papers;

  const hasActiveFilters = Boolean(
    filterAuthor ||
      (selectedJournal && selectedJournal !== '全部期刊') ||
      (selectedVolume && selectedVolume !== '全部卷') ||
      (selectedIssue && selectedIssue !== '全部期') ||
      (filterPaperTitle && filterPaperTitle.trim()) ||
      searchQuery ||
      (selectedTag && selectedTag !== '全部领域')
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner (Apple-style frosted card) */}
      <div className="bg-white rounded-2xl sm:rounded-[22px] p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20 text-[#0071E3] text-[11px] font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Global Literature Pipeline · 全球法学前沿索引</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-[#1D1D1F] tracking-tight">
              域外法学文献库 (Literature Library)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
                {pagination.total || papers.length}
              </div>
              <div className="text-[11px] text-[#86868B] font-medium">全库检索篇目</div>
            </div>
          </div>
        </div>

        {/* Tag Cloud Selector */}
        <div className="mt-6 pt-6 border-t border-black/[0.04] flex flex-wrap gap-1.5 items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] mr-2">
            <Filter className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>领域标签:</span>
          </div>
          {POPULAR_TAGS.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-xs font-semibold'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:bg-black/[0.06] hover:text-[#1D1D1F]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Cascading Dropdown Filter Bar (Apple-style rounded container) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white p-4 sm:p-5 rounded-[22px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Left Side: Search Input Box & Language Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-md flex items-center">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearchInput}
              onKeyDown={handleKeyDown}
              onChange={(e) => setLocalSearchInput(e.target.value)}
              placeholder="搜索篇名、中英摘要、学者、学科分类 (按 Enter)..."
              className="w-full pl-9 pr-20 py-2.5 bg-[#F5F5F7] border border-black/[0.06] rounded-full text-xs text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            />
            <button
              onClick={handleTriggerSearch}
              className="absolute right-1.5 px-3 py-1 bg-[#1D1D1F] hover:bg-[#0071E3] text-white text-xs font-medium rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span>搜索</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
          </div>

          {/* Bilingual Language Mode Selector (Apple Segmented Style) */}
          <div className="flex items-center bg-black/[0.04] p-1 rounded-full border border-black/[0.04] text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setLangMode('bilingual')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                langMode === 'bilingual'
                  ? 'bg-white text-[#0071E3] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="中英对照显示篇名与摘要"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>双语对照</span>
            </button>
            <button
              onClick={() => setLangMode('zh')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                langMode === 'zh'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="优先展示中文"
            >
              <span>仅中文</span>
            </button>
            <button
              onClick={() => setLangMode('en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                langMode === 'en'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="展示英文原版"
            >
              <span>原文 (EN)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Cascading Journal -> Vol -> Issue Dropdown Selectors */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start lg:justify-end">
          {/* 1. 期刊名下拉选项 */}
          <div className="relative flex items-center">
            <select
              value={selectedJournal}
              onChange={(e) => handleJournalChange(e.target.value)}
              className={`pl-3.5 pr-8 py-2 bg-[#F5F5F7] hover:bg-black/[0.05] border rounded-full text-xs font-medium appearance-none transition-all cursor-pointer max-w-[200px] truncate ${
                selectedJournal !== '全部期刊'
                  ? 'border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold'
                  : 'border-black/[0.06] text-[#1D1D1F]'
              }`}
              title="按期刊名过滤"
            >
              <option value="全部期刊">📚 全部期刊 (All Journals)</option>
              {journalOptions.map((j) => (
                <option key={j.name} value={j.name}>
                  {j.nameCn ? `${j.nameCn} (${j.abbr || j.name})` : j.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 pointer-events-none" />
          </div>

          {/* 2. 卷 (Vol) 下拉选项 (选中期刊后且存在卷数据时显示) */}
          {selectedJournal !== '全部期刊' && availableVolumes.length > 0 && (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
              <select
                value={selectedVolume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className={`pl-3.5 pr-8 py-2 bg-[#F5F5F7] hover:bg-black/[0.05] border rounded-full text-xs font-medium appearance-none transition-all cursor-pointer ${
                  selectedVolume !== '全部卷'
                    ? 'border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold'
                    : 'border-black/[0.06] text-[#1D1D1F]'
                }`}
                title="按卷号 (Volume) 过滤"
              >
                <option value="全部卷">卷: 全部卷 (All)</option>
                {availableVolumes.map((vol) => (
                  <option key={vol} value={vol}>
                    {vol}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
            </div>
          )}

          {/* 3. 期 (Issue) 下拉选项 (选中卷后且存在期数据时显示) */}
          {selectedJournal !== '全部期刊' && selectedVolume !== '全部卷' && availableIssues.length > 0 && (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
              <select
                value={selectedIssue}
                onChange={(e) => handleIssueChange(e.target.value)}
                className={`pl-3.5 pr-8 py-2 bg-[#F5F5F7] hover:bg-black/[0.05] border rounded-full text-xs font-medium appearance-none transition-all cursor-pointer ${
                  selectedIssue !== '全部期'
                    ? 'border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] font-semibold'
                    : 'border-black/[0.06] text-[#1D1D1F]'
                }`}
                title="按期号 (Issue) 过滤"
              >
                <option value="全部期">期: 全部期 (All)</option>
                {availableIssues.map((iss) => (
                  <option key={iss} value={iss}>
                    {iss}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2.5 pointer-events-none" />
            </div>
          )}

          {/* Reset Filter Button */}
          <button
            onClick={handleResetAllFilters}
            className="px-3.5 py-2 bg-black/[0.04] hover:bg-black/[0.08] text-[#6E6E73] hover:text-[#1D1D1F] rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-black/[0.04]"
            title="重置所有筛选"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges Bar (Apple tinted alert box) */}
      {hasActiveFilters && (
        <div className="bg-[#0071E3]/5 border border-[#0071E3]/15 rounded-[18px] p-3.5 flex items-center justify-between gap-3 text-xs text-[#1D1D1F] animate-in fade-in duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#0071E3] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>当前过滤条件:</span>
            </span>

            {/* Paper Title Badge */}
            {filterPaperTitle && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-300 text-zinc-900 font-medium shadow-2xs">
                <span>指定文献: <strong>《{filterPaperTitle}》</strong></span>
                {onClearPaperTitleFilter && (
                  <button
                    onClick={onClearPaperTitleFilter}
                    className="hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer text-zinc-400"
                    title="取消指定文献过滤"
                  >
                    ×
                  </button>
                )}
              </span>
            )}

            {/* Author Badge */}
            {filterAuthor && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-300 text-zinc-900 font-medium shadow-2xs">
                <span>学者: <strong>{filterAuthor}</strong></span>
                {onClearAuthorFilter && (
                  <button
                    onClick={onClearAuthorFilter}
                    className="hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer text-zinc-400"
                    title="清除学者过滤"
                  >
                    ×
                  </button>
                )}
              </span>
            )}

            {/* Journal Badge */}
            {selectedJournal !== '全部期刊' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-300 text-zinc-900 font-medium shadow-2xs">
                <span>期刊: <strong>{selectedJournal}</strong></span>
                <button
                  onClick={() => handleJournalChange('全部期刊')}
                  className="hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer text-zinc-400"
                  title="清除期刊过滤"
                >
                  ×
                </button>
              </span>
            )}

            {/* Volume Badge */}
            {selectedVolume !== '全部卷' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-300 text-zinc-900 font-medium shadow-2xs">
                <span>卷: <strong>{selectedVolume}</strong></span>
                <button
                  onClick={() => handleVolumeChange('全部卷')}
                  className="hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer text-zinc-400"
                  title="清除卷过滤"
                >
                  ×
                </button>
              </span>
            )}

            {/* Issue Badge */}
            {selectedIssue !== '全部期' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-300 text-zinc-900 font-medium shadow-2xs">
                <span>期: <strong>{selectedIssue}</strong></span>
                <button
                  onClick={() => handleIssueChange('全部期')}
                  className="hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer text-zinc-400"
                  title="清除期过滤"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleResetAllFilters}
            className="text-[11px] font-semibold text-[#0F52BA] hover:underline whitespace-nowrap cursor-pointer"
          >
            清除全部条件
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#0F52BA]" />
          <p className="text-xs font-medium">正在检索并加载最新法学文献数据...</p>
        </div>
      )}

      {/* Literature Cards Feed */}
      {!isLoading && (
        <div className="space-y-4">
          {displayedPapers.length > 0 ? (
            <>
              {displayedPapers.map((paper) => {
                const { volume, issue } = extractVolAndIssue(paper);
                return (
                  <div
                    key={paper.id}
                    className={`bg-white rounded-[22px] border p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-black/[0.12] relative ${
                      paper.isBookmarked
                        ? 'border-[#0071E3]/30 bg-[#0071E3]/[0.015]'
                        : 'border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    {/* Bookmarked Badge Pin */}
                    {paper.isBookmarked && (
                      <div className="absolute -top-2.5 right-6 bg-[#0071E3] text-white px-3 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-xs">
                        <BookmarkCheck className="w-3 h-3" />
                        <span>已收藏置顶</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Journal, Vol/Issue, Category, Edition & Tier Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleJournalChange(paper.journalName)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1D1D1F] text-white text-[11px] font-medium hover:bg-[#0071E3] transition-all cursor-pointer shadow-xs"
                            title="按此期刊过滤"
                          >
                            <span>{paper.journalNameCn || paper.journalName}</span>
                            {paper.journalAbbr && <span className="opacity-70 text-[10px]">({paper.journalAbbr})</span>}
                          </button>

                          {(paper.categoryCn || paper.category) && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-medium">
                              {paper.categoryCn || paper.category}
                            </span>
                          )}

                          {(volume || issue) && (
                            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.04] text-[#6E6E73] text-[10px] font-medium font-mono">
                              {[volume, issue].filter(Boolean).join(', ')}
                            </span>
                          )}

                          {paper.journalTier && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/50 text-[10px] font-bold">
                              {paper.journalTier}
                            </span>
                          )}

                          {paper.edition && (
                            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.03] text-[#6E6E73] text-[10px] font-medium border border-black/[0.04]">
                              {paper.edition === 'print' ? '纸本' : paper.edition === 'online' ? '首发' : paper.edition}
                            </span>
                          )}

                          {paper.citationsCount !== undefined && paper.citationsCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-black/[0.03] text-[#6E6E73] text-[10px] font-semibold font-mono border border-black/[0.04]">
                              被引 {paper.citationsCount}
                            </span>
                          )}

                          {paper.publishedAt && (
                            <span className="text-[11px] text-[#86868B] font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#86868B]" />
                              {paper.publishedAt}
                            </span>
                          )}
                        </div>

                        {/* Paper Title with Bilingual Switching - Click to view full information card */}
                        <div>
                          {langMode === 'bilingual' ? (
                            <>
                              <h2
                                onClick={() => setSelectedPaperForCard(paper)}
                                className="text-base sm:text-lg font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors leading-snug cursor-pointer"
                                title="点击查看完整学术信息卡片"
                              >
                                {paper.titleCn || paper.title}
                              </h2>
                              {paper.titleCn && paper.titleCn !== paper.title && (
                                <div className="text-xs sm:text-sm text-[#6E6E73] font-serif italic mt-1 leading-snug">
                                  {paper.title}
                                </div>
                              )}
                            </>
                          ) : langMode === 'zh' ? (
                            <h2
                              onClick={() => setSelectedPaperForCard(paper)}
                              className="text-base sm:text-lg font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors leading-snug cursor-pointer"
                              title="点击查看完整学术信息卡片"
                            >
                              {paper.titleCn || paper.title}
                            </h2>
                          ) : (
                            <h2
                              onClick={() => setSelectedPaperForCard(paper)}
                              className="text-base sm:text-lg font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors leading-snug cursor-pointer"
                              title="点击查看完整学术信息卡片"
                            >
                              {paper.title}
                            </h2>
                          )}
                        </div>

                        {/* Authors List with Chinese name and details */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-800">著者:</span>
                          {paper.authorsDetail && paper.authorsDetail.length > 0 ? (
                            paper.authorsDetail.map((a, idx) => (
                              <span key={a.id || idx} className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => onSelectAuthor && onSelectAuthor(a.name)}
                                  className="text-zinc-700 hover:text-[#0071E3] hover:underline font-medium cursor-pointer"
                                >
                                  {a.nameCn ? `${a.nameCn} (${a.name})` : a.name}
                                </button>
                                {a.institution && (
                                  <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1 rounded">
                                    {a.institution}
                                  </span>
                                )}
                                {a.orcid && (
                                  <a
                                    href={`https://orcid.org/${a.orcid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-emerald-600 hover:underline font-mono bg-emerald-50 px-1 rounded border border-emerald-200"
                                    title={`ORCID: ${a.orcid}`}
                                  >
                                    ORCID
                                  </a>
                                )}
                                {idx < (paper.authorsDetail?.length || 1) - 1 && <span className="text-zinc-300">·</span>}
                              </span>
                            ))
                          ) : (
                            <span>{paper.authors.join(' · ')}</span>
                          )}
                        </div>

                        {/* Abstract preview: Strictly Chinese abstract only on the card */}
                        {(paper.abstractCn || paper.abstract) && (
                          <div className="bg-[#F5F5F7] p-4 rounded-2xl border border-black/[0.03] text-xs sm:text-sm space-y-2">
                            <div className="text-[11px] font-medium text-[#0071E3] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                              <span>中文摘要</span>
                            </div>
                            <p className="text-[#1D1D1F] leading-relaxed font-sans line-clamp-3 select-text">
                              {paper.abstractCn || paper.abstract}
                            </p>
                            <button
                              onClick={() => setSelectedPaperForCard(paper)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] hover:text-[#005bb5] transition-colors cursor-pointer pt-1"
                              title="查看文章完整信息卡片（含中外文双语摘要及预计研读时间）"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>查看完整信息卡片</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Tags */}
                        {paper.tags && paper.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {paper.tags.map((t) => (
                              <button
                                key={t}
                                onClick={() => {
                                  setSelectedTag(t);
                                  setPage(1);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#6E6E73] text-[11px] font-medium transition-all cursor-pointer"
                              >
                                <Tag className="w-2.5 h-2.5 text-[#86868B]" />
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Full-Text, Card & Citation Action Bar (Strictly NO DOI displayed) */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-black/[0.04]">
                          {/* Primary Action: View Full Information Card */}
                          <button
                            onClick={() => setSelectedPaperForCard(paper)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                            title="打开完整学术信息卡片"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>完整信息卡片</span>
                          </button>

                          {/* PDF Direct Download Link */}
                          {paper.pdfUrl && (
                            <a
                              href={paper.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 text-[#D70015] text-xs font-medium transition-all cursor-pointer shadow-xs"
                              title="直接下载此文献全文 PDF"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>下载 PDF</span>
                            </a>
                          )}

                          {/* Official Link */}
                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer"
                              title="打开官方原文链接"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#86868B]" />
                              <span>原文链接</span>
                            </a>
                          )}

                          {/* 一键复制法学引注 */}
                          <button
                            onClick={() => handleCopyCitation(paper)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer"
                            title="一键复制 Bluebook 规范法学引注"
                          >
                            {copiedCitationId === paper.id ? (
                              <Check className="w-3.5 h-3.5 text-[#34C759]" />
                            ) : (
                              <Quote className="w-3.5 h-3.5 text-[#0071E3]" />
                            )}
                            <span>{copiedCitationId === paper.id ? '已复制法学引注' : '一键复制法学引注'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Actions Right Column */}
                      <div className="flex flex-col gap-2 shrink-0 pt-1">
                        {/* Bookmark Star Button */}
                        <button
                          onClick={() => handleToggleBookmark(paper)}
                          className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                            paper.isBookmarked
                              ? 'bg-[#FF9500] text-white border-[#FF9500] shadow-xs hover:bg-[#E68600]'
                              : 'bg-black/[0.04] text-[#86868B] border-black/[0.04] hover:text-[#FF9500] hover:bg-black/[0.08]'
                          }`}
                          title={paper.isBookmarked ? '取消收藏' : '收藏至个人书签'}
                        >
                          <Star className={`w-4 h-4 ${paper.isBookmarked ? 'fill-white' : ''}`} />
                        </button>

                        {/* 一键复制法学引注 */}
                        <button
                          onClick={() => handleCopyCitation(paper)}
                          className="p-2.5 bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F] rounded-full text-xs transition-all cursor-pointer flex items-center justify-center"
                          title="一键复制 Bluebook 规范法学引注"
                        >
                          {copiedCitationId === paper.id ? (
                            <Check className="w-4 h-4 text-[#34C759]" />
                          ) : (
                            <Quote className="w-4 h-4 text-[#0071E3]" />
                          )}
                        </button>

                        {/* Open External Paper Link */}
                        {paper.url && (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F] rounded-full text-xs transition-all cursor-pointer flex items-center justify-center"
                            title="打开官方原文链接"
                          >
                            <ExternalLink className="w-4 h-4 text-[#86868B]" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Standard Pagination Bar */}
              <Pagination
                pagination={pagination}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                itemName="篇文献"
              />
            </>
          ) : (
            <div className="py-16 text-center bg-white rounded-[22px] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
              <BookOpen className="w-10 h-10 text-[#86868B] mx-auto opacity-40" />
              <h3 className="text-sm font-bold text-[#1D1D1F]">未找到符合条件的学术文献</h3>
              <p className="text-xs text-[#6E6E73]">可尝试切换期刊、卷期或清除关键字重试。</p>
              <button
                onClick={handleResetAllFilters}
                className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#0071E3] text-white rounded-full text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                查看全部文献
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Information Card Modal */}
      {selectedPaperForCard && (
        <PaperDetailCardModal
          paper={selectedPaperForCard}
          onClose={() => setSelectedPaperForCard(null)}
          onToggleBookmark={(p) => handleToggleBookmark(p)}
          onSelectAuthor={onSelectAuthor}
          onSelectTag={(t) => {
            setSelectedTag(t);
            setPage(1);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
