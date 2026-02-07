# Phase 1 Implementation - Day 1 Start Prompt

**Date to Use:** 2024-02-08 (next session)
**Copy and paste this entire prompt to Claude to begin Phase 1 implementation**

---

## PROMPT FOR CLAUDE

I'm ready to start Phase 1 implementation of the OSDM Platform rail booking API.

### Current Status

**Version:** v1.0.0 (2024-02-07)
**Repository:** C:\Users\rasti\Projects\avantlehq\osdm-avantle-ai
**Status:** Infrastructure complete, documentation complete, ready to implement

**What's Already Done:**
- ✅ Repository reset with clean monorepo structure
- ✅ Complete documentation (3000+ lines):
  - docs/database/schema-design.md - Full Prisma schema design
  - docs/architecture/domain-model.md - Complete domain specifications
  - docs/PHASE1-DETAIL.md - Step-by-step implementation guide (1000+ lines)
  - docs/TODOLIST.md - High-level roadmap
- ✅ CI/CD infrastructure working (GitHub Actions ✓, Vercel ✓)
- ✅ CHANGELOG.md and version tracking
- ✅ All documentation updated to target OSDM v3.7.1 (current stable)

**What's Pending:**
- ⏳ Phase 1 implementation (this session)

### Goal for Today's Session

**Objective:** Begin Phase 1 Day 1-2 implementation - Download OSDM spec and setup workspace packages

**Target:** Complete foundational setup so domain entities can be implemented in next session

### Tasks to Accomplish

**Priority 1: OSDM Specification (Required)**
1. Download OSDM v3.7.1 OpenAPI specification
   - Source: https://github.com/UnionInternationalCheminsdeFer/OSDM
   - Look for: OSDM-online-api-v3.7.1.yml or latest stable
   - Save to: spec/OSDM-online-api-v3.7.1.yml
   - Verify it's valid OpenAPI 3.x format

**Priority 2: Workspace Package Setup**
2. Initialize npm workspaces for each package:
   - apps/osdm-api/package.json
   - packages/osdm-domain/package.json
   - packages/osdm-providers/package.json
   - packages/osdm-schema/package.json

3. Setup TypeScript configuration for each package:
   - tsconfig.json per package
   - Proper workspace references
   - Shared base config if needed

4. Configure OpenAPI generator:
   - Install @openapitools/openapi-generator-cli or similar
   - Setup codegen script in packages/osdm-schema
   - Generate TypeScript types from OSDM v3.7.1 spec

**Priority 3: Basic Infrastructure**
5. Setup Prisma in infra/:
   - Initialize Prisma
   - Create basic schema.prisma based on docs/database/schema-design.md
   - Configure PostgreSQL connection (use .env.example)

6. Create basic Fastify server structure:
   - apps/osdm-api/src/server.ts
   - Health check endpoint
   - Basic error handling
   - Swagger UI integration

### Reference Documentation

**Read these files for implementation details:**
- `docs/PHASE1-DETAIL.md` - Complete step-by-step guide with code examples
- `docs/database/schema-design.md` - Database schema to implement
- `docs/architecture/domain-model.md` - Domain entities specification
- `docs/TODOLIST.md` - Phase 1 checklist

### Technical Requirements

**Technologies to use:**
- Node.js 20+
- TypeScript 5.3+
- Fastify (for API server)
- Prisma (for database)
- PostgreSQL (database)
- OpenAPI Generator (for type generation)

**Package Management:**
- Use npm (not pnpm or yarn)
- npm workspaces already configured in root package.json

### Expected Deliverables

By end of this session:
1. ✅ OSDM v3.7.1 spec downloaded and in place
2. ✅ All workspace packages initialized with package.json
3. ✅ TypeScript configured for all packages
4. ✅ OpenAPI types generated in packages/osdm-schema
5. ✅ Basic Prisma schema created
6. ✅ Basic Fastify server running with health check
7. ✅ All changes committed and pushed to git

### Notes

- **Version**: Continue using v1.0.0 (no version bump yet)
- **Commit frequently**: Small, logical commits
- **Follow docs**: docs/PHASE1-DETAIL.md has complete code examples
- **Test as you go**: Verify each step works before moving on
- **OSDM v3.7.1**: Remember we're targeting v3.7.1, not v3.2

### Success Criteria

**Session is successful if:**
- Can run `npm install` in root and all packages install correctly
- Can run `npm run codegen` and types generate from OSDM spec
- Can run `npm run dev:api` and Fastify server starts
- Can access http://localhost:8080/health and get response
- All code committed and pushed to GitHub

### Questions to Address

If you need clarification on:
1. Where to find OSDM v3.7.1 spec - check GitHub repo or osdm.io
2. Package structure - see docs/PHASE1-DETAIL.md examples
3. Database schema - see docs/database/schema-design.md
4. Domain entities - see docs/architecture/domain-model.md

### Ready to Start?

Please confirm you understand the task and then:
1. Navigate to the project directory
2. Verify current git status (should be clean on main branch)
3. Begin with downloading OSDM v3.7.1 specification
4. Follow the implementation plan step by step
5. Commit progress regularly

Let's build the OSDM Platform! 🚀
