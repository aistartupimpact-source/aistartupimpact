# Data Breach Notification Procedure

**DPDP Act 2023 — Section 8(6) Compliance**
**Version:** 1.0
**Last Updated:** August 2026
**Owner:** Lahori Venkatesh (Grievance Officer)

---

## 1. Scope

This procedure covers any confirmed or suspected breach of personal data processed by AI Startup Impact, including unauthorized access, disclosure, alteration, or destruction of personal data held in our databases, email systems, or third-party services.

## 2. Breach Response Team

| Role | Responsibility |
|------|---------------|
| Grievance Officer | Overall coordination, regulatory notification, user communication |
| Lead Developer | Technical investigation, containment, forensic analysis |
| Infrastructure Lead | System access review, credential rotation, log preservation |

## 3. Procedure

### Phase 1: Detection & Initial Assessment (0–2 hours)

1. **Identify the breach**: via monitoring alerts, security logs, rate-limit warnings, user reports, or third-party notification.
2. **Preserve evidence**: capture relevant logs, database snapshots, and access records before any remediation.
3. **Initial assessment**: determine scope — what data, how many users, which systems, ongoing or contained?
4. **Classify severity**:
   - **Critical**: passwords, payment data, or bulk PII exposed
   - **High**: email addresses with other PII exposed
   - **Medium**: limited PII, small number of users
   - **Low**: non-personal data or internal-only exposure

### Phase 2: Containment (2–6 hours)

1. **Isolate affected systems**: revoke compromised credentials, rotate JWT secrets, invalidate sessions.
2. **Block attack vector**: patch vulnerability, update firewall rules, disable compromised endpoints.
3. **Verify containment**: confirm the breach vector is closed and no further data is leaking.

### Phase 3: Regulatory Notification (within 72 hours)

1. **Notify the Data Protection Board of India** as required under DPDP Act Sec 8(6).
   - Include: nature of breach, categories of data, approximate number of affected Data Principals, likely consequences, measures taken.
   - Contact: As specified by the DPB once constituted (monitor https://www.meity.gov.in for updates).
2. **Document the notification** with timestamp and confirmation of receipt.

### Phase 4: User Notification (within 72 hours)

1. **Notify affected Data Principals** via email using Resend transactional email infrastructure.
   - Include: what happened, what data was involved, what we are doing about it, what they should do (e.g., change passwords), Grievance Officer contact.
2. **Template location**: create notification email in `apps/web/lib/email/templates.ts` under type `BREACH_NOTIFICATION`.
3. For breaches affecting >1000 users, also post a notice on the website.

### Phase 5: Remediation (1–14 days)

1. **Root cause analysis**: document how the breach occurred and what controls failed.
2. **Fix the vulnerability**: deploy patches, update dependencies, strengthen access controls.
3. **Credential rotation**: rotate all potentially compromised secrets (JWT secrets, API keys, database credentials).
4. **Force password resets** for affected users if credentials were exposed.
5. **Enhanced monitoring**: increase logging and alerting for the affected systems for 30 days.

### Phase 6: Post-Incident Review (within 30 days)

1. **Incident report**: document timeline, root cause, impact, response actions, and lessons learned.
2. **Update security controls**: implement additional safeguards identified during review.
3. **Update this SOP** if gaps were identified in the response process.
4. **Retain records** of the breach and response for a minimum of 3 years.

## 4. Contact Information

- **Grievance Officer**: Lahori Venkatesh — privacy@aistartupimpact.com
- **Data Protection Board of India**: As notified by MeitY
- **Internal escalation**: All team members should report suspected breaches immediately to the Grievance Officer.

## 5. Testing

This procedure should be tested via a tabletop exercise at least once per year.
