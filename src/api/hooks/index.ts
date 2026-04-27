// Re-export all hooks from their respective modules for convenient importing

// Authentication & User Management Hooks
export {
  useLogin,
  useRegister,
  useForgotPassword,
  useRequestOTP,
  useSimpleRequestOTP,
  useVerifyOTP,
  useUpdateProfile,
  useChangePassword,
  useProfile,
  // useCustomerById,
  useDecodeToken,
  useNotifications,
  useUnreadNotifications,
  useNotificationDetail,
  useUploadImage,
  useLogout,
} from './authHooks';

// Event & Chapter Management Hooks
export {
  usePostEvent,
  usePostArticle,
  useChapters,
  useChapterById,
  useFrontChapters,
  useMerchantRegistration,
  usePublicRegistration,
  useEventRegister,
  useInfiniteEvents,
  useInfiniteArticles,
} from './eventHooks';

// Product Management Hooks
export {
  useProducts,
  useProductCategories,
  useProductSearch,
  useProductDetail,
  useProductCities,
  useLatestProducts,
  useBestSellerProducts,
} from './productHooks';

// Cart & Order Management Hooks
export {
  useCart,
  useRemoveFromCart,
  useSetPickup,
  useOrders,
  useCheckoutOrder,
  useOrderDetail,
} from './cartHooks';

// General/Utility Hooks
export {
  useLedger,
  useSlider,
  useSplash,
} from './generalHooks';
// Shipping/location hooks
export {
  useProvince,
  useCityByProvince,
  useDistrictByCity,
  useSetShipping,
} from './shippingHooks';

// Type exports for convenience
export type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RequestOTPRequest,
  RequestOTPResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  GetProfileResponse,
  NotificationResponse,
  NotificationDetailResponse,
  NotificationPayload,
  DecodeTokenResponse,
  LogoutResponse,
} from '../types';

export type {
  CartResponse,
  AddToCartRequest,
  AddToCartResponse,
  RemoveFromCartResponse,
  SetPickupResponse,
} from '../cartApi';

export type {
  OrderListResponse,
  OrderAddResponse,
  OrderAddItemRequest,
  OrderAddItemResponse,
  OrderCheckoutResponse,
  OrderDetailResponse,
} from '../ordersApi';