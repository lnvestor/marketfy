# Marketfy Project Guide

## Build & Development Commands
- `npm run dev`: Start development server 
- `npm run build`: Build for production
- `npm run start`: Run production build
- `npm run lint`: Run ESLint

## Code Style Guidelines
- **Imports**: Use absolute imports with `@/*` alias for src directory
- **Types**: Use strict TypeScript typing; avoid `any` when possible
- **Naming Conventions**: 
  - React components: PascalCase
  - Hooks: camelCase prefixed with 'use'
  - Util functions: camelCase
- **Error Handling**: Use try/catch for async operations with proper error logging
- **Component Structure**: Organize components by feature (e.g., auth, chat, etc.)
- **Unused Variables**: Use `_` prefix to ignore unused variables in linting

## Application Structure
- `src/app`: Next.js app router components and routes
- `src/components`: Reusable UI components 
- `src/lib`: Utility functions and shared logic
- `src/lib/tools`: AI tools for product research and market analysis

## AI Implementation
- **Google AI Config**: Replace the placeholder API key in `.env.local` with your Google AI API key
- **Tool Patterns**: New tools should be added in `src/lib/tools` directory and exported in the index.ts file
- **Available Tools**:
  - `productSearch`: Search for products by name, category, price
  - `marketAnalysis`: Get market analysis for products/categories
  - `productTrends`: Get trend data for products over time
- **Chat Interface**: Chat streaming uses AI SDK for real-time updates

## AI Configuration
- **System Prompts**: Stored in `src/lib/ai-config.ts` under `SYSTEM_PROMPTS`
- **Models**: Change models in `src/lib/ai-config.ts` under `MODELS`
- **Tool Settings**: Adjust tool behavior in `TOOL_SETTINGS`

## Extending AI Capabilities
1. Create new tool files in `src/lib/tools/`
2. Export them in the `index.ts` file
3. All exported tools in `allTools` will automatically be available to the AI
