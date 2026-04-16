import { useState, useMemo } from 'react';
import { 
  Plus, Package, DollarSign, ShoppingBag, TrendingUp,
  Edit, Trash2, Search, Copy, PlusCircle, MinusCircle
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '' as ProductCategory, stock: '', images: ['', '', '', ''], tags: '',
    specs: [{ key: '', value: '' }] as { key: string; value: string }[],
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
      // Only show actual revenue, 0 if no orders that day
      data.push({ name: dateStr, revenue: dailyRev });
    }
    return data;
  }, [sellerOrders, user?.id]);

  const filteredProducts = sellerProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      showToast('Please select a category', 'error');
      return;
    }
    const productData = {
      name: formData.name, description: formData.description,
      price: Number(formData.price), originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category, images: formData.images.filter(img => img),
      stock: Number(formData.stock), status: 'active' as ProductStatus,
      sellerId: user?.id || '', sellerName: user?.name || '',
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      specifications: Object.fromEntries(formData.specs.filter(s => s.key && s.value).map(s => [s.key, s.value])),
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast('Product updated successfully!', 'success');
      } else {
        await addProduct(productData);
        showToast('Product added successfully!', 'success');
      }
      resetForm();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => setFormData({ name: '', description: '', price: '', originalPrice: '', category: '' as ProductCategory, stock: '', images: ['', '', '', ''], tags: '', specs: [{ key: '', value: '' }] });
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const imgs = [...product.images, '', '', '', ''].slice(0, 4);
    const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value: value as string }));
    if (specs.length === 0) specs.push({ key: '', value: '' });
    setFormData({ name: product.name, description: product.description, price: product.price.toString(), originalPrice: product.originalPrice?.toString() || '', category: product.category, stock: product.stock.toString(), images: imgs, tags: product.tags.join(', '), specs });
    setIsAddDialogOpen(true);
  };
  const handleDelete = (productId: string) => { if (confirm('Are you sure you want to delete this product?')) { deleteProduct(productId); showToast('Product deleted successfully!', 'success'); } };
  const handleDuplicate = (product: any) => {
    const imgs = [...product.images, '', '', '', ''].slice(0, 4);
    const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value: value as string }));
    if (specs.length === 0) specs.push({ key: '', value: '' });
    setEditingProduct(null);
    setFormData({ name: `${product.name} (Copy)`, description: product.description, price: product.price.toString(), originalPrice: product.originalPrice?.toString() || '', category: product.category, stock: product.stock.toString(), images: imgs, tags: product.tags.join(', '), specs });
    setIsAddDialogOpen(true);
  };

  const categories: { id: ProductCategory; name: string }[] = [ { id: 'sarees', name: 'Sarees' }, { id: 'salwar-kameez', name: 'Salwar Kameez' }, { id: 'lehengas', name: 'Lehengas' }, { id: 'kurtis', name: 'Kurtis' }, { id: 'dupattas', name: 'Dupattas' }, { id: 'jewelry', name: 'Jewelry' }, { id: 'accessories', name: 'Accessories' } ];

  return (
    <div className="min-h-screen bg-[#e3e6e6] dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111] dark:text-white">Seller Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
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
                <div className="space-y-2">
                  <Label>Image URLs (up to 4) *</Label>
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder={idx === 0 ? 'Main image URL *' : `Image ${idx + 1} URL (optional)`}
                        value={img}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !val.startsWith('http')) return; // basic URL validation
                          const imgs = [...formData.images];
                          imgs[idx] = val;
                          setFormData({ ...formData, images: imgs });
                        }}
                        required={idx === 0}
                      />
                      {img && (
                        <img src={img} alt="" className="w-10 h-10 rounded object-cover border flex-shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} /></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Specifications (e.g. Fabric: Silk)</Label>
                    <button type="button" onClick={() => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] })} className="text-[#007185] hover:text-[#febd69] flex items-center gap-1 text-xs">
                      <PlusCircle className="w-3 h-3" />Add row
                    </button>
                  </div>
                  {formData.specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input placeholder="Key (e.g. Fabric)" value={spec.key} onChange={e => { const s = [...formData.specs]; s[idx].key = e.target.value; setFormData({ ...formData, specs: s }); }} className="flex-1" />
                      <Input placeholder="Value (e.g. Silk)" value={spec.value} onChange={e => { const s = [...formData.specs]; s[idx].value = e.target.value; setFormData({ ...formData, specs: s }); }} className="flex-1" />
                      {formData.specs.length > 1 && (
                        <button type="button" onClick={() => setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600">
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold">{isSubmitting ? <><div className="w-4 h-4 border-2 border-[#131921] border-t-transparent rounded-full animate-spin mr-2" />Saving...</> : editingProduct ? 'Update Product' : 'Add Product'}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none pb-px bg-transparent h-auto">
            <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-[#febd69] data-[state=active]:bg-transparent rounded-none px-6 py-3">Analytics & Overview</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-[#febd69] data-[state=active]:bg-transparent rounded-none px-6 py-3 relative">
              Order Management
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingOrders}
                </span>
              )}
            </TabsTrigger>
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
                <CardHeader><CardTitle className="text-lg">Revenue by Product</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {useMemo(() => {
                    const revenueMap: Record<string, { name: string; image: string; revenue: number; qty: number }> = {};
                    sellerOrders.forEach(order => {
                      order.items.forEach(item => {
                        if (item.sellerId === user?.id) {
                          if (!revenueMap[item.productId]) {
                            revenueMap[item.productId] = { name: item.productName, image: item.productImage, revenue: 0, qty: 0 };
                          }
                          revenueMap[item.productId].revenue += item.price * item.quantity;
                          revenueMap[item.productId].qty += item.quantity;
                        }
                      });
                    });
                    return Object.values(revenueMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
                  }, [sellerOrders, user?.id]).map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.qty} sold</p>
                      </div>
                      <span className="text-sm font-bold text-[#b12704]">₹{p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                  {sellerOrders.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>
                  )}
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
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 tracking-wider text-sm">Order ID</th>
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
                        <tr key={`${order.id}-${idx}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm tracking-wider">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover" />
                              <div><p className="font-medium line-clamp-1">{product.name}</p><p className="text-sm text-gray-500">{product.reviewCount} reviews</p></div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><Badge variant="secondary">{categories.find(c => c.id === product.category)?.name}</Badge></td>
                          <td className="py-3 px-4"><div><span className="font-medium">₹{product.price.toLocaleString()}</span>{product.originalPrice && (<span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>)}</div></td>
                          <td className="py-3 px-4"><span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>{product.stock}</span></td>
                          <td className="py-3 px-4"><Badge className={product.status === 'active' ? 'bg-green-500 cursor-pointer' : 'bg-gray-500 cursor-pointer'} onClick={() => { updateProduct(product.id, { status: product.status === 'active' ? 'inactive' : 'active' }); showToast(`Product ${product.status === 'active' ? 'deactivated' : 'activated'}.`, 'success'); }}>{product.status}</Badge></td>
                          <td className="py-3 px-4"><div className="flex gap-2"><button onClick={() => handleEdit(product)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button><button onClick={() => handleDuplicate(product)} className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600 transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button><button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
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
