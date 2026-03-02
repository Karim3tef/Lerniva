export function formatPrice(amount, currency = 'SAR') {
  if (amount === 0) return 'مجاني';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} ساعة`;
  return `${hours} ساعة و${remainingMinutes} دقيقة`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('ar-SA').format(num);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name) {
  if (!name) return 'م';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0);
  return words[0].charAt(0) + words[words.length - 1].charAt(0);
}

export function getRatingStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
}

export function getLevelLabel(level) {
  const labels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };
  return labels[level] || level;
}

export function getLevelColor(level) {
  const colors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
}

export function getStatusLabel(status) {
  const labels = {
    published: 'منشور',
    draft: 'مسودة',
    archived: 'مؤرشف',
    pending: 'قيد المراجعة',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-700',
    archived: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateDiscount(originalPrice, discountedPrice) {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
