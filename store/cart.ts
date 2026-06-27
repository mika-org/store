import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  size: string;
  color: string;
  qty: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem, qty = 1) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.size === newItem.size &&
            item.color === newItem.color
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingItemIndex].qty + qty;
          // Check stock limit
          updatedItems[existingItemIndex].qty = Math.min(newQty, newItem.stock);
          set({ items: updatedItems });
        } else {
          set({
            items: [...currentItems, { ...newItem, qty: Math.min(qty, newItem.stock) }],
          });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.size === size &&
                item.color === color
              )
          ),
        });
      },

      updateQty: (productId, size, color, qty) => {
        const currentItems = get().items;
        const itemIndex = currentItems.findIndex(
          (item) =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
        );

        if (itemIndex > -1) {
          const updatedItems = [...currentItems];
          // Limit qty between 1 and stock
          updatedItems[itemIndex].qty = Math.max(
            1,
            Math.min(qty, updatedItems[itemIndex].stock)
          );
          set({ items: updatedItems });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.qty, 0);
      },

      setItems: (items) => set({ items }),
    }),
    {
      name: 'toko-baju-cart', // Unique name for localstorage key
    }
  )
);
