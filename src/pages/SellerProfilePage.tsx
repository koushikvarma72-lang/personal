import { useParams, Link } from 'react-router-dom';
import { Store, Star, Package, ShoppingCart } from 'lucide-react';
import { useProductStore, useCartStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SellerProfilePage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();

  const sellerProducts = products.filter(p => p.sellerId === sellerId && p.status === 'active');
  const sellerName = sellerProducts[0]?.sellerName || 'Seller';
  const avgRating = sellerProducts.length
    ? (sellerProducts.reduce((s, p) => s + p.rating, 0) / sellerProducts.length).toFixed(1)
    : '0';

  const handleAddToCart = (product: any) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
    setCartOpen(true);
  };

  if (sellerProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">Seller not found</h2>
          <Link to="/products"><Button className="bg-[#febd69] hover:bg-[#f90] text-[#131921]">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Seller Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 bg-[#febd69]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Store className="w-10 h-10 text-[#febd69]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#0f1111] dark:text-white">{sellerName}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#ffa41c] text-[#ffa41c]" />
                {avgRating} avg rating
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {sellerProducts.length} products
              </span>
            </div>
            <div className="flex gap-2 mt-3 justify-center sm:justify-start">
              <Badge variant="secondary">Verified Seller</Badge>
              <Badge variant="secondary">Fast Shipping</Badge>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold text-[#0f1111] dark:text-white mb-4">Products by {sellerName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellerProducts.map(product => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <Link to={`/product/${product.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:text-[#007185]">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bold text-[#b12704]">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <Button size="sm" className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921]" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
