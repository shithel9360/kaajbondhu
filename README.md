# 🚀 কাজবন্ধু (KaajBondhu)

KaajBondhu is a premium, Bangladesh-first local service marketplace connecting customers with verified professionals (Providers/Mistry) for everyday tasks.

This repository contains the complete MVP Web Application.

---

## 🏗 Architecture & Tech Stack

- **Frontend Hosting:** Vercel (SPA fallback configured via `vercel.json`).
- **Frontend Framework:** React 18, Vite, TypeScript.
- **Styling & UI:** Tailwind CSS v4, shadcn/ui, Lucide Icons.
- **State Management:** React hooks + Supabase Realtime/Fetch.
- **Map & Geolocation:** Leaflet + OpenStreetMap (100% Free, Zero Google Maps billing required).
- **Backend & Database:** Supabase (PostgreSQL 15).
- **Authentication:** Supabase Auth (Email/Password).
- **Security Logic:** PostgreSQL Row Level Security (RLS) + Edge Functions / RPCs.

---

## 🔒 Security & Credential Rotation

**⚠️ CRITICAL SECURITY WARNING:**
A legacy database password was previously exposed in historical development logs.
> **You MUST rotate your Supabase database password in the Supabase Cloud Console prior to public production launch.**

### Environment Variables
**Never** put backend secrets in the browser bundle. Only the following safe, public-facing variables should be configured in your Vercel Production Environment (and `.env.local`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-safe-anon-key
```

### Authorization & RLS
- **Authentication:** Handled entirely by Supabase Auth.
- **Role Model:** Defined securely in `public.user_roles` (`admin`, `customer`, `provider`). 
- **Row Level Security (RLS):** All tables are protected.
  - Customers can only read their own bookings.
  - Providers can only see jobs they are assigned to, or public `pending` jobs.
  - Profile visibility is restricted appropriately.
- **RPCs:** Critical financial logic (e.g., `accept_booking`, `verify_booking_otp`, `complete_booking`) runs under `SECURITY DEFINER` with fixed `search_path = public` to ensure the client browser cannot manipulate financial outcomes or state transitions.

### Storage Security
Provider KYC documents (NID) and portfolio images are uploaded to Supabase Storage.
> **Action Required:** Ensure you manually set your Supabase Storage buckets to "Private" for KYC documents in the Supabase Dashboard, applying RLS so only Admins can read them.

---

## 💸 Booking Lifecycle & Matching

The booking lifecycle strictly adheres to the PRD:
`pending` → `matching` → `accepted` → `ongoing` → `completed`

Payment state is entirely decoupled from the booking state:
`pending` → `authorized` → `paid` → `failed` → `refunded`

### Provider Matching & Idempotency
- **Atomic Acceptance:** Providers accept jobs via the `accept_booking` RPC. This uses PostgreSQL `FOR UPDATE` row-level locks. If two providers tap "Accept" on the exact same millisecond, exactly one will succeed.
- **OTP Security:** When a provider accepts, the server securely generates a single-use, 15-minute expiring 4-digit OTP. The job cannot transition to `ongoing` unless the customer physically reads the OTP to the provider, preventing phantom starts.

### Financial Ledger
- **Append-Only:** Once a job is completed, the RPC dynamically calculates any platform commission and inserts immutable, append-only records into `financial_ledger`.
- No client-side mathematics are trusted.

---

## 🎨 UI/UX & Theming

The application features a strict, highly polished Design System:
- **Pricing Uniformity:** A single `PriceDisplay` component renders all prices. All values are stored as integers (Poisha) in the database and formatted consistently.
- **Dark/Light Mode:** Full WCAG 2.1 AA compliant Dark Mode using strict Tailwind `slate/blue/amber` mappings. Prevented hydration flash via a blocking script in `index.html`.
- **Responsive:** Layout scales fluidly from 320px (Small Mobile) to 1920px (Desktop), converting tables to horizontal scroll-wrappers on mobile devices.

---

## 🛠 Admin CMS Management

The Admin Dashboard provides a real-time CMS allowing administrators to dynamically manage operations without modifying frontend source code.

### How to add a new "Mistry" service:
1. Log in as an Admin.
2. Navigate to the **Admin Dashboard** (`/admin`).
3. Under the **Service Management (CMS)** section, click **"নতুন সার্ভিস যোগ করুন"** (Add New Service).
4. Fill out the form:
   - **Name:** "Mistry (মিস্ত্রি)"
   - **Category:** Select the appropriate parent category.
   - **Description:** Enter the service details.
   - **Base Price:** Enter the base booking price.
5. Click **Save**. 
6. *Result:* The service instantly populates globally on the Landing Page, Search, and Booking flows using the centralized `PriceDisplay` logic.

### Modifying Historical Prices
If an Admin updates the base price of "AC Servicing" from ৳500 to ৳600, all *future* bookings will reflect ৳600. *Historical* bookings are safely preserved since the actual price was copied to `bookings.total_price` at the moment of checkout.

---

## 💳 Payments (Demo Notice)

Currently, the AamarPay checkout button is configured as a **DEMO/TEST ONLY** simulation. 
Before processing real BDT transactions, you must replace the simulated `setTimeout` in `Dashboard.tsx` with a real AamarPay API initialization, and set up a Supabase Edge Function to securely handle the AamarPay Server-to-Server Webhook.

---

## 📦 Deployment Instructions

1. Push all code to your GitHub Repository.
2. Connect the repository to **Vercel**.
3. Select **Vite** as the framework.
4. Add the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.
6. Verify your Vercel Domain is added to Supabase Auth -> URL Configuration -> Redirect URLs.
