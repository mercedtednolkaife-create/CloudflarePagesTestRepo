import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Author, PaginationMeta } from '../types';
import { fetchAuthors, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/Pagination';
import {
  Users,
  Building2,
  Globe,
  ExternalLink,
  Star,
  BookOpen,
  Search,
  RotateCcw,
  Loader2,
  BookmarkCheck,
  Award,
  CornerDownLeft,
} from 'lucide-react';

interface AuthorsProps {
  onSelectPaper?: (paperTitle: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const Authors: React.FC<AuthorsProps> = ({ onSelectPaper, onShowToast }) => {
  const { user } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [localSearchInput, setLocalSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('全部');
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

  // Load Authors from GET /api/authors with pagination
  const loadAuthors = useCallback(async (targetPage = page, targetSize = pageSize) => {
    setIsLoading(true);
    try {
      const res = await fetchAuthors(targetPage, targetSize);
      setAuthors(res.authors);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load authors:', err);
      if (onShowToast) onShowToast(err?.message || '获取学者画像失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, onShowToast]);

  useEffect(() => {
    loadAuthors(page, pageSize);
  }, [page, pageSize, loadAuthors]);

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

  // Toggle Author Star/Bookmark (strictly bound to current user)
  const handleToggleBookmark = async (author: Author) => {
    const nextState = !author.isBookmarked;

    // Optimistic UI update
    setAuthors((prev) =>
      prev.map((a) => (a.id === author.id ? { ...a, isBookmarked: nextState } : a))
    );

    try {
      const res = await toggleBookmark('author', author.id, user?.id);
      if (onShowToast) {
        onShowToast(
          res.bookmarked ? `已关注标星学者【${author.name}】` : `已取消对【${author.name}】的关注`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Bookmark author failed:', err);
      if (onShowToast) onShowToast('关注状态更新失败', 'error');
      // Rollback
      setAuthors((prev) =>
        prev.map((a) => (a.id === author.id ? { ...a, isBookmarked: !nextState } : a))
      );
    }
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    authors.forEach((a) => (a.tags || []).forEach((t) => set.add(t)));
    return ['全部', ...Array.from(set)];
  }, [authors]);

  // Filtered authors in current page
  const displayedAuthors = useMemo(() => {
    return authors.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        a.name.toLowerCase().includes(q) ||
        (a.institution?.name || '').toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (a.ssrnId || '').toLowerCase().includes(q);

      const matchesTag = selectedTag === '全部' || (a.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [authors, searchQuery, selectedTag]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[#0F52BA] text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Scholar Directory & Academic Graph</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-zinc-900 tracking-tight">
              域外法学学者画像库 (Authors)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl font-sans">
              直连知名法学院所与研究机构，追踪顶尖法学学者的 SSRN 论著、最新发刊动态及代表论文。
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-900 font-mono">{pagination.total || authors.length}</div>
            <div className="text-[11px] text-zinc-500 font-medium">总建档学者</div>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-zinc-500 mr-2">研究专长:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tag === '全部' ? '全部专长' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="relative w-full sm:w-96 flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearchInput}
            onKeyDown={handleKeyDown}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            placeholder="学者姓名、所属机构、SSRN ID (按 Enter 或点击【搜索】)..."
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

        <button
          onClick={() => {
            setSelectedTag('全部');
            setLocalSearchInput('');
            setSearchQuery('');
            setPage(1);
            loadAuthors(1, pageSize);
          }}
          className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置画像筛选</span>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#0F52BA]" />
          <p className="text-xs font-medium">正在拉取学者与机构档案...</p>
        </div>
      )}

      {/* Authors Grid */}
      {!isLoading && (
        <div className="space-y-4">
          {displayedAuthors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAuthors.map((author) => (
                  <div
                    key={author.id}
                    className={`bg-white rounded-2xl border p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-xs relative flex flex-col justify-between ${
                      author.isBookmarked ? 'border-amber-300 bg-amber-50/15' : 'border-zinc-200'
                    }`}
                  >
                    {/* Bookmarked Badge */}
                    {author.isBookmarked && (
                      <div className="absolute -top-2.5 right-6 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <BookmarkCheck className="w-3 h-3" />
                        <span>重点关注学者</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-editorial-heading font-bold text-lg shrink-0 shadow-2xs">
                            {author.name
                              .split(' ')
                              .filter((w) => !w.startsWith('Dr.') && !w.startsWith('Prof.'))
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('') || 'LE'}
                          </div>
                          <div>
                            <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-editorial-heading flex items-center gap-2">
                              <span>{author.name}</span>
                            </h2>
                            {author.institution && (
                              <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="font-medium text-zinc-800">{author.institution.name}</span>
                                {author.institution.country && (
                                  <span className="text-[10px] text-zinc-400">· {author.institution.country}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Star Button */}
                        <button
                          onClick={() => handleToggleBookmark(author)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            author.isBookmarked
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs hover:bg-amber-600'
                              : 'bg-white text-zinc-400 border-zinc-200 hover:text-amber-500 hover:border-amber-300'
                          }`}
                          title={author.isBookmarked ? '取消关注' : '关注标星学者'}
                        >
                          <Star className={`w-4 h-4 ${author.isBookmarked ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Institution Details & Links */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {author.institution?.domain && (
                          <a
                            href={`https://${author.institution.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-[11px]"
                          >
                            <Globe className="w-3 h-3 text-zinc-400" />
                            <span>{author.institution.domain}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                          </a>
                        )}

                        {author.ssrnId && (
                          <a
                            href={author.ssrnUrl || `https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=${author.ssrnId.replace('ssrn-', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0F52BA] border border-blue-100 hover:bg-blue-100 text-[11px] font-medium"
                          >
                            <Award className="w-3 h-3" />
                            <span>SSRN ID: {author.ssrnId}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Research Tags */}
                      {author.tags && author.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {author.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px] font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recent Papers */}
                      {author.papers && author.papers.length > 0 && (
                        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-2">
                          <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#0F52BA]" />
                            <span>代表论文 ({author.papers.length}):</span>
                          </div>
                          <div className="space-y-1.5">
                            {author.papers.map((p) => (
                              <div key={p.id} className="text-xs text-zinc-800">
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#0F52BA] hover:underline font-medium line-clamp-1"
                                >
                                  • {p.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

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
                itemName="位学者"
              />
            </>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
              <Users className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800">未找到相关学者画像</h3>
              <p className="text-xs text-zinc-500">尝试更换搜索关键字或清除筛选。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
