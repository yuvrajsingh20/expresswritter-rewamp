# Xpresswriters — Developer Handoff
## Next.js 14 · Supabase · Vercel

> **Important:** All HTML files in this bundle are **high-fidelity design prototypes** — not production code. Your task is to **recreate these designs in a Next.js 14 App Router project** using the component structure, patterns, and libraries described below. Do not ship the HTML files directly.

---

## 1. Project Overview

Xpresswriters is a **SaaS content writing marketplace** connecting clients who need written content with vetted freelance writers. It includes:

- Public marketing landing page
- Role-based authentication (Client / Writer / Admin)
- Client dashboard (orders, real-time chat with writers, CRM)
- Writer studio (order management, CMS chat, earnings)
- Writer onboarding (6-step application flow)
- Admin panel (9 sections: integrations, ticketing, payments, writers, users, workflow, theme, currency)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Auth | Supabase Auth (Email, Google OAuth, Magic Link) |
| Database | Supabase Postgres (with Row Level Security) |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| File Storage | Supabase Storage (order attachments) |
| Payments | Stripe (global) + Razorpay (India) |
| Email | SendGrid (transactional) |
| AI | OpenAI GPT-4o + Anthropic Claude + Google Gemini |
| WhatsApp | WhatsApp Cloud API (Meta) |
| Automation | Make.com webhooks |
| SMS/Voice | Twilio |
| Deployment | Vercel (Pro) |
| Domain | Custom domain via Vercel |

---

## 3. Repository Structure

```
xpresswriters/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no navbar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (marketing)/              # Public pages
│   │   └── page.tsx              # Landing page (index.html)
│   ├── dashboard/                # Client dashboard (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── orders/page.tsx
│   │   ├── messages/page.tsx
│   │   └── writers/page.tsx
│   ├── writer/                   # Writer studio (protected)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── orders/page.tsx
│   │   ├── earnings/page.tsx
│   │   └── profile/page.tsx
│   ├── onboarding/               # Writer onboarding (protected)
│   │   └── page.tsx
│   ├── admin/                    # Admin panel (protected, admin-only)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── integrations/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── currency/page.tsx
│   │   ├── writers/page.tsx
│   │   ├── users/page.tsx
│   │   ├── workflow/page.tsx
│   │   └── theme/page.tsx
│   ├── api/                      # API Routes (Edge Functions)
│   │   ├── auth/callback/route.ts
│   │   ├── orders/route.ts
│   │   ├── messages/route.ts
│   │   ├── payments/stripe/route.ts
│   │   ├── payments/razorpay/route.ts
│   │   ├── webhooks/stripe/route.ts
│   │   ├── ai/triage/route.ts
│   │   └── ai/quality-check/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css               # CSS variables + Tailwind
├── components/
│   ├── ui/                       # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Toggle.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── Avatar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── OTPInput.tsx
│   │   └── PasswordStrength.tsx
│   ├── landing/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── WritersMarketplace.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── OrderTracking.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── Footer.tsx
│   │   └── LiveChat.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── OrderCard.tsx
│   │   ├── MessageThread.tsx
│   │   └── StatCard.tsx
│   ├── writer/
│   │   ├── OrderStrip.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── EarningsChart.tsx
│   │   └── WriterSidebar.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── IntegrationCard.tsx
│   │   ├── TicketList.tsx
│   │   ├── EscalationMatrix.tsx
│   │   └── WriterDetailPanel.tsx
│   └── shared/
│       ├── OrderModal.tsx
│       └── RealTimeChat.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (RSC)
│   │   └── middleware.ts         # Auth middleware
│   ├── stripe.ts
│   ├── razorpay.ts
│   ├── sendgrid.ts
│   ├── twilio.ts
│   ├── openai.ts
│   ├── claude.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── useMessages.ts
│   ├── useRealtime.ts
│   └── useTheme.ts
├── types/
│   └── index.ts                  # All TypeScript types
├── middleware.ts                  # Route protection
├── .env.local                    # Environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. Design Tokens (CSS Variables)

Define these in `app/globals.css`. The admin panel supports dark/light switching — these vars change on theme toggle:

```css
/* globals.css */
:root {
  /* Dark theme (default) */
  --bg: #09090f;
  --surface: #0d0d1c;
  --surface2: #121224;
  --surface3: #181830;
  --surface4: #1e1e3a;
  --border: rgba(255, 255, 255, 0.07);
  --border-teal: rgba(13, 148, 136, 0.25);

  /* Brand */
  --teal: #0d9488;
  --teal-light: #2dd4bf;
  --teal-glow: rgba(13, 148, 136, 0.2);

  /* Text */
  --text: #eefcfb;
  --text-muted: #6b9e9a;
  --text-dim: #2e4d4a;

  /* Semantic */
  --green: #22c55e;
  --amber: #f59e0b;
  --red: #f43f5e;
  --blue: #3b82f6;
  --purple: #8b5cf6;
  --gold: #f5c842;

  /* Typography */
  --font: 'Google Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
}

[data-theme="light"] {
  --bg: #f4f6f9;
  --surface: #ffffff;
  --surface2: #f0f2f7;
  --surface3: #e6eaf2;
  --surface4: #dde1ee;
  --border: rgba(0, 0, 0, 0.08);
  --text: #0f1923;
  --text-muted: #4a6670;
  --text-dim: #94a8b3;
}
```

**Typography:** Import from Google Fonts in `layout.tsx`:
```tsx
import { Google_Sans } from 'next/font/google'
// Note: use 'DM Sans' as fallback if Google Sans unavailable via next/font
```

---

## 5. Supabase Database Schema

Run these migrations in order in your Supabase SQL editor:

```sql
-- ═══════════════════════════════
-- USERS & ROLES
-- ═══════════════════════════════
create type user_role as enum ('client', 'writer', 'admin', 'super_admin');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role user_role not null default 'client',
  avatar_url text,
  phone text,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════
-- WRITERS
-- ═══════════════════════════════
create type writer_status as enum ('pending', 'active', 'inactive', 'suspended');
create type kyc_status as enum ('not_submitted', 'submitted', 'verified', 'rejected');

create table writers (
  id uuid references profiles(id) on delete cascade primary key,
  title text,
  bio text,
  skills text[] default '{}',
  experience_level text,
  education text,
  credentials text,
  portfolio_url text,
  base_rate numeric(10,2) default 12.00,  -- per 100 words
  rush_rate_pct int default 40,
  availability text,
  fastest_turnaround text,
  rating numeric(3,2) default 0,
  total_reviews int default 0,
  total_orders int default 0,
  total_earnings numeric(12,2) default 0,
  badge text,
  status writer_status default 'pending',
  kyc_status kyc_status default 'not_submitted',
  payment_method text,
  payment_currency text default 'USD',
  nda_signed boolean default false,
  identity_verified boolean default false,
  featured boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════
-- ORDERS
-- ═══════════════════════════════
create type order_status as enum (
  'new_order', 'writer_assigned', 'in_progress',
  'under_review', 'quality_check', 'delivered',
  'revision', 'closed'
);
create type delivery_type as enum ('urgent', 'timeline');

create table orders (
  id uuid default gen_random_uuid() primary key,
  invoice_num text unique not null,
  client_id uuid references profiles(id),
  writer_id uuid references writers(id),
  service text not null,
  category text,
  brief text,
  word_count int not null,
  price numeric(10,2) not null,
  status order_status default 'new_order',
  progress int default 0,
  delivery_type delivery_type default 'timeline',
  due_date timestamptz,
  submitted_at timestamptz default now(),
  delivered_at timestamptz,
  has_nda boolean default false,
  client_alias text,  -- e.g. "Client #A204" — never expose real name to writer
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-generate invoice number
create sequence invoice_seq start 1000;
alter table orders alter column invoice_num
  set default 'INV-2024-' || lpad(nextval('invoice_seq')::text, 4, '0');

-- ═══════════════════════════════
-- MESSAGES (order chat)
-- ═══════════════════════════════
create type message_type as enum ('text', 'file', 'status_update', 'system');
create type sender_role as enum ('client', 'writer', 'system');

create table messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  sender_id uuid references profiles(id),
  sender_role sender_role not null,
  type message_type default 'text',
  content text,
  file_url text,
  file_name text,
  file_size text,
  is_watermarked boolean default false,
  is_secure boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════
create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');
create type payment_gateway as enum ('stripe', 'razorpay', 'bank_transfer', 'paypal', 'wire');

create table transactions (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id),
  client_id uuid references profiles(id),
  amount numeric(10,2) not null,
  currency text default 'USD',
  gateway payment_gateway not null,
  gateway_txn_id text,
  status payment_status default 'pending',
  writer_payout numeric(10,2),
  platform_fee numeric(10,2),
  created_at timestamptz default now()
);

-- ═══════════════════════════════
-- PAYOUTS
-- ═══════════════════════════════
create type payout_status as enum ('scheduled', 'processing', 'paid', 'failed');

create table payouts (
  id uuid default gen_random_uuid() primary key,
  writer_id uuid references writers(id),
  amount numeric(10,2) not null,
  currency text not null,
  method payment_gateway not null,
  status payout_status default 'scheduled',
  order_count int default 0,
  scheduled_date timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════
-- TICKETS
-- ═══════════════════════════════
create type ticket_type as enum ('order', 'client', 'writer', 'payment', 'general');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');
create type ticket_status as enum ('open', 'in_progress', 'escalated', 'resolved', 'closed');
create type escalation_level as enum ('none', 'level1', 'level2', 'level3');

create table tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_num text unique not null default 'TKT-' || lpad(floor(random()*9000+1000)::text, 4, '0'),
  type ticket_type not null,
  subject text not null,
  description text,
  client_id uuid references profiles(id),
  writer_id uuid references writers(id),
  order_id uuid references orders(id),
  assigned_to uuid references profiles(id),
  priority ticket_priority default 'medium',
  status ticket_status default 'open',
  escalation_level escalation_level default 'none',
  ai_draft text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════
-- CURRENCY SETTINGS
-- ═══════════════════════════════
create table currency_settings (
  id uuid default gen_random_uuid() primary key,
  region text not null,
  currency_code text not null,
  symbol text not null,
  exchange_rate numeric(12,6) not null default 1.0,
  gateway payment_gateway,
  min_payout numeric(10,2),
  enabled boolean default true,
  updated_at timestamptz default now()
);

-- Seed default currencies
insert into currency_settings (region, currency_code, symbol, exchange_rate, gateway, min_payout, enabled) values
  ('United States', 'USD', '$', 1.0, 'stripe', 50, true),
  ('United Kingdom', 'GBP', '£', 0.79, 'stripe', 50, true),
  ('India', 'INR', '₹', 83.2, 'razorpay', 5000, true),
  ('European Union', 'EUR', '€', 0.92, 'stripe', 50, true),
  ('UAE', 'AED', 'د.إ', 3.67, 'stripe', 180, true);

-- ═══════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════
alter table profiles enable row level security;
alter table orders enable row level security;
alter table messages enable row level security;
alter table transactions enable row level security;

-- Clients see only their own orders
create policy "clients_own_orders" on orders
  for all using (client_id = auth.uid());

-- Writers see only their assigned orders
create policy "writers_assigned_orders" on orders
  for select using (writer_id = auth.uid());

-- Messages: only order participants
create policy "order_participants_messages" on messages
  for all using (
    order_id in (
      select id from orders
      where client_id = auth.uid() or writer_id = auth.uid()
    )
  );

-- Admins bypass RLS (use service role key server-side)

-- ═══════════════════════════════
-- REALTIME SUBSCRIPTIONS
-- Enable for live chat and order updates
-- ═══════════════════════════════
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table tickets;
```

---

## 6. Environment Variables

Create `.env.local` at project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only, never expose to client

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# Messaging
SENDGRID_API_KEY=SG....
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
WHATSAPP_ACCESS_TOKEN=EAABx...
WHATSAPP_PHONE_NUMBER_ID=...

# Make.com
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/...

# App
NEXT_PUBLIC_APP_URL=https://xpresswriters.com
```

---

## 7. Auth & Middleware

### `middleware.ts` — Route protection

```ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Protected routes
  const clientRoutes = ['/dashboard']
  const writerRoutes = ['/writer', '/onboarding']
  const adminRoutes = ['/admin']

  if (!session) {
    if ([...clientRoutes, ...writerRoutes, ...adminRoutes].some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (session) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', session.user.id).single()

    const role = profile?.role

    if (adminRoutes.some(r => pathname.startsWith(r)) && !['admin','super_admin'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (writerRoutes.some(r => pathname.startsWith(r)) && role !== 'writer') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (clientRoutes.some(r => pathname.startsWith(r)) && role !== 'client') {
      return NextResponse.redirect(new URL('/writer', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/writer/:path*', '/admin/:path*', '/onboarding/:path*']
}
```

### Role-based redirect after login

```ts
// After successful auth.signIn:
const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()

const redirectMap = {
  client: '/dashboard',
  writer: '/writer',
  admin: '/admin',
  super_admin: '/admin',
}
router.push(redirectMap[profile.role] ?? '/dashboard')
```

---

## 8. Real-time Chat Implementation

```ts
// hooks/useMessages.ts
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useMessages(orderId: string) {
  const [messages, setMessages] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch existing messages
    supabase.from('messages').select('*')
      .eq('order_id', orderId).order('created_at')
      .then(({ data }) => setMessages(data ?? []))

    // Subscribe to new messages
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  const sendMessage = async (content: string, senderRole: string) => {
    await supabase.from('messages').insert({
      order_id: orderId, content, sender_role: senderRole,
      sender_id: (await supabase.auth.getUser()).data.user?.id
    })
  }

  return { messages, sendMessage }
}
```

---

## 9. File Upload & Security

```ts
// Supabase Storage — secure file upload per order
const uploadOrderFile = async (orderId: string, file: File) => {
  const path = `orders/${orderId}/${file.name}`

  const { data, error } = await supabase.storage
    .from('order-files')  // private bucket — RLS protected
    .upload(path, file, { upsert: false })

  // Generate signed URL (expires in 1 hour — never permanent public links)
  const { data: signed } = await supabase.storage
    .from('order-files')
    .createSignedUrl(path, 3600)

  return signed?.signedUrl
}
```

**Watermarking:** Call Cloudinary API on the server after upload to add watermark with client ID + document hash.

---

## 10. Payment Flow

### Stripe Order Payment

```ts
// app/api/payments/stripe/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { orderId, amount, currency } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency, unit_amount: amount * 100,
      product_data: { name: 'Xpresswriters Order' } }, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
    metadata: { orderId }
  })

  return Response.json({ url: session.url })
}
```

### Stripe Webhook → Update DB

```ts
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // Update transaction status in Supabase
    await supabase.from('transactions')
      .update({ status: 'paid', gateway_txn_id: session.payment_intent })
      .eq('order_id', session.metadata.orderId)
  }
  return Response.json({ received: true })
}
```

---

## 11. AI Integration

```ts
// app/api/ai/triage/route.ts — ticket auto-triage
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { ticketSubject, ticketType, priority } = await req.json()

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a customer support AI for Xpresswriters, a content writing platform. 
Draft a professional, empathetic support response for this ticket:
Type: ${ticketType}
Subject: ${ticketSubject}
Priority: ${priority}

Keep it concise (3-4 sentences), warm, and action-oriented.`
    }]
  })

  return Response.json({ draft: message.content[0].text })
}
```

---

## 12. Screen-by-Screen Implementation Guide

### Screen 1: Auth (`auth.html`)
**Fidelity:** High-fidelity

**Layout:** Two-column split — Left panel (440px fixed, dark gradient) + Right panel (flex-1, dark bg, centered form)

**Left panel:**
- Background: `linear-gradient(160deg, #0a0a18, #0d1a20, #091a18)`
- Grid texture overlay: `repeating-linear-gradient` at 32px intervals, `rgba(13,148,136,0.04)`
- Floating glow orb: 500×500 radial gradient, `animation: orbFloat 8s ease-in-out infinite`
- Logo (X mark in teal square 36px rounded-9, fontWeight 700) + "Xpresswriters"
- 5 feature items with teal icons, slide-in animation (`slideRight 0.4s ease {i*70}ms`)
- Testimonial card: `rgba(13,148,136,0.07)` bg, `border-teal`, 12px border-radius

**Login form:**
- Role selector: 3-card grid (Client / Writer / Admin), teal border + bg on selected
- Google OAuth button: full-width, `var(--surface3)` bg, hover → teal border
- Email + password inputs: floating label, left icon, eye toggle for password
- "Remember me" checkbox + "Forgot password?" link (right-aligned)
- Primary CTA: full-width, `var(--teal)` bg, 15px font, 13px border-radius
- On submit: 1.8s loading spinner, then redirect based on role

**Signup (2-step):**
- Step 1: Role picker (Client "I need content" vs Writer "I am a writer") + Google
- Step 2: Name, email, password + strength meter (4 checks), confirm, terms checkbox
- Password strength: 4-segment bar changing color (red→amber→teal→green)

**Forgot Password (3-step):**
- Step 1: Email → send OTP
- Step 2: 6-box OTP grid (48×56px each, auto-focus next on type, backspace to prev)
- 60s resend countdown timer
- Step 3: New password + strength meter + confirm
- Step 4: Success screen with animated checkmark

---

### Screen 2: Landing (`index.html`)
**Fidelity:** High-fidelity

**Navbar:** Fixed, `position: fixed`, backdrop-blur on scroll, logo + nav links + "Dashboard" + "Place Order" CTA

**Hero:**
- Full viewport height, centered content, two glow orbs (600px top-center, 300px bottom-right)
- Background noise texture overlay (SVG feTurbulence, 4% opacity)
- Animated counter stats (0 → target over 2s, cubic ease-out)
- Headline: `clamp(42px, 6vw, 88px)`, fontWeight 900, shimmer gradient text animation
- Two CTAs: "Place Your Order →" (primary) + "Browse Writers" (outline)

**Services Grid:** `repeat(auto-fill, minmax(260px, 1fr))`, 12 cards, hover: lift + teal top border

**Writer Marketplace:** Filterable (All/Academic/Career/Content/Business), 6 writer cards per row, hire button on hover

**Order Modal:** 3-step (Category picker → Turnaround + word count slider + brief → Review + place order)

**Order Tracking:** Animated step progress bar, auto-advances every 3s for demo

**Pricing:** 3-tier grid, middle card scaled 1.04x with violet gradient bg

---

### Screen 3: Client Dashboard (`dashboard.html`)
**Fidelity:** High-fidelity

**Layout:** Sidebar (220px) + Main content area (flex-1)

**Sidebar sections:**
- Logo area (30px)
- User card (avatar + name + plan badge)
- Nav: Overview / My Orders / Messages / My Writers / Settings
- Bottom: "Become a Writer" link

**Overview tab:** 4 stat cards, active order cards with mini-track, activity feed list

**Orders tab:** Filter tabs (All/Active/Delivered/Revision), table layout with expandable order detail below, full status timeline on expand

**Messages tab:** Split pane — conversation list (280px) + chat area (flex-1)
- Conversation list: avatar, online indicator, unread badge, last message preview
- Chat area: header with order ID badge, message bubbles (user: teal, writer: surface3), file share cards, input with attach button

**My Writers tab:** Saved writer grid with "New Order" + "Message" quick actions

---

### Screen 4: Writer Studio (`writer-dashboard.html`)
**Fidelity:** High-fidelity

**Order Strips** (key component — implement pixel-precisely):
- 2px colored top bar (= status color)
- Row 1: Invoice number (monospace, 10px) + delivery type badge (⚡URGENT red or 📅timeline blue) + NDA badge
- Row 2: Service name (bold 13px) + client alias with shield icon + word count + price
- Row 3: Status pill + unread messages pulse badge + days-left countdown
- Mini 5-dot progress track
- 3px progress bar at bottom with percentage

**Chat panel** (opens on strip click):
- 4 tabs: Chat / Brief / Files / Timeline
- Chat tab: Security banner (purple, E2E encrypted), message thread (system msgs centered pill, status updates centered teal pill, file cards, text bubbles), typing indicator (3 pulsing dots), input with attach
- Status dropdown: changes order status → auto-injects system message into thread
- Files tab: client files + delivered files, watermark badges, download buttons

---

### Screen 5: Writer Onboarding (`writer-onboarding.html`)
**Fidelity:** High-fidelity

6-step flow with `localStorage` persistence:
1. Profile (name, title, email, country, bio 400-char, education, language)
2. Expertise (skill category grid 3-col, experience level 4-option grid)
3. Portfolio (drag-drop zone, file list with remove, portfolio URL)
4. Assessment (3 prompt tabs, textarea, simulated AI scoring with 4-metric breakdown)
5. Rates (base rate slider $5–$60, rush premium 4-option grid, availability + turnaround radio lists)
6. Review (profile preview card, 4-section summary grid, terms checkbox)

Fixed bottom nav bar with Back + Continue, progress auto-saved.

---

### Screen 6: Admin Panel (`admin.html`)
**Fidelity:** High-fidelity

**Layout:** Sidebar (224px, gradient) + Topbar (52px, gradient) + Content area

**Theme toggle** (topbar): Pill button with sliding track, switches CSS variables, persisted to `data-theme` on `<html>`, `localStorage`

**9 sections — implement each as a separate route/page:**

1. **Overview:** Platform health bar, 6 gradient stat cards with glow orbs, quick-access grid, activity feed
2. **Integrations:** 10 accordion cards grouped by category (Payments/Google/Communication/AI/Automation), credential fields with show/hide, enable toggle, feature list, test connection
3. **Ticketing:** Stats row, filterable list + detail pane, AI draft generator, 3-level escalation matrix with configurable delays
4. **Payments:** Subtabs (Overview/Transactions/Writer Payouts/Accounts), bar chart, gateway split bars, transactions table, payout management
5. **Currency:** Per-region table with live exchange rate inputs, enable/disable per region
6. **Writers:** List + detail panel, KPI table with target comparison, verification checklist, payment settings, skill toggles, approve/deactivate
7. **Users:** Admin accounts table, roles & permissions cards, login security toggles, audit log
8. **Workflow:** Status pipeline visual, transition rules table with SLA, automation toggles
9. **Theme:** Color presets, 4 color pickers, font selector with preview, radius sliders, layout toggles

---

## 13. Animations Reference

All animations use CSS `@keyframes`. Key ones to replicate:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes orbFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(-20px); }
}
@keyframes trackPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(13,148,136,0); }
}
```

Transition standard: `all 0.2s ease` for hover states, `0.3s ease` for panel slides, `0.4s ease` for step transitions.

---

## 14. TypeScript Types

```ts
// types/index.ts

export type UserRole = 'client' | 'writer' | 'admin' | 'super_admin'
export type OrderStatus = 'new_order' | 'writer_assigned' | 'in_progress' | 'under_review' | 'quality_check' | 'delivered' | 'revision' | 'closed'
export type DeliveryType = 'urgent' | 'timeline'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  country?: string
  created_at: string
}

export interface Writer extends Profile {
  title: string
  bio: string
  skills: string[]
  base_rate: number
  rating: number
  total_reviews: number
  total_orders: number
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  badge?: string
  payment_currency: string
}

export interface Order {
  id: string
  invoice_num: string
  client_id: string
  writer_id?: string
  service: string
  brief: string
  word_count: number
  price: number
  status: OrderStatus
  progress: number
  delivery_type: DeliveryType
  due_date: string
  client_alias: string
  has_nda: boolean
  created_at: string
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  sender_role: 'client' | 'writer' | 'system'
  type: 'text' | 'file' | 'status_update' | 'system'
  content?: string
  file_url?: string
  file_name?: string
  is_watermarked?: boolean
  created_at: string
}

export interface Ticket {
  id: string
  ticket_num: string
  type: 'order' | 'client' | 'writer' | 'payment' | 'general'
  subject: string
  priority: TicketPriority
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed'
  escalation_level: 'none' | 'level1' | 'level2' | 'level3'
  ai_draft?: string
  created_at: string
}
```

---

## 15. Deployment Checklist (Vercel)

```bash
# 1. Install dependencies
npx create-next-app@latest xpresswriters --typescript --tailwind --app --src-dir=false
cd xpresswriters
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install stripe razorpay @sendgrid/mail twilio
npm install @anthropic-ai/sdk openai @google/generative-ai

# 2. Push to GitHub
git init && git add . && git commit -m "feat: initial Next.js 14 setup"
gh repo create xpresswriters --private --push

# 3. Connect to Vercel
# Go to vercel.com → New Project → Import from GitHub → xpresswriters

# 4. Set Environment Variables in Vercel Dashboard
# (all vars from .env.local above)

# 5. Connect Supabase
# supabase.com → New Project → copy URL + keys → paste in Vercel env vars
# Run SQL migrations in Supabase SQL Editor

# 6. Configure Stripe webhooks
# stripe.com → Webhooks → Add endpoint:
# https://xpresswriters.vercel.app/api/webhooks/stripe
# Events: checkout.session.completed, payment_intent.payment_failed

# 7. Custom domain
# vercel.com → Project Settings → Domains → xpresswriters.com
# Update DNS at registrar: A record → 76.76.21.21
```

---

## 16. Design Files Reference

| File | Screen | Notes |
|---|---|---|
| `auth.html` | Login, Signup, Forgot Password | 3 screens in one file, `screen` state switches |
| `index.html` | Landing page | Hero, services, writers, how-it-works, tracking, testimonials, pricing, footer |
| `dashboard.html` | Client dashboard | Overview, orders, messages, writers, settings |
| `writer-dashboard.html` | Writer studio | Overview, orders+chat, earnings, profile |
| `writer-onboarding.html` | Writer application | 6-step flow with localStorage persistence |
| `admin.html` | Admin panel | 9 sections, dark/light theme toggle |
| `admin-shared.jsx` | Admin shared components | Toggle, Card, Table, Btn, Input, Select, etc. |
| `admin-integrations.jsx` | Admin: API integrations | All 10 service accordion cards |
| `admin-tickets.jsx` | Admin: Ticketing | Queue, AI triage, escalation matrix |
| `admin-payments.jsx` | Admin: Payments + Currency | Revenue, transactions, payouts, currency table |
| `admin-writers.jsx` | Admin: Writer management | List, KPI, verification, payment settings |
| `admin-settings.jsx` | Admin: Theme, Workflow, Users | 3 sections in one file |

---

*Generated by Xpresswriters Design System — April 2026*
*All designs are © Xpresswriters. Implement in Next.js 14 App Router as described.*
