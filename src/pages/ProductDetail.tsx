import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  // MdShoppingCart,
  MdStar,
  MdAdd,
  MdRemove,
  MdZoomIn,
  MdClose,
  MdArrowBackIos,
  MdArrowForwardIos,
  MdRestore,
} from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';
import SEO from '../components/SEO';
import { generateBreadcrumbs, formatPrice, truncateText, stripHtml } from '../utils/seoUtils';
// import { useCart as useCartContext } from '../contexts/CartContext';
import { useProductDetail, useCart } from '../api/hooks/index';
// import { useAuthStore } from '../stores/authStore';
import { extractIdFromParam } from '../api/codeMapping';
// import { toast } from 'react-toastify';
import AturPengiriman from '../components/AturPengiriman';
// import { isShippingAddressRequiredError, logErrorDetails, getErrorMessage, isAuthenticationError } from '../utils/errorUtils';
import './ProductDetail.css';

interface ProductDetailType {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  description: string;
  specifications: string[];
  stock: number;
  images: string[];
}

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId: productParam } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  // const { addToCart } = useCartContext();
  // API hooks for cart
  const { data: apiCartData, 
    // refetch: cartRefetch 
  } = useCart();

  // Extract actual product ID from URL parameter (handles both old ID format and new SEO format)
  const productId = productParam ? extractIdFromParam(productParam) : null;

  // Auth state - get all needed auth properties
  // const { isAuthenticated, token, validateToken, requireAuth } = useAuthStore();

  // Scroll to top on component mount
  useEffect(() => {
    // Immediate scroll to top when component first mounts
    window.scrollTo(0, 0);
  }, []);

  // Log when productParam changes and scroll to top
  useEffect(() => {
    // Scroll to top when productParam changes (for navigation between products)
    if (productParam && productId) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [productParam, productId]);

  // API hook for product detail
  const {
    data: productDetailData,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(productId || '');

  // Add to cart mutation hook
  // const addToCartMutation = useAddToCart();

  // Log the response to console
  useEffect(() => {
    if (productDetailData) {
      if (productDetailData.content) {
      }
    }
  }, [productDetailData]);


  // Log errors
  useEffect(() => {
    if (productError) {
      console.error('❌ Product Detail Error:', productError);
    }
  }, [productError]);

  // Log cart API data
  useEffect(() => {
    if (apiCartData) {
    }
  }, [apiCartData]);

  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };

  const apiCartCount = getApiCartCount();

  const handleBackClick = () => {
    navigate('/product');
  };

  const handleCartClick = () => {
    // Small delay to ensure any pending cart operations complete
    setTimeout(() => {
      navigate('/cart', { 
        state: { 
          from: window.location.pathname,
          productId: productId // Include productId for better back navigation
        } 
      });
    }, 100);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Image zoom handlers
  const handleImageZoomOpen = (imageIndex: number) => {
    setZoomImageIndex(imageIndex);
    setIsImageZoomOpen(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleImageZoomClose = () => {
    setIsImageZoomOpen(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handleZoomImageChange = (direction: 'prev' | 'next') => {
    const productData = getProductData();
    if (direction === 'prev') {
      setZoomImageIndex((prev) => (prev === 0 ? productData.images.length - 1 : prev - 1));
    } else {
      setZoomImageIndex((prev) => (prev === productData.images.length - 1 ? 0 : prev + 1));
    }
    // Reset zoom when changing images
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 0.5, 3);
      return newZoom;
    });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pinch-to-zoom state for mobile
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [tapCount, setTapCount] = useState<number>(0);

  // Helper to calculate distance between two touches
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Enhanced touch handlers for smooth pinch zoom and drag
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Single touch - check for double tap or drag
      const now = Date.now();
      const touch = e.touches[0];

      // Double tap detection
      if (now - lastTapTime < 300) {
        setTapCount((prev) => prev + 1);
        if (tapCount === 1) {
          // Double tap detected - toggle zoom
          if (zoomLevel === 1) {
            setZoomLevel(2);
          } else {
            setZoomLevel(1);
            setImagePosition({ x: 0, y: 0 });
          }
          setTapCount(0);
          return;
        }
      } else {
        setTapCount(1);
      }
      setLastTapTime(now);

      if (zoomLevel > 1) {
        // Start dragging if zoomed in
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - imagePosition.x,
          y: touch.clientY - imagePosition.y,
        });
      }

      setIsPinching(false);
    } else if (e.touches.length === 2) {
      // Two fingers - start pinch zoom
      setIsPinching(true);
      setIsDragging(false);

      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);

      // Calculate center point of pinch
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      // Store initial pinch center for smooth zooming
      setDragStart({ x: centerX, y: centerY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (isPinching && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);

      if (lastTouchDistance && Math.abs(distance - lastTouchDistance) > 3) {
        const scaleFactor = distance / lastTouchDistance;

        setZoomLevel((prev) => {
          const newZoom = Math.max(1, Math.min(3, prev * scaleFactor));

          // If zooming out to minimum, reset position
          if (newZoom === 1) {
            setImagePosition({ x: 0, y: 0 });
          }

          return newZoom;
        });

        setLastTouchDistance(distance);
      }
    } else if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      // Single finger drag when zoomed
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // Apply boundaries to prevent over-panning
      const maxPan = (zoomLevel - 1) * 100;
      const boundedX = Math.max(-maxPan, Math.min(maxPan, newX));
      const boundedY = Math.max(-maxPan, Math.min(maxPan, newY));

      setImagePosition({ x: boundedX, y: boundedY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      setIsDragging(false);
      setIsPinching(false);
      setLastTouchDistance(null);
    } else if (e.touches.length === 1 && isPinching) {
      // Switched from pinch to single touch
      setIsPinching(false);
      setLastTouchDistance(null);

      // Start drag if zoomed
      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - imagePosition.x,
          y: e.touches[0].clientY - imagePosition.y,
        });
      }
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageZoomOpen) {
        handleImageZoomClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isImageZoomOpen]);

  // Get product data from API or use dummy data as fallback
  const getProductData = (): ProductDetailType => {
    // Default dummy data
    const dummyData: ProductDetailType = {
      id: productParam || '1',
      title: 'Merciku T-Shirt Premium',
      price: 149000,
      image: '/bea2x.jpg',
      category: 'Apparel',
      rating: 4.8,
      description:
        'Premium quality t-shirt made from 100% cotton with comfortable fit. Perfect for daily wear or casual events. Features the iconic Merciku logo with modern design.',
      specifications: [
        'Material: 100% Cotton',
        'Available sizes: S, M, L, XL, XXL',
        'Color: Black, White, Navy',
        'Weight: 180 GSM',
        'Care: Machine wash cold',
      ],
      stock: 25,
      images: ['/bea2x.jpg', '/bea2x.jpg', '/bea2x.jpg'],
    };

    // If we have API data, use it
    if (productDetailData?.content) {
      const apiProduct = productDetailData.content;

      // Create images array from available URLs
      const productImages = [];
      if (apiProduct.image) productImages.push(apiProduct.image);
      if (apiProduct.url1) productImages.push(apiProduct.url1);
      if (apiProduct.url2) productImages.push(apiProduct.url2);
      if (apiProduct.url3) productImages.push(apiProduct.url3);
      if (apiProduct.url4) productImages.push(apiProduct.url4);
      if (apiProduct.url5) productImages.push(apiProduct.url5);
      if (apiProduct.url6) productImages.push(apiProduct.url6);

      // Remove duplicates
      const uniqueImages = [...new Set(productImages)];

      // Create specifications array from available data
      const specifications = [];
      if (apiProduct.sku) specifications.push(`SKU: ${apiProduct.sku}`);
      if (apiProduct.weight) specifications.push(`Weight: ${apiProduct.weight}g`);
      if (apiProduct.period) specifications.push(`Available: ${apiProduct.period}`);
      if (apiProduct.restricted)
        specifications.push(`Restricted: ${apiProduct.restricted === 'Y' ? 'Yes' : 'No'}`);
      if (apiProduct.status)
        specifications.push(`Status: ${apiProduct.status === 1 ? 'Active' : 'Inactive'}`);

      return {
        id: apiProduct.id?.toString() || productId || '1',
        title: apiProduct.name || dummyData.title,
        price: apiProduct.price || dummyData.price,
        image: apiProduct.image || dummyData.image,
        category: apiProduct.category || apiProduct.categoryName || apiProduct.kategori || dummyData.category, // Check multiple possible category fields from API
        rating: parseFloat(apiProduct.rating) || dummyData.rating,
        description: apiProduct.description || apiProduct.shortdesc || dummyData.description,
        specifications: specifications.length > 0 ? specifications : dummyData.specifications,
        stock: 25, // API doesn't provide stock info, use default
        images: uniqueImages.length > 0 ? uniqueImages : dummyData.images,
      };
    }

    // Return dummy data if no API data
    return dummyData;
  };

  const productData = getProductData();

  // Log zoom level changes
  useEffect(() => {
    console.log('🔍 Zoom Level Changed:', zoomLevel);
  }, [zoomLevel]);

  // Log image position changes
  useEffect(() => {
    if (zoomLevel > 1) {
    }
  }, [imagePosition, zoomLevel]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= productData.stock) {
      setQuantity(newQuantity);
    }
  };

  // const handleAddToCart = async () => {
  //   // Enhanced authentication check using authStore methods
  //   const isTokenValid = validateToken();

  //   if (!isAuthenticated || !token || !isTokenValid) {
  //     toast.warning('Please login to add items to cart', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     navigate('/login');
  //     return;
  //   }

  //   // Use requireAuth method from authStore for additional validation
  //   const canProceed = requireAuth(() => {
  //     // This callback will only execute if authentication is valid
  //     console.log('✅ Authentication verified, proceeding with add to cart');
  //   }, 'add items to cart');

  //   if (!canProceed) {
  //     navigate('/login');
  //     return;
  //   }

  //   try {
  //     // Get the SKU from the API data or use the product ID as fallback
  //     const productSku = productDetailData?.content?.sku || productData.id;

  //     // Check if item already exists in cart
  //     // const existingItem = apiCartData?.content?.result?.find(item => item.sku === productSku);
  //     // const newQuantity = existingItem ? existingItem.qty + quantity : quantity;

  //     // Add to cart using API with cumulative quantity
  //     // await addToCartMutation.mutateAsync({
  //     //   data: {
  //     //     sku: productSku,
  //     //     qty: newQuantity.toString(),
  //     //   },
  //     // });

  //     // Show success message with toast
  //     toast.success(`${quantity} ${productData.title.toUpperCase()} added to cart successfully`, {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     cartRefetch();
      
  //     // Also add to cart context for immediate UI update
  //     addToCart(
  //       {
  //         id: productData.id,
  //         title: productData.title,
  //         price: productData.price,
  //         image: productData.image,
  //       },
  //       quantity,
  //     );

  //     // Reset quantity to 1 after adding to cart
  //     setQuantity(1);
  //   } catch (error: any) {
  //     console.error('Failed to add to cart:', error);
      
  //     // Enhanced error logging for debugging
  //     logErrorDetails(error, 'Add to Cart');

  //     // Check if error is 307 - Shipping address required
  //     if (isShippingAddressRequiredError(error)) {
  //       toast.warning('Please set your shipping address first', {
  //         position: 'bottom-right',
  //         autoClose: 1500,
  //         theme: 'dark',
  //       });
  //       setIsShippingModalOpen(true);
  //       return;
  //     }

  //     // Check if error is related to authentication
  //     if (isAuthenticationError(error)) {
  //       const authErrorMessage = 'Your session has expired. Please login again.';
  //       toast.warning(authErrorMessage, {
  //         position: 'bottom-right',
  //         autoClose: 1500,
  //         theme: 'dark',
  //       });
  //       // Logout and redirect to login
  //       useAuthStore.getState().logout();
  //       navigate('/login');
  //       return;
  //     }

  //     // Handle timeout errors specifically
  //     if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
  //       toast.error('Koneksi timeout. Silakan periksa koneksi internet dan coba lagi.', {
  //         position: 'bottom-right',
  //         autoClose: 1500,
  //         theme: 'dark',
  //       });
  //       return;
  //     }

  //     // Handle network errors
  //     if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
  //       toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.', {
  //         position: 'bottom-right',
  //         autoClose: 1500,
  //         theme: 'dark',
  //       });
  //       return;
  //     }

  //     // Handle other errors
  //     const errorMessage = getErrorMessage(error) || 'Gagal menambahkan ke keranjang. Silakan coba lagi.';
  //     toast.error(`${errorMessage}`, {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //   }
  // };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<MdStar key="half" className="star half" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<MdStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  const handleShippingModalClose = () => {
    setIsShippingModalOpen(false);
  };

  return (
    <div className="product-detail-page">
      <SEO 
        title={`${productData.title} - ${productData.category} - Harga & Spesifikasi | LapakBenz - Platform Komunitas & Event Indonesia`}
        description={truncateText(stripHtml(productData.description), 155)}
        keywords={`${productData.title.toLowerCase()}, ${productData.category.toLowerCase()}, produk lapakbenz, beli ${productData.title.toLowerCase()}, ${formatPrice(productData.price)}, marketplace indonesia`}
        image={productData.image}
        schemaType="Product"
        price={productData.price}
        currency="IDR"
        availability={productData.stock > 0 ? 'in stock' : 'out of stock'}
        brand="lapakBenz"
        category={productData.category}
        breadcrumbs={generateBreadcrumbs('product', productData.title)}
      />
      <AppbarDefault
        title="Product Detail"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={apiCartCount}
      />

      {/* Image Zoom Modal */}
      {isImageZoomOpen && (
        <div className="image-zoom-modal" onClick={handleImageZoomClose}>
          {/* Close Button */}
          <div
            className="zoom-close-btn"
            onClick={handleImageZoomClose}
            aria-label="Tutup pratinjau"
          >
            <MdClose />
          </div>

          {/* Image Counter */}
          <div className="zoom-counter">
            <span>
              {zoomImageIndex + 1} / {productData.images.length}
            </span>
          </div>

          {/* Main Image Container */}
          <div className="zoom-main-container" onClick={(e) => e.stopPropagation()}>
            <div
              className={`zoom-image-wrapper ${zoomLevel > 1 ? 'zoomed' : ''} ${isDragging || isPinching ? 'interacting' : ''}`}
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                transition:
                  isDragging || isPinching
                    ? 'none'
                    : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={productData.images[zoomImageIndex]}
                alt={`${productData.title} ${zoomImageIndex + 1}`}
                className="zoom-image"
                draggable="false"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/bea2x.jpg';
                }}
              />
            </div>

            {/* Navigation Arrows */}
            {productData.images.length > 1 && (
              <>
                <div
                  className="zoom-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomImageChange('prev');
                  }}
                  aria-label="Gambar sebelumnya"
                >
                  <MdArrowBackIos />
                </div>
                <div
                  className="zoom-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomImageChange('next');
                  }}
                  aria-label="Gambar berikutnya"
                >
                  <MdArrowForwardIos />
                </div>
              </>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="zoom-bottom-controls" onClick={(e) => e.stopPropagation()}>
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <div
                className={`zoom-btn zoom-out ${zoomLevel <= 1 ? 'disabled' : ''}`}
                onClick={handleZoomOut}
                aria-label="Perkecil"
              >
                <MdRemove />
              </div>

              <div className="zoom-indicator">
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <div className="zoom-bar">
                  <div
                    className="zoom-progress"
                    style={{ width: `${((zoomLevel - 1) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div
                className={`zoom-btn zoom-in ${zoomLevel >= 3 ? 'disabled' : ''}`}
                onClick={handleZoomIn}
                aria-label="Perbesar"
              >
                <MdAdd />
              </div>

              {zoomLevel > 1 && (
                <button
                  className="zoom-reset-btn"
                  onClick={handleResetZoom}
                  aria-label="Reset zoom"
                >
                  <MdRestore />
                </button>
              )}
            </div>

            {/* Image Thumbnails */}
            {productData.images.length > 1 && (
              <div className="zoom-thumbnails">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    className={`zoom-thumbnail ${zoomImageIndex === index ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImageIndex(index);
                      setZoomLevel(1);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                    aria-label={`Gambar ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${productData.title} thumbnail ${index + 1}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/bea2x.jpg';
                      }}
                    />
                    <div className="thumbnail-overlay"></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom Instructions */}
          {zoomLevel === 1 && (
            <div className="zoom-instructions">
              <span>Pinch to zoom • Double tap to zoom</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {productLoading && (
        <div className="product-detail-content">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              background: 'white',
              borderRadius: '12px',
              margin: '20px',
            }}
          >
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Loading product details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {productError && !productLoading && (
        <div className="product-detail-content">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              background: 'white',
              borderRadius: '12px',
              margin: '20px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 16px 0', color: '#e74c3c', fontSize: '16px' }}>
              Failed to load product details
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#161129',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Product Content - show if not loading and no error, or if we have dummy data */}
      {!productLoading && !productError && (
        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images-section">
            <div className="main-image" onClick={() => handleImageZoomOpen(selectedImageIndex)}>
              <img
                src={productData.images[selectedImageIndex]}
                alt={productData.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/bea2x.jpg';
                }}
              />
              <div className="zoom-indicator-overlay">
                <MdZoomIn className="zoom-icon" />
                <span>Klik untuk perbesar</span>
              </div>
            </div>
            <div className="image-thumbnails">
              {productData.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${productData.title} ${index + 1}`}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/bea2x.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <span className="product-category">{productData.category}</span>
              <h1 className="product-title">{productData.title.toUpperCase()}</h1>

              <div className="product-rating-section">
                <div className="rating-stars">{renderStars(productData.rating)}</div>
                <span className="rating-text">({productData.rating}) • 156 reviews</span>
              </div>

              <div className="product-price">Rp {productData.price.toLocaleString('id-ID')}</div>
            </div>

            <div className="product-description">
              <h3>Deskripsi</h3>
              <p>{productData.description}</p>
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="purchase-section">
            <div className="purchase-header">
              <h3>Pilih Jumlah</h3>
            </div>

            <div className="quantity-selector">
              <div className="quantity-label">
                <span>Jumlah</span>
              </div>
              <div className="quantity-controls">
                <div
                  className={`quantity-btn decrease ${quantity <= 1 ? 'disabled' : ''}`}
                  onClick={() => quantity > 1 && handleQuantityChange(-1)}
                  aria-label="Kurangi jumlah"
                >
                  <MdRemove />
                </div>
                <div className="quantity-display">
                  <span className="quantity-number">{quantity}</span>
                </div>
                <div
                  className={`quantity-btn increase ${quantity >= productData.stock ? 'disabled' : ''}`}
                  onClick={() => quantity < productData.stock && handleQuantityChange(1)}
                  aria-label="Tambah jumlah"
                >
                  <MdAdd />
                </div>
              </div>
            </div>

            <div className="price-summary">
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Harga per item</span>
                  <span>Rp {productData.price.toLocaleString('id-ID')}</span>
                </div>
                <div className="price-row">
                  <span>Jumlah</span>
                  <span>x{quantity}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-row total">
                  <span>Total Harga</span>
                  <span className="total-amount">
                    Rp {(productData.price * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              {/* <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={productData.stock === 0 || addToCartMutation.isPending}
              >
                <MdShoppingCart className="cart-icon" />
                <span>
                  {addToCartMutation.isPending ? (
                    <>
                      <div className="spinner" style={{ marginRight: '8px' }}></div>
                      Menambahkan...
                    </>
                  ) : (
                    'Tambah ke Keranjang'
                  )}
                </span>
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address Modal */}
      {isShippingModalOpen && (
        <div className="shipping-modal-overlay" onClick={handleShippingModalClose}>
          <div className="shipping-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="shipping-modal-header">
              <button 
                className="shipping-modal-close"
                onClick={handleShippingModalClose}
                aria-label="Tutup"
              >
                <MdClose />
              </button>
            </div>
            <AturPengiriman onSuccess={handleShippingModalClose} />
          </div>
        </div>
      )}

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default ProductDetail;
