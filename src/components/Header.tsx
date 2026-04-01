import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  User, 
  Menu, 
  X, 
  Package, 
  LogOut,
  Store,
  ChevronDown
} from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore, useProductStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { setCartOpen } = useUIStore();
  const { setFilters } = useProductStore();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters({ search: searchQuery });
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categories = [
    { id: 'sarees', name: 'Sarees' },
    { id: 'salwar-kameez', name: 'Salwar Kameez' },
    { id: 'lehengas', name: 'Lehengas' },
    { id: 'kurtis', name: 'Kurtis' },
    { id: 'dupattas', name: 'Dupattas' },
    { id: 'jewelry', name: 'Jewelry' },
  ];

  return (
    <>
      {/* Main Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#131921]/95 backdrop-blur-xl shadow-lg' 
            : 'bg-[#131921]'
        }`}
        style={{ height: isScrolled ? '50px' : '60px' }}
      >
        <div className="h-full px-4 flex items-center gap-4 max-w-[1920px] mx-auto">
          {/* Logo */}
          {/* Logo */}
          <Link 
            to={user?.role === 'seller' ? '/seller' : '/'} 
            className="flex items-center gap-2 group"
            style={{ 
              transform: isScrolled ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#febd69] to-[#f90] rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-[#131921]" />
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">
              Saree<span className="text-[#febd69]">Bazaar</span>
            </span>
          </Link>

          {/* Location - Hidden on mobile, Hidden for Sellers */}
          {user?.role !== 'seller' && (
            <div className="hidden md:flex items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors group">
              <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs">
                <p className="text-white/60">Deliver to</p>
                <p className="font-medium">India</p>
              </div>
            </div>
          )}

          {/* Search Bar - Hidden for Sellers */}
          {user?.role !== 'seller' ? (
            <form 
              onSubmit={handleSearch}
              className={`flex-1 max-w-2xl mx-4 transition-all duration-500 ${
                isSearchFocused ? 'scale-[1.02]' : 'scale-100'
              }`}
            >
              <div className="flex rounded-lg overflow-hidden shadow-lg">
                <select className="bg-[#f3f3f3] text-[#0f1111] text-sm px-3 py-2 border-r border-gray-300 outline-none hover:bg-[#e8e8e8] transition-colors cursor-pointer hidden sm:block">
                  <option value="all">All</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Input
                  type="text"
                  placeholder="Search for sarees, kurtis, jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 rounded-none border-none bg-white text-[#0f1111] placeholder:text-gray-500 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  type="submit"
                  className="rounded-none bg-[#febd69] hover:bg-[#f90] text-[#131921] px-4 h-10 transition-all duration-200"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1"></div>
          )}

          {/* Right Navigation */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Account */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
                    <img 
                      src={user?.avatar} 
                      alt={user?.name}
                      className="w-7 h-7 rounded-full border border-white/30"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs text-white/70">Hello, {user?.name}</p>
                      <p className="text-sm font-medium">Account</p>
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {user?.role !== 'seller' && (
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'seller' && (
                    <DropdownMenuItem onClick={() => navigate('/seller')}>
                      <Store className="w-4 h-4 mr-2" />
                      Seller Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/login"
                className="text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              >
                <div className="hidden sm:block">
                  <p className="text-xs text-white/70">Hello, Sign in</p>
                  <p className="text-sm font-medium">Account</p>
                </div>
                <User className="w-6 h-6 sm:hidden" />
              </Link>
            )}

            {/* Orders - Hidden on mobile, Hidden for Sellers */}
            {user?.role !== 'seller' && (
              <Link 
                to={isAuthenticated ? "/orders" : "/login"}
                className="hidden md:block text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
              >
                <p className="text-xs text-white/70">Returns</p>
                <p className="text-sm font-medium">& Orders</p>
              </Link>
            )}

            {/* Cart - Hidden for Sellers */}
            {user?.role !== 'seller' && (
              <button 
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1 text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10 group"
              >
                <div className="relative">
                  <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                      {cart.itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      {user?.role !== 'seller' && (
        <nav className="fixed top-[60px] left-0 right-0 z-40 bg-[#232f3e] text-white hidden lg:block transition-all duration-300"
          style={{ 
            top: isScrolled ? '50px' : '60px',
            opacity: isScrolled ? 0.95 : 1
          }}
        >
          <div className="px-4 py-2 flex items-center gap-6 max-w-[1920px] mx-auto overflow-x-auto">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-1 font-medium hover:text-[#febd69] transition-colors whitespace-nowrap"
            >
              <Menu className="w-4 h-4" />
              All
            </button>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to="/products"
                onClick={() => setFilters({ category: cat.id as any })}
                className="text-sm hover:text-[#febd69] transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/products" className="text-sm hover:text-[#febd69] transition-colors whitespace-nowrap">
              Today's Deals
            </Link>
            <Link to="/products" className="text-sm hover:text-[#febd69] transition-colors whitespace-nowrap">
              New Arrivals
            </Link>
          </div>
        </nav>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto animate-slide-in-left">
            <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8" />
                <span className="font-medium text-lg">
                  {isAuthenticated ? `Hello, ${user?.name}` : 'Hello, Sign in'}
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-lg mb-3">Shop by Category</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to="/products"
                    onClick={() => {
                      setFilters({ category: cat.id as any });
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              
              <div className="border-t my-4" />
              
              <h3 className="font-medium text-lg mb-3">Help & Settings</h3>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="block py-2 px-3 rounded hover:bg-gray-100">Your Account</Link>
                    {user?.role !== 'seller' && (
                      <Link to="/orders" className="block py-2 px-3 rounded hover:bg-gray-100">Your Orders</Link>
                    )}
                    {user?.role === 'seller' && (
                      <Link to="/seller" className="block py-2 px-3 rounded hover:bg-gray-100">Seller Dashboard</Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100 text-red-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block py-2 px-3 rounded hover:bg-gray-100">Sign In</Link>
                    <Link to="/register" className="block py-2 px-3 rounded hover:bg-gray-100">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
