export interface SiteSettings {
  siteName?: string;
  siteTagline?: string;
  contactLocation?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoAlt?: string;
  heroTitle: string;
  heroTagline: string;
  heroMediaUrl: string;
  heroMediaType: 'none' | 'image' | 'video';
  introStripText: string;
  ctaHeadline: string;
  ctaSubline: string;
  contactEmail: string;
  contactPhone: string;
  copyrightText: string;
  promoBannerEnabled: boolean;
  promoBannerText: string;
  floatingBookButtonEnabled: boolean;
  floatingBookButtonLabel: string;
  googleReviewsUrl: string;
  privacyPolicy: string;
  termsOfService: string;
  cookiePolicy: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  gaMeasurementId: string;
  updatedAt?: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  featured?: boolean;
  createdAt?: string;
}

export interface ThemeTokens {
  goldAccent: string;
  darkBg: string;
  darkBody: string;
  darkHeading: string;
  darkBtnBg: string;
  darkBtnText: string;
  darkBtnHover: string;
  darkLink: string;
  darkLinkHover: string;
  darkBorder: string;
  darkCardBg: string;
  darkIcon: string;
  lightBg: string;
  lightBody: string;
  lightHeading: string;
  lightBtnBg: string;
  lightBtnText: string;
  lightBtnHover: string;
  lightLink: string;
  lightLinkHover: string;
  lightBorder: string;
  lightCardBg: string;
  lightIcon: string;
  headingFont: string;
  bodyFont: string;
  updatedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  year: string;
  body: string;
  photoUrl?: string;
  order: number;
  createdAt?: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  categoryId: string; // references PortfolioCategory.id
  order: number;
  createdAt?: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt?: string;
}

export interface PortfolioItem {
  id: string;
  categoryId: string;
  title: string;
  mediaType: 'photo' | 'video' | 'graphic' | 'audio';
  mediaUrl: string;
  videoSource?: 'upload' | 'embed';
  description?: string;
  showDescription: boolean;
  altText: string;
  order: number;
  featured?: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  reviewText: string;
  source: 'Google' | 'Trustpilot' | 'Other';
  status: 'Live' | 'Archived';
  createdAt?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  dateType: 'single' | 'range';
  dateValue: string;
  endDateValue?: string;
  projectDescription: string;
  status: 'New' | 'Approved' | 'Canceled' | 'Rescheduled';
  adminNotes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  content: string; // rich text or markdown/html
  status: 'Draft' | 'Published';
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  createdAt: string;
  publishedAt?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string; // private, moderation only
  content: string;
  status: 'Pending' | 'Approved';
  createdAt: string;
}

export interface SocialLink {
  platform: 'Instagram' | 'Vimeo' | 'YouTube' | 'LinkedIn' | 'X';
  url: string;
}
