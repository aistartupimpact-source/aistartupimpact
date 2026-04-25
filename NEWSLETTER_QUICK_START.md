# Newsletter Tracking - Quick Start Guide

## 🚀 Setup (One-Time)

### 1. Apply Database Changes
```bash
cd packages/database
npx prisma db push
npx prisma generate
```

### 2. Restart Development Servers
```bash
# Terminal 1 - Admin Dashboard
cd apps/admin
npm run dev

# Terminal 2 - Public Website
cd apps/web
npm run dev
```

---

## 📧 How to Use

### Creating a Campaign
1. Go to **Admin Dashboard** → **Newsletter**
2. Click **"New Campaign"**
3. Fill in:
   - Subject line
   - Preview text
   - Email body (HTML)
   - Schedule (optional)
4. Click **"Save"**

### Sending a Campaign
1. Click **"Send Test"** to test first
2. Enter your email and verify:
   - ✅ Email looks good
   - ✅ Links work
   - ✅ Unsubscribe link is blue
3. Click **"Send"** to send to all active subscribers
4. Watch real-time stats update!

---

## 📊 Understanding Metrics

### Open Rate
- **Unique Opens:** Number of people who opened (counted once per person)
- **Total Opens:** Total times email was opened (includes multiple opens)
- **Open Rate %:** (Unique Opens / Total Sent) × 100

### Click-Through Rate
- **Unique Clicks:** Number of people who clicked any link (counted once per person)
- **Total Clicks:** Total link clicks (includes multiple clicks)
- **CTR %:** (Unique Clicks / Total Sent) × 100

### Unsubscribes
- Number of people who unsubscribed from this campaign
- View reasons in database for insights

---

## 🎯 Industry Benchmarks

**Good Newsletter Performance:**
- Open Rate: 20-30%
- Click-Through Rate: 2-5%
- Unsubscribe Rate: <0.5%

**Your Goals:**
- Aim for >25% open rate
- Aim for >3% CTR
- Keep unsubscribes <0.3%

---

## ✅ What's Tracked Automatically

### Every Email Sent:
- ✅ Tracking pixel embedded (invisible 1x1 image)
- ✅ All links wrapped with tracking
- ✅ Blue unsubscribe link added
- ✅ Campaign ID attached

### When Subscriber Opens:
- ✅ Open recorded in database
- ✅ Campaign stats updated
- ✅ Subscriber's last opened date updated
- ✅ Unique vs total opens calculated

### When Subscriber Clicks Link:
- ✅ Click recorded in database
- ✅ Which link clicked is saved
- ✅ Campaign stats updated
- ✅ Subscriber's last clicked date updated
- ✅ Redirected to original URL

### When Subscriber Unsubscribes:
- ✅ Marked as inactive
- ✅ Reason captured (if provided)
- ✅ Feedback saved (if provided)
- ✅ Campaign unsubscribe count updated
- ✅ Won't receive future emails

---

## 🔍 Viewing Detailed Analytics

### In Admin Dashboard:
- **Newsletter page:** See all campaigns with metrics
- **Subscribers page:** See all subscribers and their status

### In Database (for advanced analytics):
```sql
-- Top performing campaigns
SELECT subject, "uniqueOpens", "uniqueClicks", "totalSent",
       ROUND(("uniqueOpens"::numeric / "totalSent") * 100, 1) as open_rate,
       ROUND(("uniqueClicks"::numeric / "totalSent") * 100, 1) as ctr
FROM "NewsletterCampaign"
WHERE status = 'SENT'
ORDER BY open_rate DESC;

-- Most clicked links
SELECT "linkUrl", COUNT(*) as clicks
FROM "NewsletterClick"
WHERE "campaignId" = 'your-campaign-id'
GROUP BY "linkUrl"
ORDER BY clicks DESC;

-- Unsubscribe reasons
SELECT reason, COUNT(*) as count
FROM "NewsletterUnsubscribe"
GROUP BY reason
ORDER BY count DESC;
```

---

## 🎨 Email Template Tips

### Best Practices:
1. **Subject Line:** Keep under 50 characters
2. **Preview Text:** Write compelling 100-character preview
3. **Content:** Mix text and images, keep scannable
4. **CTAs:** Use clear call-to-action buttons
5. **Links:** Make them descriptive (not "click here")
6. **Mobile:** Test on mobile devices

### HTML Tips:
```html
<!-- Good CTA Button -->
<a href="https://example.com" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
  Read Full Article
</a>

<!-- Good Section -->
<div style="margin:24px 0">
  <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px">This Week's Top Story</h2>
  <p style="color:#4b5563;line-height:1.6;margin:0">
    Your content here...
  </p>
</div>
```

---

## 🐛 Troubleshooting

### Opens not tracking?
- Check if tracking pixel is in email HTML
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Test in different email clients (some block images)

### Clicks not tracking?
- Verify links are being wrapped
- Check browser console for errors
- Test redirect URL manually

### Unsubscribe not working?
- Check `/unsubscribe` page loads
- Verify API endpoint is accessible
- Check database connection

### Stats not updating?
- Refresh the page
- Check database for records
- Verify campaign ID is correct

---

## 🔐 Privacy & Compliance

### What We Track:
- ✅ Email opens (with IP and user agent)
- ✅ Link clicks (with IP and user agent)
- ✅ Unsubscribe events (with reason)

### What We DON'T Track:
- ❌ Email content reading time
- ❌ Personal browsing history
- ❌ Location beyond IP address
- ❌ Device fingerprinting

### Compliance:
- ✅ Unsubscribe link in every email
- ✅ One-click unsubscribe
- ✅ Clear sender information
- ✅ Honest subject lines
- ✅ Privacy-focused tracking

---

## 📞 Support

### Common Questions:

**Q: Can I see who opened my email?**
A: Yes, check the `NewsletterOpen` table in database.

**Q: Can I resend to people who didn't open?**
A: Yes, query for emails not in `NewsletterOpen` for that campaign.

**Q: How do I export subscriber data?**
A: Use the "Export CSV" button on Subscribers page.

**Q: Can I schedule campaigns?**
A: Yes, set the "Schedule" field when creating campaign.

**Q: How do I add images to emails?**
A: Upload to Media Library, copy URL, use in HTML `<img>` tag.

---

## ✅ Pre-Launch Checklist

Before sending to real subscribers:

- [ ] Database migration completed
- [ ] Test email sent and received
- [ ] Tracking pixel loads (check email HTML)
- [ ] Links redirect correctly
- [ ] Unsubscribe page works
- [ ] Stats update in dashboard
- [ ] Mobile view looks good
- [ ] Subject line is compelling
- [ ] Preview text is set
- [ ] No typos in content
- [ ] All links tested
- [ ] Sender email verified in Resend
- [ ] Production URL configured

---

## 🎉 You're Ready!

Your newsletter system now has:
- ✅ Industry-standard tracking
- ✅ Beautiful analytics dashboard
- ✅ Compliant unsubscribe system
- ✅ Detailed engagement metrics
- ✅ Scalable architecture

**Start sending amazing newsletters!** 🚀
