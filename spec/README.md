# OSDM OpenAPI Specification

This directory should contain the official OSDM v3.2 OpenAPI specification.

## Download Instructions

**Official Source:** UIC (Union Internationale des Chemins de fer)

### Option 1: Direct Download
Visit the official OSDM repository:
- https://github.com/UnionInternationalCheminsdeFer/OSDM

Download the file:
- `OSDM-online-api-v3.2.0.yml` or latest version

### Option 2: Manual Download
1. Navigate to the UIC OSDM GitHub repository
2. Locate the OpenAPI specification file
3. Save as `spec/OSDM-online-api-v3.2.0.yml`

## Expected File

```
spec/
└── OSDM-online-api-v3.2.0.yml
```

## Usage

Once downloaded, the OpenAPI spec will be used for:

1. **Type Generation** - Generate TypeScript types in `packages/osdm-schema/`
   ```bash
   npm run codegen
   ```

2. **API Validation** - Validate request/response schemas
3. **Documentation** - Auto-generate API documentation
4. **Contract Testing** - Ensure OSDM 3.2 compliance

## Version Notes

- **OSDM v3.2** is the target specification
- Always use the official UIC specification
- Check for updates periodically
- License: Apache 2.0 (from UIC)

## Next Steps

After downloading the specification:
1. Verify it's valid OpenAPI 3.x format
2. Configure OpenAPI Generator in `packages/osdm-schema/package.json`
3. Generate TypeScript interfaces
4. Implement controller interfaces in `apps/osdm-api/`
