import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, Check, Lock, User, Package, Tag } from 'lucide-react';
import { useCartStore, useAuthStore, useOrderStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Address } from '@/types';

const VALID_COUPONS: Record<string, number> = {
  'SAVE10': 10,
  'FIRST20': 20,
  'SAREE15': 15,
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { showToast } = useUIStore();
  
  const [activeStep, setActiveStep] = useState<string>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  
  const [address, setAddress] = useState<Address>({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'India',
  });

  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const baseDiscount = cart.total > 5000 ? Math.round(cart.total * 0.1) : 0;
  const couponDiscount = appliedCoupon ? Math.round(cart.total * appliedCoupon.percent / 100) : 0;
  const discount = baseDiscount + couponDiscount;
  const standardDeliveryCost = cart.total > 999 ? 0 : 99;
  const delivery = deliveryOption === 'express' ? 149 : standardDeliveryCost;
  const tax = Math.round(cart.total * 0.05);
  const finalTotal = cart.total - discount + delivery + tax;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, percent: VALID_COUPONS[code] });
      showToast(`Coupon applied! ${VALID_COUPONS[code]}% off`, 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        userId: user?.id || '',
        items: cart.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          sellerId: item.product.sellerId,
          status: 'pending' as const,
        })),
        subtotal: cart.total,
        shipping: delivery,
        tax,
        total: finalTotal,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        shippingAddress: address,
      };

      const orderId = await addOrder(orderData);
      if (!orderId) throw new Error('Failed to create order');
      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${orderId}`);
    } catch {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items to proceed with checkout</p>
            <Button onClick={() => navigate('/products')} className="bg-[#febd69] hover:bg-[#f90] text-[#131921]">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f1111] dark:text-white">Secure Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Accordion */}
          <div className="lg:col-span-2">
            <Accordion 
              type="single" 
              collapsible 
              value={activeStep} 
              onValueChange={(val) => { if (val) setActiveStep(val) }}
              className="space-y-6"
            >
              
              {/* Login Status */}
              <AccordionItem value="login" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check className="w-5 h-5" /></div>
                    <span className="text-xl font-bold">1. Login Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="pl-12">
                    <p className="text-gray-600 flex items-center gap-2"><User className="w-4 h-4" /> Logged in as <span className="font-semibold text-gray-900">{user?.name}</span> ({user?.email})</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Delivery Address */}
              <AccordionItem value="address" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'address' ? 'bg-[#febd69] text-[#131921]' : 'bg-gray-200'}`}>2</div>
                    <span className="text-xl font-bold">2. Delivery Address</span>
                  </div>
                  {activeStep !== 'address' && address.street && (
                    <div className="text-left ml-4 text-sm text-gray-500 font-normal">
                      {address.street}, {address.city}
                    </div>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="pl-12 space-y-5">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Street Address</Label>
                      <Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House/Flat No., Building Name, Street" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-3"><Label className="text-sm font-semibold">City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                      <div className="space-y-3"><Label className="text-sm font-semibold">State</Label><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-3"><Label className="text-sm font-semibold">PIN Code</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
                      <div className="space-y-3"><Label className="text-sm font-semibold">Country</Label><Input value={address.country} disabled /></div>
                    </div>
                    <Button onClick={() => {
                        if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
                          showToast('Please fill in all address fields', 'error');
                          return;
                        }
                        setActiveStep('delivery');
                      }} className="mt-4 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold px-8">Use this address</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Delivery Options */}
              <AccordionItem value="delivery" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'delivery' ? 'bg-[#febd69] text-[#131921]' : 'bg-gray-200'}`}>3</div>
                    <span className="text-xl font-bold">3. Delivery Options</span>
                  </div>
                  {activeStep !== 'delivery' && (
                    <div className="text-left ml-4 text-sm text-gray-500 font-normal capitalize">
                      {deliveryOption} Delivery
                    </div>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="pl-12">
                    <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="space-y-4">
                      <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryOption === 'standard' ? 'border-[#febd69] bg-[#febd69]/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <RadioGroupItem value="standard" />
                        <div className="flex-1">
                          <p className="font-bold text-base">Standard Delivery</p>
                          <p className="text-sm text-gray-500">3-5 Business Days</p>
                        </div>
                        <span className="font-bold text-green-600">{standardDeliveryCost === 0 ? 'FREE' : `₹${standardDeliveryCost}`}</span>
                      </Label>
                      <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryOption === 'express' ? 'border-[#febd69] bg-[#febd69]/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <RadioGroupItem value="express" />
                        <div className="flex-1">
                          <p className="font-bold text-base">Express Delivery</p>
                          <p className="text-sm text-gray-500">1-2 Business Days</p>
                        </div>
                        <span className="font-bold">₹149</span>
                      </Label>
                    </RadioGroup>
                    <Button onClick={() => setActiveStep('payment')} className="mt-6 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold px-8">Continue to Payment</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payment Method */}
              <AccordionItem value="payment" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'payment' ? 'bg-[#febd69] text-[#131921]' : 'bg-gray-200'}`}>4</div>
                    <span className="text-xl font-bold">4. Payment Method</span>
                  </div>
                  {activeStep !== 'payment' && (
                    <div className="text-left ml-4 text-sm text-gray-500 font-normal uppercase">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                    </div>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="pl-12">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#febd69] bg-[#febd69]/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <RadioGroupItem value="cod" />
                        <div className="flex-1"><p className="font-bold text-base">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when you receive</p></div><Truck className="w-6 h-6 text-gray-400" />
                      </Label>
                      <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#febd69] bg-[#febd69]/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <RadioGroupItem value="card" />
                        <div className="flex-1"><p className="font-bold text-base">Credit/Debit Card</p><p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p></div><CreditCard className="w-6 h-6 text-gray-400" />
                      </Label>
                      <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-[#febd69] bg-[#febd69]/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <RadioGroupItem value="upi" />
                        <div className="flex-1"><p className="font-bold text-base">UPI</p><p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p></div>
                        <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">U</div>
                      </Label>
                    </RadioGroup>
                    <Button onClick={() => setActiveStep('review')} className="mt-6 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold px-8">Review Order</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Review */}
              <AccordionItem value="review" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'review' ? 'bg-[#febd69] text-[#131921]' : 'bg-gray-200'}`}>5</div>
                    <span className="text-xl font-bold">5. Review items and delivery</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="pl-12 space-y-5">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-700/50">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5"/> Items ({cart.itemCount})</h4>
                      <div className="space-y-4">
                        {cart.items.map((item) => (
                          <div key={item.product.id} className="flex gap-4">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-24 object-cover rounded-lg border border-gray-200" />
                            <div className="flex-1">
                              <p className="font-bold">{item.product.name}</p>
                              <p className="text-sm text-[#007185] mb-2">Seller: {item.product.sellerName}</p>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-[#b12704]">₹{item.product.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-[100px] border-gray-200 shadow-lg rounded-xl">
              <CardContent className="p-6 space-y-4">
                <Button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold py-6 text-lg shadow-sm"
                  disabled={isProcessing || activeStep !== 'review'}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-[#131921] border-t-transparent rounded-full animate-spin" /> Processing...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> Place Your Order</span>
                  )}
                </Button>
                
                {activeStep !== 'review' && (
                  <p className="text-xs text-center text-gray-500 mt-2">Please complete all steps to place the order.</p>
                )}

                <Separator className="my-4" />

                <h3 className="font-bold text-lg">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Items ({cart.itemCount}):</span><span>₹{cart.total.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount:</span><span>-₹{discount.toLocaleString()}</span></div>}
                  {appliedCoupon && <div className="flex justify-between text-sm text-green-600"><span>Coupon ({appliedCoupon.code}):</span><span>-{appliedCoupon.percent}%</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery:</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Taxes (5%):</span><span>₹{tax.toLocaleString()}</span></div>

                  {/* Coupon Input */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="pl-8 h-8 text-sm"
                          disabled={!!appliedCoupon}
                        />
                      </div>
                      {appliedCoupon ? (
                        <Button size="sm" variant="outline" className="h-8 text-red-500" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>Remove</Button>
                      ) : (
                        <Button size="sm" className="h-8 bg-[#febd69] hover:bg-[#f90] text-[#131921]" onClick={handleApplyCoupon}>Apply</Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Try: SAVE10, FIRST20, SAREE15</p>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center"><span className="font-bold text-lg text-[#b12704]">Order Total:</span><span className="font-black text-2xl text-[#b12704]">₹{finalTotal.toLocaleString()}</span></div>
                </div>

                <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-xl flex items-start gap-3 mt-4 border border-green-100">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-800 leading-snug">Safe and secure payments. 100% Authentic products.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
