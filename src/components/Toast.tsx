import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store';

export function Toast() {
  const { toast, clearToast } = useUIStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-4 md:right-4 top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 z-[100] animate-slide-in-right w-max max-w-[90vw]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        <button 
          onClick={clearToast}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
