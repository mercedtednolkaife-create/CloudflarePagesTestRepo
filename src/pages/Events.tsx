import React from 'react';
import { AcademicEvent } from '../types';
import { EventSidebar } from '../components/EventSidebar';
import { CalendarClock } from 'lucide-react';

interface EventsProps {
  events: AcademicEvent[];
}

export const Events: React.FC<EventsProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 sm:p-8 text-[#09090B] border border-zinc-200 shadow-2xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-sans font-semibold">
            <CalendarClock className="w-3.5 h-3.5 text-[#0F52BA]" />
            <span>Call for Papers & Academic Summits</span>
          </div>
          <h2 className="font-editorial-heading font-bold text-2xl sm:text-3xl text-[#09090B] tracking-tight">
            国际学术研讨会与法学特刊征稿
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-sans">
            追踪知名法学院与国际学会征稿（CFP）。截稿日期不足 7 天的活动将启用红色紧急倒计时预警。
          </p>
        </div>
      </div>

      <EventSidebar events={events} isFullView={true} />
    </div>
  );
};
