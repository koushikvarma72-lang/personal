import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw,
  Check, Plus, Minus, Store, MapPin, CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { useProductStore, useCartStore, useUIStore, useAuthStore, useWishlistStore } from '@/store';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, getProductsByCategory, products } = useProductStore();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { add: addRecentlyViewed, getIds } = useRecentlyViewed();
  
  const product = getProductById(id || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Track recently viewed
  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id]);

  const wishlisted = product ? isWishlisted(product.id) : false;

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Recently viewed products (excluding current)
  const recentIds = getIds().filter(rid => rid !== id);
  const recentlyViewed = recentIds.map(rid => products.find(p => p.id === rid)).filter(Boolean) as typeof products;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#e3e6e6] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${quantity} x ${product.name} added to cart!`, 'success');
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !user?.id || !product) {
      showToast('Please sign in to save items', 'info');
      return;
    }
    if (wishlisted) {
      await removeFromWishlist(user.id, product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      await addToWishlist(user.id, product.id);
      showToast('Added to wishlist!', 'success');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:text-[#007185]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#007185]">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-[#007185]">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          <span>/</span>
          <span className="text-[#0f1111] line-clamp-1">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                        selectedImage === index ? 'border-[#febd69]' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={`flex-1 ${wishlisted ? 'bg-red-50 border-red-300 text-red-600' : ''}`}
              >
                <Heart className={`w-5 h-5 mr-2 ${wishlisted ? 'fill-current' : ''}`} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Title & Rating */}
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111] mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[#007185] ml-1">{product.rating}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-[#007185]">{product.reviewCount} ratings</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#b12704]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-green-600 font-medium">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <Separator className="my-4" />

              {/* Offers */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm"><span className="font-medium">Free Delivery</span> on orders above ₹999</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm"><span className="font-medium">Cash on Delivery</span> available</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm"><span className="font-medium">30-day returns</span> - Easy returns</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="bg-[#ffa41c] hover:bg-[#f90] text-[#131921] font-bold"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#febd69]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-[#febd69]" />
                  </div>
                  <div className="flex-1">
                    <Link to={`/seller/${product.sellerId}`} className="font-medium hover:text-[#007185] transition-colors">
                      {product.sellerName}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>Mumbai, India</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Top Rated</Badge>
                      <Badge variant="secondary">Fast Shipping</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[#febd69]" />
                <p className="text-xs font-medium">Free Delivery</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[#febd69]" />
                <p className="text-xs font-medium">Secure Payment</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-[#febd69]" />
                <p className="text-xs font-medium">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description" className="bg-white rounded-lg shadow-sm">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="description" 
                className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#febd69]"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#febd69]"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#febd69]"
              >
                Reviews ({product.reviewCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex border-b border-gray-100 pb-2">
                    <span className="font-medium w-1/3 text-gray-600">{key}</span>
                    <span className="w-2/3">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-[#0f1111]">{product.rating || 0}</p>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{product.reviewCount} ratings</p>
                  </div>
                </div>

                <Separator />

                {/* Write a Review */}
                {isAuthenticated ? (
                  reviewSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-medium text-green-700">Thank you for your review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Write a Review</h4>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Your Rating</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              onClick={() => setReviewRating(star)}
                            >
                              <Star className={`w-8 h-8 transition-colors ${star <= (reviewHover || reviewRating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Your Review</p>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button
                        className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold"
                        disabled={reviewRating === 0 || reviewComment.trim().length < 5}
                        onClick={() => {
                          if (reviewRating === 0) { showToast('Please select a rating', 'error'); return; }
                          if (reviewComment.trim().length < 5) { showToast('Please write a review', 'error'); return; }
                          setReviewSubmitted(true);
                          showToast('Review submitted!', 'success');
                        }}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-3">Please sign in to write a review</p>
                    <Link to="/login">
                      <Button className="bg-[#febd69] hover:bg-[#f90] text-[#131921]">Sign In</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-all">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:text-[#007185]">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold">₹{relatedProduct.price.toLocaleString()}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((p) => (
                <Card key={p.id} className="group hover:shadow-lg transition-all">
                  <Link to={`/product/${p.id}`}>
                    <div className="relative h-32 overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  </Link>
                  <CardContent className="p-2">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-medium text-xs line-clamp-2 mb-1 hover:text-[#007185]">{p.name}</h3>
                    </Link>
                    <span className="text-sm font-bold text-[#b12704]">₹{p.price.toLocaleString()}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
