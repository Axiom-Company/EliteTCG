import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from './CartItem';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    subtotal,
    shipping,
    total,
    freeShippingThreshold
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeCart]);

  if (!isCartOpen) return null;

  const amountToFreeShipping = freeShippingThreshold - subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-gray-500 mb-6">Add some products to get started</p>
              <Link
                to="/products"
                onClick={closeCart}
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="py-2">
              {cart.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-white">
            {/* Free shipping progress */}
            {amountToFreeShipping > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Add <span className="font-medium text-gray-900">R{amountToFreeShipping.toLocaleString()}</span> more for free shipping
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFCB32] rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">R{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `R${shipping}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">R{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full py-3 bg-gray-900 text-white text-center text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              onClick={closeCart}
              className="block w-full py-2 mt-2 text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
