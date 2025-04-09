# Marketfy

Marketfy is an AI-powered product research tool for dropshippers, e-commerce sellers, and Amazon FBA sellers. The platform helps users find profitable products to sell online, analyze market trends, and make data-driven business decisions.

## Features

- **AI Assistant**: Chat with our AI to get product recommendations, market insights, and sales strategies
- **Market Analysis**: Analyze products and niches to identify trends and opportunities
- **Product Research**: Find high-potential products with validated market demand
- **Tool Integration**: Use specialized tools for data-driven insights

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Supabase](https://supabase.com/) - Authentication and database
- [Google Generative AI](https://ai.google.dev/) - AI capabilities through Gemini models
- [AI SDK](https://ai.vercel.ai) - For AI tool integration and chat interfaces

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Google AI API key (get one at [makersuite.google.com](https://makersuite.google.com/app/apikey))

### Environment Setup

1. Create or update your `.env.local` file with the following:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Running the Project

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `src/app` - Next.js app router pages and API routes
- `src/components` - Reusable UI components
- `src/lib` - Utility functions, AI config, and tools
- `src/lib/tools` - AI tools for product research and market analysis

## AI Tools

The application integrates with Google's Gemini models through the AI SDK, providing:

- **Chat Interface**: Real-time streaming responses
- **Product Search**: Find products matching specific criteria
- **Market Analysis**: Get insights on product markets and trends
- **Trend Analysis**: Track product popularity over time

You can extend the available tools by adding new functions to the `src/lib/tools` directory.
