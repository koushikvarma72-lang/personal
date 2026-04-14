import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuthStore, useWishlistStore, useProductStore, useCartStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function WishlistPage() {
  const { user } = useAuthStore();
  const { items, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();

  useEffect(() => {
    if (user?.id) fetchWishlist(user.id);
  }, [user?.id]);

  const wishlistProducts = products.filter(p => items.includes(p.id));

  const handleRemove = async (productId: string) => {
    if (!user?.id) return;
    await removeFromWishlist(user.id, productId);
    showToast('Removed from wishlist', 'info');
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111] flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            Your Wishlist
          </h1>
          <p className="text-gray-500">{wishlistProducts.length} saved items</p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-16 text-center">
            <Heart className="w-20 h-20 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Save items you love and come back to them later</p>
            <Link to="/products">
              <Button className="bg-[#febd69] hover:bg-[#f90] text-[#131921]">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistProducts.map(product => (
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
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemove(product.id); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:text-[#007185]">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 mb-2">{product.sellerName}</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-bold text-[#b12704]">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-medium"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
