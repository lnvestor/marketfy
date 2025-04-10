# Celigo Export Tools Implementation Plan

## Overview
Need to implement HTTP and NetSuite export tools for Celigo integration. The implementation will follow the existing patterns from the source files.

## Files to Create

### 1. Shared Schemas
Location: `tools/export/shared/schemas.ts`
- Contains shared schema definitions used by both HTTP and NetSuite exports
- Includes:
  - Two-dimensional array schema
  - Response schema
  - Delta schema
  - Transform schema
  - Filter schema

### 2. HTTP Export Schema
Location: `tools/export/http/schemas/tool.ts`
- Imports shared schemas
- Defines HTTP-specific schemas:
  - Page pagination
  - Link header pagination
  - Main HTTP export schema

### 3. NetSuite Export Schema
Location: `tools/export/netsuite/schemas/tool.ts`
- Imports shared schemas
- Defines NetSuite-specific schemas:
  - Search criteria schema
  - Main NetSuite export schema

### 4. Types
Location: `tools/export/types.ts`
- Define interfaces for:
  - Export configuration
  - Update export configuration
  - HTTP export specific types
  - NetSuite export specific types

### 5. Handler Implementation
Location: `tools/export/handler.ts`
- Implements handlers for:
  - Getting all exports
  - Getting export by ID
  - Creating new export
  - Updating existing export
- Uses Celigo API endpoints
- Includes error handling

### 6. Main Index Updates
Location: `tools/export/index.ts`
- Export all schemas, types, and handlers

## Implementation Steps

1. Create shared schemas first as they are dependencies
2. Create HTTP and NetSuite specific schemas
3. Implement types
4. Implement handlers
5. Create index file to export everything
6. Update main tools/index.ts to include new exports

## Notes
- Follow existing patterns from source files
- Maintain consistent error handling
- Use proper TypeScript types
- Keep code organized and well-documented

## Next Steps
Switch to Code mode to implement these changes.