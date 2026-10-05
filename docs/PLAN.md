# KaajBondhu Execution Plan

## Exit Gates

### Phase 0 - Audit and plan
- [x] Write `docs/AUDIT.md`
- [x] Write `docs/PLAN.md`
- [ ] Credentials checklist
- **Gate:** Plan written, blockers listed.

### Phase 1 - Foundation
- [ ] Env setup, `.env.example`
- [ ] Supabase local + remote connection
- [ ] CI skeleton
- [ ] error/logging/requestId scaffolding
- [ ] i18n scaffold
- [ ] design tokens
- **Gate:** CI green on a clean clone.

### Phase 2 - Data and security core
- [ ] Core migrations, roles, RLS, auth flows, admin bootstrap
- [ ] RLS test harness, audit log and outbox plumbing
- **Gate:** RLS matrix tests pass; build fails if any table lacks RLS.

### Phase 3 - Walking skeleton (vertical slice)
- [ ] Seeded service -> customer books -> provider accepts -> state machine to completion -> cash recorded -> commission in ledger -> visibility
- **Gate:** Playwright E2E passes.

*(Further phases are deferred for now)*
