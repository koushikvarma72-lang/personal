import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  Product, 
  Cart, 
  CartItem, 
  Order, 
  OrderStatus,
  ProductFilters,
  ProductCategory
} from '@/types';
import { supabase } from '@/lib/supabase';

// Auth Store
export interface LoginResult {
  success: boolean;
  roleMismatch?: boolean;
  currentRole?: 'buyer' | 'seller';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'buyer' | 'seller') => Promise<LoginResult>;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchRole: (newRole: 'buyer' | 'seller') => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string, role?: 'buyer' | 'seller'): Promise<LoginResult> => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(error.message);
        }

        let profileData = null;
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.warn('Profile fetch error:', profileError);
          }

          profileData = profile;

          if (!profileData) {
            throw new Error("User profile not found. Please register again.");
          }

          // Role mismatch — don't throw, return structured result
          if (role && profileData.role !== role) {
            // Sign out so the session isn't left dangling
            await supabase.auth.signOut();
            return { success: false, roleMismatch: true, currentRole: profileData.role };
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profileData?.name || email.split('@')[0],
          role: profileData.role,
          avatar: profileData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date(data.user.created_at || Date.now()),
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      },

      loginWithProvider: async (provider: 'google' | 'facebook') => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          }
        });
        if (error) {
          throw new Error(error.message);
        }
      },

      register: async (name: string, email: string, password: string, role: 'buyer' | 'seller') => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          // 422 = email already registered
          if (error.status === 422 || error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already exists')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }
          throw new Error(error.message);
        }

        // Supabase returns a user with identities=[] when email is already taken (no-email-confirm mode)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }

        if (data.user) {
          // ✅ INSERT into profiles table
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              name,
              role,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              email
            }
          ]);

          if (profileError) {
            throw new Error(profileError.message);
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            name,
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date(data.user.created_at || Date.now()),
          };

          set({ user, isAuthenticated: true });
        }

        return true;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      switchRole: async (newRole: 'buyer' | 'seller') => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', user.id);

        if (error) throw new Error(error.message);

        set({
          user: { ...user, role: newRole }
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart Store
interface CartState {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
      },

      addToCart: (product: Product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.items.find(item => item.product.id === product.id);
        
        let newItems: CartItem[];
        if (existingItem) {
          newItems = cart.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...cart.items, { product, quantity }];
        }
        
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ cart: { items: newItems, total, itemCount } });
      },

      removeFromCart: (productId: string) => {
        const { cart } = get();
        const newItems = cart.items.filter(item => item.product.id !== productId);
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ cart: { items: newItems, total, itemCount } });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const { cart } = get();
        const newItems = cart.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ cart: { items: newItems, total, itemCount } });
      },

      clearCart: () => {
        set({ cart: { items: [], total: 0, itemCount: 0 } });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Product Store
interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  filters: ProductFilters;
  sellerProducts: Product[];
  fetchProducts: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory) => Product[];
  getFeaturedProducts: () => Product[];
  getDeals: () => Product[];
  applyFilters: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
      products: [],
      filteredProducts: [],
      filters: {},
      sellerProducts: [],

      fetchProducts: async () => {
        const { data, error } = await supabase.from('products').select('*');
        if (data) {
          const formatted = data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            category: p.category as ProductCategory,
            images: p.images || [],
            stock: Number(p.stock),
            status: p.status,
            sellerId: p.seller_id,
            sellerName: p.seller_name,
            rating: Number(p.rating),
            reviewCount: Number(p.review_count),
            tags: p.tags || [],
            specifications: p.specifications || {},
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          }));
          const user = useAuthStore.getState().user;
          set({ 
            products: formatted, 
            filteredProducts: formatted,
            sellerProducts: user ? formatted.filter(x => x.sellerId === user.id) : []
          });
          get().applyFilters();
        } else if (error) {
          console.error("Error fetching products:", error);
        }
      },

      setFilters: (filters) => {
        set({ filters });
        get().applyFilters();
      },

      applyFilters: () => {
        const { products, filters } = get();
        let filtered = [...products];

        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters.minPrice !== undefined) {
          filtered = filtered.filter(p => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
          filtered = filtered.filter(p => p.price <= filters.maxPrice!);
        }

        if (filters.rating) {
          filtered = filtered.filter(p => p.rating >= filters.rating!);
        }

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.tags.some(tag => tag.toLowerCase().includes(search))
          );
        }

        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price-low':
              filtered.sort((a, b) => a.price - b.price);
              break;
            case 'price-high':
              filtered.sort((a, b) => b.price - a.price);
              break;
            case 'rating':
              filtered.sort((a, b) => b.rating - a.rating);
              break;
            case 'newest':
              filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case 'popular':
              filtered.sort((a, b) => b.reviewCount - a.reviewCount);
              break;
          }
        }

        set({ filteredProducts: filtered });
      },

      addProduct: async (productData) => {
        const { error } = await supabase.from('products').insert([{
           name: productData.name,
           description: productData.description,
           price: productData.price,
           original_price: productData.originalPrice,
           category: productData.category,
           images: productData.images,
           stock: productData.stock,
           status: productData.status,
           seller_id: productData.sellerId,
           seller_name: productData.sellerName,
           tags: productData.tags,
           specifications: productData.specifications
        }]);
        if (!error) get().fetchProducts();
      },

      updateProduct: async (id, updates) => {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.images !== undefined) payload.images = updates.images;
        if (updates.stock !== undefined) payload.stock = updates.stock;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.tags !== undefined) payload.tags = updates.tags;

        await supabase.from('products').update(payload).eq('id', id);
        get().fetchProducts();
      },

      deleteProduct: async (id) => {
        await supabase.from('products').delete().eq('id', id);
        get().fetchProducts();
      },

      getProductById: (id) => {
        return get().products.find(p => p.id === id);
      },

      getProductsByCategory: (category) => {
        return get().products.filter(p => p.category === category);
      },

      getFeaturedProducts: () => {
        return get().products
          .filter(p => p.rating >= 4.5)
          .slice(0, 6);
      },

      getDeals: () => {
        return get().products
          .filter(p => p.originalPrice && p.originalPrice > p.price)
          .slice(0, 4);
      },
    })
);

// Order Store
interface OrderState {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderItemStatus: (orderId: string, productId: string, status: Order['status']) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
}

export const useOrderStore = create<OrderState>((set, get) => ({
      orders: [],

      fetchOrders: async () => {
        const { data: ordersData } = await supabase.from('orders').select('*');
        if (ordersData) {
          const { data: itemsData } = await supabase.from('order_items').select('*');
          
          const formattedOrders: Order[] = ordersData.map(o => {
            const currentItems = (itemsData || []).filter(i => i.order_id === o.id).map(i => ({
              productId: i.product_id,
              productName: i.product_name,
              productImage: i.product_image,
              price: Number(i.price),
              quantity: Number(i.quantity),
              total: Number(i.total),
              sellerId: i.seller_id,
              status: i.status as OrderStatus,
            }));
            
            return {
              id: o.id,
              userId: o.user_id,
              items: currentItems,
              subtotal: Number(o.subtotal),
              shipping: Number(o.shipping),
              tax: Number(o.tax),
              total: Number(o.total),
              status: o.status as OrderStatus,
              paymentStatus: o.payment_status as any,
              shippingAddress: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
              createdAt: new Date(o.created_at),
              updatedAt: new Date(o.updated_at),
            };
          });
          set({ orders: formattedOrders });
        }
      },

      addOrder: async (orderData) => {
        const { data: order } = await supabase.from('orders').insert([{
          user_id: orderData.userId,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          tax: orderData.tax,
          total: orderData.total,
          status: orderData.status,
          payment_status: orderData.paymentStatus,
          shipping_address: orderData.shippingAddress,
        }]).select().single();

        if (order) {
          const itemsToInsert = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            seller_id: item.sellerId,
            status: item.status
          }));
          await supabase.from('order_items').insert(itemsToInsert);
          get().fetchOrders();
          return order.id;
        }
        return undefined;
      },

      updateOrderStatus: async (orderId, status) => {
        await supabase.from('orders').update({ status }).eq('id', orderId);
        get().fetchOrders();
      },

      updateOrderItemStatus: async (orderId, productId, status) => {
        await supabase.from('order_items').update({ status }).match({ order_id: orderId, product_id: productId });
        get().fetchOrders();
      },

      getUserOrders: (userId) => {
        return get().orders.filter(o => o.userId === userId);
      },

      getSellerOrders: (sellerId) => {
        return get().orders.filter(o => 
          o.items.some(item => item.sellerId === sellerId)
        );
      },
    })
);

// UI Store
interface UIState {
  isSearchOpen: boolean;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isCartOpen: false,
  isMobileMenuOpen: false,
  toast: null,

  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
