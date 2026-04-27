import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDelete,
  // MdLocationOn,
  MdPayment,
  MdHome,
  MdClear,
  MdShoppingCart,
  MdAdd,
  MdRemove,
} from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import { useCart as useCartContext } from '../contexts/CartContext';
import { useAuthStore } from '../stores/authStore';
import { useCart, useRemoveFromCart, useSetPickup } from '../api/hooks/index';
// import {
//   useAddOrder,
//   useCheckoutOrder } from '../api/ordersApi';
import { useDecodeToken } from '../api/hooks/authHooks';
import { toast } from 'react-toastify';
import './Cart.css';

// interface ShippingAddress {
//   name: string;
//   phone: string;
//   address: string;
//   city: string;
//   zipCode: string;
// }

// interface PaymentMethod {
//   id: string;
//   name: string;
//   type: 'bank' | 'ewallet' | 'cod';
//   fee: number;
// }

interface OrderingStatus {
  isOrdering: boolean;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  processedItems: number;
  totalItems: number;
  error?: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, removeFromCart } = useCartContext();
  const {
    isAuthenticated,
    // token: authToken,
    requireAuth,
  } = useAuthStore();

  // Get the referring page from location state or referrer
  const getBackDestination = () => {
    // Priority 1: Check location state for explicit 'from' parameter
    if (location.state?.from) {
      // Validate the path to ensure it's not blank or invalid
      const fromPath = location.state.from;
      if (fromPath && fromPath !== '' && fromPath !== '/') {
        return fromPath;
      }
    }

    // Priority 2: Check document.referrer and map to appropriate routes
    const referrer = document.referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;
        // Map referrer paths to appropriate back destinations
        if (referrerPath.includes('/product-detail')) {
          // Ensure we return the full product detail path
          if (referrerPath.startsWith('/product-detail/')) {
            return referrerPath;
          }
          return '/product'; // Fallback to product list if path is malformed
        }
        if (referrerPath.includes('/product')) return '/product';
        if (referrerPath.includes('/dashboard')) return '/dashboard';
        if (referrerPath.includes('/event-detail')) return referrerPath; // Return to specific event detail
        if (referrerPath.includes('/event')) return '/event';
        if (referrerPath.includes('/profile')) return '/profile';
        if (referrerPath.includes('/invoice')) return '/orders'; // Invoice should go to orders
        if (referrerPath.includes('/orders')) return '/orders';
        if (referrerPath.includes('/checkout')) return '/product'; // Checkout should go back to products
        if (referrerPath === '/' || referrerPath === '') return '/dashboard';

        // Return the referrer path if it's a valid route and not empty
        if (referrerPath && referrerPath !== '' && referrerPath !== '/') {
          return referrerPath;
        }
      } catch (error) {
        console.warn('📍 Error parsing referrer URL:', error);
      }
    }

    // Priority 3: Check if we have product info in location state
    if (location.state?.productId) {
      return `/product-detail/${location.state.productId}`;
    }

    // Priority 4: Default fallback - use product page instead of dashboard for better UX
    return '/product';
  };

  const backDestination = getBackDestination();
  // const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  // const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [orderingStatus, setOrderingStatus] = useState<OrderingStatus>({
    isOrdering: false,
    currentStep: '',
    totalSteps: 3,
    currentStepNumber: 0,
    processedItems: 0,
    totalItems: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // API hooks for cart
  const {
    data: apiCartData,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCart();

  const removeAllFromCartMutation = useRemoveFromCart();

  const setPickupMutation = useSetPickup();

  // Order API hooks
  // const addOrderMutation = useAddOrder();
  // const addItemToOrderMutation = useAddItemToOrder();
  // const checkoutOrderMutation = useCheckoutOrder();

  // Decode token hook untuk mendapatkan cost data
  const { data: decodeTokenData } = useDecodeToken();

  // Refetch cart data when component mounts to ensure fresh data
  useEffect(() => {
    if (isAuthenticated) {
      refetchCart();
    }
  }, [isAuthenticated, refetchCart]);

  // Refetch cart data when window regains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && document.visibilityState === 'visible') {
        refetchCart();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isAuthenticated, refetchCart]);

  // Refetch cart data when location changes (navigating to cart)
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/cart') {
      // Small delay to ensure any pending operations complete
      const timer = setTimeout(() => {
        refetchCart();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAuthenticated, refetchCart]);

  // Handle quantity change for API cart items
  const handleQuantityChange = async (item: any, newQuantity: number) => {
    if (!requireAuth(() => {}, 'update cart quantity')) {
      toast.warning('Silakan login untuk mengubah keranjang', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }

    try {
      // await addToCartMutation.mutateAsync({
      //   data: {
      //     sku: item.sku,
      //     qty: newQuantity.toString(),
      //   },
      // });

      refetchCart();
    } catch (error: any) {
      toast.error('Gagal memperbarui jumlah item. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleBackClick = () => {
    // Navigate to the determined back destination
    navigate(backDestination);
  };

  const handleCartClick = () => {
    console.log('Already in cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!requireAuth(() => {}, 'remove cart item')) {
      toast.warning('Silakan login untuk mengelola keranjang', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    try {
      // Find the item to get its details for the success message
      const itemToRemove = apiCartData?.content?.result?.find((item) => item.id === itemId);
      const itemName = itemToRemove?.name || 'Item';

      // Use quantity change with 0 to remove specific item via API
      // await addToCartMutation.mutateAsync({
      //   data: {
      //     sku: itemToRemove?.sku || itemId,
      //     qty: '0', // Setting quantity to 0 removes the item
      //   },
      // });

      // Remove from context cart (for immediate UI update)
      removeFromCart(itemId);

      // Show success message with item name
      toast.success(`${itemName.toUpperCase()} telah dihapus dari keranjang`, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });

      // Refresh cart data from API
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to remove item:', error);
      toast.error('Gagal menghapus item. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handlePickupToggle = async (isPickup: boolean) => {
    if (!requireAuth(() => {}, 'change pickup option')) {
      toast.warning('Silakan login untuk mengubah opsi pengambilan', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    const cartItems = apiCartData?.content?.result || [];

    if (cartItems.length === 0) {
      toast.warning('Keranjang kosong', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    try {
      const promises = cartItems.map((item) => setPickupMutation.mutateAsync(item.id));

      await Promise.all(promises);

      toast.success(
        isPickup
          ? `Berhasil mengatur pengambilan sendiri untuk ${cartItems.length} produk`
          : `Berhasil mengatur pengiriman untuk ${cartItems.length} produk`,
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        },
      );

      // Refresh cart data to get updated pickup status and shipping costs
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to set pickup option:', error);
      toast.error('Gagal mengubah opsi pengambilan. Silakan coba lagi.', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  const handleRemoveAllFromCart = async () => {
    if (!requireAuth(() => {}, 'clear cart')) {
      toast.warning('Silakan login untuk mengelola keranjang Anda', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    // Show confirmation toast with buttons
    toast(
      ({ closeToast }) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: '12px', fontWeight: '500' }}>
            Yakin ingin menghapus semua item dari keranjang?
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                closeToast();
              }}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Batal
            </button>
            <button
              onClick={async () => {
                closeToast();
                await performRemoveAll();
              }}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Hapus Semua
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      },
    );
  };

  const performRemoveAll = async () => {
    try {
      // Get current cart items
      const cartItems = apiCartData?.content?.result || [];

      if (cartItems.length === 0) {
        toast.warning('Keranjang sudah kosong', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
        return;
      }

      // Remove each item by setting quantity to 0
      // const removePromises = cartItems.map((item) =>
      //   addToCartMutation.mutateAsync({
      //     data: {
      //       sku: item.sku,
      //       qty: '0', // Setting quantity to 0 removes the item
      //     },
      //   }),
      // );

      // await Promise.all(removePromises);

      // Clear context cart as well
      cartItems.forEach((item) => removeFromCart(item.id));

      toast.success('Semua item telah dihapus dari keranjang Anda', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      refetchCart();
    } catch (error: any) {
      console.error('❌ Failed to clear cart:', error);

      let errorMessage = 'Gagal mengosongkan keranjang. Silakan coba lagi.';

      if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
    }
  };

  // Calculate total from API cart only
  const getApiCartTotal = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.amount, 0) || 0;
  };

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };

  const getShippingCost = () => {
    return (
      apiCartData?.content?.result?.reduce((total, item) => total + (item.shipping || 0), 0) || 0
    );
  };

  const getCostFromToken = () => {
    return decodeTokenData?.content?.cost || 0;
  };

  const subtotal = getApiCartTotal();
  const apiCartCount = getApiCartCount();
  const shippingCost = getShippingCost();
  const costFromToken = getCostFromToken();
  const paymentFee = 0;
  const totalPayment = subtotal + shippingCost + costFromToken + paymentFee;

  // New order flow function
  const handlePlaceOrder = async () => {
    if (!requireAuth(() => {}, 'place order')) {
      toast.warning('Silakan login untuk melakukan pemesanan', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      navigate('/login');
      return;
    }

    // if (!selectedAddress) {
    //   await Swal.fire({
    //     icon: 'warning',
    //     title: 'Address Required',
    //     text: 'Please select a shipping address',
    //     confirmButtonColor: '#f39c12',
    //   });
    //   return;
    // }

    // if (!selectedPayment) {
    //   await Swal.fire({
    //     icon: 'warning',
    //     title: 'Payment Method Required',
    //     text: 'Please select a payment method',
    //     confirmButtonColor: '#f39c12',
    //   });
    //   return;
    // }

    if (!hasApiCartItems) {
      toast.warning('Keranjang Anda kosong', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    const cartItems = apiCartData?.content?.result || [];

    // Initialize ordering status
    setOrderingStatus({
      isOrdering: true,
      currentStep: 'Creating Order...',
      totalSteps: 3,
      currentStepNumber: 1,
      processedItems: 0,
      totalItems: cartItems.length,
    });

    // try {
    //   // Step 1: Create Order (useAddOrder)
    //   // const orderResponse = await addOrderMutation.mutateAsync(authToken!);

    //   if (!orderResponse?.content?.id) {
    //     throw new Error('Failed to create order - no order ID returned');
    //   }

    //   const orderId = orderResponse.content.id;
    //   // Step 2: Add Items to Order (useAddItemToOrder)
    //   setOrderingStatus((prev) => ({
    //     ...prev,
    //     currentStep: 'Adding Items to Order...',
    //     currentStepNumber: 2,
    //   }));

    //   for (let i = 0; i < cartItems.length; i++) {
    //     const item = cartItems[i];
    //     // Update status for each item
    //     setOrderingStatus((prev) => ({
    //       ...prev,
    //       processedItems: i,
    //       currentStep: `Adding Item ${i + 1}/${cartItems.length}: ${item.name}...`,
    //     }));

    //     // const itemPayload = {
    //     //   cproduct: item.sku,
    //     //   ctax: '0',
    //     //   tqty: item.qty.toString(),
    //     //   tdiscount: '0',
    //     //   tshipping: item.pickup === "1" ? '0' : item.shipping.toString(),
    //     // };

    //     // try {
    //     //   // const itemResponse = await addItemToOrderMutation.mutateAsync({
    //     //   //   orderId,
    //     //   //   data: itemPayload,
    //     //   //   authToken: authToken!,
    //     //   // });

    //     // } catch (itemError: any) {
    //     //   throw new Error(`Failed to add item "${item.name}" to order: ${itemError.message}`);
    //     // }
    //   }

    //   // Update status for final processed items
    //   setOrderingStatus((prev) => ({
    //     ...prev,
    //     processedItems: cartItems.length,
    //   }));

    //   // Step 3: Checkout Order (useCheckoutOrder)
    //   setOrderingStatus((prev) => ({
    //     ...prev,
    //     currentStep: 'Processing Checkout...',
    //     currentStepNumber: 3,
    //   }));
    //   const checkoutResponse = await checkoutOrderMutation.mutateAsync({
    //     orderId,
    //     authToken: authToken!,
    //   });
    //   // Reset ordering status
    //   setOrderingStatus({
    //     isOrdering: false,
    //     currentStep: '',
    //     totalSteps: 3,
    //     currentStepNumber: 0,
    //     processedItems: 0,
    //     totalItems: 0,
    //   });

    //   // Check if we have an invoice_url in the response
    //   if (checkoutResponse?.content?.invoice_url) {
    //     // Clear cart after successful order
    //     await removeAllFromCartMutation.mutateAsync(authToken!);
    //     refetchCart();

    //     // Navigate to invoice page with the invoice_url
    //     navigate('/invoice', {
    //       state: {
    //         invoiceUrl: checkoutResponse.content.invoice_url,
    //         orderId: checkoutResponse.content.orderid || orderId,
    //         transId: checkoutResponse.content.transid,
    //         orderPayment: orderId,
    //       },
    //     });
    //     return;
    //   }

    //   // Show success message if no invoice_url (fallback)
    //   toast.success(`Pesanan #${orderId} telah dibuat dan sedang diproses.`, {
    //     position: 'bottom-right',
    //     autoClose: 1500,
    //     theme: 'dark',
    //   });
    //   // Clear cart after successful order
    //   await removeAllFromCartMutation.mutateAsync(authToken!);
    //   refetchCart();

    //   // Navigate to orders page or home
    //   navigate('/orders');
    // } catch (error: any) {
    //   console.error('❌ Order process failed:', error);

    //   setOrderingStatus((prev) => ({
    //     ...prev,
    //     isOrdering: false,
    //     error: error.message,
    //   }));

    //   toast.error(error.message || 'Gagal melakukan pemesanan. Silakan coba lagi.', {
    //     position: 'bottom-right',
    //     autoClose: 1500,
    //     theme: 'dark',
    //   });
    // }
  };

  const hasApiCartItems = apiCartData?.content?.result && apiCartData.content.result.length > 0;

  if ((!hasApiCartItems && !cartLoading) || apiCartData?.content?.result == null) {
    return (
      <div className="cart-page">
        <AppbarDefault
          title="Keranjang Belanja"
          onBack={handleBackClick}
          backTo={backDestination}
          onCartClick={handleCartClick}
          cartCount={cartCount}
          defaultBack="/dashboard"
        />

        <div className="cart-content">
          <div className="empty-cart">
            <img src="/nodata.png" alt="Empty Cart" className="empty-icon" />
            <h3>Keranjang Anda Kosong</h3>
            <p>Tambahkan produk ke keranjang untuk mulai belanja!</p>
            <div className="empty-cart-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
                Lanjut Belanja
              </button>
              <button className="home-btn" onClick={() => navigate('/')}>
                <MdHome /> Ke Beranda
              </button>
            </div>
          </div>
        </div>

        <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
      </div>
    );
  }

  return (
    <>
      {/* Ordering Status Modal */}
      {orderingStatus.isOrdering && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '350px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #161129',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            ></div>

            <h3
              style={{
                margin: '0 0 15px 0',
                color: '#161129',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Processing Order
            </h3>

            <p
              style={{
                margin: '0 0 20px 0',
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.4',
              }}
            >
              {orderingStatus.currentStep}
            </p>

            <div
              style={{
                background: '#f8f9ff',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                <span>
                  Step {orderingStatus.currentStepNumber} of {orderingStatus.totalSteps}
                </span>
                <span>
                  {orderingStatus.processedItems}/{orderingStatus.totalItems} items
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(orderingStatus.currentStepNumber / orderingStatus.totalSteps) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #161129, #2c5aa0)',
                    transition: 'width 0.3s ease',
                  }}
                ></div>
              </div>
            </div>

            <p
              style={{
                margin: '0',
                color: '#999',
                fontSize: '12px',
              }}
            >
              Please wait, do not close this page
            </p>
          </div>
        </div>
      )}

      <div className="cart-page">
        <AppbarDefault
          title={`Keranjang Belanja (${apiCartCount})`}
          onBack={handleBackClick}
          backTo={backDestination}
          onCartClick={handleCartClick}
          cartCount={apiCartCount}
        />

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header">
              <h3>Daftar Belanja</h3>
              {hasApiCartItems && (
                <button
                  className="remove-all-btn"
                  onClick={handleRemoveAllFromCart}
                  disabled={removeAllFromCartMutation.isPending}
                  title="Hapus semua item dari keranjang"
                >
                  <MdClear />
                  <span>
                    {removeAllFromCartMutation.isPending ? 'Menghapus...' : 'Hapus Semua'}
                  </span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {cartLoading && isAuthenticated && (
              <div className="cart-loading">
                <p>Memuat daftar belanja...</p>
              </div>
            )}

            {/* Error State */}
            {cartError && isAuthenticated && (
              <div className="cart-error">
                <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>
                  Gagal memuat keranjang dari server
                </p>
                <button
                  onClick={() => refetchCart()}
                  style={{
                    background: '#161129',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* API Cart Items */}
            {apiCartData?.content?.result?.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-content">
                  {/* Left Column - Product Image */}
                  <div className="item-image-column">
                    <img
                      src={item.image || '/nodata.png'}
                      alt={item.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/nodata.png';
                      }}
                    />
                  </div>

                  {/* Right Column - Product Info */}
                  <div className="item-info-column">
                    <div className="product-details">
                      <h4 className="item-title" style={{ textTransform: 'uppercase' }}>
                        {item.name.toUpperCase()}
                      </h4>
                      <p className="item-price">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="quantity-and-remove-section">
                      <div className="quantity-section">
                        <div
                          className="quantity-btn decrease"
                          onClick={() => handleQuantityChange(item, item.qty - 1)}
                          style={{
                            opacity: item.qty <= 1 ? 0.5 : 1,
                            pointerEvents: item.qty <= 1 ? 'none' : 'auto',
                          }}
                        >
                          <MdRemove />
                        </div>
                        <span className="quantity-value">{item.qty}</span>
                        <div
                          className="quantity-btn increase"
                          onClick={() => handleQuantityChange(item, item.qty + 1)}
                        >
                          <MdAdd />
                        </div>
                      </div>

                      <div
                        className="remove-btn-inline"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Hapus item"
                        title="Hapus item dari keranjang"
                      >
                        <MdDelete />
                      </div>
                    </div>

                    <div className="item-total-section">
                      <span className="item-total-label">Total:</span>
                      <span className="item-total">Rp {item.amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          {/* Pickup Options Section */}
          <div className="pickup-options-section">
            <h3>Opsi Pengiriman</h3>

            {/* Global Pickup Options */}
            <div className="pickup-global-options">
              <div className="pickup-radio-group">
                <label className="pickup-radio-option">
                  <input
                    type="radio"
                    name="pickup-global"
                    checked={
                      apiCartData?.content?.result?.every((item) => item.pickup === '1') || false
                    }
                    onChange={() => handlePickupToggle(true)}
                    className="pickup-radio-input"
                  />
                  <span className="pickup-radio-label">Ambil Sendiri</span>
                  <span className="pickup-radio-desc">Gratis - Untuk semua produk</span>
                </label>

                <label className="pickup-radio-option">
                  <input
                    type="radio"
                    name="pickup-global"
                    checked={
                      apiCartData?.content?.result?.every((item) => item.pickup === '0') || false
                    }
                    onChange={() => handlePickupToggle(false)}
                    className="pickup-radio-input"
                  />
                  <span className="pickup-radio-label">Pakai Ongkir</span>
                  <span className="pickup-radio-desc">
                    {shippingCost > 0
                      ? `Rp ${shippingCost.toLocaleString('id-ID')} - Untuk semua produk`
                      : 'Untuk semua produk'}
                  </span>
                </label>
              </div>
            </div>

            {/* Product List */}
            <div className="pickup-items-list">
              <h4>Produk dalam keranjang:</h4>
              <div className="pickup-items">
                {apiCartData?.content?.result?.map((item) => (
                  <div key={item.id} className="pickup-item-display">
                    <div className="pickup-item-info">
                      <img
                        src={item.image || '/nodata.png'}
                        alt={item.name}
                        className="pickup-item-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/nodata.png';
                        }}
                      />
                      <div className="pickup-item-details">
                        <h4 className="pickup-item-name">{item.name.toUpperCase()}</h4>
                        <p className="pickup-item-qty">Qty: {item.qty}</p>
                        <p className="pickup-item-status">
                          Status:{' '}
                          {item.pickup === '1' ? (
                            <span className="status-pickup">📦 Ambil Sendiri</span>
                          ) : (
                            <span className="status-shipping">
                              🚚 Kirim (Rp {item.shipping.toLocaleString('id-ID')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Ringkasan Pesanan</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({apiCartCount} item)</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              {shippingCost > 0 && (
                <div className="summary-row">
                  <span>Biaya Pengiriman</span>
                  <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              {costFromToken > 0 && (
                <div className="summary-row">
                  <span>Biaya Layanan</span>
                  <span>Rp {costFromToken.toLocaleString('id-ID')}</span>
                </div>
              )}

              {paymentFee > 0 && (
                <div className="summary-row">
                  <span>Biaya Pembayaran</span>
                  <span>Rp {paymentFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Bayar</span>
                <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="checkout-section">
            <button
              className="checkout-btn"
              onClick={handlePlaceOrder}
              disabled={orderingStatus.isOrdering || !hasApiCartItems}
            >
              {orderingStatus.isOrdering ? (
                <>
                  <div className="spinner"></div>
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <MdPayment size={24} />
                  <span>Checkout</span>
                  <span className="checkout-total">Rp {totalPayment.toLocaleString('id-ID')}</span>
                </>
              )}
            </button>
            <div className="checkout-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/product')}>
                <MdShoppingCart size={20} />
                <span>Lanjut Belanja</span>
              </button>
              <button className="home-btn" onClick={() => navigate('/')}>
                <MdHome size={20} />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Cart;
