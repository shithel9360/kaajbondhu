# 🚀 KaajBondhu (কাজবন্ধু)

KaajBondhu is a Bangladesh-first, premium on-demand local service marketplace MVP. It connects customers with verified professionals for home services (AC repair, cleaning, plumbing, etc.) through a seamless, highly optimized, and robust platform.

![KaajBondhu Preview](https://via.placeholder.com/1200x600.png?text=KaajBondhu+-+Home+Services)

## ✨ Core Features

### 👤 For Customers
- **Interactive Booking:** Pick precise service locations using a fully free, integrated interactive map (Leaflet + OpenStreetMap).
- **Special Offers & Bundles:** Real-time discount calculations and competitive BD market pricing.
- **Service Lifecycle:** Track bookings from `pending` -> `in_progress` -> `completed` -> `paid`.
- **User Profiles:** Manage personal information effortlessly.

### 🛠️ For Providers
- **Dedicated Dashboard:** Track total earnings (80% provider cut) and completed jobs.
- **Job Assignment:** View new jobs available in the local zone and accept them with one click.
- **Smart Navigation:** Direct Google Maps links to customer locations.
- **Onboarding Wizard:** Secure onboarding and NID verification workflow.

### 👑 For Admins
- **Operational Console:** View total platform bookings, total active providers, and calculate platform income (20% commission).
- **Approval Workflow:** Approve or reject new provider applications.
- **Enterprise Architecture:** Built-in tables for Audit Logs, Financial Ledger, Disputes, and Quotes.

## 🛠️ Technology Stack

**Frontend:**
- [React 18](https://reactjs.org/) + [Vite 8](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + Lucide Icons
- [React Router v7](https://reactrouter.com/)
- [React Leaflet](https://react-leaflet.js.org/) (OpenStreetMap)

**Backend & Database:**
- [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- Row Level Security (RLS) & Secure Postgres RPCs

## ⚙️ Enterprise Architecture

KaajBondhu is built as an **API-first modular monolith**. The backend is completely decoupled from the UI, ensuring 100% readiness for future iOS and Android applications. 
- **Append-Only Financial Ledger:** Immutable transaction records.
- **Booking Status History:** Audit trail for all state transitions.
- **Server-Side OTP:** Secure OTP generation at the database level.
- **Strict Authorization:** Server-enforced role-based access control (RBAC).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Project (for DB and Auth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/kaajbondhu.git
   cd kaajbondhu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

### Database Setup

The database schema is managed via Supabase Migrations. Ensure you have the Supabase CLI installed.

Run the following command to apply all migrations to your linked Supabase project:
```bash
supabase migration up
```

**Migrations Included:**
- `00001_core_schema.sql` - Auth, Roles, Profiles, Markets
- `00002_catalog_and_bookings.sql` - Categories, Services, Bookings, Assignments
- `00003_seed_data.sql` - Dummy initial services and categories
- `00004_provider_profiles.sql` - Provider KYC, Onboarding, and Approval RPCs
- `00005_offers_and_pricing.sql` - Discount columns and BD Market pricing
- `00006_location_coordinates.sql` - Latitude/Longitude for Map Integration
- `00007_enterprise_architecture.sql` - Financial Ledger, Audit Logs, Quotes, Disputes, Messages, OTP

## 🛡️ Security

- **Row Level Security (RLS):** Enabled on all tables. Users can only access their own data.
- **Admin Verification:** Admin roles cannot be assigned from the client. They are securely verified via database triggers.

## 📄 License

This project is proprietary and built specifically for the KaajBondhu platform.
