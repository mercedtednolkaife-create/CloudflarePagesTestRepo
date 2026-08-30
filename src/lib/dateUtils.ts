/**
 * Date calculation and deadline countdown utilities
 */

// Target anchor reference time (aligned with current context or runtime)
export function getRemainingTime(deadlineStr: string): {
  days: number;
  hours: number;
  isUrgent: boolean;
  isExpired: boolean;
  text: string;
} {
  const target = new Date(deadlineStr + 'T23:59:59').getTime();
  // Using fixed realistic current reference or actual current time
  const now = new Date('2026-08-28T20:38:34').getTime();
  
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      isUrgent: false,
      isExpired: true,
      text: '已截止'
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
    text
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
