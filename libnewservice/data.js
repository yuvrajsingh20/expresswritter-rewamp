// Mock data — swap with API calls later.

export const INITIAL_SERVICES = [
  { id: 'sop-academic',     cat: 'Academic', icon: '🎓', name: 'Statement of Purpose', tagline: 'Admission-ready SOPs',          variants: 6, addons: 3, active: true,  orders: 312, revenue: '₹14.2L', priceMin: 4499,  priceMax: 7999,  updated: '2 days ago' },
  { id: 'sop-visa',         cat: 'Visa',     icon: '🛂', name: 'Visa SOP & Appeals',   tagline: 'Country-specific Visa SOPs',     variants: 5, addons: 2, active: true,  orders: 198, revenue: '₹9.4L',  priceMin: 3999,  priceMax: 7500,  updated: '5 hr ago' },
  { id: 'personal-statement', cat: 'Academic', icon: '📝', name: 'Personal Statement', tagline: 'UK, EU & global admissions',     variants: 5, addons: 2, active: true,  orders: 142, revenue: '₹4.1L',  priceMin: 2499,  priceMax: 2599,  updated: '1 day ago' },
  { id: 'lor-academic',     cat: 'Academic', icon: '📜', name: 'Academic LOR',         tagline: 'Faculty recommendations',         variants: 5, addons: 1, active: true,  orders: 245, revenue: '₹3.8L',  priceMin: 1099,  priceMax: 1999,  updated: '3 hr ago' },
  { id: 'resume-job',       cat: 'Career',   icon: '💼', name: 'Job Resume',           tagline: 'ATS-optimized resumes',           variants: 6, addons: 4, active: true,  orders: 521, revenue: '₹11.6L', priceMin: 599,   priceMax: 2599,  updated: 'Just now' },
  { id: 'linkedin',         cat: 'Career',   icon: '💎', name: 'LinkedIn Profile',     tagline: 'Full rewrite with keywords',      variants: 4, addons: 2, active: true,  orders: 268, revenue: '₹6.7L',  priceMin: 999,   priceMax: 7999,  updated: '1 day ago' },
  { id: 'blog',             cat: 'Content',  icon: '✍️', name: 'Blog & SEO Articles',  tagline: 'Long-form SEO content',           variants: 3, addons: 3, active: true,  orders: 412, revenue: '₹8.3L',  priceMin: 1199,  priceMax: 4999,  updated: '4 hr ago' },
  { id: 'thesis',           cat: 'Content',  icon: '🧬', name: 'Thesis & Dissertation', tagline: 'PhD-level research writing',     variants: 4, addons: 2, active: false, orders:  38, revenue: '₹6.8L',  priceMin: 15000, priceMax: 85000, updated: '1 week ago' },
];

export const SERVICE_CATEGORIES = ['All', 'Academic', 'Visa', 'Career', 'Content', 'Business'];

export function categoryColor(cat) {
  switch (cat) {
    case 'Academic': return 'var(--teal)';
    case 'Visa':     return '#a78bfa';
    case 'Career':   return '#3b82f6';
    case 'Content':  return '#f59e0b';
    case 'Business': return '#22c55e';
    default:         return 'var(--text-muted)';
  }
}

export const INITIAL_OFFERS = [
  { id: 'WELCOME15',  code: 'WELCOME15',  label: 'First Order 15% Off', kind: 'percent', value: 15,                  status: 'active',  uses:  234, cap: 1000, expires: 'Dec 31, 2026', scope: 'All services',         minOrder: 1499 },
  { id: 'SOP25',      code: 'SOP25',      label: 'SOP Mega Sale',       kind: 'percent', value: 25,                  status: 'active',  uses:   87, cap:  200, expires: 'Jun 30, 2026', scope: 'SOP services',         minOrder: 4000 },
  { id: 'FREEFAST',   code: 'FREEFAST',   label: 'Free Fast Track',     kind: 'addon',   value: 'Fast Track Free',   status: 'paused',  uses:   12, cap:   50, expires: 'May 25, 2026', scope: 'Resume + LinkedIn',    minOrder: 1999 },
  { id: 'STUDENT500', code: 'STUDENT500', label: 'Flat ₹500 Off',       kind: 'flat',    value: 500,                 status: 'expired', uses: 1024, cap: 1024, expires: 'Apr 30, 2026', scope: 'Personal Statement',   minOrder: 2500 },
];

export const OFFER_SCOPES = [
  'All services',
  'SOP services',
  'Resume + LinkedIn',
  'Personal Statement',
  'Academic only',
  'Visa only',
  'Content only',
];

export const OFFER_KINDS = [
  { value: 'percent', label: '% Discount' },
  { value: 'flat',    label: 'Flat ₹ Off' },
  { value: 'addon',   label: 'Free Add-on' },
];

export function offerStatusColor(status) {
  if (status === 'active') return 'var(--green)';
  if (status === 'paused') return 'var(--amber)';
  return 'var(--text-dim)';
}

export function offerKindGlyph(kind) {
  if (kind === 'percent') return '%';
  if (kind === 'flat')    return '₹';
  return '🎁';
}
