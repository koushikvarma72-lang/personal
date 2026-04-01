import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  ShoppingCart, 
  ChevronDown,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useProductStore, useCartStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProductCategory } from '@/types';

export function ProductsPage() {
  const { filteredProducts, filters, setFilters, products } = useProductStore();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const categories: { id: ProductCategory; name: string; count: number }[] = [
    { id: 'sarees', name: 'Sarees', count: products.filter(p => p.category === 'sarees').length },
    { id: 'salwar-kameez', name: 'Salwar Kameez', count: products.filter(p => p.category === 'salwar-kameez').length },
    { id: 'lehengas', name: 'Lehengas', count: products.filter(p => p.category === 'lehengas').length },
    { id: 'kurtis', name: 'Kurtis', count: products.filter(p => p.category === 'kurtis').length },
    { id: 'dupattas', name: 'Dupattas', count: products.filter(p => p.category === 'dupattas').length },
    { id: 'jewelry', name: 'Jewelry', count: products.filter(p => p.category === 'jewelry').length },
  ];

  const ratings = [4, 3, 2, 1];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest Arrivals' },
  ];

  const handleAddToCart = (product: any) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
    setCartOpen(true);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] });
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 50000]);
  };

  const activeFiltersCount = Object.keys(filters).filter(k => k !== 'sortBy').length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-lg mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label 
              key={category.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={filters.category === category.id}
                onCheckedChange={() => 
                  setFilters({ 
                    ...filters, 
                    category: filters.category === category.id ? undefined : category.id 
                  })
                }
              />
              <span className="flex-1">{category.name}</span>
              <span className="text-sm text-gray-500">({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-lg mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          max={50000}
          step={500}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h3 className="font-bold text-lg mb-3">Customer Rating</h3>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label 
              key={rating}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={filters.rating === rating}
                onCheckedChange={() => 
                  setFilters({ 
                    ...filters, 
                    rating: filters.rating === rating ? undefined : rating 
                  })
                }
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < rating ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">& Up</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          onClick={clearFilters}
          variant="outline"
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:text-[#007185]">Home</Link>
          <span>/</span>
          <span className="text-[#0f1111]">Products</span>
          {filters.category && (
            <>
              <span>/</span>
              <span className="text-[#0f1111]">
                {categories.find(c => c.id === filters.category)?.name}
              </span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0f1111]">
                {filters.category 
                  ? categories.find(c => c.id === filters.category)?.name 
                  : 'All Products'
                }
              </h1>
              <p className="text-sm text-gray-500">
                {filteredProducts.length} results found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy || 'popular'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#febd69] cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#febd69] text-[#131921]' : 'bg-white hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#febd69] text-[#131921]' : 'bg-white hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden relative">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#febd69] text-[#131921] text-xs rounded-full flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    <FilterSidebar />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-4 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-[#007185] hover:text-[#febd69]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image */}
                    <Link to={`/product/${product.id}`} className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'h-full' : 'h-48 md:h-64'}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </Badge>
                        )}
                        {product.stock < 10 && (
                          <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                            Only {product.stock} left
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-1 hover:text-[#007185] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mb-2">{product.sellerName}</p>
                        
                        {/* Rating */}
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

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-[#b12704]">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-medium"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
