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

### Authorization & RLS
- **Role Model:** Defined securely in `public.user_roles`.
- **Negative Security Tested:** Cross-customer access, cross-provider access, and privilege escalation are completely blocked by RLS policies.
- **RPCs:** Critical financial logic uses `SECURITY DEFINER` with fixed `SET search_path = public` to ensure the client browser cannot manipulate financial outcomes or state transitions.

### Storage Security (Provider KYC)
- **Bucket:** `provider_kyc`
- **Privacy:** The bucket is marked `public = false`. Strict RLS policies guarantee:
  - Providers can only upload and read their own KYC files based on `auth.uid()`.
  - Authorized `admin` roles can read all KYC documents.
  - Unauthenticated users and unauthorized customers are strictly DENIED access.

---

## 💸 Booking & Payment Architecture

The booking lifecycle strictly adheres to the PRD:
`pending` → `matching` → `accepted` → `ongoing` → `completed`

Payment state is decoupled from the booking state:
`pending` → `authorized` → `paid` → `failed` → `refunded`

### Server-Side Commission & Financial Ledger
- **No Hardcoded Commissions:** The legacy hardcoded 10% frontend/backend commission was completely removed.
- **Dynamic Configuration:** Commission is now fetched securely on the server side from the `platform_settings` table (key: `commission_percentage`).
- **Append-Only Ledger:** Upon job completion, the `complete_booking` RPC calculates the dynamic platform fee and provider payout securely, writing them as immutable records to `financial_ledger`. Client tampering of prices or fees is completely ignored by the backend.

### Real Payment Readiness & Edge Functions
- **Payment Mocking:** The UI currently initiates a **Demo/Mock Payment**. Real BDT transactions are blocked until the Edge Function receives actual AamarPay merchant credentials.
- **Webhook Idempotency:** The database contains a `payment_events` table designed for webhook idempotency, preventing duplicate transaction processing or replay attacks.
- **Edge Function:** A secure Deno Edge Function (`supabase/functions/payment-webhook/index.ts`) is fully scaffolded and ready to handle AamarPay Server-to-Server callbacks. 
> **CONFIGURATION REQUIRED:** To process real transactions, you must deploy this Edge Function and provide your `AAMARPAY_SIGNATURE_SECRET`.

---

## 🔐 OTP Security & Provider Matching

- **Atomic Acceptance:** Handled via PostgreSQL `FOR UPDATE` lock. Multiple providers trying to accept the same job concurrently will result in exactly one successful assignment.
- **OTP Gateway:** The job cannot transition to `ongoing` unless the provider verifies the 4-digit OTP provided by the customer. Validated server-side via RPC.

---

## 🛠 Admin CMS Management

Admins manage the platform dynamically without modifying source code.

### How to add a new "Mistry" service:
1. Log in as an Admin.
2. Navigate to `/admin`.
3. Under the **Service Management (CMS)** section, click **"নতুন সার্ভিস যোগ করুন"**.
4. Fill out the form (Name, Category, Base Price) and save.
5. *Result:* The service instantly populates globally on the Landing Page and Booking flows.

Historical bookings are fully protected. Modifying a service price today will not alter the invoice of a booking completed yesterday.
