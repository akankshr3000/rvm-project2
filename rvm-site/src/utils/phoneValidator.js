export function validatePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return 'Enter a 10-digit number';
  if (/^(\d)\1{9}$/.test(digits)) return 'Invalid: all digits are the same';
  if (digits.startsWith('0') || digits.startsWith('1')) return 'Invalid Indian mobile number';
  return null;
}

export function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  return d;
}
