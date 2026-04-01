// User Types
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: Address;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Product Types
export type ProductCategory = 
  | 'sarees' 
  | 'salwar-kameez' 
  | 'lehengas' 
  | 'kurtis' 
  | 'dupattas' 
  | 'jewelry' 
  | 'accessories';

export type ProductStatus = 'active' | 'inactive' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  status: ProductStatus;
  sellerId: string;
  sellerName: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  sellerId: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
}

// Category Types
export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

// Filter Types
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

// Deal Types
export interface Deal {
  id: string;
  productId: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  stock: number;
  sold: number;
}
