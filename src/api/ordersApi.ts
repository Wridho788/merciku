import axios from 'axios';
import { BASE_URL, ENDPOINT_ORDER,
  //  ENDPOINT_ORDER_ADD, ENDPOINT_ORDER_ADD_ITEM, 
   ENDPOINT_ORDER_CHECKOUT, ENDPOINT_ORDER_GET, ENDPOINT_ORDER_TRACKING } from './constants';
import { type UseQueryResult, useQuery, type UseMutationResult, useMutation } from '@tanstack/react-query';

// TypeScript interfaces for Order API
export interface OrderListRequest {
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  start?: string;
  end?: string;
}

export interface OrderItem {
  id: string;
  club_id: string;
  club: string;
  code: string;
  transcode: string;
  transno: string;
  transid: string | null;
  dates: string;
  customer: string;
  amount: string;
  tax: string;
  cost: string;
  discount: string;
  total: number;
  payment_type: string;
  canceled: string | null;
  canceled_desc: string | null;
  posted: string;
  log: string | null;
  paid_status: string;
  paid_date: string;
  items_count: number;
  created: string;
  updated: string | null;
}

export interface OrderListResponse {
  content: {
    orderid: number;
    record: number;
    result: OrderItem[];
  };
}

export interface OrderAddResponse {
  content: {
    id: string;
    club_id: string;
    code: string;
    transcode: string;
    transno: string;
    transid: string | null;
    dates: string;
    customer: string;
    notes: string | null;
    amount: string;
    tax: string;
    cost: string;
    discount: string;
    total: string;
    payment_type: string;
    paid_date: string | null;
    sender_name: string | null;
    sender_acc: string | null;
    sender_bank: string | null;
    sender_amount: string;
    bank_id: string | null;
    canceled: string | null;
    canceled_desc: string | null;
    approved: string;
    log: string | null;
    created: string;
    updated: string | null;
    deleted: string | null;
  };
}

export interface OrderAddItemRequest {
  cproduct: string;
  ctax: string;
  tqty: string;
  tdiscount: string;
  tshipping: string;
}

export interface OrderAddItemResponse {
  content: string;
}

export interface OrderCheckoutResponse {
  error?: string;
  content?: {
    invoice_url?: string;
    transid?: number;
    orderid?: string;
    [key: string]: any;
  };
}

export interface OrderErrorResponse {
  error: string;
}

// TypeScript interfaces untuk Get Order Detail
export interface OrderDetailItem {
  id: string;
  order_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  product_price: string;
  quantity: string;
  tax: string;
  discount: string;
  subtotal: string;
  created: string;
  updated: string | null;
}


export interface OrderDetailResponse {
  content: {
    code: string;
    dates: string;
    cust: string;
    customer: string;
    amount: number;
    tax: number;
    costs: number;
    discount: number;
    total: number;
    payment_type: string;
    transcode: string;
    transno: string;
    transid: string;
    canceled: string | null;
    canceled_desc: string | null;
    posted: string;
    log: string | null;
    status: string | null;
    link_url: string;
    link_expired: string;
    paid_date: string | null;
    canceled_date: string | null;
    tot_amt: number;
    shipping: number;
    items: Array<{
      id: string;
      order_id: string;
      product_id: string;
      product: string;
      sku: string;
      qty: number;
      discount: number;
      tax: number;
      amount: number;
      price: number;
      awb?: string;
      last_digit?: string;
    }>;
  };
}

// TypeScript interfaces untuk Order Tracking
export interface TrackingManifest {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
}

export interface TrackingSummary {
  courier_code: string;
  courier_name: string;
  waybill_number: string;
  service_code: string;
  waybill_date: string;
  shipper_name: string;
  receiver_name: string;
  origin: string;
  destination: string;
  status: string;
}

export interface OrderTrackingResponse {
  content: {
    status: boolean;
    manifest: TrackingManifest[];
    summary: TrackingSummary;
  };
}

export interface OrderTrackingRequest {
  awb: string;
  lastDigit: string;
  limit?: string;
  offset?: string;
  confirm?: string;
  paid?: string;
  start?: string;
  end?: string;
}

// Order API functions
export const orderApi = {
  // Get Orders - POST method
  async getOrders(
    payload: OrderListRequest = {
      limit: "120",
      offset: "0",
      confirm: "",
      paid: "",
      start: "",
      end: ""
    },
    authToken: string
  ): Promise<OrderListResponse> {
    try {
      const response = await axios.post(`${BASE_URL}${ENDPOINT_ORDER}`, payload, {
        headers: {
          'X-auth-token': authToken,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to get orders');
      }
      throw error;
    }
  },

  // Add Order - POST method with FormData
  // async addOrder(authToken: string): Promise<OrderAddResponse> {
  //   try {
  //     // Create empty FormData for order creation
  //     const formData = new FormData();

  //     const response = await axios.post(`${BASE_URL}${ENDPOINT_ORDER_ADD}`, formData, {
  //       headers: {
  //         'X-auth-token': authToken,
  //         'Content-Type': 'application/x-www-form-urlencoded'
  //       },
  //       timeout: 10000
  //     });
  //     return response.data;
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       throw new Error(error.response?.data?.message || error.message || 'Failed to add order');
  //     }
  //     throw error;
  //   }
  // },

  // Add Item to Order - POST method with FormData
  // async addItemToOrder(
  //   orderId: string,
  //   payload: OrderAddItemRequest,
  //   authToken: string
  // ): Promise<OrderAddItemResponse> {
  //   try {
  //     // Create FormData
  //     const formData = new FormData();
  //     formData.append('cproduct', payload.cproduct);
  //     formData.append('ctax', payload.ctax);
  //     formData.append('tqty', payload.tqty);
  //     formData.append('tdiscount', payload.tdiscount);
  //     formData.append('tshipping', payload.tshipping);

  //     const response = await axios.post(`${BASE_URL}${ENDPOINT_ORDER_ADD_ITEM}${orderId}`, formData, {
  //       headers: {
  //         'X-auth-token': authToken,
  //         'Content-Type': 'application/x-www-form-urlencoded'
  //       },
  //       timeout: 10000
  //     });
  //     return response.data;
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       // Handle specific 404 error
  //       if (error.response?.status === 404) {
  //         throw new Error(error.response?.data?.error || 'ID not found');
  //       }
  //       throw new Error(error.response?.data?.message || error.message || 'Failed to add item to order');
  //     }
  //     throw error;
  //   }
  // },

  // Checkout Order - GET method
  async checkoutOrder(orderId: string, authToken: string): Promise<OrderCheckoutResponse> {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT_ORDER_CHECKOUT}${orderId}`, {
        headers: {
          'X-auth-token': authToken
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific 403 error
        if (error.response?.status === 403) {
          throw new Error(error.response?.data?.error || 'Failed to create payment');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to checkout order');
      }
      throw error;
    }
  },

  // Get Order Detail - GET method
  async getOrderDetail(orderId: string, authToken: string): Promise<OrderDetailResponse> {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT_ORDER_GET}${orderId}`, {
        headers: {
          'X-auth-token': authToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error codes
        if (error.response?.status === 404) {
          throw new Error('Order not found');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied to order details');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to get order details');
      }
      throw error;
    }
  },

  // Track Order - POST method
  async trackOrder(
    awb: string, 
    lastDigit: string, 
    authToken: string,
    payload: Partial<OrderTrackingRequest> = {}
  ): Promise<OrderTrackingResponse> {
    try {
      const requestPayload = {
        limit: payload.limit || "120",
        offset: payload.offset || "0",
        confirm: payload.confirm || "",
        paid: payload.paid || "",
        start: payload.start || "",
        end: payload.end || ""
      };

      const response = await axios.post(`${BASE_URL}${ENDPOINT_ORDER_TRACKING}/${awb}/${lastDigit}`, requestPayload, {
        headers: {
          'X-auth-token': authToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error codes
        if (error.response?.status === 404) {
          throw new Error('Tracking information not found');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied to tracking information');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid tracking number or last digit');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to track order');
      }
      throw error;
    }
  }
};

// Order API Hooks
export function useOrders(
  payload: OrderListRequest = {
    limit: "120",
    offset: "0",
    confirm: "",
    paid: "",
    start: "",
    end: ""
  },
  authToken?: string | null
): UseQueryResult<OrderListResponse, Error> {
  return useQuery({
    queryKey: ['orders', JSON.stringify(payload), authToken],
    queryFn: async () => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for orders');
      }
      try {
        return await orderApi.getOrders(payload, authToken);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!authToken && authToken.trim() !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes (order data should be relatively fresh)
    retry: 2,
  });
}

// export function useAddOrder(): UseMutationResult<OrderAddResponse, Error, string> {
//   return useMutation({
//     mutationFn: async (authToken: string) => {
//       if (!authToken || authToken.trim() === '') {
//         throw new Error('Valid auth token is required for creating order');
//       }
//       try {
//         return await orderApi.addOrder(authToken);
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

// export function useAddItemToOrder(): UseMutationResult<OrderAddItemResponse, Error, UseAddItemToOrderPayload> {
//   return useMutation({
//     mutationFn: async ({ orderId, data, authToken }: UseAddItemToOrderPayload) => {
//       if (!authToken || authToken.trim() === '') {
//         throw new Error('Valid auth token is required for adding item to order');
//       }
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
//         return await orderApi.addItemToOrder(orderId, data, authToken);
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

export function useCheckoutOrder(): UseMutationResult<OrderCheckoutResponse, Error, UseCheckoutOrderPayload> {
  return useMutation({
    mutationFn: async ({ orderId, authToken }: UseCheckoutOrderPayload) => {
      if (!authToken || authToken.trim() === '') {
        throw new Error('Valid auth token is required for checkout');
      }
      if (!orderId || orderId.trim() === '') {
        throw new Error('Order ID is required');
      }
      try {
        return await orderApi.checkoutOrder(orderId, authToken);
      } catch (error) {
        throw error;
      }
    },
  });
}

