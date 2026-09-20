import { AcademicEvent } from '../types';

/**
 * 格式化 YYYY-MM-DD 为 iCalendar 标准紧凑格式 YYYYMMDD
 */
function formatIcsDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  // 匹配类似 2026-05-30 或 2026/05/30
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length >= 8) {
    return clean.slice(0, 8);
  }
  return null;
}

/**
 * 计算次日日期 (用于全天事件的 DTEND)
 */
function getNextDayIcsDate(dateStr?: string): string {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const clean = dateStr.replace(/[^0-9]/g, '');
      return clean.length >= 8 ? clean.slice(0, 8) : '20261231';
    }
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  } catch {
    return '20261231';
  }
}

/**
 * 转义 iCalendar 文本特殊字符 (, ; \ \n)
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * 为单个学术活动生成标准 iCalendar (.ics) 字符串
 */
export function generateEventIcs(event: AcademicEvent): string {
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const rawDate = event.deadline && event.deadline.length >= 8 ? event.deadline : new Date().toISOString().slice(0, 10);
  const startDate = formatIcsDate(rawDate) || '20261231';
  const endDate = getNextDayIcsDate(rawDate);

  const title = `【截稿提醒】${event.titleCn || event.title}`;
  const location = event.location || event.host || '在线 / Hybrid';
  const descriptionParts = [
    `活动类别: ${event.type}`,
    `主办机构: ${event.host}`,
    `截稿时间: ${event.deadline}${event.isExtended ? ' (已延期)' : ''}`,
    event.notificationDate ? `结果通知: ${event.notificationDate}` : '',
    event.submissionUrl ? `投稿地址: ${event.submissionUrl}` : '',
    event.officialUrl ? `官方主页: ${event.officialUrl}` : '',
    event.descriptionCn || event.description ? `简介: ${event.descriptionCn || event.description}` : '',
    '数据来源: LexExtern 法学学术信息与论文智能服务平台',
  ].filter(Boolean);

  const description = escapeIcsText(descriptionParts.join('\n'));
  const safeLocation = escapeIcsText(location);
  const safeTitle = escapeIcsText(title);
  const uid = `${event.id || 'evt'}-${startDate}@lexextern.org`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexExtern//Academic Calendar Event//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${safeLocation}`,
    event.submissionUrl ? `URL:${event.submissionUrl}` : '',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    // 提前 3 天提醒
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`【距截稿还剩3天】${event.titleCn || event.title}`)}`,
    'END:VALARM',
    // 提前 1 天提醒
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`【明天截稿】${event.titleCn || event.title}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return icsLines.join('\r\n');
}

/**
 * 触发浏览器一键下载 .ics 文件
 */
export function downloadEventIcs(event: AcademicEvent): void {
  const icsContent = generateEventIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const tempAnchor = document.createElement('a');

  const safeFilename = (event.titleCn || event.title)
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 30)
    .trim();

  tempAnchor.href = downloadUrl;
  tempAnchor.download = `LexExtern_DDL_${safeFilename || 'event'}.ics`;
  document.body.appendChild(tempAnchor);
  tempAnchor.click();

  document.body.removeChild(tempAnchor);
  URL.revokeObjectURL(downloadUrl);
}
