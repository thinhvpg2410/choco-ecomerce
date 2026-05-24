import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart } from "@/services/cart.service";

interface CartState {
  items: any[];
  loading: boolean;
  total: number;
}

const initialState: CartState = {
  items: [],
  loading: false,
  total: 0,
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const cart = await getCart();
  return cart?.items || [];
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState(state) {
      state.items = [];
      state.total = 0; 
    },
    restoreCartState: (state, action) => {
      state.items = action.payload;
      state.total = action.payload.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = action.payload.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0,
        );
      })

      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
        state.items = [];
      });
  },
});

export const { clearCartState, restoreCartState } = cartSlice.actions;

export default cartSlice.reducer;