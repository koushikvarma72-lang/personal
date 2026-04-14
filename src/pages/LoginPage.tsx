import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Store, User, ArrowRightLeft } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithProvider, switchRole } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loginType, setLoginType] = useState<'buyer' | 'seller'>('buyer');

  // Role mismatch state
  const [showSwitchOption, setShowSwitchOption] = useState(false);
  const [currentRole, setCurrentRole] = useState<'buyer' | 'seller' | null>(null);

  const handleTabChange = (val: string) => {
    setLoginType(val as 'buyer' | 'seller');
    setShowSwitchOption(false);
    setCurrentRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSwitchOption(false);

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, loginType);
      if (result.success) {
        showToast(`Welcome back!`, 'success');
        navigate(loginType === 'seller' ? '/seller' : '/');
      } else if (result.roleMismatch) {
        setCurrentRole(result.currentRole ?? null);
        setShowSwitchOption(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      // Login without role check first
      const result = await login(email, password);
      if (result.success) {
        await switchRole(loginType);
        showToast(`Switched to ${loginType} successfully!`, 'success');
        navigate(loginType === 'seller' ? '/seller' : '/');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to switch role', 'error');
    } finally {
      setIsSwitching(false);
      setShowSwitchOption(false);
    }
  };

  const handleLoginAsCurrentRole = async () => {
    if (!currentRole) return;
    setIsSwitching(true);
    try {
      const result = await login(email, password, currentRole);
      if (result.success) {
        showToast(`Welcome back!`, 'success');
        navigate(currentRole === 'seller' ? '/seller' : '/');
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setIsSwitching(false);
      setShowSwitchOption(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      await loginWithProvider(provider);
    } catch (error) {
      showToast(`${provider} login failed`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3e6e6] via-purple-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#febd69] to-[#f90] rounded-xl flex items-center justify-center shadow-lg">
            <Store className="w-7 h-7 text-[#131921]" />
          </div>
          <span className="text-2xl font-bold text-[#131921]">
            Saree<span className="text-[#febd69]">Bazaar</span>
          </span>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Login Type Tabs */}
            <Tabs value={loginType} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buyer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Buyer
                </TabsTrigger>
                <TabsTrigger value="seller" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Seller
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link to="#" className="text-[#007185] hover:text-[#febd69]">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : `Sign in as ${loginType === 'buyer' ? 'Buyer' : 'Seller'}`}
              </Button>
            </form>

            {/* Role Mismatch Switch UI */}
            {showSwitchOption && currentRole && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <ArrowRightLeft className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    You're currently registered as a{' '}
                    <span className="capitalize font-bold">{currentRole}</span>.
                  </p>
                </div>
                <p className="text-xs text-amber-600">
                  Want to switch to {loginType}? This will update your account role.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={handleLoginAsCurrentRole}
                    disabled={isSwitching}
                  >
                    Continue as {currentRole}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold"
                    onClick={handleSwitch}
                    disabled={isSwitching}
                  >
                    {isSwitching ? 'Switching...' : `Switch to ${loginType}`}
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Social Login */}
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500">Or continue with</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-11" onClick={() => handleOAuth('google')}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-11" onClick={() => handleOAuth('facebook')}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#007185] hover:text-[#febd69] font-medium">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#007185]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
