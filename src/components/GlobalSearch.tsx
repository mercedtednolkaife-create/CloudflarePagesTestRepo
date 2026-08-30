import React, { useState, useEffect, useRef } from 'react';
import { Search, X, RefreshCw, Layers, Sparkles, FileText, BookMarked, HeartHandshake, ArrowRight } from 'lucide-react';
import { TOPIC_TAGS, JURISDICTIONS } from '../data/mockData';
import { JurisdictionType, GlobalSearchResult } from '../types';
import { fetchGlobalSearch } from '../services/api';

interface GlobalSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedJurisdiction: JurisdictionType;
  setSelectedJurisdiction: (j: JurisdictionType) => void;
  totalResults: number;
  onClearAll: () => void;
  onSelectSearchResult?: (result: GlobalSearchResult) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  selectedJurisdiction,
  setSelectedJurisdiction,
  totalResults,
  onClearAll,
  onSelectSearchResult,
}) => {
  const [ftsResults, setFtsResults] = useState<GlobalSearchResult[]>([]);
  const [isSearchingFts, setIsSearchingFts] = useState(false);
  const [showFtsDropdown, setShowFtsDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedTag !== '全部领域' || selectedJurisdiction !== 'All';

  // Live FTS5 Trigram Search Query with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setFtsResults([]);
      setShowFtsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingFts(true);
      try {
        const results = await fetchGlobalSearch(searchQuery.trim());
        setFtsResults(results);
        setShowFtsDropdown(results.length > 0);
      } catch (err) {
        console.error('FTS search error:', err);
      } finally {
        setIsSearchingFts(false);
      }
    }, 250);

    return () => clearTimeout(timer);
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

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'journal':
        return <BookMarked className="w-3.5 h-3.5 text-amber-600" />;
      case 'wishlist':
        return <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'article':
        return '文献';
      case 'journal':
        return '期刊';
      case 'wishlist':
        return '心愿单';
      default:
        return '实体';
    }
  };

  return (
    <section className="bg-white border-b border-zinc-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Search Input & Primary Filters in One Cohesive Strip */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1 group" ref={searchContainerRef}>
            <div className="relative flex items-center bg-zinc-50 hover:bg-white rounded-md border border-zinc-200 focus-within:border-[#0F52BA] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F52BA]/10 shadow-2xs transition-all">
              <div className="pl-3.5 pr-2 text-zinc-400">
                <Search className="w-4 h-4 text-zinc-500" />
              </div>
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (ftsResults.length > 0) setShowFtsDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="检索全球法学文献、著者、DOI或裁判要旨 (如: Artificial Intelligence, 侵权, 宪法审查, GDPR...)"
                className="w-full py-2.5 pr-10 text-sm text-[#09090B] placeholder-zinc-400 bg-transparent focus:outline-hidden font-sans"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setShowFtsDropdown(false);
                  }}
                  className="absolute right-3 p-1 rounded-sm text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                  title="清空搜索"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* FTS5 Trigram Dropdown Search Preview */}
            {showFtsDropdown && ftsResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-zinc-100 max-h-80 overflow-y-auto">
                <div className="bg-zinc-50 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-zinc-500 font-sans border-b border-zinc-100">
                  <span className="flex items-center gap-1 font-semibold text-zinc-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F52BA]" />
                    Cloudflare D1 FTS5 全文索引命中 ({ftsResults.length})
                  </span>
                  <span className="font-mono text-[10px]">Trigram Tokenized</span>
                </div>
                {ftsResults.map((item, idx) => (
                  <div
                    key={`${item.entityType}-${item.entityId}-${idx}`}
                    onClick={() => {
                      setShowFtsDropdown(false);
                      if (onSelectSearchResult) {
                        onSelectSearchResult(item);
                      }
                    }}
                    className="p-3 hover:bg-zinc-50 cursor-pointer transition-colors space-y-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {getEntityIcon(item.entityType)}
                        <span>{getEntityLabel(item.entityType)}</span>
                      </span>
                      <div
                        className="text-xs font-semibold text-zinc-900 truncate"
                        dangerouslySetInnerHTML={{ __html: item.titleHighlighted || item.rawTitle }}
                      />
                    </div>
                    <div
                      className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.contentHighlighted || item.rawContent }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jurisdiction Segmented Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200 shrink-0 overflow-x-auto">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.id}
                id={`jurisdiction-filter-${j.id}`}
                onClick={() => setSelectedJurisdiction(j.id as JurisdictionType)}
                className={`px-2.5 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedJurisdiction === j.id
                    ? 'bg-white text-[#09090B] shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              id="clear-all-filters-btn"
              onClick={onClearAll}
              className="text-xs font-semibold text-zinc-600 hover:text-[#0F52BA] flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 px-3 py-2 rounded-md border border-zinc-200 transition-colors shrink-0"
              title="重置所有筛选"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重置条件</span>
            </button>
          )}
        </div>

        {/* Bottom Row: Topic Filter Pills & Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          {/* Topic Tags Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
              <Layers className="w-3 h-3 text-zinc-400" />
              学科:
            </span>
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag}
                id={`topic-tag-btn-${tag}`}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-[#0F52BA] text-white font-semibold'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Result Count Status */}
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs shrink-0 self-end sm:self-auto">
            <span>INDEXED:</span>
            <span className="font-bold text-[#09090B] bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              {totalResults}
            </span>
            <span>RESULTS</span>
          </div>
        </div>
      </div>
    </section>
  );
};
