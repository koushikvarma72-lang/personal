import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react';
import { useOrderStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useOrderStore();
  const { user } = useAuthStore();

  const order = orders.find(o => o.id === orderId);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#0f1111] dark:text-white mb-2">Order Placed!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Thank you, {user?.name}. Your order has been confirmed.
          </p>
        </div>

        {/* Order ID Card */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                <p className="font-mono font-bold text-lg">{orderId?.slice(-12).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Estimated Delivery</p>
                <p className="font-medium text-green-600">
                  {estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Order Status</h3>
            <div className="relative">
              {[
                { label: 'Order Placed', icon: CheckCircle, done: true },
                { label: 'Confirmed', icon: Package, done: false },
                { label: 'Shipped', icon: Truck, done: false },
                { label: 'Delivered', icon: MapPin, done: false },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${step.done ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</p>
                    {step.done && <p className="text-xs text-gray-400">Just now</p>}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="absolute left-4 mt-8" style={{ top: `${i * 56 + 32}px`, height: '24px', width: '2px', background: step.done ? '#22c55e' : '#e5e7eb' }} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        {order && (
          <Card className="mb-4">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-[#b12704] text-sm">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Shipping</span><span className={order.shipping === 0 ? 'text-green-600' : ''}>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tax</span><span>₹{order.tax.toLocaleString()}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-[#b12704]">₹{order.total.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/orders" className="flex-1">
            <Button className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold">
              Track Order <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
