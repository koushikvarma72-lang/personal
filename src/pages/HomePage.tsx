import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Clock, 
  TrendingUp, 
  Shield, 
  Truck, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useProductStore, useCartStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function HomePage() {
  const { getFeaturedProducts, getDeals, getProductsByCategory, setFilters } = useProductStore();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();
  
  const featuredProducts = getFeaturedProducts();
  const deals = getDeals();
  const sarees = getProductsByCategory('sarees').slice(0, 4);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
    setCartOpen(true);
  };

  const categories = [
    { id: 'sarees', name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop', count: 150 },
    { id: 'salwar-kameez', name: 'Salwar Kameez', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop', count: 89 },
    { id: 'lehengas', name: 'Lehengas', image: 'https://images.unsplash.com/photo-1583391733952-0e8a5ed1f57c?w=400&h=300&fit=crop', count: 45 },
    { id: 'kurtis', name: 'Kurtis', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop', count: 200 },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      rating: 5,
      comment: 'The Banarasi saree I ordered exceeded my expectations! The quality is amazing and the delivery was super fast.',
      date: '2 weeks ago'
    },
    {
      id: 2,
      name: 'Anjali Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
      rating: 5,
      comment: 'Beautiful collection! I bought a lehenga for my sister\'s wedding and everyone loved it. Will definitely shop again.',
      date: '1 month ago'
    },
    {
      id: 3,
      name: 'Meera Reddy',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
      rating: 4,
      comment: 'Great customer service and authentic products. The Kundan jewelry set is stunning!',
      date: '3 weeks ago'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="grid md:grid-cols-2 gap-8 items-center w-full">
            <div className="space-y-6 text-white">
              <Badge className="bg-[#febd69] text-[#131921] hover:bg-[#f90] font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Summer Collection 2026
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Discover the Beauty of{' '}
                <span className="text-[#febd69]">Indian Tradition</span>
              </h1>
              <p className="text-lg text-white/80 max-w-lg">
                Explore our exquisite collection of handwoven sarees, designer lehengas, 
                and traditional jewelry. Up to 50% off on selected items.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button 
                    size="lg"
                    className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold px-8"
                  >
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    View Deals
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-[#febd69]">10K+</p>
                  <p className="text-sm text-white/70">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#febd69]">500+</p>
                  <p className="text-sm text-white/70">Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#febd69]">4.8</p>
                  <p className="text-sm text-white/70">Average Rating</p>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden md:block relative">
              <div className="relative z-10 animate-float">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop"
                  alt="Traditional Saree"
                  className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#ffa41c] text-[#ffa41c]" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-800">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">2,000+ Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, text: 'Free Delivery', subtext: 'On orders above ₹999' },
              { icon: Shield, text: 'Authentic Products', subtext: '100% Genuine guarantee' },
              { icon: RefreshCw, text: 'Easy Returns', subtext: '30-day return policy' },
              { icon: TrendingUp, text: 'Best Prices', subtext: 'Direct from artisans' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-[#febd69]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#febd69]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.text}</p>
                  <p className="text-xs text-gray-500">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Shop by Category</h2>
            <Link to="/products" className="text-[#007185] hover:text-[#febd69] flex items-center gap-1 transition-colors">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/products"
                onClick={() => setFilters({ category: category.id as any })}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.count} products</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals */}
      <section className="py-12 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-bold">Today's Deals</h2>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl">
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            <Link to="/products" className="text-white/90 hover:text-white flex items-center gap-1">
              View All Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <Link key={deal.id} to={`/product/${deal.id}`} className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={deal.images[0]}
                    alt={deal.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    {Math.round(((deal.originalPrice! - deal.price) / deal.originalPrice!) * 100)}% OFF
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">{deal.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-[#b12704]">₹{deal.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">₹{deal.originalPrice?.toLocaleString()}</span>
                  </div>
                  <Progress value={(deal.stock / (deal.stock + 20)) * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{deal.stock} left in stock</p>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Featured Products</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product) => (
              <Card key={product.id} className="flex-shrink-0 w-64 group hover:shadow-xl transition-all duration-300">
                <Link to={`/product/${product.id}`}>
                  <div className="relative h-64 overflow-hidden bg-gray-100">
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
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 hover:text-[#007185] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#007185]">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-medium"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sarees Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Exquisite Sarees</h2>
              <p className="text-gray-500 mt-1">Handwoven traditions from across India</p>
            </div>
            <Link to="/products" onClick={() => setFilters({ category: 'sarees' })}>
              <Button variant="outline" className="border-[#febd69] text-[#febd69] hover:bg-[#febd69] hover:text-[#131921]">
                View All Sarees
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sarees.map((saree) => (
              <Card key={saree.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <Link to={`/product/${saree.id}`}>
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={saree.images[0]}
                      alt={saree.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${saree.id}`}>
                    <h3 className="font-medium line-clamp-1 mb-1 hover:text-[#007185] transition-colors">
                      {saree.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{saree.sellerName}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">₹{saree.price.toLocaleString()}</span>
                    {saree.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{saree.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f1111] text-center mb-8">
            What Our Customers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < testimonial.rating ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <p className="text-sm text-gray-400">{testimonial.date}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#232f3e] to-[#131921] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Selling on SareeBazaar
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Reach millions of customers and grow your business. 
            Join thousands of sellers already on our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button 
                size="lg"
                className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold px-8"
              >
                Become a Seller
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
