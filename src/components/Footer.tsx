import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronUp, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { showToast } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      showToast('Successfully subscribed to newsletter!', 'success');
      setEmail('');
    }
  };

  const footerLinks = {
    'Get to Know Us': [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Releases', href: '#' },
      { label: 'Our Story', href: '#' },
    ],
    'Connect with Us': [
      { label: 'Facebook', href: '#', icon: Facebook },
      { label: 'Twitter', href: '#', icon: Twitter },
      { label: 'Instagram', href: '#', icon: Instagram },
      { label: 'YouTube', href: '#', icon: Youtube },
    ],
    'Make Money with Us': [
      { label: 'Sell on SareeBazaar', href: '/register' },
      { label: 'Become an Affiliate', href: '#' },
      { label: 'Advertise Your Products', href: '#' },
      { label: 'Seller Success Stories', href: '#' },
    ],
    'Let Us Help You': [
      { label: 'Your Account', href: '/profile' },
      { label: 'Returns Centre', href: '/orders' },
      { label: '100% Purchase Protection', href: '#' },
      { label: 'Help', href: '#' },
    ],
  };

  return (
    <footer className="bg-[#232f3e] text-white">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-4 text-sm font-medium transition-colors relative overflow-hidden group"
      >
        <span className="relative z-10">Back to Top</span>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-[#febd69] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </button>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - About */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0ms' }}>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#febd69] to-[#f90] rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-[#131921]" />
              </div>
              <span className="text-xl font-bold">
                Saree<span className="text-[#febd69]">Bazaar</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your one-stop destination for authentic Indian traditional wear. 
              We bring you the finest collection of sarees, lehengas, and jewelry 
              directly from skilled artisans across India.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-[#febd69]" />
                <span>support@sareebazaar.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-[#febd69]" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-[#febd69]" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="font-bold text-lg mb-4">Get to Know Us</h3>
            <ul className="space-y-2">
              {footerLinks['Get to Know Us'].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-[#febd69] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Make Money */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="font-bold text-lg mb-4">Make Money with Us</h3>
            <ul className="space-y-2">
              {footerLinks['Make Money with Us'].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-[#febd69] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe for exclusive deals and new arrivals.
            </p>
            
            {isSubscribed ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ChevronUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-400 font-medium">Thank you for subscribing!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#febd69]"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-medium"
                >
                  Subscribe
                </Button>
              </form>
            )}

            {/* Social Links */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {footerLinks['Connect with Us'].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#febd69] hover:text-[#131921] transition-all duration-300 hover:rotate-[360deg]"
                    aria-label={link.label}
                  >
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <Link to="#" className="hover:text-white transition-colors">Conditions of Use</Link>
              <Link to="#" className="hover:text-white transition-colors">Privacy Notice</Link>
              <Link to="#" className="hover:text-white transition-colors">Interest-Based Ads</Link>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SareeBazaar. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 bg-[#febd69] hover:bg-[#f90] text-[#131921] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${
          scrollProgress > 10 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        aria-label="Back to top"
      >
        <ChevronUp className="w-6 h-6" />
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#131921"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
            className="transition-all duration-100"
          />
        </svg>
      </button>
    </footer>
  );
}
