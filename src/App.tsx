import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useProductStore, useOrderStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toast } from '@/components/Toast';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SellerDashboard } from '@/pages/SellerDashboard';
import { OrdersPage } from '@/pages/OrdersPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchProducts } = useProductStore();
  const { fetchOrders } = useOrderStore();

  useEffect(() => {
    // Restore session on page refresh
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !useAuthStore.getState().isAuthenticated) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const email = session.user.email ?? '';
        useAuthStore.setState({
          isAuthenticated: true,
          user: {
            id: session.user.id,
            email,
            name: profile?.name || session.user.user_metadata?.full_name || email.split('@')[0],
            role: profile?.role || 'buyer',
            avatar:
              session.user.user_metadata?.avatar_url ||
              profile?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date(session.user.created_at || Date.now()),
          },
        });
      }
    });

    fetchProducts();
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchProducts, fetchOrders]);

  // Listen for Supabase auth changes (e.g. after Google OAuth redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const authStore = useAuthStore.getState();
        if (!authStore.isAuthenticated) {
          // Fetch profile from DB to get role/name
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const email = session.user.email ?? '';
          authStore.updateProfile({
            id: session.user.id,
            email,
            name: profile?.name || session.user.user_metadata?.full_name || email.split('@')[0],
            role: profile?.role || 'buyer',
            avatar:
              session.user.user_metadata?.avatar_url ||
              profile?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date(session.user.created_at || Date.now()),
          });
          // Mark as authenticated in the store
          useAuthStore.setState({ isAuthenticated: true });
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children, requireSeller = false, requireBuyer = false }: { children: React.ReactNode; requireSeller?: boolean; requireBuyer?: boolean }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (requireSeller && user?.role !== 'seller') {
      return <Navigate to="/" replace />;
    }
    if (requireBuyer && user?.role === 'seller') {
      return <Navigate to="/seller" replace />;
    }
    return children;
  };

  const BuyerRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated && user?.role === 'seller') {
      return <Navigate to="/seller" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#e3e6e6]">
        <Header />
        <main className="pt-[60px]">
          <Routes>
            <Route path="/" element={
              <BuyerRoute>
                <HomePage />
              </BuyerRoute>
            } />
            <Route path="/products" element={
              <BuyerRoute>
                <ProductsPage />
              </BuyerRoute>
            } />
            <Route path="/product/:id" element={
              <BuyerRoute>
                <ProductDetailPage />
              </BuyerRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute requireSeller>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute requireBuyer>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <Toast />
      </div>
    </Router>
  );
}

export default App;
