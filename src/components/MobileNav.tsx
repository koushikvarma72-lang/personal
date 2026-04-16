import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, Package } from 'lucide-react';
import { useCartStore, useUIStore, useAuthStore } from '@/store';

export function MobileNav() {
  const location = useLocation();
  const { cart } = useCartStore();
  const { setCartOpen } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  // Hide for sellers and on auth pages
  if (user?.role === 'seller') return null;
  if (['/login', '/register'].includes(location.pathname)) return null;

  const active = (path: string) =>
    location.pathname === path
      ? 'text-[#febd69]'
      : 'text-gray-500 hover:text-[#febd69]';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex md:hidden">
      <Link to="/" className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active('/')}`}>
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link to="/products" className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active('/products')}`}>
        <Search className="w-5 h-5" />
        <span className="text-[10px]">Shop</span>
      </Link>
      <button
        onClick={() => setCartOpen(true)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 text-gray-500 hover:text-[#febd69] transition-colors relative"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cart.itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Cart</span>
      </button>
      {isAuthenticated ? (
        <Link to="/wishlist" className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active('/wishlist')}`}>
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">Wishlist</span>
        </Link>
      ) : (
        <Link to="/login" className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active('/login')}`}>
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">Wishlist</span>
        </Link>
      )}
      <Link to={isAuthenticated ? '/orders' : '/login'} className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${active('/orders')}`}>
        <Package className="w-5 h-5" />
        <span className="text-[10px]">Orders</span>
      </Link>
    </nav>
  );
}
