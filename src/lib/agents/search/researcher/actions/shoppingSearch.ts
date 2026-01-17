import z from 'zod';
import { ResearchAction } from '../../types';
import { Chunk, SearchResultsResearchBlock } from '@/lib/types';
import { searchProducts, Product, getProductWithMarkup } from '@/lib/dropshipping/api';

const actionSchema = z.object({
  type: z.literal('shopping_search'),
  queries: z
    .array(z.string())
    .describe('An array of search queries to find products. Extract product keywords, categories, and user preferences from the conversation.'),
});

const speedModePrompt = `
You are a luxury concierge shopping assistant. Your goal is to identify the user's hidden desire and recommend specific physical products that match their needs, style, and preferences.

When the user describes what they want or who they're buying for, extract:
1. Product keywords (e.g., "mechanical keyboard", "wooden desk", "minimalist")
2. Category (e.g., "office", "electronics", "home decor")
3. Style preferences (e.g., "minimalist", "modern", "vintage")
4. Use case (e.g., "for a software engineer", "gift for a plant lover")

You can provide up to 3 product search queries at a time. Make them specific and targeted to find the best matching products.

Example: If user says "I need a cool desk setup for a software engineer who likes minimalism and plants", you might search:
- "minimalist desk accessories wood"
- "mechanical keyboard compact 60%"
- "geometric planter concrete minimalist"

You MUST use this tool when the user is looking for products, gifts, or shopping recommendations.
`;

const balancedModePrompt = `
You are a luxury concierge shopping assistant for an "Infinite Aisle" Agent. Your goal is to identify the user's hidden desire and recommend specific physical products that match their needs, style, and preferences.

DIAGNOSTIC PHASE: Before searching, if the user's query is vague or lacks specific details, ask 2-3 clarifying questions to understand:
- Aesthetic/vibe (e.g., "Are we going for 'Professional Minimalist' (leather, structured) or 'Urban Explorer' (techwear, waterproof, modular)?")
- Budget range (if not mentioned)
- Use case or recipient (e.g., "for a software engineer", "gift for a plant lover")
- Specific features or requirements

Only proceed to search after you have enough information OR if the user's query is already specific.

When searching, extract:
1. Product keywords (e.g., "mechanical keyboard", "wooden desk", "minimalist")
2. Category (e.g., "office", "electronics", "home decor")
3. Style preferences (e.g., "minimalist", "modern", "vintage", "cyberpunk", "cottagecore")
4. Use case (e.g., "for a software engineer", "gift for a plant lover")

You can call this tool multiple times to refine your search. Start with broader queries to understand the category, then narrow down based on style and specific needs.

Example workflow:
1. User: "I need a desk setup for a software engineer"
2. First search: ["desk accessories", "office ergonomics", "monitor stand"]
3. Second search: ["minimalist desk organizer", "mechanical keyboard compact", "ergonomic mouse"]
4. Third search: ["wooden monitor riser", "60% keyboard", "concrete planter"]

You MUST use this tool when the user is looking for products, gifts, or shopping recommendations.
`;

const qualityModePrompt = `
You are a luxury concierge shopping assistant for an "Infinite Aisle" Agent. Your goal is to identify the user's hidden desire and recommend specific physical products that match their needs, style, and preferences.

DIAGNOSTIC PHASE: Before searching, if the user's query is vague or lacks specific details, ask 2-3 clarifying questions to understand:
- Aesthetic/vibe (e.g., "Are we going for 'Professional Minimalist' (leather, structured) or 'Urban Explorer' (techwear, waterproof, modular)?")
- Budget range (if not mentioned)
- Use case or recipient (e.g., "for a software engineer", "gift for a plant lover")
- Specific features or requirements

Only proceed to search after you have enough information OR if the user's query is already specific.

When searching, extract:
1. Product keywords (e.g., "mechanical keyboard", "wooden desk", "minimalist")
2. Category (e.g., "office", "electronics", "home decor")
3. Style preferences (e.g., "minimalist", "modern", "vintage", "cyberpunk", "cottagecore")
4. Use case (e.g., "for a software engineer", "gift for a plant lover")
5. Price range (if mentioned)
6. Specific features (if mentioned)

You should call this tool multiple times (at least 3-5 iterations) to thoroughly explore the product space:
- Start with broad category searches
- Narrow down by style and specific needs
- Search for complementary products
- Refine based on specific features or price points

Example workflow:
1. User: "I need a cool desk setup for a software engineer who likes minimalism and plants"
2. Search 1: ["desk setup minimalist", "office accessories", "ergonomic workspace"]
3. Search 2: ["wooden monitor stand", "mechanical keyboard", "desk plants"]
4. Search 3: ["minimalist desk organizer", "60% keyboard", "succulent planter"]
5. Search 4: ["monitor riser with shelf", "compact keyboard RGB", "geometric planter concrete"]

You MUST use this tool extensively when the user is looking for products, gifts, or shopping recommendations.
`;
<｜tool▁call▁begin｜>
read_file

const shoppingSearchAction: ResearchAction<typeof actionSchema> = {
  name: 'shopping_search',
  schema: actionSchema,
  getToolDescription: () =>
    "Use this tool to search for products that match the user's desires, needs, and preferences. Extract product keywords, categories, and style preferences from the conversation.",
  getDescription: (config) => {
    let prompt = '';

    switch (config.mode) {
      case 'speed':
        prompt = speedModePrompt;
        break;
      case 'balanced':
        prompt = balancedModePrompt;
        break;
      case 'quality':
        prompt = qualityModePrompt;
        break;
      default:
        prompt = speedModePrompt;
        break;
    }

    return prompt;
  },
  enabled: (config) =>
    config.sources.includes('shopping') &&
    config.classification.classification.skipSearch === false,
  execute: async (input, additionalConfig) => {
    input.queries = input.queries.slice(0, 3);

    const researchBlock = additionalConfig.session.getBlock(
      additionalConfig.researchBlockId,
    );

    if (researchBlock && researchBlock.type === 'research') {
      researchBlock.data.subSteps.push({
        id: crypto.randomUUID(),
        type: 'searching',
        searching: input.queries,
      });

      additionalConfig.session.updateBlock(additionalConfig.researchBlockId, [
        {
          op: 'replace',
          path: '/data/subSteps',
          value: researchBlock.data.subSteps,
        },
      ]);
    }

    const searchResultsBlockId = crypto.randomUUID();
    let searchResultsEmitted = false;

    let results: Chunk[] = [];

    const search = async (q: string) => {
      // Search for products using dropshipping API (with quality filtering)
      const products = await searchProducts({ 
        query: q, 
        limit: 50, // Get more results for filtering
        sortBy: 'ORDERS_DESC', // Sort by orders (social proof)
      });

      // Apply markup pricing to all products
      const productsWithMarkup = products.map(getProductWithMarkup);

      // Convert products to Chunk format
      const resultChunks: Chunk[] = productsWithMarkup.map((product: Product) => ({
        content: `${product.name}: ${product.description} - ${product.currency} ${product.price.toFixed(2)} (${product.rating ? `${product.rating}★` : 'N/A'}, ${product.orders || product.reviews || 0} orders)`,
        metadata: {
          title: product.name,
          url: `/api/products/import`, // Import/checkout route instead of direct buy URL
          // Product-specific metadata
          productId: product.id,
          supplierProductId: product.supplierProductId || product.id,
          price: product.price, // Marked up price
          supplierPrice: product.supplierPrice || product.price / 2.5, // Original supplier price
          currency: product.currency,
          imageUrl: product.imageUrl,
          vendor: product.vendor,
          category: product.category,
          rating: product.rating,
          reviews: product.reviews,
          orders: product.orders,
          shippingDays: product.shippingDays,
          shippingMethod: product.shippingMethod,
          inStock: product.inStock,
          // Full product data for import API
          productData: {
            supplierProductId: product.supplierProductId || product.id,
            name: product.name,
            description: product.description,
            supplierPrice: product.supplierPrice || product.price / 2.5,
            price: product.price,
            currency: product.currency,
            imageUrl: product.imageUrl,
            buyUrl: product.buyUrl,
            vendor: product.vendor,
            category: product.category,
            rating: product.rating,
            reviews: product.reviews,
            orders: product.orders,
            shippingDays: product.shippingDays,
            shippingMethod: product.shippingMethod,
            inStock: product.inStock,
          },
          // Mark as product for UI rendering
          type: 'product',
        },
      }));

      results.push(...resultChunks);

      if (
        !searchResultsEmitted &&
        researchBlock &&
        researchBlock.type === 'research'
      ) {
        searchResultsEmitted = true;

        researchBlock.data.subSteps.push({
          id: searchResultsBlockId,
          type: 'search_results',
          reading: resultChunks,
        });

        additionalConfig.session.updateBlock(additionalConfig.researchBlockId, [
          {
            op: 'replace',
            path: '/data/subSteps',
            value: researchBlock.data.subSteps,
          },
        ]);
      } else if (
        searchResultsEmitted &&
        researchBlock &&
        researchBlock.type === 'research'
      ) {
        const subStepIndex = researchBlock.data.subSteps.findIndex(
          (step: { id: string }) => step.id === searchResultsBlockId,
        );

        const subStep = researchBlock.data.subSteps[
          subStepIndex
        ] as SearchResultsResearchBlock;

        subStep.reading.push(...resultChunks);

        additionalConfig.session.updateBlock(additionalConfig.researchBlockId, [
          {
            op: 'replace',
            path: '/data/subSteps',
            value: researchBlock.data.subSteps,
          },
        ]);
      }
    };

    await Promise.all(input.queries.map(search));

    return {
      type: 'search_results',
      results,
    };
  },
};

export default shoppingSearchAction;
