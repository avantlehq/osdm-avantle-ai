# CLAUDE.md

Tento súbor poskytuje kontext pre Claude Code pri práci s OSDM Agent repozitárom.

## Kontext projektu OSDM.avantle.ai

**OSDM.avantle.ai** je AI-powered platforma pre Open Source Dependency Management, ktorá poskytuje komplexnú analýzu bezpečnosti, compliance a správy závislostí pre softvérové projekty.

### Architektúra platformy

**Dual-component architektúra podobná DPO Studio:**

1. **OSDM Studio** (admin vrstva) - **PLÁNOVANÉ**
   - Doména: `osdmstudio.ai` (plánované)
   - Funkcie: onboarding, správa projektov, dashboards, reporting, whitelabel konfigurácie

2. **OSDM.avantle.ai** (agent/runtime engine) - **TENTO REPOZITÁR**
   - Doména: `osdm.avantle.ai`
   - Repo: `avantlehq/osdm-avantle-ai`
   - Funkcie: dependency scanning, vulnerability analysis, license compliance, security reporting
   - Multi-tenant architektúra pre izolované úložiská projektov

### API rozhranie (poskytované týmto repozitárom)

```
POST /api/provision → vytvorenie tenanta/projektu
POST /api/v1/engine/scan → skenering závislostí
POST /api/v1/engine/analyze → analýza bezpečnosti a compliance
POST /api/v1/report/security → generovanie bezpečnostných reportov
```

**Guardrails:**
- Authorization: Bearer <JWT> s tenant_id, project_id, role, exp
- Rate limit per tenant/project
- SQLite (dev) / Postgres (prod)
- Žiadne PII v logoch
- Bezpečné ukladanie SBOM dát

### Integrácia s budúcou admin platformou

Tento agent bude konzumovaný OSDM Studio pre:
- Project/tenant provisioning cez `/api/provision`
- Dependency scanning cez `/api/v1/engine/scan`
- Security analysis cez `/api/v1/engine/analyze`
- Security report generation cez `/api/v1/report/security`

## Aktuálny stav repozitára

### ✅ Hotové komponenty

**Infraštruktúra:**
- Next.js 16 + TypeScript + Tailwind CSS setup
- GitHub Actions CI workflow (.github/workflows/ci.yml)
- Vercel deployment konfigurácia (vercel.json)
- Environment variables template (.env.example)

**API Endpoints (implementované ako mock):**
```
src/app/api/
├── provision/
│   └── route.ts              # POST /api/provision
└── v1/
    ├── engine/
    │   ├── scan/
    │   │   └── route.ts      # POST /api/v1/engine/scan
    │   └── analyze/
    │       └── route.ts      # POST /api/v1/engine/analyze
    └── report/
        └── security/
            └── route.ts      # POST /api/v1/report/security
```

**UI Components:**
- Landing page (src/app/page.tsx) - agent status a API overview pre OSDM
- Agent Shell (src/app/agent/page.tsx) - monitoring UI pre dependency scanning

### 🔧 Technické detaily

**Tech stack:**
- Framework: Next.js 16 s App Router
- Styling: Tailwind CSS v4
- TypeScript: Plná type safety
- Package manager: npm (default)
- CI/CD: GitHub Actions
- Deployment: Vercel ready
- API: REST s JWT auth (pripravené)

**Security konfigurácia:**
- Multi-tenant project isolation (pripravené)
- Rate limiting per tenant/project (pripravené)
- JWT authentication guardrails
- Security headers v vercel.json
- SBOM data encryption
- Vulnerability database access controls

**Environment variables:**
```bash
NEXT_PUBLIC_ENV=local|preview|prod
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
LOG_LEVEL=info
ENCRYPTION_KEY=
VULNERABILITY_DB_URL=
SBOM_SCANNER_ENDPOINT=
LICENSE_DB_API_KEY=
SECURITY_ADVISORY_API_KEY=
```

### 🚀 Deployment status

**GitHub:**
- Repozitár: https://github.com/avantlehq/osdm-avantle-ai
- Initial commit pushnutý
- CI workflow pripravený
- Build test: Pripravené na testovanie

**Pripravené na Vercel:**
- vercel.json s API functions konfiguráciou
- maxDuration: 30s pre API endpoints
- Environment variables template
- Doména: osdm.avantle.ai (treba nastaviť DNS)

### 📊 API Implementation Status

**Mock endpoints pripravené:**

1. **Dependency Scanning** (`POST /api/v1/engine/scan`):
   - Input: repository URL/path, scan configuration
   - Output: scan results s vulnerability counts, license compliance, outdated packages
   - TODO: Implementovať skutočný SBOM scanner (Syft, SPDX)

2. **Security Analysis** (`POST /api/v1/engine/analyze`):
   - Input: dependencies data, analysis type
   - Output: security recommendations, risk scoring, compliance analysis
   - TODO: Implementovať LLM-powered analýzu s CVE database

3. **Security Reporting** (`POST /api/v1/report/security`):
   - Input: scan data, report type
   - Output: formatted security reports (JSON, PDF, HTML)
   - TODO: Implementovať report template engine

4. **Project Provisioning** (`POST /api/provision`):
   - Input: tenantId, project name, configuration
   - Output: provision status, API endpoints
   - TODO: Implementovať skutočné project isolation

### 📋 Ďalšie kroky (budúce implementácie)

**Core scanning engine:**
1. SBOM generator integrácia (Syft, CycloneDX)
2. CVE database connector (NVD, OSV, Snyk)
3. License compliance engine (SPDX, ClearlyDefined)
4. Dependency graph analysis
5. Supply chain security checks
6. Container image scanning

**AI-powered analysis:**
1. LLM pipeline pre dependency risk assessment
2. Automated vulnerability impact analysis
3. Fix recommendation engine
4. License conflict detection
5. Security policy compliance checking

**Advanced features:**
- SBOM diff analysis (version comparisons)
- Continuous monitoring webhooks
- Integration s CI/CD pipeline
- Custom security policies
- Remediation workflow automation
- Threat intelligence feeds

**Reporting & visualization:**
- Interactive security dashboards
- Compliance audit reports
- Executive summary reports
- Trend analysis over time
- Integration s security tools (SIEM, ticketing)

### 🎯 Technologická vízia

OSDM Agent má byť centrálne jadro pre:
- **Enterprise-ready**: On-premise deployment s air-gap support
- **CI/CD native**: Seamless integrácia do development workflows
- **Policy-driven**: Custom security a compliance polície
- **Real-time**: Continuous monitoring a alerting
- **Standards-compliant**: SBOM, SPDX, CycloneDX, SWID support

Založené na industry-standard tools a AI-enhanced analysis.

## Lokálna cesta

**Projekt sa nachádza v:** `C:\Users\rasti\Projects\avantlehq\osdm-avantle-ai\`

## Development commands

```bash
# Development (z avantlehq/osdm-avantle-ai/)
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server  
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# API Testing
# POST http://localhost:3000/api/v1/engine/scan
# POST http://localhost:3000/api/v1/engine/analyze
# POST http://localhost:3000/api/v1/report/security
# POST http://localhost:3000/api/provision

# Deployment
git push origin main # Trigger CI build
```

## OSDM-specific functionality

**Dependency Management Features:**
- Multi-language support (NPM, Maven, PyPI, Go modules, Cargo, etc.)
- SBOM generation a parsing
- Vulnerability scanning s CVE matching
- License analysis a compliance checking
- Supply chain security analysis
- Dependency update recommendations

**Security Analysis:**
- Risk scoring based na CVSS, EPSS
- Exploit availability detection
- Malicious package detection
- Typosquatting analysis
- Known attack pattern matching

**Compliance & Governance:**
- Custom policy engine
- Regulatory compliance checking (SOC2, ISO27001)
- License compatibility matrix
- Approval workflow integration
- Audit trail maintenance