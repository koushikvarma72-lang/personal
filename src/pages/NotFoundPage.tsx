import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3e6e6] via-purple-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">

        {/* Animated 404 Number */}
        <div className="relative flex items-center justify-center mb-8 select-none">
          <span
            className="text-[180px] font-black text-transparent leading-none"
            style={{
              WebkitTextStroke: '3px #febd69',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            4
          </span>
          {/* Spinning circle in the middle "0" */}
          <div
            className="w-28 h-28 rounded-full border-[12px] border-[#febd69] flex items-center justify-center mx-1"
            style={{ animation: 'spin-slow 4s linear infinite' }}
          >
            <div className="w-6 h-6 bg-[#febd69] rounded-full" />
          </div>
          <span
            className="text-[180px] font-black text-transparent leading-none"
            style={{
              WebkitTextStroke: '3px #febd69',
              animation: 'float 3s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          >
            4
          </span>

          {/* Floating sparkles */}
          <div
            className="absolute top-4 left-10 w-3 h-3 bg-purple-400 rounded-full"
            style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
          />
          <div
            className="absolute bottom-4 right-10 w-2 h-2 bg-orange-400 rounded-full"
            style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '0.8s' }}
          />
          <div
            className="absolute top-8 right-16 w-2 h-2 bg-pink-400 rounded-full"
            style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '1.4s' }}
          />
        </div>

        {/* Message */}
        <div
          className="space-y-3 mb-10"
          style={{ animation: 'fadeSlideUp 0.6s ease-out forwards', opacity: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#131921]">Page Not Found</h1>
          <p className="text-gray-500 text-lg">
            Oops! This page seems to have wandered off like a lost thread.
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animation: 'fadeSlideUp 0.6s ease-out 0.2s forwards', opacity: 0 }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-12 px-6 border-[#131921] text-[#131921] hover:bg-[#131921] hover:text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="h-12 px-6 bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          <Button
            onClick={() => navigate('/products')}
            variant="outline"
            className="h-12 px-6 border-[#febd69] text-[#febd69] hover:bg-[#febd69] hover:text-[#131921] gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Button>
        </div>
      </div>

      {/* Custom keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
