const MS_PER_DAY = 86400000;

export function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function formatExpiryStatus(date: string) {
  const daysLeft = daysUntil(date);

  if (daysLeft >= 0) {
    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;
  }

  const daysAgo = Math.abs(daysLeft);
  return daysAgo === 0 ? 'Expired' : `Expired ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
}
