import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Journal, PaginationMeta } from '../types';
import { fetchPapers, fetchJournals, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/Pagination';
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
  Layers,
} from 'lucide-react';

export interface PapersFeedProps {
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

const POPULAR_TAGS = [
  '全部领域',
  '人工智能法',
  '侵权责任',
  '算法治理',
  '知识产权法',
  '反垄断法',
  '生成式AI版权',
  '数据治理',
  '欧盟法',
  '行政法',
  '宪法',
  '民法',
  '比较法',
  '智能合约',
  '法律科技',
];

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
  const [allJournalsList, setAllJournalsList] = useState<Journal[]>([]);
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

  // Load Journals for Dropdown Options
  useEffect(() => {
    let isMounted = true;
    fetchJournals({ page: 1, pageSize: 100 })
      .then((res) => {
        if (isMounted) setAllJournalsList(res.journals);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Papers from GET /api/papers
  const loadPapers = useCallback(async (tag?: string, targetPage = page, targetSize = pageSize) => {
    setIsLoading(true);
    try {
      const activeTag = tag && tag !== '全部领域' ? tag : undefined;
      const res = await fetchPapers(activeTag, targetPage, targetSize);
      setPapers(res.papers);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load papers:', err);
      if (onShowToast) onShowToast(err?.message || '获取文献列表失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, onShowToast]);

  useEffect(() => {
    loadPapers(selectedTag, page, pageSize);
  }, [selectedTag, page, pageSize, loadPapers]);

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

    // From loaded journals endpoint
    allJournalsList.forEach((j) => {
      journalMap.set(j.nameOriginal, {
        name: j.nameOriginal,
        nameCn: j.nameCn,
        abbr: j.abbreviation,
      });
    });

    // Also from current papers
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
  }, [allJournalsList, papers]);

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
    loadPapers('全部领域', 1, pageSize);
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
  const handleCopyBibTeX = (paper: Paper) => {
    const firstAuthor = paper.authors[0]?.split(' ').pop() || 'Scholar';
    const year = paper.publishedAt ? paper.publishedAt.split('-')[0] : '2026';
    const bibtex = `@article{${firstAuthor.toLowerCase()}${year},\n  author = {${paper.authors.join(' and ')}},\n  title = {${paper.title}},\n  journal = {${paper.journalName}},\n  year = {${year}},\n  url = {${paper.url}}\n}`;

    navigator.clipboard.writeText(bibtex);
    setCopiedId(paper.id);
    if (onShowToast) onShowToast('已复制标准 BibTeX 引证格式到剪贴板！', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered papers by all criteria (client-side dynamic composition)
  const displayedPapers = useMemo(() => {
    return papers.filter((p) => {
      // 1. Author filter
      if (filterAuthor) {
        const matchesAuthor = p.authors.some((a) =>
          a.toLowerCase().includes(filterAuthor.toLowerCase())
        );
        if (!matchesAuthor) return false;
      }

      // 2. Journal filter
      const activeJournal =
        filterJournal && filterJournal !== '全部期刊'
          ? filterJournal
          : selectedJournal !== '全部期刊'
          ? selectedJournal
          : null;

      if (activeJournal) {
        const jf = activeJournal.toLowerCase();
        const matchesJournal =
          p.journalName.toLowerCase().includes(jf) ||
          (p.journalNameCn && p.journalNameCn.toLowerCase().includes(jf)) ||
          (p.journalAbbr && p.journalAbbr.toLowerCase().includes(jf));
        if (!matchesJournal) return false;
      }

      // 3. Volume filter
      const activeVolume =
        filterVolume && filterVolume !== '全部卷'
          ? filterVolume
          : selectedVolume !== '全部卷'
          ? selectedVolume
          : null;

      if (activeVolume) {
        const { volume } = extractVolAndIssue(p);
        if (!volume || volume.toLowerCase() !== activeVolume.toLowerCase()) {
          return false;
        }
      }

      // 4. Issue filter
      const activeIssue =
        filterIssue && filterIssue !== '全部期'
          ? filterIssue
          : selectedIssue !== '全部期'
          ? selectedIssue
          : null;

      if (activeIssue) {
        const { issue } = extractVolAndIssue(p);
        if (!issue || issue.toLowerCase() !== activeIssue.toLowerCase()) {
          return false;
        }
      }

      // 5. Paper Title specific filter (e.g. from Home "在文献流中查看")
      if (filterPaperTitle && filterPaperTitle.trim()) {
        const titleTarget = filterPaperTitle.trim().toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(titleTarget);
        if (!matchesTitle) return false;
      }

      // 6. Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          p.journalName.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [
    papers,
    searchQuery,
    filterAuthor,
    filterJournal,
    selectedJournal,
    filterVolume,
    selectedVolume,
    filterIssue,
    selectedIssue,
    filterPaperTitle,
  ]);

  const hasActiveFilters = Boolean(
    filterAuthor ||
      (selectedJournal && selectedJournal !== '全部期刊') ||
      (selectedVolume && selectedVolume !== '全部卷') ||
      (selectedIssue && selectedIssue !== '全部期') ||
      (filterPaperTitle && filterPaperTitle.trim())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Global Literature Pipeline · D1 Schema</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-zinc-900 tracking-tight">
              域外法学文献信息流 (Papers Feed)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl font-sans">
              实时聚合 SSCI 顶刊论文与 SSRN 预印本，支持期刊名、卷(Vol)、期(Issue)多级联动过滤与个人书签置顶。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-zinc-900 font-mono">
                {displayedPapers.length !== papers.length ? `${displayedPapers.length} / ${papers.length}` : pagination.total || papers.length}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">当前检索篇目</div>
            </div>
          </div>
        </div>

        {/* Tag Cloud Selector */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-1.5 items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
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
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Cascading Dropdown Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[220px] max-w-md flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearchInput}
            onKeyDown={handleKeyDown}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            placeholder="搜索篇名、学者、摘要 (按 Enter)..."
            className="w-full pl-9 pr-20 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA] transition-colors"
          />
          <button
            onClick={handleTriggerSearch}
            className="absolute right-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-[#0F52BA] text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <span>搜索</span>
            <CornerDownLeft className="w-3 h-3 opacity-70" />
          </button>
        </div>

        {/* Right Side: Cascading Journal -> Vol -> Issue Dropdown Selectors */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start lg:justify-end">
          {/* 1. 期刊名下拉选项 */}
          <div className="relative flex items-center">
            <select
              value={selectedJournal}
              onChange={(e) => handleJournalChange(e.target.value)}
              className={`pl-3 pr-8 py-2 bg-zinc-50 hover:bg-zinc-100 border rounded-lg text-xs font-medium appearance-none transition-colors cursor-pointer max-w-[200px] truncate ${
                selectedJournal !== '全部期刊'
                  ? 'border-[#0F52BA] bg-blue-50/40 text-[#0F52BA] font-semibold'
                  : 'border-zinc-200 text-zinc-700'
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
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* 2. 卷 (Vol) 下拉选项 (选中期刊后且存在卷数据时显示) */}
          {selectedJournal !== '全部期刊' && availableVolumes.length > 0 && (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
              <select
                value={selectedVolume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className={`pl-3 pr-8 py-2 bg-zinc-50 hover:bg-zinc-100 border rounded-lg text-xs font-medium appearance-none transition-colors cursor-pointer ${
                  selectedVolume !== '全部卷'
                    ? 'border-[#0F52BA] bg-blue-50/40 text-[#0F52BA] font-semibold'
                    : 'border-zinc-200 text-zinc-700'
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
                className={`pl-3 pr-8 py-2 bg-zinc-50 hover:bg-zinc-100 border rounded-lg text-xs font-medium appearance-none transition-colors cursor-pointer ${
                  selectedIssue !== '全部期'
                    ? 'border-[#0F52BA] bg-blue-50/40 text-[#0F52BA] font-semibold'
                    : 'border-zinc-200 text-zinc-700'
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
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
            </div>
          )}

          {/* Reset Filter Button */}
          <button
            onClick={handleResetAllFilters}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="重置所有筛选"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-blue-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#0F52BA] flex items-center gap-1">
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
          <p className="text-xs font-medium">正在自 Cloudflare D1 拉取文献数据...</p>
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
                    className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-xs relative ${
                      paper.isBookmarked ? 'border-blue-200 bg-blue-50/15' : 'border-zinc-200'
                    }`}
                  >
                    {/* Bookmarked Badge Pin */}
                    {paper.isBookmarked && (
                      <div className="absolute -top-2.5 right-6 bg-[#0F52BA] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <BookmarkCheck className="w-3 h-3" />
                        <span>已收藏置顶</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Journal, Vol/Issue, & Tier Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleJournalChange(paper.journalName)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-semibold hover:bg-[#0F52BA] transition-colors cursor-pointer"
                            title="按此期刊过滤"
                          >
                            <span>{paper.journalNameCn || paper.journalName}</span>
                            {paper.journalAbbr && <span className="opacity-70 text-[10px]">({paper.journalAbbr})</span>}
                          </button>

                          {(volume || issue) && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-medium font-mono">
                              {[volume, issue].filter(Boolean).join(', ')}
                            </span>
                          )}

                          {paper.journalTier && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                              {paper.journalTier}
                            </span>
                          )}

                          {paper.publishedAt && (
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {paper.publishedAt}
                            </span>
                          )}
                        </div>

                        {/* Paper Title */}
                        <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-editorial-heading hover:text-[#0F52BA] transition-colors leading-snug">
                          <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            {paper.title}
                          </a>
                        </h2>

                        {/* Authors List */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-800">著者:</span>
                          {paper.authorsDetail && paper.authorsDetail.length > 0 ? (
                            paper.authorsDetail.map((a, idx) => (
                              <span key={a.id || idx} className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => onSelectAuthor && onSelectAuthor(a.name)}
                                  className="text-zinc-700 hover:text-[#0F52BA] hover:underline font-medium cursor-pointer"
                                >
                                  {a.name}
                                </button>
                                {a.institution && (
                                  <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1 rounded">
                                    {a.institution}
                                  </span>
                                )}
                                {idx < (paper.authorsDetail?.length || 1) - 1 && <span className="text-zinc-300">·</span>}
                              </span>
                            ))
                          ) : (
                            <span>{paper.authors.join(' · ')}</span>
                          )}
                        </div>

                        {/* Abstract preview */}
                        {paper.abstract && (
                          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3 font-sans bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
                            {paper.abstract}
                          </p>
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
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                <Tag className="w-2.5 h-2.5 text-zinc-400" />
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions Right Column */}
                      <div className="flex flex-col gap-2 shrink-0 pt-1">
                        {/* Bookmark Star Button */}
                        <button
                          onClick={() => handleToggleBookmark(paper)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            paper.isBookmarked
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs hover:bg-amber-600'
                              : 'bg-white text-zinc-400 border-zinc-200 hover:text-amber-500 hover:border-amber-300'
                          }`}
                          title={paper.isBookmarked ? '取消收藏' : '收藏至个人书签'}
                        >
                          <Star className={`w-4 h-4 ${paper.isBookmarked ? 'fill-white' : ''}`} />
                        </button>

                        {/* Copy BibTeX Button */}
                        <button
                          onClick={() => handleCopyBibTeX(paper)}
                          className="p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                          title="一键复制 BibTeX 引证"
                        >
                          {copiedId === paper.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>

                        {/* Open External Paper Link */}
                        {paper.url && (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                            title="打开官方原文链接"
                          >
                            <ExternalLink className="w-4 h-4 text-zinc-500" />
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
            <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
              <BookOpen className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800">未找到符合条件的学术文献</h3>
              <p className="text-xs text-zinc-500">可尝试切换期刊、卷期或清除关键字重试。</p>
              <button
                onClick={handleResetAllFilters}
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-[#0F52BA] transition-colors cursor-pointer"
              >
                查看全部文献
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
