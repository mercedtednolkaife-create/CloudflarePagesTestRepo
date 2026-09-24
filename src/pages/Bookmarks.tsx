import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Author, Journal, PaginationMeta } from '../types';
import { fetchPapers, fetchAuthors, fetchJournals, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/Pagination';
import {
  Bookmark,
  Download,
  CheckSquare,
  Square,
  BookOpen,
  Users,
  Library,
  Star,
  ExternalLink,
  Trash2,
  FileDown,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BookmarksProps {
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
  onNavigateToFeed?: () => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ onShowToast, onNavigateToFeed }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'papers' | 'authors' | 'journals'>('all');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load all bookmarked entities strictly bound to current user
  const loadAllBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [papersRes, authorsRes, journalsRes] = await Promise.all([
        fetchPapers(undefined, 1, 100, { bookmarked: true }).catch((err) => {
          console.warn('Failed to load bookmarked papers:', err);
          return { papers: [], pagination: {} as any };
        }),
        fetchAuthors(1, 100, { bookmarked: true }).catch((err) => {
          console.warn('Failed to load bookmarked authors:', err);
          return { authors: [], pagination: {} as any };
        }),
        fetchJournals({ page: 1, pageSize: 100, pinned: true }).catch((err) => {
          console.warn('Failed to load bookmarked journals:', err);
          return { journals: [], pagination: {} as any };
        }),
      ]);

      const savedPapers = papersRes.papers || [];
      const savedAuthors = authorsRes.authors || [];
      const savedJournals = journalsRes.journals || [];

      setPapers(savedPapers);
      setAuthors(savedAuthors);
      setJournals(savedJournals);

      // Default select all saved papers for fast export
      setSelectedPaperIds(new Set(savedPapers.map((p) => p.id)));
    } catch (err: any) {
      console.error('Failed to load bookmarks:', err);
      if (onShowToast) onShowToast(err?.message || '加载个人书签失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadAllBookmarks();
  }, [loadAllBookmarks]);

  // Toggle Single Paper Selection for Export
  const handleToggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select All or Deselect All
  const handleToggleSelectAll = () => {
    if (selectedPaperIds.size === papers.length) {
      setSelectedPaperIds(new Set());
    } else {
      setSelectedPaperIds(new Set(papers.map((p) => p.id)));
    }
  };

  // Remove Bookmark
  const handleRemoveBookmark = async (type: 'paper' | 'author' | 'journal', id: string, name: string) => {
    try {
      await toggleBookmark(type, id, user?.id);
      if (type === 'paper') {
        setPapers((prev) => prev.filter((p) => p.id !== id));
        setSelectedPaperIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else if (type === 'author') {
        setAuthors((prev) => prev.filter((a) => a.id !== id));
      } else if (type === 'journal') {
        setJournals((prev) => prev.filter((j) => j.id !== id));
      }
      if (onShowToast) onShowToast(`已将《${name}》移出个人收藏夹`, 'success');
    } catch (err: any) {
      if (onShowToast) onShowToast('移除书签失败', 'error');
    }
  };

  /**
   * 纯前端数据导出逻辑 (Pure Frontend BibTeX Export)
   */
  const handleExportSelectedBibTeX = () => {
    const selectedPapers = papers.filter((p) => selectedPaperIds.has(p.id));
    if (selectedPapers.length === 0) {
      if (onShowToast) onShowToast('请至少勾选一篇需要导出的文献', 'error');
      return;
    }

    const bibtexEntries = selectedPapers.map((paper) => {
      const rawFirst = paper.authors && paper.authors.length > 0 ? (typeof paper.authors[0] === 'string' ? paper.authors[0] : (paper.authors[0] as any)?.name || 'Scholar') : 'Scholar';
      const firstAuthor = rawFirst.split(' ').pop() || 'Scholar';
      const year = paper.publishedAt ? paper.publishedAt.split('-')[0] : '2026';
      const safeKey = `${firstAuthor.toLowerCase()}${year}_${paper.id.replace(/[^a-zA-Z0-9]/g, '')}`;
      const authorsStr = (paper.authors || []).map((a) => typeof a === 'string' ? a : (a as any)?.name || (a as any)?.nameCn || 'Scholar').join(' and ');

      return `@article{${safeKey},
  author    = {${authorsStr}},
  title     = {${paper.title}},
  journal   = {${paper.journalName}},
  year      = {${year}},
  url       = {${paper.url}}
}`;
    });

    const fileContent = `% ==========================================================================\n% LawGlobal Academic Export · Standard BibTeX Format\n% Generated for User: ${user?.username || 'scholar'}\n% Generated at: ${new Date().toISOString()}\n% Export Count: ${selectedPapers.length} articles\n% ==========================================================================\n\n${bibtexEntries.join('\n\n')}\n`;

    const blob = new Blob([fileContent], { type: 'application/x-bibtex;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const tempAnchor = document.createElement('a');
    tempAnchor.href = downloadUrl;
    tempAnchor.download = `lawglobal_bibtex_${new Date().toISOString().split('T')[0]}.bib`;
    document.body.appendChild(tempAnchor);
    tempAnchor.click();

    document.body.removeChild(tempAnchor);
    URL.revokeObjectURL(downloadUrl);

    if (onShowToast) {
      onShowToast(`已成功导出 ${selectedPapers.length} 篇文献的 BibTeX 索引文件！`, 'success');
    }
  };

  const totalSavedCount = papers.length + authors.length + journals.length;

  // Pagination for Papers
  const papersTotal = papers.length;
  const papersTotalPages = Math.max(1, Math.ceil(papersTotal / pageSize));
  const validPage = Math.min(page, papersTotalPages);
  const start = (validPage - 1) * pageSize;
  const paginatedPapers = papers.slice(start, start + pageSize);

  const papersPagination: PaginationMeta = {
    page: validPage,
    pageSize,
    total: papersTotal,
    totalPages: papersTotalPages,
    hasNext: validPage < papersTotalPages,
    hasPrev: validPage > 1,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Personal Archive ({user?.username})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-zinc-900 tracking-tight">
              学者个人收藏夹与引证导出 (Bookmarks)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl font-sans">
              当前书签严格与您的个人账号 <strong className="text-zinc-800 font-mono">({user?.username})</strong> 隔离绑定。支持勾选文献并纯前端一键导出标准 BibTeX 格式。
            </p>
          </div>

          {/* Export BibTeX Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSelectedBibTeX}
              disabled={selectedPaperIds.size === 0}
              className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-[#0F52BA] transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>导出所选 BibTeX ({selectedPaperIds.size})</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            全部收藏 ({totalSavedCount})
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'papers'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>标星文献 ({papers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('authors')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'authors'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>关注学者 ({authors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'journals'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>置顶期刊 ({journals.length})</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#0F52BA]" />
          <p className="text-xs font-medium">正在读取个人学术收藏夹...</p>
        </div>
      )}

      {/* Content Area */}
      {!isLoading && (
        <div className="space-y-6">
          {/* SECTION 1: PAPERS (文献导出区) */}
          {(activeTab === 'all' || activeTab === 'papers') && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0F52BA]" />
                  <h2 className="font-bold text-sm text-zinc-900">标星文献库 ({papers.length})</h2>
                </div>

                {papers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleToggleSelectAll}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {selectedPaperIds.size === papers.length ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#0F52BA]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>
                        {selectedPaperIds.size === papers.length ? '取消全选' : '全选文献'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {papers.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {paginatedPapers.map((paper) => {
                      const isSelected = selectedPaperIds.has(paper.id);
                      return (
                        <div
                          key={paper.id}
                          className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                            isSelected ? 'bg-blue-50/20 border-blue-200' : 'bg-zinc-50/60 border-zinc-200'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleToggleSelectPaper(paper.id)}
                              className="mt-1 text-zinc-400 hover:text-[#0F52BA] cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#0F52BA]" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-300" />
                              )}
                            </button>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.2 rounded bg-zinc-900 text-white text-[10px] font-bold">
                                  {paper.journalNameCn || paper.journalName}
                                </span>
                                {paper.publishedAt && (
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    {paper.publishedAt}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 font-editorial-heading">
                                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0F52BA]">
                                  {paper.title}
                                </a>
                              </h3>
                              <div className="text-[11px] text-zinc-500">
                                <span>著者: {(paper.authors || []).map((a) => typeof a === 'string' ? a : (a as any)?.name || (a as any)?.nameCn || '学者').join(' · ')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleRemoveBookmark('paper', paper.id, paper.title)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="取消收藏"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    pagination={papersPagination}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    itemName="篇收藏文献"
                  />
                </>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  暂未收藏任何文献，可在文献库中点击星标进行收藏。
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: AUTHORS (学者关注区) */}
          {(activeTab === 'all' || activeTab === 'authors') && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                <Users className="w-4 h-4 text-[#0F52BA]" />
                <h2 className="font-bold text-sm text-zinc-900">关注学者画像 ({authors.length})</h2>
              </div>

              {authors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {authors.map((author) => (
                    <div
                      key={author.id}
                      className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                          <span>{author.name}</span>
                          {author.nameCn && (
                            <span className="text-[10px] text-zinc-500 font-normal">
                              ({author.nameCn})
                            </span>
                          )}
                        </div>
                        {author.institution && (
                          <div className="text-[10px] text-zinc-500">{author.institution.name}</div>
                        )}
                        {author.tags && (
                          <div className="text-[10px] text-blue-700">#{author.tags.slice(0, 2).join(' #')}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark('author', author.id, author.name)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="取消关注"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  暂无关注的学者，可在学者画像库中点击关注。
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: JOURNALS (置顶期刊区) */}
          {(activeTab === 'all' || activeTab === 'journals') && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                <Library className="w-4 h-4 text-[#0F52BA]" />
                <h2 className="font-bold text-sm text-zinc-900">置顶核心期刊 ({journals.length})</h2>
              </div>

              {journals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {journals.map((journal) => (
                    <div
                      key={journal.id}
                      className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-zinc-900">{journal.nameCn}</div>
                        <div className="text-[10px] text-zinc-500">{journal.impactRank || journal.name}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark('journal', journal.id, journal.nameCn)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="取消置顶"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  暂无置顶期刊，可在期刊架点击置顶图钉。
                </div>
              )}
            </div>
          )}

          {totalSavedCount === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
              <Bookmark className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800">个人书签收藏夹为空</h3>
              <p className="text-xs text-zinc-500">
                在文献信息流或学者库中点击星标即可添加至此，随时进行学术引证导出。
              </p>
              {onNavigateToFeed && (
                <button
                  onClick={onNavigateToFeed}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-[#0F52BA] transition-colors cursor-pointer"
                >
                  去发现文献
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
