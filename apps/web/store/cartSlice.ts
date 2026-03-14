import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/type";

export interface CartProduct {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartProduct[];
}

const loadCart = (): CartProduct[] => {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem("cart");
  return data ? JSON.parse(data) : [];
};

const saveCart = (items: CartProduct[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

const initialState: CartState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>,
    ) {
      const quantity = action.payload.quantity ?? 1;

      const item = state.items.find(
        (i) => i.product.id === action.payload.product.id,
      );

      if (item) {
        item.quantity += quantity;
      } else {
        state.items.push({
          product: action.payload.product,
          quantity,
        });
      }

      saveCart(state.items);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload);

      saveCart(state.items);
    },

    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const item = state.items.find(
        (i) => i.product.id === action.payload.productId,
      );

      if (item) {
        item.quantity = action.payload.quantity;
      }

      saveCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
