import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { cartApi } from '../cartApi';
import { orderApi } from '../ordersApi';
import type {
  CartResponse,
  // AddToCartRequest,
  // AddToCartResponse,
  RemoveFromCartResponse,
  SetPickupResponse,
} from '../cartApi';
import type {
  OrderListResponse,
  // OrderAddResponse,
  // OrderAddItemRequest,
  // OrderAddItemResponse,
  OrderCheckoutResponse,
  OrderDetailResponse,
  OrderTrackingResponse,
} from '../ordersApi';

// Cart API Hooks
export function useCart(): UseQueryResult<CartResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['cart', token],
    queryFn: () => cartApi.getCart(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (cart data should be fresh)
    retry: 2,
  });
}

// interface UseAddToCartPayload {
//   data: AddToCartRequest;
// }

// export function useAddToCart(): UseMutationResult<AddToCartResponse, Error, UseAddToCartPayload> {
//   const { token } = useAuthStore();

//   return useMutation({
//     mutationFn: async ({ data }: UseAddToCartPayload) => {
//       if (!data.sku || data.sku.trim() === '') {
//         throw new Error('SKU is required');
//       }
//       if (!data.qty || data.qty.trim() === '') {
//         throw new Error('Quantity is required');
//       }
//       try {
//         return await cartApi.addToCart(data, token!);
//       } catch (error) {
//         throw error;
//       }
//     },
//     retry: (failureCount, error) => {
//       // Retry only for timeout and network errors, max 2 retries
//       if (failureCount < 2) {
//         const isTimeoutError = error?.message?.includes('timeout') || error?.message?.includes('ECONNABORTED');
//         const isNetworkError = error?.message?.includes('Network Error') || error?.message?.includes('ERR_NETWORK');
//         return isTimeoutError || isNetworkError;
//       }
//       return false;
//     },
//     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
//   });
// }

export function useRemoveFromCart(): UseMutationResult<RemoveFromCartResponse, Error, string> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        return await cartApi.removeFromCart(token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useSetPickup(): UseMutationResult<SetPickupResponse, Error, string> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (cartId: string) => {
      if (!cartId || cartId.trim() === '') {
        throw new Error('Cart ID is required');
      }
      try {
        return await cartApi.setPickup(cartId, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

// Order API Hooks
interface UseOrdersPayload {
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  start?: string;
  end?: string;
}

export function useOrders(
  payload: UseOrdersPayload = {
    limit: '120',
    offset: '0',
    confirm: '',
    paid: '',
    start: '',
    end: '',
  },
): UseQueryResult<OrderListResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orders', JSON.stringify(payload), token],
    queryFn: () => orderApi.getOrders(payload, token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (order data should be relatively fresh)
    retry: 2,
  });
}

// export function useAddOrder(): UseMutationResult<OrderAddResponse, Error, string> {
//   const { token } = useAuthStore();

//   return useMutation({
//     mutationFn: async () => {
//       try {
//         return await orderApi.addOrder(token!);
//       } catch (error) {
//         throw error;
//       }
//     },
//   });
// }

// interface UseAddItemToOrderPayload {
//   orderId: string;
//   data: OrderAddItemRequest;
//   authToken: string;
// }

// export function useAddItemToOrder(): UseMutationResult<
//   OrderAddItemResponse,
//   Error,
//   UseAddItemToOrderPayload
// > {
//   const { token } = useAuthStore();

//   return useMutation({
//     mutationFn: async ({ orderId, data }: UseAddItemToOrderPayload) => {
//       if (!orderId || orderId.trim() === '') {
//         throw new Error('Order ID is required');
//       }
//       if (!data.cproduct || data.cproduct.trim() === '') {
//         throw new Error('Product code is required');
//       }
//       if (!data.tqty || data.tqty.trim() === '') {
//         throw new Error('Quantity is required');
//       }
//       try {
//         return await orderApi.addItemToOrder(orderId, data, token!);
//       } catch (error) {
//         throw error;
//       }
//     },
//   });
// }

interface UseCheckoutOrderPayload {
  orderId: string;
  authToken: string;
}

export function useCheckoutOrder(): UseMutationResult<
  OrderCheckoutResponse,
  Error,
  UseCheckoutOrderPayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async ({ orderId }: UseCheckoutOrderPayload) => {
      if (!token || token.trim() === '') {
        throw new Error('Valid auth token is required for checkout');
      }
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is required');
      }
      try {
        return await orderApi.checkoutOrder(orderId, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useOrderDetail(orderId: string): UseQueryResult<OrderDetailResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orderDetail', orderId, token],
    queryFn: () => orderApi.getOrderDetail(orderId, token!),
    enabled: isAuthenticated && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403) or not found (404)
      if (axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useOrderTracking(awb: string, lastDigit: string): UseQueryResult<OrderTrackingResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['orderTracking', awb, lastDigit, token],
    queryFn: () => orderApi.trackOrder(awb, lastDigit, token!),
    enabled: isAuthenticated && !!awb && !!lastDigit && awb.trim() !== '' && lastDigit.trim() !== '',
    staleTime: 1000 * 60 * 5, // 5 minutes (tracking data doesn't change frequently)
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403) or not found (404) or bad request (400)
      if (axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}