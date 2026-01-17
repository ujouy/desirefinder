# DesireFinder Codebase Explanation

## 📋 Overview

DesireFinder is an AI-powered shopping assistant built on Next.js 16. It uses Gemini 3.0 Flash API for AI processing and implements an "Infinite Aisle" architecture for dynamic product sourcing with quality filtering.

---

## 🏗️ Project Structure

### Root Level Files

#### Configuration Files
- **`package.json`** - Node.js dependencies and scripts (dev, build, db commands)
- **`tsconfig.json`** - TypeScript compiler configuration
- **`next.config.mjs`** - Next.js configuration (webpack, external packages, image domains)
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration for CSS processing
- **`drizzle.config.ts`** - Drizzle ORM configuration (SQLite migrations)
- **`next-env.d.ts`** - Next.js TypeScript environment declarations

#### Docker & Deployment
- **`Dockerfile`** - Production Docker image definition
- **`Dockerfile.slim`** - Optimized slim Docker image
- **`docker-compose.yaml`** - Development Docker Compose configuration
- **`docker-compose.production.yml`** - Production Docker Compose (Next.js + SearXNG, no Ollama)
- **`entrypoint.sh`** - Docker container entrypoint script

#### Database
- **`prisma/schema.prisma`** - Prisma database schema (PostgreSQL models: User, Product, Order, Transaction, AffiliateClick)
- **`drizzle/`** - SQLite migration files (legacy, now using Prisma)

#### Documentation (Setup Guides)
- **`README.md`** - Main project documentation
- **`GEMINI_SETUP.md`** - Gemini 3.0 Flash API setup guide
- **`INFINITE_AISLE_SETUP.md`** - Infinite Aisle architecture guide
- **`DIGITALOCEAN_COMPLETE_SETUP.md`** - DigitalOcean deployment guide
- **`MIGRATION_TO_GEMINI.md`** - Migration from Ollama to Gemini guide
- Various other setup guides (Supabase, payments, DNS, etc.)

#### Scripts
- **`scripts/`** - Deployment and setup automation scripts

---

## 📁 Source Code (`src/`)

### **`src/app/`** - Next.js App Router Pages & API Routes

#### Pages (UI Routes)
- **`layout.tsx`** - Root layout with ClerkProvider, ThemeProvider, Sidebar, SetupWizard
- **`page.tsx`** - Homepage (main chat interface)
- **`globals.css`** - Global CSS styles
- **`manifest.ts`** - PWA manifest configuration
- **`favicon.ico`** - Site favicon

- **`c/[chatId]/page.tsx`** - Individual chat page (dynamic route)
- **`library/page.tsx`** - User's saved/library page
- **`library/layout.tsx`** - Library page layout
- **`discover/page.tsx`** - Discover/trending page
- **`pricing/page.tsx`** - Pricing page
- **`legal/dmca/page.tsx`** - DMCA takedown request form

#### API Routes (`src/app/api/`)

**Chat & Search:**
- **`chat/route.ts`** - Main chat API endpoint (handles user messages, AI responses)
- **`search/route.ts`** - Search API endpoint
- **`suggestions/route.ts`** - AI-generated search suggestions
- **`reconnect/[id]/route.ts`** - Reconnect to existing chat session

**Chat Management:**
- **`chats/route.ts`** - List/create chats
- **`chats/[id]/route.ts`** - Get/update/delete specific chat

**Configuration:**
- **`config/route.ts`** - Get/update application configuration
- **`config/setup-complete/route.ts`** - Mark setup as complete

**Credits & Payments:**
- **`credits/route.ts`** - Get user credits
- **`credits/spend/route.ts`** - Deduct credits for actions
- **`payments/create/route.ts`** - Create payment invoice (NowPayments integration)

**Products & Dropshipping:**
- **`products/import/route.ts`** - On-demand product import & Stripe checkout creation
  - Implements "Ghost Cart" strategy
  - Creates product in DB if not exists
  - Creates Stripe checkout session
  - Returns checkout URL

**File Uploads:**
- **`uploads/route.ts`** - Handle file uploads (PDFs, documents for personal search)

**Model Providers:**
- **`providers/route.ts`** - List available AI model providers
- **`providers/[id]/route.ts`** - Get specific provider details
- **`providers/[id]/models/route.ts`** - Get models for a provider

**Webhooks:**
- **`webhooks/clerk/route.ts`** - Clerk webhook handler (user sync)
- **`webhooks/nowpayments/route.ts`** - NowPayments IPN webhook (payment status)

**Legal:**
- **`legal/dmca/route.ts`** - DMCA takedown request handler (sends email via Resend)

**Affiliate:**
- **`affiliate/click/route.ts`** - Track affiliate clicks on products

---

### **`src/components/`** - React UI Components

#### Core Chat Components
- **`Chat.tsx`** - Main chat container component
- **`ChatWindow.tsx`** - Chat window UI
- **`MessageBox.tsx`** - Individual message display
- **`MessageBoxLoading.tsx`** - Loading state for messages
- **`MessageInput.tsx`** - Message input field
- **`EmptyChat.tsx`** - Empty state when no chat
- **`EmptyChatMessageInput.tsx`** - Input field for empty chat state

#### Message Components
- **`MessageRenderer/`** - Message rendering components
  - **`Citation.tsx`** - Citation/source links
  - **`CodeBlock/`** - Code block syntax highlighting (light/dark themes)

- **`MessageSources.tsx`** - Display search results/sources (products, web results)
- **`ProductCard.tsx`** - Product card component (image, price, rating, buy button)
- **`ThinkBox.tsx`** - AI "thinking" indicator

#### Message Actions
- **`MessageActions/Copy.tsx`** - Copy message button
- **`MessageActions/Rewrite.tsx`** - Rewrite message button

#### Input Actions
- **`MessageInputActions/Sources.tsx`** - Source selector (Shopping only)
- **`MessageInputActions/ChatModelSelector.tsx`** - AI model selector dropdown
- **`MessageInputActions/Optimization.tsx`** - Speed/Balanced/Quality mode selector
- **`MessageInputActions/Attach.tsx`** - File attachment button
- **`MessageInputActions/AttachSmall.tsx`** - Small attachment button

#### Layout Components
- **`Layout.tsx`** - Main application layout wrapper
- **`Sidebar.tsx`** - Left sidebar (chat history, navigation)
- **`Navbar.tsx`** - Top navigation bar
- **`CreditDisplay.tsx`** - User credits display

#### Settings
- **`Settings/SettingsDialogue.tsx`** - Settings modal/dialog
- **`Settings/SettingsButton.tsx`** - Settings button
- **`Settings/SettingsButtonMobile.tsx`** - Mobile settings button
- **`Settings/SettingsField.tsx`** - Reusable settings field component
- **`Settings/Sections/`** - Settings sections
  - **`Models/Section.tsx`** - Model provider configuration
  - **`Models/AddProviderDialog.tsx`** - Add new provider dialog
  - **`Models/UpdateProviderDialog.tsx`** - Update provider dialog
  - **`Models/DeleteProviderDialog.tsx`** - Delete provider dialog
  - **`Models/AddModelDialog.tsx`** - Add custom model dialog
  - **`Models/ModelSelect.tsx`** - Model selection dropdown
  - **`Models/ModelProvider.tsx`** - Provider display component
  - **`Personalization.tsx`** - Personalization settings
  - **`Preferences.tsx`** - User preferences
  - **`Search.tsx`** - Search settings

#### Setup
- **`Setup/SetupWizard.tsx`** - Initial setup wizard
- **`Setup/SetupConfig.tsx`** - Setup configuration component

#### Theme
- **`theme/Provider.tsx`** - Theme provider (dark/light mode)
- **`theme/Switcher.tsx`** - Theme switcher button

#### Other
- **`AssistantSteps.tsx`** - AI assistant step indicators
- **`DeleteChat.tsx`** - Delete chat button/functionality
- **`Discover/`** - Discover page components (news cards)
- **`Widgets/Renderer.tsx`** - Widget renderer (currently empty, widgets removed)
- **`ui/Loader.tsx`** - Loading spinner component
- **`ui/Select.tsx`** - Custom select dropdown component

---

### **`src/lib/`** - Core Business Logic

#### **`src/lib/agents/`** - AI Agent System

**`agents/search/`** - Search Agent Architecture
- **`index.ts`** - Search agent entry point
- **`types.ts`** - Search source types (currently only 'shopping')
- **`classifier.ts`** - Query classifier (determines if search needed, diagnostic phase)
- **`api.ts`** - Search API utilities
- **`researcher/`** - Research agent
  - **`index.ts`** - Researcher agent entry point
  - **`actions/`** - Research actions
    - **`shoppingSearch.ts`** - Shopping product search action (main ecommerce logic)
    - **`uploadsSearch.ts`** - Personal document search action
    - **`plan.ts`** - Research planning action
    - **`done.ts`** - Research completion action
    - **`index.ts`** - Action registry
    - **`registry.ts`** - Action registration system
  - **`widgets/`** - Widget system (currently empty, widgets removed)
    - **`executor.ts`** - Widget execution
    - **`index.ts`** - Widget registry

**`agents/suggestions/`** - AI suggestion generation
- **`index.ts`** - Suggestion agent

#### **`src/lib/config/`** - Configuration Management

- **`index.ts`** - ConfigManager class (centralized config management)
- **`types.ts`** - Configuration type definitions
- **`defaultModels.ts`** - Default Gemini 3.0 Flash model configuration
- **`clientRegistry.ts`** - Client-side config registry
- **`serverRegistry.ts`** - Server-side config registry

#### **`src/lib/dropshipping/`** - Dropshipping Integration

- **`api.ts`** - Infinite Aisle dropshipping API
  - Implements "Vetting Funnel": Translation → Broad Search → Quality Filter → Presentation
  - Supports AliExpress, CJ Dropshipping, SerpApi
  - Quality filtering (rating > 4.5, orders > 100, shipping < 15 days)
  - Markup pricing (2.5x multiplier)
  - No mock data - requires real API keys

#### **`src/lib/models/`** - AI Model Provider System

**`base/`** - Base classes
- **`provider.ts`** - BaseModelProvider abstract class
- **`llm.ts`** - BaseLLM abstract class
- **`embedding.ts`** - BaseEmbedding abstract class

**`providers/`** - Model provider implementations
- **`openai/`** - OpenAI provider (GPT models)
- **`gemini/`** - Gemini provider (Gemini 3.0 Flash, embeddings)
- **`anthropic/`** - Anthropic provider (Claude)
- **`groq/`** - Groq provider
- **`ollama/`** - Ollama provider (legacy, not used in production)
- **`lemonade/`** - Lemonade provider
- **`lmstudio/`** - LM Studio provider
- **`transformers/`** - Transformers.js provider
- **`index.ts`** - Provider registry

- **`registry.ts`** - Model registry
- **`types.ts`** - Model type definitions

#### **`src/lib/prompts/`** - AI Prompt Templates

- **`search/classifier.ts`** - Query classification prompts
- **`search/researcher.ts`** - Research agent prompts
- **`search/writer.ts`** - Answer writing prompts (Infinite Aisle context)
- **`suggestions/index.ts`** - Suggestion generation prompts

#### **`src/lib/db/`** - Database Layer

- **`prisma.ts`** - Prisma client instance
- **`schema.ts`** - Drizzle schema (legacy SQLite, now using Prisma)
- **`migrate.ts`** - Database migration utilities
- **`index.ts`** - Database utilities

#### **`src/lib/credits/`** - Credits System

- **`manager.ts`** - CreditManager class
  - Credit tracking and spending
  - Affiliate click tracking
  - Transaction management

#### **`src/lib/uploads/`** - File Upload System

- **`manager.ts`** - File upload manager
- **`store.ts`** - File storage utilities

#### **`src/lib/utils/`** - Utility Functions

- **`files.ts`** - File handling utilities
- **`formatHistory.ts`** - Chat history formatting
- **`splitText.ts`** - Text splitting utilities
- **`computeSimilarity.ts`** - Similarity computation
- **`utils.ts`** - General utilities (cn, etc.)

#### **`src/lib/middleware/`** - Middleware

- **`checkCredits.ts`** - Credit check middleware

#### **`src/lib/hooks/`** - React Hooks

- **`useChat.tsx`** - Main chat hook (manages chat state, messages, streaming)

#### **`src/lib/`** - Root Level Lib Files

- **`actions.ts`** - Server actions
- **`session.ts`** - Session management
- **`serverUtils.ts`** - Server-side utilities
- **`types.ts`** - Shared TypeScript types

---

### **`src/middleware.ts`** - Next.js Middleware

- Clerk authentication middleware
- Public route configuration
- Redirects unauthenticated users to sign-in

---

### **`src/instrumentation.ts`** - Next.js Instrumentation

- Code that runs when the server starts
- Used for initialization tasks

---

## 🔄 Data Flow

### Search Flow (Shopping)
1. User types query → `MessageInput.tsx`
2. Request → `app/api/search/route.ts`
3. Classifier → `lib/agents/search/classifier.ts` (determines if search needed)
4. Researcher → `lib/agents/search/researcher/actions/shoppingSearch.ts`
5. Dropshipping API → `lib/dropshipping/api.ts`
6. Quality Filter → Filters products (rating, orders, shipping)
7. Markup Pricing → Applies 2.5x markup
8. Response → `MessageBox.tsx` → `ProductCard.tsx`

### Product Purchase Flow
1. User clicks "Buy" → `ProductCard.tsx`
2. Request → `app/api/products/import/route.ts`
3. Check DB → If product doesn't exist, create it
4. Create Order → Prisma Order record
5. Stripe Checkout → Create checkout session
6. Return URL → User redirected to Stripe

### Chat Flow
1. User message → `app/api/chat/route.ts`
2. Session Manager → `lib/session.ts`
3. AI Agent → `lib/agents/search/` (classifier → researcher → writer)
4. Model Provider → `lib/models/providers/gemini/` (Gemini 3.0 Flash)
5. Stream Response → `useChat.tsx` hook
6. Display → `MessageBox.tsx`

---

## 🗄️ Database Schema (Prisma)

### Models
- **`User`** - User accounts (linked to Clerk)
  - Fields: id, clerkId, email, credits, isPremium
- **`Product`** - On-demand products (created when user clicks buy)
  - Fields: supplierProductId, name, supplierPrice, markedUpPrice, vendor, rating, orders, etc.
- **`Order`** - User orders
  - Fields: userId, productId, quantity, totalPrice, supplierPrice, status, paymentIntentId
- **`Transaction`** - Credit purchase transactions
  - Fields: userId, amount, creditsAdded, status, paymentId
- **`AffiliateClick`** - Affiliate click tracking
  - Fields: userId, productId, vendor, originalUrl, affiliateUrl

---

## 🔧 Key Technologies

- **Next.js 16** - React framework (App Router)
- **TypeScript** - Type safety
- **Prisma** - Database ORM (PostgreSQL)
- **Clerk** - Authentication
- **Gemini 3.0 Flash API** - AI processing
- **Stripe** - Payment processing
- **Resend** - Email service (DMCA)
- **Tailwind CSS** - Styling
- **Docker** - Containerization

---

## 📝 Important Notes

1. **No Mock Data**: All code requires real API keys and configuration
2. **Quality Filtering**: Products must meet strict criteria (rating > 4.5, orders > 100, shipping < 15 days)
3. **Markup Pricing**: 2.5x multiplier applied to all products
4. **On-Demand Creation**: Products created in DB only when user clicks "Buy"
5. **Gemini Only**: Uses Gemini 3.0 Flash API (no local Ollama in production)
6. **Shopping Only**: All non-shopping search sources removed
7. **Single ORM**: Uses Prisma only (Drizzle removed)
8. **Production-Ready**: Dockerized, DigitalOcean-ready with Nginx

---

## 🚀 Entry Points

- **Development**: `yarn dev` → `http://localhost:3000`
- **Production**: Docker Compose → `docker-compose.yml` (DigitalOcean Droplet)
- **Main Page**: `src/app/page.tsx`
- **API Entry**: `src/app/api/chat/route.ts` (main chat endpoint)

---

## 📚 Documentation

- **`CODEBASE_EXPLANATION.md`** - This file (architecture overview)
- **`DEVELOPMENT_SOP.md`** - Standard Operating Procedure for making changes
- **`DIGITALOCEAN_DROPLET_DEPLOYMENT.md`** - Complete deployment guide
- **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment checklist
- **`DIGITALOCEAN_SETUP_COMPLETE.md`** - Implementation summary
- **`DRIZZLE_MIGRATION_COMPLETE.md`** - Database migration details

---

This codebase implements a production-ready AI shopping assistant with dynamic product sourcing, quality filtering, and on-demand fulfillment capabilities. The architecture is consolidated (single ORM, Dockerized, DigitalOcean-ready) and follows a structured DevOps lifecycle.
