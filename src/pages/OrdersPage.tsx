import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { useAuthStore, useOrderStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { OrderStatus } from '@/types';

export function OrdersPage() {
  const { user } = useAuthStore();
  const { getUserOrders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const userOrders = getUserOrders(user?.id || '');
  
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing': return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pending: 'bg-orange-100 text-orange-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      returned: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const orderCounts = {
    all: userOrders.length,
    pending: userOrders.filter(o => o.status === 'pending').length,
    processing: userOrders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: userOrders.filter(o => o.status === 'shipped').length,
    delivered: userOrders.filter(o => o.status === 'delivered').length,
    cancelled: userOrders.filter(o => o.status === 'cancelled').length,
  };

  const displayOrders = filteredOrders;

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Your Orders</h1>
          <p className="text-gray-500">Track and manage your purchases</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by order ID or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto mb-6">
            <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({orderCounts.pending})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({orderCounts.processing})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({orderCounts.shipped})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({orderCounts.delivered})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({orderCounts.cancelled})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-4">
              {displayOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No orders found</h3>
                    <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
                    <Link to="/products">
                      <Button className="bg-[#febd69] hover:bg-[#f90] text-[#131921]">
                        Start Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                displayOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-xs text-gray-500">ORDER ID</p>
                            <p className="font-medium">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">ORDERED ON</p>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">TOTAL</p>
                            <p className="font-medium">₹{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Order Items */}
                      <div className="p-4 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-4 border-b last:border-0 pb-4 last:pb-0">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{item.productName}</h4>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  <p className="font-medium mt-1">₹{item.price.toLocaleString()}</p>
                                </div>
                                <Badge className={getStatusBadge(item.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(item.status)}
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Actions */}
                      <div className="p-4 flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                          View Order Details
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Write a Review
                          </Button>
                        )}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            Cancel Order
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Need Help?
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
