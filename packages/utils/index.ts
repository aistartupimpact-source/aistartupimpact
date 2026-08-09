export { generateSlug, generateUniqueSlug } from './slug';
export { calculateReadTime, countWords } from './readTime';
export { formatINR, rupeesToPaise, paiseToRupees, formatINRCompact } from './currency';
export { truncateSeoTitle, truncateSeoDescription, generateCanonicalUrl } from './seo';
export { 
  verifyDNS, 
  generateVerificationToken, 
  generateDNSRecord, 
  extractDomain, 
  isValidDomain 
} from './src/verification/dns';
export { CITY_DATABASE, searchCities, standardizeCityName } from './src/cities';
export type { CityEntry } from './src/cities';
export {
  startupApprovalHtml,
  toolApprovalHtml,
  startupRejectionHtml,
  userInvitationHtml,
  submissionReceivedHtml,
  verificationEmailHtml,
  passwordResetHtml,
  jobApplicationHtml,
  paymentSuccessHtml,
  newsletterConfirmHtml,
  newsletterWelcomeHtml,
} from './src/email-templates';

