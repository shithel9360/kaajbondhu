# 🚀 KaajBondhu (কাজবন্ধু)

KaajBondhu is a Bangladesh-first, premium on-demand local service marketplace MVP. It connects customers with verified professionals for home services (AC repair, cleaning, plumbing, etc.) through a seamless, highly optimized, and robust platform.

## ✨ Core Architecture & Security Model

The project strictly follows the **PRD Requirements** focusing on correctness, security, and an API-first monolithic design. 

### 🔒 Security Model & Database
- **Thick DB, Thin Client:** All business logic lives in PostgreSQL. The frontend is fully decoupled and untrusted.
- **Strict Role-Based Access (RBAC):** `user_roles` acts as the single source of truth. `has_role()` is an explicitly secured RPC function (`SECURITY DEFINER SET search_path = public`).
- **Row Level Security (RLS):** Enabled universally. Providers cannot read other providers' data. Customers cannot view internal platform configurations.
- **Provider Privacy:** Customers' exact addresses and phone numbers are hidden via UI logic prior to job acceptance, mitigating data scraping. 

### 🔄 Booking Lifecycle
Strict adherence to the PRD state machine via atomic transactions.
1. `pending`
2. `matching`
3. `accepted` (Provider assignment locks via atomic row update preventing race conditions)
4. `ongoing` (Triggered ONLY by 4-digit expiring server-generated OTP validation)
5. `completed` (Triggers server-side ledger calculations and locks fees)

*Note: `payment_status` is modeled completely independently as `pending`, `authorized`, `paid`, `failed`, or `refunded`.*

### 💰 Financial Engine
- **Append-Only Ledger:** `financial_ledger` is immutable. Server-side RPC calculates the platform commission upon booking completion and securely inserts locked entries (`platform_commission`, `provider_payable`).
- **Dynamic Commission:** Removed hardcoded 20% calculations from the UI. Server computes dynamic fractions.
- **Data Integrity:** Pricing operates strictly in **Poisha** integers (1 BDT = 100 Poisha) completely bypassing IEEE 754 float rounding bugs. 

## 🛠️ Technology Stack

**Frontend:**
- React 18 + Vite 8
- Tailwind CSS v4 + shadcn/ui
- React Router v7
- React Leaflet (OpenStreetMap integration for 100% free coordinate-based locations)

**Backend:**
- Supabase (PostgreSQL 15, Auth, PostgREST)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project & CLI

### Installation & Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/kaajbondhu.git
   cd kaajbondhu
   npm install
   ```

2. **Environment Variables:**
   Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the Database Migrations:**
   ```bash
   supabase migration up
   ```
   **Migrations Map:**
   - `00001` - Auth & Roles
   - `00002` - Catalog & Bookings
   - `00003` - Initial PRD Seed Data
   - `00004` - Provider KYC Logic
   - `00005` - Offers & Pricing Logic
   - `00006` - Map Coordinates
   - `00007` - Enterprise Scaffolding (Ledger, Quotes, Disputes)
   - `00008` - PRD Strict Compliance (Concurrency, Security, OTP, Enums)

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## 🧪 Testing Scope
- **Concurrency:** `accept_booking` RPC relies on `FOR UPDATE` preventing double-assignment.
- **OTP Tampering:** OTP strings reside in private DB columns; `verify_booking_otp` strictly limits state transitions.
- **Financial Hacking:** Frontend price mutations are ignored during `complete_booking`.

## ⚠️ Known Limitations (MVP Scope)
- Storage access policies (e.g., NID uploads) currently rely on bucket configuration (not detailed in migrations).
- "AamarPay" integration is implemented as a functional mock; requires production webhook handler via Supabase Edge Functions before going live.
