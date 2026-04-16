import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useUIStore } from '@/store';
import type { Product } from '@/types';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: Props) {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { showToast, setCartOpen } = useUIStore();

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
    setCartOpen(true);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="grid sm:grid-cols-2">
          <div className="relative bg-gray-100 dark:bg-gray-700 h-64 sm:h-full">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500">{discount}% OFF</Badge>
            )}
          </div>
          <div className="p-6 flex flex-col justify-between dark:bg-gray-800">
            <div>
              <p className="text-xs text-gray-500 mb-1">{product.sellerName}</p>
              <h2 className="text-lg font-bold text-[#0f1111] mb-2">{product.name}</h2>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#ffa41c] text-[#ffa41c]' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-[#b12704]">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{product.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {product.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <p className={`text-sm font-medium mb-4 ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-[#febd69] hover:bg-[#f90] text-[#131921] font-bold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { onClose(); navigate(`/product/${product.id}`); }}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
