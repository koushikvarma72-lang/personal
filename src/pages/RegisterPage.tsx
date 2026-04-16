import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Store, Phone } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithProvider } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!formData.agreeTerms) {
      showToast('Please agree to the terms and conditions', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register(formData.name, formData.email, formData.password, userType);
      if (success) {
        showToast(`Account created successfully! Welcome as a ${userType}.`, 'success');
        navigate(userType === 'seller' ? '/seller' : '/');
      }
    } catch (error: any) {
      const msg: string = error?.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
      // If email already exists, nudge them to login
      if (msg.toLowerCase().includes('already exists')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#e3e6e6] dark:from-gray-900 via-purple-50 dark:via-gray-900 to-orange-50 dark:to-gray-900 flex items-center justify-center py-12 px-4">
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

        <Card className="shadow-xl border-0 dark:bg-gray-800 dark:border dark:border-gray-700">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join our community of buyers and sellers</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* User Type Tabs */}
            <Tabs value={userType} onValueChange={(v) => setUserType(v as 'buyer' | 'seller')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buyer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  I'm a Buyer
                </TabsTrigger>
                <TabsTrigger value="seller" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  I'm a Seller
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="buyer" className="mt-0">
                <p className="text-sm text-gray-500 text-center py-2">
                  Shop from thousands of authentic Indian products
                </p>
              </TabsContent>
              <TabsContent value="seller" className="mt-0">
                <p className="text-sm text-gray-500 text-center py-2">
                  Start selling your products to millions of customers
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                  }
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                  I agree to the{' '}
                  <Link to="#" className="text-[#007185] hover:text-[#febd69]">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="#" className="text-[#007185] hover:text-[#febd69]">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : `Create ${userType === 'buyer' ? 'Buyer' : 'Seller'} Account`}
              </Button>
            </form>

            <Separator />

            {/* Social Sign Up */}
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500">Or sign up with</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-11" type="button" onClick={() => handleOAuth('google')}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-11" type="button" onClick={() => handleOAuth('facebook')}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#007185] hover:text-[#febd69] font-medium">
                Sign in
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
