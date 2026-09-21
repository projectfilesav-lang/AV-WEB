# Firestore Security Specification & Invariants for AV Productions

## 1. Data Invariants
1. **Public Write Shielding**: All public writes directly against content collections (`site_settings`, `theme_tokens`, `milestones`, `services`, `portfolio_categories`, `portfolio_items`, `faqs`, `blog_posts`, `reviews`) are strictly forbidden via client SDKs. All admin mutations are routed through trusted server-side verification verifying Supabase credentials for allowlisted admin emails (`desheriffV653@gmail.com` and `projectfilesav@gmail.com`).
2. **Review Visibility Gate**: Only reviews with `status == 'Live'` can be read by public visitors. Archived reviews are non-readable by anonymous users.
3. **Blog Post Visibility Gate**: Only blog posts with `status == 'Published'` are publicly readable. Draft posts cannot be read by public clients.
4. **Blog Comment Moderation Gate**: Only blog comments with `status == 'Approved'` are publicly readable. Pending comments cannot be scraped.
5. **Booking Confidentiality**: Client bookings contain private contact information (email, phone, project briefs, admin notes) and must NEVER be read or listed by unauthenticated client callers.
6. **Comment Email Privacy**: Commenter email addresses are for moderation contact only and are isolated from public projection.
7. **Document ID Format**: All document IDs must conform to `^[a-zA-Z0-9_\\-]+$` and not exceed 128 characters.
8. **Catch-All Default Deny**: All unspecified paths are closed by default.

## 2. The Dirty Dozen Payloads (Security Attack Vectors)
1. **Malicious Review Direct Write**: Anonymous user attempts `setDoc(/reviews/attack-1, { status: 'Live', reviewerName: 'Hacker', rating: 5 })`. -> REJECTED
2. **Service Mutation Attack**: Anonymous user attempts `updateDoc(/services/s1, { title: 'Defaced Service' })`. -> REJECTED
3. **Draft Post Scraping**: Anonymous user attempts `getDoc(/blog_posts/secret-draft)` where `status == 'Draft'`. -> REJECTED
4. **Archived Review Disclosure**: Anonymous user attempts `getDoc(/reviews/hidden-rev)` where `status == 'Archived'`. -> REJECTED
5. **Direct Theme Token Defacement**: Anonymous user attempts `updateDoc(/theme_tokens/active, { darkBg: '#FF0000' })`. -> REJECTED
6. **Direct Site Settings Hijack**: Anonymous user attempts `updateDoc(/site_settings/global, { contactEmail: 'hacker@malicious.com' })`. -> REJECTED
7. **Bookings Siphoning Attack**: Unauthenticated user attempts `listDoc(/bookings)`. -> REJECTED
8. **Pending Comments Exposure**: Anonymous user attempts `listDoc(/blog_comments)` without approved filter. -> REJECTED
9. **Fake Milestone Injection**: Anonymous user attempts `setDoc(/milestones/fake, { title: 'Fake milestone' })`. -> REJECTED
10. **Portfolio Category Deletion**: Anonymous user attempts `deleteDoc(/portfolio_categories/cat1)`. -> REJECTED
11. **Admin Notes Extraction from Booking**: Direct query to read client notes. -> REJECTED
12. **Denial-of-Wallet Payload Injection**: 2MB junk text injected into FAQ answer or Portfolio Item description. -> REJECTED
