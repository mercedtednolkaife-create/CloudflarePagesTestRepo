import React from 'react';
import { AcademicEvent } from '../types';
import { getRemainingTime, formatDateChinese } from '../lib/dateUtils';
import { 
  CalendarClock, 
  ExternalLink, 
  ArrowRight,
  Activity
} from 'lucide-react';

interface EventSidebarProps {
  events: AcademicEvent[];
  onViewAllEvents?: () => void;
  isFullView?: boolean;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
  events,
  onViewAllEvents,
  isFullView = false
}) => {
  return (
    <aside 
      id="academic-events-sidebar"
      className="bg-white rounded-lg border border-zinc-200 p-5 space-y-5 shadow-2xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div>
          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#0F52BA]" />
            学术征稿与会议 DDL
          </h3>
          <p className="text-[11px] font-sans text-zinc-500 mt-0.5">
            CFP & Conference Watchlist
          </p>
        </div>

        {!isFullView && onViewAllEvents && (
          <button
            onClick={onViewAllEvents}
            className="text-[11px] font-sans font-semibold text-[#0F52BA] hover:text-[#0B3D8A] flex items-center gap-0.5 transition-colors"
          >
            <span>全部</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((evt) => {
          const countdown = getRemainingTime(evt.deadline);

          return (
            <div
              key={evt.id}
              id={`event-item-${evt.id}`}
              className="group pb-3.5 border-b border-zinc-100 last:border-b-0 last:pb-0 space-y-1.5"
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-xs font-semibold font-sans text-zinc-900 group-hover:text-[#0F52BA] transition-colors leading-snug">
                  {evt.title}
                </h4>
                {countdown.isUrgent ? (
                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-sm shrink-0 whitespace-nowrap">
                    {countdown.text}
                  </span>
                ) : (
                  <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-sm shrink-0 font-mono whitespace-nowrap">
                    {countdown.text}
                  </span>
                )}
              </div>

              <p className="text-[11px] font-sans text-zinc-500 leading-relaxed">
                {evt.host} · {evt.location}
              </p>

              <div className="flex items-center justify-between text-[11px] font-sans pt-0.5">
                <span className="text-zinc-400 font-mono text-[10px]">
                  截稿: {formatDateChinese(evt.deadline)}
                </span>
                <a
                  href={evt.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-zinc-700 hover:text-[#0F52BA] text-xs transition-colors"
                >
                  <span>查看详情</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Index Node Status Box */}
      <div className="pt-3 border-t border-zinc-100 space-y-2">
        <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-sans font-semibold text-zinc-800">
              数据节点索引正常
            </span>
          </div>
          <p className="text-[10px] font-sans text-zinc-500 leading-relaxed">
            实时聚合 Oxford, Harvard, Max Planck 等 30+ 全球法学期刊与学术委员会公开数据源。
          </p>
        </div>
      </div>
    </aside>
  );
};

