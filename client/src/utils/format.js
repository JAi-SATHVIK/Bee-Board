export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

export function truncate(text, max = 100) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
} 