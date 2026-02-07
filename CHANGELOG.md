# Changelog

All notable changes to the OSDM Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-07

### Summary
Complete repository reset to establish proper foundation for OSDM 3.2 rail booking platform. Removed legacy DPIA scaffolding and created clean monorepo architecture with comprehensive documentation. Fixed all CI/CD and deployment infrastructure.

### Changed
- Complete repository reset for Phase 1 implementation
- Removed Next.js structure in favor of Fastify monorepo architecture (with temporary Next.js shim for Vercel)
- Established proper monorepo architecture with npm workspaces
- Renamed project from "osdm-avantle-ai" to "osdm-platform" internally
- Version reset from aspirational v1.2.0 to proper v1.0.0

### Added
- **Monorepo Structure**
  - `apps/osdm-api/` - API server placeholder
  - `packages/osdm-domain/` - Domain layer placeholder
  - `packages/osdm-providers/` - Provider abstraction placeholder
  - `packages/osdm-schema/` - Generated types placeholder
  - `spec/` - OpenAPI specification placeholder
  - `infra/` - Infrastructure configs placeholder

- **Comprehensive Documentation** (`/docs`)
  - `docs/database/schema-design.md` - Complete database schema with Prisma design
  - `docs/architecture/domain-model.md` - Domain-driven design specifications
  - `docs/CLAUDE.md` - Project context and development guidelines
  - `docs/MANAGEMENT-SUMMARY.md` - Business objectives and market analysis
  - `docs/TODOLIST.md` - High-level implementation roadmap (all phases)
  - `docs/PHASE1-DETAIL.md` - Detailed Phase 1 step-by-step implementation guide

- **Infrastructure Configuration**
  - Root `package.json` with npm workspaces configuration
  - `.npmrc` to enforce npm package manager
  - `CHANGELOG.md` for version tracking
  - `public/index.html` - Phase 1 status page
  - Updated `.gitignore` for monorepo structure

- **CI/CD Setup**
  - GitHub Actions workflow configured for monorepo
  - Vercel deployment with Next.js shim (temporary)
  - `package-lock.json` for reproducible builds (112 packages)

- **Temporary Next.js Deployment Shim**
  - Minimal Next.js 15 + React 19 setup for Vercel compatibility
  - Static export configuration serving status page
  - Will be removed when migrating to Docker deployment

### Removed
- Legacy Next.js UI and API routes (DPIA scaffolding from v0.x)
- Incorrect mock endpoints (DPIA risk scoring, not rail booking)
- Old Next.js dependency structure
- Obsolete configuration files (old next.config.ts, postcss.config.mjs)
- `.eslintrc.json` (circular reference issues)

### Fixed
- **Project Scope:** Aligned with OSDM rail booking (was incorrectly scoped as "dependency management")
- **Documentation:** Properly organized in `/docs` folder with clear structure
- **GitHub Actions CI:** Package lock file dependency resolution
- **Vercel Deployment:**
  - Framework auto-detection blocking deployments
  - pnpm vs npm package manager conflicts
  - Missing TypeScript type definitions
  - Build command execution issues
- **Architecture:** Clear separation between application code and documentation

### Deployment
- **Live Status Page:** https://osdm.avantle.ai
- **GitHub Repository:** https://github.com/avantlehq/osdm-avantle-ai
- **Git Tag:** v1.0.0
- **CI Status:** ✓ Passing
- **Vercel Status:** ✓ Deployed

### Commits
- `ec1f7dc` - Reset repository for Phase 1 OSDM implementation
- `c800b70` - Fix CI workflow for monorepo structure
- `bca440d` - Configure Vercel for Phase 1 transition
- `fcccfc9` - Force npm as package manager in Vercel
- `4dc2d2c` - Disable framework detection in Vercel
- `f5d9151` - Add minimal Next.js shim for Vercel deployment
- `f742ecd` - Force npm package manager for Vercel
- `6a418a3` - Add TypeScript types and fix build command

---

## [Unreleased] - Phase 1 Implementation

### To Be Added
- OSDM v3.2 OpenAPI specification download
- TypeScript type generation from OpenAPI spec
- Domain entities implementation
- Mock European rail provider with realistic data
- OSDM 3.2 compliant API endpoints
- Prisma schema and database migrations
- Docker Compose setup with PostgreSQL
- Integration test suite with 3 booking scenarios
- Fastify server implementation

---

## Previous Versions

### [0.x] - Deprecated
Version 0.x was experimental scaffolding with incorrect business logic (DPIA instead of rail booking). All 0.x code has been removed and is not maintained.

**Note:** This version history starts fresh with v1.0.0 as the foundation for proper OSDM implementation.

---

## Version Naming Convention

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0) - Breaking API changes, major architecture updates
- **MINOR** version (1.X.0) - New features, OSDM endpoint additions, backward compatible
- **PATCH** version (1.0.X) - Bug fixes, performance improvements, documentation updates

### Phase Mapping
- **Phase 1 (Foundation):** v1.0.0 → v1.2.0
- **Phase 2 (Provider Ecosystem):** v1.3.0
- **Phase 3 (AI Enhancement):** v1.4.0
- **Phase 4 (Production):** v1.5.0

---

**Maintained by:** Avantle.ai Development Team
**Last Updated:** 2024-02-07
