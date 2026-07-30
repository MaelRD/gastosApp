const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency || 'MXN' }).format(amount || 0);
  } catch {
    return `$${(amount || 0).toFixed(2)}`;
  }
}

export function formatDate(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]}`;
}

export function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
