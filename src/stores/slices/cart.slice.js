export const createCartSlice = (set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      state.cart.push(product); // Immer handle immutability
    }),
  removeFromCart: (productId) =>
    set((state) => {
      state.cart = state.cart.filter((item) => item.id !== productId);
    }),
  clearCart: () => set({ cart: [] }),
});
