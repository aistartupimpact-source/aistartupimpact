/**
 * Disposable / temporary email domain blocklist and free email provider detection.
 * Used across all signup endpoints to prevent fraud.
 */

const DISPOSABLE_DOMAINS = new Set([
  // Major disposable email services
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'grr.la', 'sharklasers.com',
  'guerrilla.ml', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  'throwaway.email', 'throwaway.com', 'yopmail.com', 'yopmail.fr',
  'dispostable.com', '10minutemail.com', '10minutemail.net', 'minutemail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org',
  'mailnesia.com', 'maildrop.cc', 'mailsac.com', 'getairmail.com',
  'fakeinbox.com', 'tempail.com', 'tempr.email', 'discard.email',
  'discardmail.com', 'discardmail.de', 'mailcatch.com', 'mailexpire.com',
  'mailnull.com', 'mailzilla.com', 'mohmal.com', 'burnermail.io',
  'getnada.com', 'nada.email', 'emailondeck.com', 'harakirimail.com',
  'spamgourmet.com', 'mytemp.email', 'tempinbox.com', 'tmpmail.org',
  'tmpmail.net', 'bupmail.com', 'mailtemp.org', 'emailfake.com',
  'crazymailing.com', 'armyspy.com', 'cuvox.de', 'dayrep.com',
  'einrot.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com',
  'rhyta.com', 'superrito.com', 'teleworm.us', 'inboxbear.com',
  'mailhazard.com', 'mailhazard.us', 'mailmoat.com', 'spamfree24.org',
  'trashymail.com', 'uggsrock.com', 'wegwerfmail.de', 'wegwerfmail.net',
  'wh4f.org', 'mailforspam.com', 'safetymail.info', 'tempomail.fr',
  'mailnator.com', 'anonbox.net', 'mytrashmail.com', 'thankyou2010.com',
  'trash-mail.at', 'nowmymail.com', 'spam4.me', 'jetable.org',
]);

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.in',
  'outlook.com', 'outlook.in',
  'live.com', 'live.in',
  'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'mail.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'zoho.com', 'zohomail.in',
  'yandex.com', 'yandex.ru',
  'gmx.com', 'gmx.net',
  'rediffmail.com', 'rediff.com',
  'mail.ru', 'inbox.ru', 'list.ru',
  'tutanota.com', 'tuta.io',
  'fastmail.com',
]);

export function extractEmailDomain(email: string): string {
  const parts = email.toLowerCase().trim().split('@');
  return parts.length === 2 ? parts[1] : '';
}

export function isDisposableEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // Check subdomains (e.g. anything.mailinator.com)
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join('.');
    if (DISPOSABLE_DOMAINS.has(parent)) return true;
  }
  return false;
}

export function isFreeEmailProvider(email: string): boolean {
  const domain = extractEmailDomain(email);
  return FREE_EMAIL_PROVIDERS.has(domain);
}
