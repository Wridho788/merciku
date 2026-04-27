import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useAuthStore } from '../stores/authStore';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import {
  useSplash,
  useSlider,
  useLedger,
  useDecodeToken,
  usePostArticle,
  useProfile,
  useCart,
  useFrontChapters,
  useLatestProducts,
  useBestSellerProducts,
} from '../api/hooks/index';
import { SectionWrapper } from '../components/SectionWrapper';
import { Partnership } from '../components/Partnership';
import { CompletedEvent } from '../components/CompletedEvent';
import { FrontChapter } from '../components/FrontChapter';
import { UpcomingNews } from '../components/UpcomingNews';
import { ProductTabs } from '../components/ProductTabs';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';
import SplashScreen from '../components/SplashScreen';
import './Dashboard.css';
import { UserCard } from '../components/userCard';

const Dashboard: React.FC = () => {
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();

  // Use Zustand auth store
  const {
    token: authToken,
    user,
    isAuthenticated,
    requireAuth: storeRequireAuth,
    updatePoints,
    logout,
  } = useAuthStore();

  // API hooks for cart
  const { data: apiCartData, refetch: cartRefetch } = useCart();

  // State untuk development mode dan notification testing
  // const [showDevTools, setShowDevTools] = useState(false);

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  // Development helper function untuk testing
  // const setTestToken = () => {
  //   const testToken = 'test-valid-token-12345';
  //   // Use auth store instead of localStorage
  //   useAuthStore.getState().login(testToken, { username: 'test-user' });
  //   console.log('🧪 Test token set:', testToken);
  // };

  // const clearToken = () => {
  //   logout();
  //   console.log('🗑️ Token cleared');
  // };

  // Add to window for debugging (development only)
  // if (typeof window !== 'undefined') {
  //   (window as any).setTestToken = setTestToken;
  //   (window as any).clearToken = clearToken;
  //   (window as any).toggleDevTools = () => setShowDevTools((prev) => !prev);
  // }

  // Helper function untuk check authentication using Zustand store
  const requireAuth = (callback: () => void, actionName: string = 'access this feature') => {
    const success = storeRequireAuth(() => {
      callback();
    }, actionName);

    if (!success) {
      navigate('/login');
    }

    return success;
  };

  // State untuk splash screen - Tokopedia-like behavior (show once per session)
  const [showSplash, setShowSplash] = useState(false);
  const [splashImage, setSplashImage] = useState<string>('');
  const [hasShownSplash, setHasShownSplash] = useState(() => {
    // Check if splash has been shown in current session
    return sessionStorage.getItem('splashShown') === 'true';
  });

  // Get current user points from auth store
  const userPoints = user?.points || 0;

  // Panggil useSplash hook
  const {
    data: splashData,
    isLoading: splashLoading,
    error: splashError,
    refetch: splashRefetch,
  } = useSplash();

  // Panggil useDecodeToken hook untuk mendapatkan nama user
  const { data: decodeTokenData, error: decodeTokenError } = useDecodeToken();
  const { data: profileData, error: profileError, refetch: profileRefetch } = useProfile();

  // Helper function to capitalize name
  const capitalizeName = (name: string) => {
    if (!name) return 'User';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get user image with priority: profile image_url > decodeToken image > default
  const userImage = profileData?.content?.result.image_url || '/lapakbenz.png';

  // Panggil useSlider hook untuk Partnership
  const { data: sliderData, refetch: sliderRefetch } = useSlider();

  // Panggil useLedger hook - now uses Zustand auth store internally
  const {
    data: ledgerData,
    isLoading: ledgerLoading,
    error: ledgerError,
    refetch: ledgerRefetch,
  } = useLedger();

  // Panggil useFrontChapters hook
  const {
    data: frontChaptersData,
    refetch: frontChaptersRefetch,
  } = useFrontChapters({ limit: 100, offset: 0 });

  // Panggil useLatestProducts hook
  const {
    data: latestProductsData,
    isLoading: latestProductsLoading,
    error: latestProductsError,
    refetch: latestProductsRefetch,
  } = useLatestProducts();
  

  // Panggil useBestSellerProducts hook
  const {
    data: bestSellerProductsData,
    isLoading: bestSellerProductsLoading,
    error: bestSellerProductsError,
    refetch: bestSellerProductsRefetch,
  } = useBestSellerProducts();

  // Panggil usePostArticle untuk check upcoming news
  const upcomingNewsMutation = usePostArticle();

  // Check if Partnership should be displayed
  const shouldShowPartnership =
    sliderData?.result &&
    Array.isArray(sliderData.result) &&
    sliderData.result.length > 0;

  // Check if UpcomingNews should be displayed
  const shouldShowUpcomingNews =
    upcomingNewsMutation.data?.content?.result &&
    Array.isArray(upcomingNewsMutation.data.content.result) &&
    upcomingNewsMutation.data.content.result.length > 0;

  // Pull to refresh handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || startY.current === null || isRefreshing) return;

      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
        // Apply resistance effect for more natural feel
        const resistance = Math.max(0.3, 1 - diff / 300);
        const distance = Math.min(diff * resistance, MAX_PULL_DISTANCE);
        setPullDistance(distance);
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      triggerRefresh();
    }
    pulling.current = false;
    startY.current = null;
    setTimeout(() => setPullDistance(0), 200);
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Refresh all data sources in parallel
      const refreshPromises = [];

      // Refresh slider data
      if (sliderRefetch) refreshPromises.push(sliderRefetch());

      // Refresh ledger data
      if (ledgerRefetch) refreshPromises.push(ledgerRefetch());

      // Refresh profile data
      if (profileRefetch) refreshPromises.push(profileRefetch());

      // Refresh splash data
      if (splashRefetch) refreshPromises.push(splashRefetch());

      // Refresh upcoming news
      refreshPromises.push(upcomingNewsMutation.mutateAsync({}));

      // Refresh cart data
      if (cartRefetch) refreshPromises.push(cartRefetch());

      // Refresh front chapters data
      if (frontChaptersRefetch) refreshPromises.push(frontChaptersRefetch());

      // Refresh product data
      if (latestProductsRefetch) refreshPromises.push(latestProductsRefetch());
      if (bestSellerProductsRefetch) refreshPromises.push(bestSellerProductsRefetch());

      // Wait for all refreshes to complete
      await Promise.allSettled(refreshPromises);
    } catch (error) {
      console.error('❌ Pull to refresh error:', error);
    } finally {
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [
    isRefreshing,
    sliderRefetch,
    ledgerRefetch,
    profileRefetch,
    splashRefetch,
    upcomingNewsMutation,
    frontChaptersRefetch,
    latestProductsRefetch,
    bestSellerProductsRefetch,
  ]);

    // Prevent back navigation on dashboard
  useEffect(() => {
    const preventBack = () => {
      // Push current state again to prevent going back
      window.history.pushState(null, '', window.location.pathname);
    };

    // Add initial state to history
    window.history.pushState(null, '', window.location.pathname);
    
    // Listen for back button press
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pulling.current = false;
      startY.current = null;
      setPullDistance(0);
    };
  }, []);

  // Trigger upcoming news API call
  useEffect(() => {
    upcomingNewsMutation.mutate({});
  }, []);

  // Log ledger response and update points in Zustand store
  useEffect(() => {
  

    // Log decode token data
    if (decodeTokenData) {
    }
    if (decodeTokenError) {
      localStorage.removeItem('authToken');
      return;
    }

    // Log profile data
    if (profileData) {
    }
    if (profileError) {
    }

    if (ledgerData) {

      // Check if response indicates invalid token
      if (ledgerData.error && ledgerData.error.includes('Invalid Token')) {
        logout();
        navigate('/login');
        return;
      }

      // Extract points dari ledger response
      if (ledgerData.content) {
        // API returns points directly in content.point
        const points = ledgerData.content.point || 0;
        updatePoints(points);
       
      } else {
        // Jika tidak ada content, set points ke 0
        updatePoints(0);
      }
    }

    if (ledgerError) {
      console.error('❌ Ledger API Error:', ledgerError);
      updatePoints(0); // Set points ke 0 jika ada error
    }

  }, [
    authToken,
    ledgerData,
    ledgerError,
    ledgerLoading,
    isAuthenticated,
    updatePoints,
    logout,
    navigate,
    decodeTokenData,
    decodeTokenError,
    profileData,
    profileError,
  ]);

  // Log response ke console dan handle splash screen Tokopedia-style
  useEffect(() => {
    if (splashData) {
      // Extract image dari response
      if (splashData.content && splashData.content.result && splashData.content.result.length > 0) {
        const firstSlide = splashData.content.result[0];
        if (firstSlide.image && !hasShownSplash) {
          setSplashImage(firstSlide.image);
          setShowSplash(true);

          // Mark splash as shown in session storage
          sessionStorage.setItem('splashShown', 'true');
          setHasShownSplash(true);

          // Auto close setelah 5 detik
          const timer = setTimeout(() => {
            setShowSplash(false);
          }, 5000);

          return () => clearTimeout(timer);
        }
      }
    }
    if (splashError) {
      console.error('Splash API Error:', splashError);
    }
  
  }, [splashData, splashError, splashLoading, hasShownSplash]);

  // Log cart API data
  useEffect(() => {
    if (apiCartData) {
    }
  }, [apiCartData]);

  // Log front chapters API data
  // useEffect(() => {
  //   if (frontChaptersData) {
  //   }
  //   if (frontChaptersError) {
  //   }
  //   if (frontChaptersLoading) {
  //   }
  // }, [frontChaptersData, frontChaptersError, frontChaptersLoading]);

  // Log latest products API data
  useEffect(() => {
    if (latestProductsData) {
      console.log('Latest Products API Response:', latestProductsData);
    }
    if (latestProductsError) {
      console.error('Latest Products API Error:', latestProductsError);
    }
    if (latestProductsLoading) {
      console.log('Latest Products API Loading...');
    }
  }, [latestProductsData, latestProductsError, latestProductsLoading]);

  // Log best seller products API data
  useEffect(() => {
    if (bestSellerProductsData) {
      console.log('Best Seller Products API Response:', bestSellerProductsData);
    }
    if (bestSellerProductsError) {
      console.error('Best Seller Products API Error:', bestSellerProductsError);
    }

    if (bestSellerProductsLoading) {
      console.log('Best Seller Products API Loading...');
    }
  }, [bestSellerProductsData, bestSellerProductsError, bestSellerProductsLoading]);
  const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };
  const apiCartCount = getApiCartCount();

  // Handler untuk menutup splash screen
  const handleCloseSplash = () => {
    setShowSplash(false);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
    // Navigation is handled in AppbarHomepage component
  };

  const handleFABClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    requireAuth(() => navigate('/profile'), 'access profile');
  };

  const handleEventHistoryClick = () => {
    requireAuth(() => navigate('/profile/event-history'), 'view event history');
  };

  const handleTransactionClick = () => {
    requireAuth(() => navigate('/orders'), 'view transaction history');
  };

  const handleCartClick = () => {
    navigate('/cart', { state: { from: '/dashboard' } });
  };

  return (
    <>
      <SEO 
        title="lapakBenz - Platform Komunitas & Event Indonesia"
        description="Bergabunglah dengan lapakBenz, platform komunitas terdepan untuk UMKM, otomotif, dan berbagai komunitas di Indonesia. Temukan event menarik, marketplace terpercaya, dan peluang networking baru."
        keywords="lapakbenz, platform komunitas indonesia, event umkm, event otomotif, komunitas otomotif indonesia, marketplace komunitas, aplikasi komunitas, platform event indonesia, umkm indonesia, komunitas bisnis"
        schemaType="WebPage"
        breadcrumbs={[
          { name: 'Home', url: '/' }
        ]}
      />
      <StructuredData 
        type="WebSite" 
        data={{
          name: 'lapakBenz',
          url: 'https://lapakbenz.com'
        }} 
      />
      <AppbarHomepage
        avatar={userImage}
        name={decodeTokenError ? 'User' : capitalizeName(decodeTokenData?.content?.name || 'User')}
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        cartCount={apiCartCount}
        onCartClick={handleCartClick}
      />
      <div
        className="dashboard-page"
        ref={pullRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pulling.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Pull to Refresh Indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div
            style={{
              position: 'fixed',
              top: pullDistance > 0 ? `${Math.max(0, pullDistance - 60)}px` : '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '8px 16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#666',
              transition: 'all 0.2s ease-out',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ddd',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: isRefreshing
                  ? 'spin 1s linear infinite'
                  : pullDistance > PULL_THRESHOLD
                    ? 'spin 1s linear infinite'
                    : 'none',
                transform:
                  !isRefreshing && pullDistance <= PULL_THRESHOLD
                    ? `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)`
                    : 'none',
              }}
            />
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance > PULL_THRESHOLD
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </div>
        )}

        {/* Splash Screen */}
        {showSplash && splashImage && (
          <SplashScreen imageUrl={splashImage} onClose={handleCloseSplash} />
        )}

        {/* Black background behind dashboard content */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '20vh',
          background: 'black',
          zIndex: -1
        }} />
        
        <div className="dashboard-content">
          <UserCard
            points={userPoints}
            onProfileClick={handleProfileClick}
            onEventHistoryClick={handleEventHistoryClick}
            onTransactionClick={handleTransactionClick}
          />

          {/* Conditionally render Partnership section */}
          {shouldShowPartnership && (
            <SectionWrapper title="Partnership">
              <Partnership />
            </SectionWrapper>
          )}

          {/* Conditionally render CompletedEvent section */}
          <SectionWrapper title="Upcoming Events">
            <CompletedEvent />
          </SectionWrapper>

          {/* Product Tabs - Latest & Best Seller */}
          <SectionWrapper title="Our Products">
            <ProductTabs />
          </SectionWrapper>

          {/* Front Chapter sections - Loop through chapters */}
          {frontChaptersData?.content?.result?.map((chapter: any) => (
            <SectionWrapper key={chapter.id} title={chapter.name}>
              <FrontChapter chapterId={chapter.id} />
            </SectionWrapper>
          ))}

          {/* Conditionally render UpcomingNews section */}
          {shouldShowUpcomingNews && (
            <SectionWrapper title="Latest News">
              <UpcomingNews />
            </SectionWrapper>
          )}
        </div>
      </div>
      <FAB onClick={handleFABClick} ariaLabel="Notifications" />
      <BottomNav />
    </>
  );
};

export default Dashboard;
