export function ucfirst(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (now.getTime() - d.getTime()) / 1000; // seconds
  if (diff < 60) return 'few seconds ago';
  if (diff < 120) return '1 minute ago';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 7200) return '1 hour ago';
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  const days = Math.floor(diff / 86400);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'a week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'a month ago';
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  if (days < 730) return 'a year ago';
  return `${Math.floor(days / 365)} years ago`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('he', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}