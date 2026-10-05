# 🚀 কাজবন্ধু (KaajBondhu) - Final Production Architecture

KaajBondhu is a premium, Bangladesh-first local service marketplace connecting customers with verified professionals (Providers/Mistry).

This repository contains the complete, production-hardened MVP Web Application.

---

## 🏗 Architecture & Tech Stack

- **Frontend Hosting:** Vercel (SPA fallback configured via `vercel.json`).
- **Frontend Framework:** React 18, Vite, TypeScript, Tailwind CSS v4.
- **Backend & Database:** Supabase (PostgreSQL 15).
- **Authentication:** Supabase Auth.
- **Security Logic:** PostgreSQL Row Level Security (RLS) + `SECURITY DEFINER` RPCs.

---

## 🔒 Security & Credential Management

**⚠️ CRITICAL CREDENTIAL WARNING:**
A legacy database password was previously exposed in historical development logs.
> **USER ACTION REQUIRED:** You MUST manually rotate your Supabase database password in the Supabase Cloud Console prior to public production launch.

### Environment Variables
**Never** put backend secrets in the browser bundle. Only the following safe, public-facing variables should be configured in your Vercel Production Environment (and `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-safe-anon-key
```

### Authorization & Roles
- **Role Model:** Defined securely in `public.user_roles`.
- **Negative Security Tested:** Cross-customer access, cross-provider access, and privilege escalation are completely blocked by RLS policies.
- **RPCs & Edge Functions:** Critical financial logic uses `SECURITY DEFINER` RPCs with fixed `SET search_path = public` to ensure the client browser cannot manipulate financial outcomes or state transitions. Webhook operations are isolated to Deno Edge Functions.

### Storage Security (Provider KYC)
- **Bucket:** `provider_kyc`
- **Privacy:** The bucket is marked `public = false`. Strict RLS policies guarantee:
  - Providers can only upload and read their own KYC files based on `auth.uid()`.
  - Authorized `admin` roles can read all KYC documents.
  - Unauthenticated users and unauthorized customers are strictly DENIED access.

---

## 🗺 Maps & Geolocation
KaajBondhu utilizes a 100% free mapping architecture built on **Leaflet + OpenStreetMap (OSM)**. 
Google Maps has been completely removed to avoid billing dependencies during the MVP phase. Customers drop a pin on the Leaflet map to provide exact latitude/longitude coordinates directly into the database.

---

## 💸 Booking, OTP, & Payment Architecture

### Booking Lifecycle
The booking lifecycle strictly adheres to the PRD:
`pending` → `matching` → `accepted` → `ongoing` → `completed`
*Transitions are enforced natively in the PostgreSQL ENUM.*

### Provider Matching & Atomic Acceptance
- **Concurrency Protection:** Handled via PostgreSQL `FOR UPDATE` lock. Multiple providers trying to accept the same job concurrently will result in exactly one successful assignment. The rest will fail safely.

### OTP Security
- **OTP Gateway:** The job cannot transition to `ongoing` unless the provider verifies the 4-digit OTP provided by the customer. Validated server-side via RPC. It is bound specifically to the assigned provider and the single booking, and nullifies upon successful use.

### Server-Side Commission & Financial Ledger
- **No Hardcoded Commissions:** The legacy hardcoded 10% frontend/backend commission was completely removed.
- **Dynamic Configuration:** Commission is fetched securely on the server side from the `platform_settings` table (key: `commission_percentage`).
- **Append-Only Ledger:** Upon job completion, the `complete_booking` RPC calculates the dynamic platform fee and provider payout securely, writing them as immutable records to `financial_ledger`. Client tampering of prices or fees is completely ignored by the backend.

### Real Payment Readiness
- **Payment Mocking:** The UI currently initiates a **Demo/Mock Payment**. Real BDT transactions are blocked until the Edge Function receives actual AamarPay merchant credentials.
- **Webhook Idempotency:** The database contains a `payment_events` table designed for webhook idempotency, preventing duplicate transaction processing or replay attacks.
- **Edge Function:** A secure Deno Edge Function (`supabase/functions/payment-webhook/index.ts`) is fully scaffolded and ready to handle AamarPay Server-to-Server callbacks. 
> **CONFIGURATION REQUIRED:** To process real transactions, you must deploy this Edge Function and provide your `AAMARPAY_SIGNATURE_SECRET`.

---

## 🤝 Reviews, Notifications, & Disputes
- **Reviews:** Handled via the `reviews` table post-completion.
- **Notifications:** Schema implemented in `notifications`. UI triggers rely on Supabase Realtime/Polling.
- **Disputes:** Schema implemented in `disputes`. Admins can view/manage flags raised during the `completed` state.

---

## 🎨 Theme, UI/UX, & Responsive Design

- **Theming (Light/Dark/System):** Fully compliant WCAG 2.1 AA implementation. Exact hex values map to Tailwind semantic colors (`slate-900`, `blue-600`, `amber-500`). The 3-state toggle seamlessly transitions the entire app.
- **Mobile-First Responsiveness:** Strict adherence to 44px minimum touch targets (`h-11` buttons). Forms and tables wrap or scroll gracefully down to 320px devices. 
- **Animation:** Staggered, tasteful entrance animations (`tailwindcss-animate`) provide a premium feel without bogging down rendering performance.

---

## 🛠 Admin CMS Management

Admins manage the platform dynamically without modifying source code.

### How to add a new "Mistry" service:
1. Log in as an Admin.
2. Navigate to `/admin`.
3. Under the **Service Management (CMS)** section, click **"নতুন সার্ভিস যোগ করুন"**.
4. Fill out the form (Name, Category, Base Price) and save.
5. *Result:* The service instantly populates globally on the Landing Page and Booking flows via the `PriceDisplay` component.

Historical bookings are fully protected. Modifying a service price today will not alter the invoice of a booking completed yesterday.

---

## 🚢 Testing & Deployment

### Testing
- Automated negative tests (`test-e2e-security.js`) verify that RLS blocks cross-tenant data leaks and unauthorized state transitions.
- Build compiles entirely without TypeScript errors.

### Vercel Deployment
1. Set Vercel project framework to **Vite**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Environment Variables.
3. Vercel automatically respects `vercel.json` for SPA deep-link routing.

### Troubleshooting & Future Maintenance
- **Hydration Flashes:** If Dark Mode flashes white on load, ensure the blocking script in `index.html` remains intact.
- **Edge Function Logs:** Monitor Supabase Edge Function logs if payment webhooks fail to hit the DB.
- **Auth Redirects:** If users cannot log in post-deployment, verify your production Vercel URL is added to the Supabase Auth Redirect URLs list.
