import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart } from "@/services/cart.service";

interface CartState {
  items: any[];
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
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
      })

      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
        state.items = [];
      });
  },
});

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;