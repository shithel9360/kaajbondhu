# Architecture Decision Records (ADRs)

## 001 - Stack Selection
- **Context:** The Master Engineering Prompt (v2) enforces React, TypeScript, Vite, Supabase. The user requested Laravel, assuming it's the only way to host for free.
- **Decision:** Proceed with React + Supabase.
- **Consequences:** We will use Vercel/Netlify + Supabase Free Tier to satisfy the "100% free" requirement, adhering strictly to the PRD tech stack rules.
