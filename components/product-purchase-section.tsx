'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, Plus, Minus, Check } from 'lucide-react';

interface ProductPurchaseSectionProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
    size: string[];
    color: string[];
  };
}

export default function ProductPurchaseSection({ product }: ProductPurchaseSectionProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSize, setSelectedSize] = useState(product.size[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.color[0] || '');
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const incrementQty = () => {
    if (qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
        stock: product.stock,
      },
      qty
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) return;

    // Add to cart
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
        stock: product.stock,
      },
      qty
    );

    // Redirect to checkout
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      {product.size && product.size.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-foreground">Select Size</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase">{selectedSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.size.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`flex h-10 min-w-10 items-center justify-center rounded-md border text-sm font-semibold px-2 transition-all ${
                  selectedSize === size
                    ? 'border-foreground bg-foreground text-background shadow-sm'
                    : 'border-input hover:border-foreground'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {product.color && product.color.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-foreground">Select Color</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.color.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-md border text-xs font-semibold transition-all ${
                  selectedColor === color
                    ? 'border-foreground bg-foreground text-background shadow-sm'
                    : 'border-input hover:border-foreground'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-foreground">Quantity</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-input rounded-md bg-background">
            <button
              type="button"
              onClick={decrementQty}
              className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              onClick={incrementQty}
              className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={qty >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {product.stock} items available
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="button"
          onClick={handleAddToCart}
          variant="outline"
          size="lg"
          className="flex-1 gap-2 font-bold"
          disabled={product.stock === 0}
        >
          {addedToCart ? (
            <>
              <Check className="h-5 w-5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </>
          )}
        </Button>
        
        <Button
          type="button"
          onClick={handleBuyNow}
          size="lg"
          className="flex-1 gap-2 font-bold"
          disabled={product.stock === 0}
        >
          <ShoppingBag className="h-5 w-5" /> Buy Now
        </Button>
      </div>
    </div>
  );
}
