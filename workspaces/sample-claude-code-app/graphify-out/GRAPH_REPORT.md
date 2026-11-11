# Graphify Architecture Report — SwiftFreight Dispatch AI

- **Nodes:** 148
- **Edges:** 312
- **Dependency Chain:** `DatabaseSchemaRoot (src/db/schema.sql::freight_quotes)` -> `ApiRouterRoot (src/server.ts)` -> `FeatureRegistryRoot (src/routes/rates.ts::calculateFreightRatePerKg)`
- **God Nodes:**
  - `ApiRouterRoot` (`src/server.ts`)
  - `calculateFreightRatePerKg` (`src/routes/rates.ts`)
  - `freight_quotes` (`src/db/schema.sql`)
