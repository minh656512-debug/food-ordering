export function formatDate(dateString) {
  if (!dateString) return '—';
  return String(dateString).replace('T', ' ').slice(0, 16);
}
