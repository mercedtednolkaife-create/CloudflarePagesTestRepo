import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  itemName = '篇',
}) => {
  const { page, pageSize, total, totalPages, hasNext, hasPrev } = pagination;

  if (total <= 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Generate page numbers with intelligent ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none font-sans text-xs text-[#6E6E73] border-t border-black/[0.04] mt-4">
      {/* Left: Range and Total Display */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs">
          显示第 <strong className="text-[#1D1D1F] font-semibold">{startItem} - {endItem}</strong> {itemName}，
          共 <strong className="text-[#1D1D1F] font-semibold">{total}</strong> {itemName}
        </span>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-black/[0.06]">
            <span className="text-[#86868B]">每页:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#F5F5F7] hover:bg-black/[0.05] text-[#1D1D1F] text-xs rounded-full px-2.5 py-1 border border-black/[0.06] focus:outline-none focus:ring-1 focus:ring-[#0071E3] cursor-pointer transition-all"
            >
              <option value={10}>10 {itemName}</option>
              <option value={15}>15 {itemName}</option>
              <option value={20}>20 {itemName}</option>
              <option value={30}>30 {itemName}</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="p-1.5 rounded-full border border-black/[0.06] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          title="第一页"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="p-1.5 rounded-full border border-black/[0.06] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          title="上一页"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 py-1 text-[#86868B]">
                  ...
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                className={`w-7 h-7 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                    : 'bg-white hover:bg-black/[0.04] text-[#1D1D1F] border border-black/[0.06]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="p-1.5 rounded-full border border-black/[0.06] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          title="下一页"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="p-1.5 rounded-full border border-black/[0.06] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          title="最后一页"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
