export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return phone.slice(0, phone.length - 4).replace(/\d/g, '*') + phone.slice(-4);
}
