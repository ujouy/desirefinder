# DesireFinder - AI-Powered Shopping Assistant

DesireFinder is an AI-powered shopping assistant that helps you discover products based on your needs, style preferences, and use cases. Instead of browsing static product catalogs, simply describe what you want (or who you're buying for), and our AI will recommend curated products that match your desires.

## ✨ Features

- **Natural Language Product Search**: Describe what you want in plain English
- **AI Product Recommendations**: Advanced LLM analyzes your intent and recommends matching products
- **Shopping-Focused**: Dedicated to product discovery and recommendations
- **Beautiful Product Cards**: Product displays with images, prices, ratings, and buy buttons
- **Semantic Understanding**: Finds products based on meaning, not just keywords

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose (for SearXNG and Ollama)
- Supabase account (for database)
- Clerk account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/desirefinder.git
cd desirefinder
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Set up the database:
```bash
yarn db:generate
yarn db:migrate
```

5. Start the development server:
```bash
yarn dev
```

## 🛍️ Shopping Mode

DesireFinder's shopping mode uses AI to understand your needs and recommend products. 

### How It Works

1. Select "Shopping" from the source selector
2. Describe what you're looking for: "I need a minimalist desk setup for a software engineer who likes plants"
3. The AI extracts:
   - Product keywords (desk, keyboard, planter)
   - Style preferences (minimalist)
   - Use case (software engineer)
4. Searches your product database
5. Displays product cards with buy buttons

### Setting Up Dropshipping Integration

See [SHOPPING_MODE_SETUP.md](./SHOPPING_MODE_SETUP.md) for detailed instructions on connecting to dropshipping APIs (Spocket, Syncee, AliExpress, or custom Supabase database).

## 🏗️ Architecture

DesireFinder is built on the Perplexica open-source answer engine, providing:

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **Clerk** - User authentication
- **Gemini 3.0 Flash API** - Cost-effective AI processing

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ProductCard.tsx    # Product display component
│   └── ...
├── lib/
│   ├── agents/            # AI agents for different search types
│   │   └── search/
│   │       └── researcher/
│   │           └── actions/
│   │               └── shoppingSearch.ts  # Shopping search action
│   ├── dropshipping/      # Dropshipping API integration
│   │   └── api.ts         # Product search service
│   └── ...
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Dropshipping API
DROPSHIPPING_API_URL=https://your-api-url.com
DROPSHIPPING_API_KEY=your_api_key

# AI Models
OLLAMA_API_URL=http://localhost:11434
DEFAULT_CHAT_MODEL=dolphin-llama3
DEFAULT_EMBEDDING_MODEL=nomic-embed-text

# Dropshipping API
DROPSHIPPING_API_URL=https://your-api-url.com
DROPSHIPPING_API_KEY=your_api_key
```

## 📚 Documentation

- [Shopping Mode Setup](./SHOPPING_MODE_SETUP.md) - Complete guide for dropshipping integration
- [API Documentation](./docs/API/SEARCH.md) - API reference
- [Deployment Guide](./DIGITALOCEAN_COMPLETE_SETUP.md) - Production deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built on top of [Perplexica](https://github.com/ItzCrazyKns/Perplexica) - an open-source answer engine.
