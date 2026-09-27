/**
 * Date calculation and deadline countdown utilities
 */

// Target anchor reference time (aligned with current context or runtime)
export function getRemainingTime(deadlineStr?: string | null): {
  days: number;
  hours: number;
  isUrgent: boolean;
  isExpired: boolean;
  isTbd?: boolean;
  text: string;
} {
  if (!deadlineStr || typeof deadlineStr !== 'string') {
    return {
      days: 999,
      hours: 0,
      isUrgent: false,
      isExpired: false,
      isTbd: true,
      text: '时间未定',
    };
  }

  const clean = deadlineStr.trim().toLowerCase();
  if (
    clean === 'tbd' ||
    clean === '待定' ||
    clean === '未定' ||
    clean.includes('rolling') ||
    clean.includes('常年') ||
    clean.includes('滚动')
  ) {
    return {
      days: 999,
      hours: 0,
      isUrgent: false,
      isExpired: false,
      isTbd: true,
      text: clean.includes('rolling') || clean.includes('滚动') ? '常年开放' : '时间未定',
    };
  }

  // Handle format like YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  const isoDate = deadlineStr.includes('T') ? deadlineStr : (deadlineStr.split(' ')[0] + 'T23:59:59');
  const target = new Date(isoDate).getTime();

  if (isNaN(target)) {
    return {
      days: 999,
      hours: 0,
      isUrgent: false,
      isExpired: false,
      isTbd: true,
      text: '时间未定',
    };
  }

  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      isUrgent: false,
      isExpired: true,
      isTbd: false,
      text: '已截止',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const isUrgent = days < 7;

  let text = '';
  if (days === 0) {
    text = `仅剩 ${hours} 小时`;
  } else if (days < 7) {
    text = `仅剩 ${days} 天 ${hours} 小时`;
  } else {
    text = `剩余 ${days} 天`;
  }

  return {
    days,
    hours,
    isUrgent,
    isExpired: false,
    isTbd: false,
    text,
  };
}

export function formatDateChinese(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`;
  } catch {
    return dateStr;
  }
}
