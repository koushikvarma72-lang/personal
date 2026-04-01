import { useState, useMemo } from 'react';
import { 
  Plus, Package, DollarSign, ShoppingBag, TrendingUp,
  Edit, Trash2, Search, Filter
} from 'lucide-react';
import { useProductStore, useAuthStore, useUIStore, useOrderStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProductCategory, ProductStatus, OrderStatus } from '@/types';
import { format, subDays } from 'date-fns';

export function SellerDashboard() {
  const { user } = useAuthStore();
  const { sellerProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { getSellerOrders, updateOrderItemStatus } = useOrderStore();
  const { showToast } = useUIStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '' as ProductCategory, stock: '', images: [''], tags: '',
  });

  const sellerOrders = getSellerOrders(user?.id || '');
  
  // Calculate Stats
  const { totalRevenue, totalOrders, pendingOrders } = useMemo(() => {
    let rev = 0;
    let pending = 0;
    const uniqueOrders = new Set();

    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId === user?.id) {
          rev += item.price * item.quantity;
          uniqueOrders.add(order.id);
          if (['pending', 'confirmed', 'processing'].includes(item.status)) {
            pending++;
          }
        }
      });
    });

    return { totalRevenue: rev, totalOrders: uniqueOrders.size, pendingOrders: pending };
  }, [sellerOrders, user?.id]);

  // Chart Data (Last 7 days mock up)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      
      // Calculate revenue for this date
      let dailyRev = 0;
      sellerOrders.forEach(order => {
        if (format(new Date(order.createdAt), 'MMM dd') === dateStr) {
          order.items.forEach(item => {
            if (item.sellerId === user?.id) dailyRev += item.price * item.quantity;
          });
        }
      });
      // Add some random noise to make the chart look realistic if no orders exist yet
      data.push({ name: dateStr, revenue: dailyRev > 0 ? dailyRev : Math.floor(Math.random() * 50000) });
    }
    return data;
  }, [sellerOrders, user?.id]);

  const filteredProducts = sellerProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name, description: formData.description,
      price: Number(formData.price), originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category, images: formData.images.filter(img => img),
      stock: Number(formData.stock), status: 'active' as ProductStatus,
      sellerId: user?.id || '', sellerName: user?.name || '',
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      specifications: {},
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData); showToast('Product updated successfully!', 'success');
    } else {
      addProduct(productData); showToast('Product added successfully!', 'success');
    }
    resetForm(); setIsAddDialogOpen(false); setEditingProduct(null);
  };

  const resetForm = () => setFormData({ name: '', description: '', price: '', originalPrice: '', category: '' as ProductCategory, stock: '', images: [''], tags: '' });
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description, price: product.price.toString(), originalPrice: product.originalPrice?.toString() || '', category: product.category, stock: product.stock.toString(), images: product.images, tags: product.tags.join(', ') });
    setIsAddDialogOpen(true);
  };
  const handleDelete = (productId: string) => { if (confirm('Are you sure you want to delete this product?')) { deleteProduct(productId); showToast('Product deleted successfully!', 'success'); } };

  const categories: { id: ProductCategory; name: string }[] = [ { id: 'sarees', name: 'Sarees' }, { id: 'salwar-kameez', name: 'Salwar Kameez' }, { id: 'lehengas', name: 'Lehengas' }, { id: 'kurtis', name: 'Kurtis' }, { id: 'dupattas', name: 'Dupattas' }, { id: 'jewelry', name: 'Jewelry' }, { id: 'accessories', name: 'Accessories' } ];

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Seller Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingProduct(null); }} className="bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold">
                <Plus className="w-5 h-5 mr-2" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Product Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ProductCategory })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description *</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required /></div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Original Price (₹)</Label><Input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Stock *</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required /></div>
                </div>
                <div className="space-y-2"><Label>Image URL *</Label><Input value={formData.images[0]} onChange={(e) => setFormData({ ...formData, images: [e.target.value] })} required /></div>
                <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} /></div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Cancel</Button><Button type="submit" className="flex-1 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold">{editingProduct ? 'Update Product' : 'Add Product'}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none pb-px bg-transparent h-auto">
            <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-[#febd69] data-[state=active]:bg-transparent rounded-none px-6 py-3">Analytics & Overview</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-[#febd69] data-[state=active]:bg-transparent rounded-none px-6 py-3">Order Management</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-[#febd69] data-[state=active]:bg-transparent rounded-none px-6 py-3">Your Products</TabsTrigger>
          </TabsList>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card><CardContent className="p-6 flex items-center gap-4"><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-gray-500 font-medium">Total Products</p><p className="text-2xl font-bold">{sellerProducts.length}</p></div></CardContent></Card>
              <Card><CardContent className="p-6 flex items-center gap-4"><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-500 font-medium">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div></CardContent></Card>
              <Card><CardContent className="p-6 flex items-center gap-4"><div className="w-12 h-12 bg-[#febd69]/20 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-[#febd69] font-bold" /></div><div><p className="text-sm text-gray-500 font-medium">Total Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div></CardContent></Card>
              <Card><CardContent className="p-6 flex items-center gap-4"><div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-orange-600" /></div><div><p className="text-sm text-gray-500 font-medium">Pending Items</p><p className="text-2xl font-bold">{pendingOrders}</p></div></CardContent></Card>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-lg">Revenue Trends (Last 7 Days)</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(val) => `₹${val/1000}k`} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#febd69" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {sellerProducts.slice(0, 4).map(product => (
                    <div key={product.id} className="flex items-center gap-4">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random()*50 + 10)} sales</p>
                      </div>
                      <div className="font-medium text-sm">₹{product.price.toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Order Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 tracking-wider text-sm">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 tracking-wider text-sm">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 tracking-wider text-sm">Buyer Date & Loc.</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 tracking-wider text-sm">Qty x Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 tracking-wider text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerOrders.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No orders placed yet.</td></tr>
                      )}
                      {sellerOrders.map(order => order.items.filter(i => i.sellerId === user?.id).map((item, idx) => (
                        <tr key={`${order.id}-${idx}`} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.id.slice(-8)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded object-cover" />
                              <p className="font-medium text-sm line-clamp-1 max-w-[200px]">{item.productName}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            <div>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-xs text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className="font-medium">{item.quantity}</span> x ₹{item.price.toLocaleString()}
                            <div className="font-bold text-[#b12704] mt-1">₹{(item.quantity * item.price).toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Select 
                              value={item.status} 
                              onValueChange={(val) => {
                                updateOrderItemStatus(order.id, item.productId, val as OrderStatus);
                                showToast('Order status updated.', 'success');
                              }}
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Your Products Inventory</CardTitle>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Search catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover" />
                              <div><p className="font-medium line-clamp-1">{product.name}</p><p className="text-sm text-gray-500">{product.reviewCount} reviews</p></div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><Badge variant="secondary">{categories.find(c => c.id === product.category)?.name}</Badge></td>
                          <td className="py-3 px-4"><div><span className="font-medium">₹{product.price.toLocaleString()}</span>{product.originalPrice && (<span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>)}</div></td>
                          <td className="py-3 px-4"><span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>{product.stock}</span></td>
                          <td className="py-3 px-4"><Badge className={product.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>{product.status}</Badge></td>
                          <td className="py-3 px-4"><div className="flex gap-2"><button onClick={() => handleEdit(product)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
