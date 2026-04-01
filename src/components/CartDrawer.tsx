import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isCartOpen, setCartOpen } = useUIStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  const discount = cart.total > 5000 ? Math.round(cart.total * 0.1) : 0;
  const delivery = cart.total > 999 ? 0 : 99;
  const finalTotal = cart.total - discount + delivery;

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white">
        <SheetHeader className="space-y-2.5 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="w-6 h-6 text-[#febd69]" />
              Shopping Cart
              {cart.itemCount > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({cart.itemCount} items)
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
            <Button 
              onClick={() => {
                setCartOpen(false);
                navigate('/products');
              }}
              className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-medium"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-5 pb-4">
                {cart.items.map((item, index) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-5 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#febd69]/50 hover:shadow-sm transition-all animate-fade-in relative"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-24 flex-shrink-0 bg-white rounded-md overflow-hidden">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{item.product.sellerName}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[#b12704]">
                            ₹{item.product.price.toLocaleString()}
                          </span>
                          {item.product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm hover:text-[#febd69] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm hover:text-[#febd69] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{cart.total.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount (10%)</span>
                  <span className="font-medium">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes (5%)</span>
                <span className="font-medium">₹{Math.round(cart.total * 0.05).toLocaleString()}</span>
              </div>
              
              {cart.total < 999 && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                  Add items worth ₹{(999 - cart.total).toLocaleString()} more for FREE delivery
                </p>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center pb-2">
                <span className="text-lg font-bold">Total Price</span>
                <span className="text-2xl font-black text-[#b12704]">
                  ₹{(finalTotal + Math.round(cart.total * 0.05)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Clear Cart
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
