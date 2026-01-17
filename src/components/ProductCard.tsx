import { ShoppingBag, Star, ExternalLink } from 'lucide-react';
import { Chunk } from '@/lib/types';
import { useState } from 'react';

interface ProductCardProps {
  product: Chunk;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const metadata = product.metadata;
  const imageUrl = metadata.imageUrl || metadata.thumbnailUrl || metadata.thumbnail;
  const price = metadata.price; // Already marked up
  const supplierPrice = metadata.supplierPrice; // Original supplier price
  const currency = metadata.currency || 'USD';
  const rating = metadata.rating;
  const reviews = metadata.reviews;
  const orders = metadata.orders;
  const vendor = metadata.vendor;
  const inStock = metadata.inStock !== false; // Default to true if not specified
  const importUrl = metadata.url || '/api/products/import'; // Import/checkout route
  const productData = metadata.productData; // Full product data for import

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Call import API to create product and checkout session
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierProductId: metadata.supplierProductId || metadata.productId,
          productData: productData || {
            supplierProductId: metadata.supplierProductId || metadata.productId,
            name: metadata.title,
            description: product.content,
            supplierPrice: supplierPrice,
            price: price,
            currency: currency,
            imageUrl: imageUrl,
            vendor: vendor,
            category: metadata.category,
            rating: rating,
            reviews: reviews,
            orders: orders,
            shippingDays: metadata.shippingDays,
            shippingMethod: metadata.shippingMethod,
            inStock: inStock,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to checkout URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback: show order details
        alert(`Order created! Order ID: ${data.orderId}`);
      }
    } catch (error: any) {
      console.error('Error importing product:', error);
      alert(`Error: ${error.message || 'Failed to create checkout'}`);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <a
      href={buyUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg overflow-hidden hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-200 hover:shadow-lg"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-light-100 dark:bg-dark-100 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={metadata.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-light-200 dark:bg-dark-200">
            <ShoppingBag className="w-12 h-12 text-black/30 dark:text-white/30" />
          </div>
        )}
        
        {/* Stock Badge */}
        {!inStock && (
          <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Rating Badge */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2 right-2 bg-cyan-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-200">
          <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-medium text-sm line-clamp-2 text-black dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
          {metadata.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-black dark:text-white">
              {price ? formatPrice(price, currency) : 'Price on request'}
            </span>
            {supplierPrice && supplierPrice < price && (
              <span className="text-xs text-black/50 dark:text-white/50 line-through">
                Supplier: {formatPrice(supplierPrice, currency)}
              </span>
            )}
            {vendor && (
              <span className="text-xs text-black/60 dark:text-white/60">
                by {vendor}
              </span>
            )}
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60">
          <div className="flex items-center gap-3">
            {/* Reviews/Orders */}
            {orders !== undefined && orders > 0 && (
              <div className="flex items-center gap-1">
                <span>
                  {orders >= 1000
                    ? `${(orders / 1000).toFixed(1)}K orders`
                    : `${orders} orders`}
                </span>
              </div>
            )}
            {reviews !== undefined && reviews > 0 && !orders && (
              <div className="flex items-center gap-1">
                <span>
                  {reviews >= 1000
                    ? `${(reviews / 1000).toFixed(1)}K reviews`
                    : `${reviews} reviews`}
                </span>
              </div>
            )}
            {/* Shipping Info */}
            {metadata.shippingDays && (
              <div className="flex items-center gap-1">
                <span className="text-xs">
                  {metadata.shippingDays <= 15 ? '🚀' : '📦'} {metadata.shippingDays} days
                </span>
              </div>
            )}

            {/* Category */}
            {metadata.category && (
              <span className="px-2 py-0.5 bg-light-100 dark:bg-dark-100 rounded text-xs font-medium">
                {metadata.category}
              </span>
            )}
          </div>

          {/* External Link Icon */}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
};

interface ProductResultsProps {
  sources: Chunk[];
  maxDisplay?: number;
}

const ProductResults = ({ sources, maxDisplay = 6 }: ProductResultsProps) => {
  // Filter to only product sources
  const products = sources.filter(
    (source) => source.metadata.type === 'product' || source.metadata.productId
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.slice(0, maxDisplay).map((product, index) => (
        <ProductCard key={product.metadata.productId || index} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductResults;
export { ProductCard };
