import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const SHIPPING_RATE = 99;
const FREE_SHIPPING_THRESHOLD = 1000;
const STORAGE_KEY = 'eliteTCG_cart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Calculate totals
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_RATE : 0);
  const total = subtotal + shipping;

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        const newQuantity = Math.min(
          updated[existingIndex].quantity + quantity,
          updated[existingIndex].maxQuantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity
        };
        return updated;
      }

      // Add new item
      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] || null,
        quantity: Math.min(quantity, product.inventory?.quantity || 99),
        maxQuantity: product.inventory?.quantity || 99
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.maxQuantity)
        };
      }
      return item;
    }));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const value = {
    cart,
    itemCount,
    subtotal,
    shipping,
    total,
    isCartOpen,
    shippingRate: SHIPPING_RATE,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
