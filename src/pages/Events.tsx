import React, { useState, useMemo } from 'react';
import { AcademicEvent } from '../types';
import {
  CalendarClock,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
  MapPin,
  Building2,
  Tag,
  CheckCircle2,
  Calendar,
  DollarSign,
  Share2,
  Check,
  Sparkles,
  CalendarPlus,
} from 'lucide-react';
import { getRemainingTime, formatDateChinese } from '../lib/dateUtils';
import { copyToClipboard } from '../lib/clipboard';
import { downloadEventIcs } from '../lib/calendarExport';

interface EventsProps {
  events: AcademicEvent[];
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const Events: React.FC<EventsProps> = ({ events, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'call_for_papers' | 'academic_job' | 'conference'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'open' | 'extended'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    let cfpCount = 0;
    let jobCount = 0;
    let urgentCount = 0;
    let extendedCount = 0;

    events.forEach((e) => {
      const isJob = e.eventCategory === 'academic_job' || e.type.includes('教职') || e.type.includes('博士后');
      const isCfp = e.eventCategory === 'call_for_papers' || e.type.includes('征文') || e.type.includes('特刊');
      if (isJob) jobCount++;
      if (isCfp) cfpCount++;

      const countdown = getRemainingTime(e.deadline);
      if (countdown.isUrgent || e.isUrgent) urgentCount++;
      if (e.isExtended) extendedCount++;
    });

    return {
      total: events.length,
      cfp: cfpCount,
      job: jobCount,
      urgent: urgentCount,
      extended: extendedCount,
    };
  }, [events]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Category Tab Filter
      if (activeTab === 'call_for_papers') {
        const isCfp = e.eventCategory === 'call_for_papers' || e.type.includes('征文') || e.type.includes('特刊');
        if (!isCfp) return false;
      } else if (activeTab === 'academic_job') {
        const isJob = e.eventCategory === 'academic_job' || e.type.includes('教职') || e.type.includes('博士后');
        if (!isJob) return false;
      } else if (activeTab === 'conference') {
        const isConf = e.type.includes('研讨会') || e.type.includes('论坛') || e.type.includes('峰会');
        if (!isConf) return false;
      }

      // 2. Status Filter
      const countdown = getRemainingTime(e.deadline);
      if (statusFilter === 'urgent' && !countdown.isUrgent && !e.isUrgent) {
        return false;
      }
      if (statusFilter === 'extended' && !e.isExtended) {
        return false;
      }
      if (statusFilter === 'open' && countdown.isExpired) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches =
          e.title.toLowerCase().includes(q) ||
          (e.titleCn && e.titleCn.toLowerCase().includes(q)) ||
          e.host.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.subjectAreas && e.subjectAreas.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });
  }, [events, activeTab, statusFilter, searchQuery]);

  // Copy shareable summary helper
  const handleCopySummary = async (evt: AcademicEvent) => {
    const summary = `【学术前沿通知】${evt.titleCn || evt.title}\n主办方：${evt.host}（${evt.location}）\n类别：${evt.type}\n截稿/截止：${evt.deadlineDisplay || evt.deadline}\n通道：${evt.submissionUrl}\n（来源：LawGlobal 全球法学学术雷达）`;
    await copyToClipboard(summary);
    setCopiedId(evt.id);
    if (onShowToast) onShowToast('已复制活动快讯到剪贴板！', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Download standard iCalendar (.ics)
  const handleDownloadEventIcs = (evt: AcademicEvent) => {
    try {
      downloadEventIcs(evt);
      if (onShowToast) {
        onShowToast(`已成功导出《${evt.titleCn || evt.title}》的日历文件 (.ics)`, 'success');
      }
    } catch {
      if (onShowToast) {
        onShowToast('日历文件导出失败，请重试', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with KPIs */}
      <div className="apple-card rounded-2xl sm:rounded-[24px] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-medium tracking-tight">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Academic Intelligence & Deadlines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial-heading text-[#1D1D1F] tracking-tight">
              法学学术征文、特刊与全球教职
            </h1>
          </div>

          {/* Quick Metrics Grid (Apple-style rounded-2xl widgets) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F5F5F7] border border-black/[0.04] rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold font-mono text-[#1D1D1F] tracking-tight tabular-nums">{stats.total}</div>
              <div className="text-[11px] text-[#86868B] font-medium mt-0.5">监测活动</div>
            </div>
            <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/15 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold font-mono text-[#FF3B30] tracking-tight tabular-nums">{stats.urgent}</div>
              <div className="text-[11px] text-[#FF3B30] font-medium mt-0.5">紧急倒计时</div>
            </div>
            <div className="bg-[#0071E3]/5 border border-[#0071E3]/15 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold font-mono text-[#0071E3] tracking-tight tabular-nums">{stats.cfp}</div>
              <div className="text-[11px] text-[#0071E3] font-medium mt-0.5">特刊/征文</div>
            </div>
            <div className="bg-[#AF52DE]/5 border border-[#AF52DE]/15 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold font-mono text-[#AF52DE] tracking-tight tabular-nums">{stats.job}</div>
              <div className="text-[11px] text-[#AF52DE] font-medium mt-0.5">教职/博士后</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Track Selector Bar (Apple Segmented Style) */}
      <div className="apple-card p-4 rounded-2xl sm:rounded-[22px] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Track Tabs */}
          <div className="flex items-center bg-black/[0.04] p-1 rounded-full border border-black/[0.04] text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              全部项目 ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('call_for_papers')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'call_for_papers'
                  ? 'bg-white text-[#0071E3] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>特刊与征稿 CFP ({stats.cfp})</span>
            </button>
            <button
              onClick={() => setActiveTab('academic_job')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'academic_job'
                  ? 'bg-white text-[#AF52DE] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>教职与博士后 ({stats.job})</span>
            </button>
            <button
              onClick={() => setActiveTab('conference')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'conference'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>学术研讨会</span>
            </button>
          </div>

          {/* Status Sub-Filters */}
          <div className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
            <span className="text-[#86868B] font-medium mr-1 text-[11px]">状态:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1D1D1F] text-white shadow-xs'
                  : 'bg-black/[0.04] text-[#6E6E73] hover:bg-black/[0.08]'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'urgent'
                  ? 'bg-[#FF3B30] text-white shadow-xs'
                  : 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>即将截止</span>
            </button>
            <button
              onClick={() => setStatusFilter('extended')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'extended'
                  ? 'bg-[#FF9500] text-white shadow-xs'
                  : 'bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500]/20'
              }`}
            >
              已延期
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按会议/职位名称、主办院校、地点、法学学科领域检索..."
            className="w-full pl-9 pr-12 py-2.5 bg-[#F5F5F7] border border-black/[0.06] rounded-full text-xs text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-xs text-[#86868B] hover:text-[#1D1D1F] cursor-pointer font-medium"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Event Cards Feed */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => {
            const countdown = getRemainingTime(evt.deadline);
            const isJob = evt.eventCategory === 'academic_job' || evt.type.includes('教职') || evt.type.includes('博士后');
            const isCfp = evt.eventCategory === 'call_for_papers' || evt.type.includes('征文') || evt.type.includes('特刊');

            return (
              <div
                key={evt.id}
                className={`apple-card apple-card-hover rounded-2xl sm:rounded-[22px] p-5 sm:p-6 space-y-4 relative ${
                  countdown.isUrgent || evt.isUrgent
                    ? 'border-[#FF3B30]/30 bg-[#FF3B30]/[0.015]'
                    : ''
                }`}
              >
                {/* Header Row: Category, Type, Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Track Badge */}
                    {isJob ? (
                      <span className="px-3 py-1 rounded-full bg-[#AF52DE]/10 text-[#AF52DE] text-[11px] font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" />
                        <span>法学教职与招聘</span>
                      </span>
                    ) : isCfp ? (
                      <span className="px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-medium flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>特刊与征稿 CFP</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-black/[0.05] text-[#1D1D1F] text-[11px] font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>学术研讨会</span>
                      </span>
                    )}

                    {/* Event Type */}
                    <span className="px-2.5 py-1 rounded-full bg-black/[0.03] text-[#6E6E73] text-[11px] font-medium border border-black/[0.04]">
                      {evt.type}
                    </span>

                    {/* Academic Year / Rank (if job) */}
                    {evt.academicYear && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium font-mono border border-amber-200/50">
                        {evt.academicYear} 学年
                      </span>
                    )}
                    {evt.hiringRank && (
                      <span className="px-2.5 py-1 rounded-full bg-black/[0.03] text-[#1D1D1F] text-[11px] font-medium border border-black/[0.04]">
                        {evt.hiringRank}
                      </span>
                    )}

                    {/* Extension Badge */}
                    {evt.isExtended && (
                      <span className="px-2.5 py-1 rounded-full bg-[#FF9500]/15 text-[#B26A00] text-[10px] font-bold tracking-tight">
                        截稿已延期
                      </span>
                    )}
                  </div>

                  {/* Countdown Badge */}
                  <div>
                    {countdown.isUrgent || evt.isUrgent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30] animate-pulse" />
                        <span>{countdown.text}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 bg-black/[0.04] text-[#6E6E73] rounded-full font-mono">
                        <Clock className="w-3 h-3 text-[#86868B]" />
                        <span>{countdown.text}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Title */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] font-editorial-heading hover:text-[#0071E3] transition-colors leading-snug tracking-tight">
                    <a href={evt.submissionUrl} target="_blank" rel="noopener noreferrer">
                      {evt.titleCn || evt.title}
                    </a>
                  </h2>
                  {evt.titleCn && evt.titleCn !== evt.title && (
                    <div className="text-xs sm:text-sm text-[#6E6E73] font-serif italic mt-0.5 leading-snug">
                      {evt.title}
                    </div>
                  )}
                </div>

                {/* Host, Location, Subject Areas (Apple-style rounded container) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-[#6E6E73] bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.03]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                    <span className="font-semibold text-[#1D1D1F]">主办机构:</span>
                    <span className="truncate">{evt.host}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                    <span className="font-semibold text-[#1D1D1F]">举办地:</span>
                    <span>{evt.location}</span>
                  </div>

                  {evt.subjectAreas && (
                    <div className="flex items-center gap-1.5 truncate col-span-1 sm:col-span-2 md:col-span-1">
                      <Tag className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                      <span className="font-semibold text-[#1D1D1F]">领域:</span>
                      <span className="truncate text-[#0071E3] font-medium">{evt.subjectAreas}</span>
                    </div>
                  )}
                </div>

                {/* Timeline & Critical Dates */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#6E6E73]">
                  <div className="flex items-center gap-1 text-[#1D1D1F] font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#FF3B30]" />
                    <span>截止日期: {evt.deadlineDisplay || formatDateChinese(evt.deadline)}</span>
                    {evt.originalDeadline && (
                      <span className="line-through text-[#86868B] text-[11px] ml-1">
                        原定: {evt.originalDeadline}
                      </span>
                    )}
                  </div>

                  {(evt.eventStartDate || evt.eventDate) && (
                    <div className="flex items-center gap-1 text-[#6E6E73]">
                      <Calendar className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>
                        活动日程: {evt.eventStartDate || evt.eventDate}
                        {evt.eventEndDate && ` ~ ${evt.eventEndDate}`}
                      </span>
                    </div>
                  )}

                  {evt.notificationDate && (
                    <div className="flex items-center gap-1 text-[#6E6E73]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                      <span>录用/通知: {evt.notificationDate}</span>
                    </div>
                  )}

                  {evt.feeInfo && (
                    <div className="flex items-center gap-1 text-[#6E6E73]">
                      <DollarSign className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>费用: {evt.feeInfo}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {(evt.descriptionCn || evt.description) && (
                  <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed font-sans border-t border-black/[0.04] pt-3">
                    {evt.descriptionCn || evt.description}
                  </p>
                )}

                {/* Tags */}
                {evt.tags && evt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {evt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#6E6E73] text-[11px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Action Buttons (Apple rounded-full pill buttons) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    {/* Primary Submission URL */}
                    <a
                      href={evt.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
                    >
                      <span>{isJob ? '前往应聘 / 申请系统' : '在线投稿 / 提交摘要'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Official Website */}
                    {evt.officialUrl && evt.officialUrl !== evt.submissionUrl && (
                      <a
                        href={evt.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer"
                      >
                        <span>主办方主页</span>
                        <ExternalLink className="w-3 h-3 text-[#86868B]" />
                      </a>
                    )}

                    {/* Calendar .ics Export */}
                    <button
                      onClick={() => handleDownloadEventIcs(evt)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200/60 text-[#0071E3] text-xs font-medium transition-all cursor-pointer"
                      title="导出标准 .ics 日历文件，同步至 Apple 日历、Outlook 或 Google Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>加入日历 (.ics)</span>
                    </button>
                  </div>

                  {/* Share / Copy Summary Button */}
                  <button
                    onClick={() => handleCopySummary(evt)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer"
                    title="复制通知格式供社群或笔记使用"
                  >
                    {copiedId === evt.id ? (
                      <Check className="w-3.5 h-3.5 text-[#34C759]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-[#86868B]" />
                    )}
                    <span>{copiedId === evt.id ? '已复制快讯' : '复制通知'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="apple-card rounded-2xl sm:rounded-[22px] p-12 text-center text-[#86868B] space-y-3">
            <CalendarClock className="w-8 h-8 mx-auto text-[#86868B] opacity-60" />
            <div className="text-sm font-semibold text-[#1D1D1F]">暂无符合条件的学术征稿或教职项目</div>
            <p className="text-xs text-[#86868B]">尝试更换筛选轨道或清除搜索关键词</p>
          </div>
        )}
      </div>
    </div>
  );
};
