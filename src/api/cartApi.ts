import axios from 'axios';
import { BASE_URL, ENDPOINT_CART, 
  // ENDPOINT_CART_ADD, 
  ENDPOINT_CART_CLEAN, ENDPOINT_CART_SET_PICKUP } from './constants';
// import { isShippingAddressRequiredError, logErrorDetails } from '../utils/errorUtils';

// TypeScript interfaces for Cart API
export interface CartItem {
  id: string;
  sku: string;
  name: string;
  image: string;
  qty: number;
  price: number;
  shipping: number;
  amount: number;
  total: number;
  pickup: string;
  created: string;
  updated: string | null;
}

export interface CartResponse {
  content: {
    balance: number;
    record: number;
    result: CartItem[];
  };
}

export interface AddToCartRequest {
  sku: string;
  qty: string;
}

export interface AddToCartResponse {
  content: null;
}

export interface RemoveFromCartResponse {
  content: null;
}

export interface SetPickupResponse {
  content: null;
}

// Cart API functions
export const cartApi = {
  // Get Cart - GET method
  async getCart(authToken: string): Promise<CartResponse> {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT_CART}`, {
        headers: {
          'X-auth-token': authToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('❌ Cart API error:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            // Set isAuthenticated to false and navigate to login
            try {
              const { useAuthStore } = await import('../stores/authStore');
              useAuthStore.getState().logout();
            } catch (e) {
              console.error('Failed to logout on 401:', e);
            }
            // Optionally, you can throw a custom error to be handled in the component
            throw new Error('401 Unauthorized: Please login again');
          }
          throw new Error(error.response?.data?.message || error.message || 'Failed to get cart');
        }
        throw error;
    }
  },

  // Add to Cart - POST method with FormData
  // async addToCart(payload: AddToCartRequest, authToken: string): Promise<AddToCartResponse> {
  //   try {
  //     // Create FormData
  //     const formData = new FormData();
  //     formData.append('sku', payload.sku);
  //     formData.append('qty', payload.qty);

  //     const response = await axios.post(`${BASE_URL}${ENDPOINT_CART_ADD}`, formData, {
  //       headers: {
  //         'X-auth-token': authToken,
  //         'Content-Type': 'application/x-www-form-urlencoded'
  //       },
  //       timeout: 30000
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('❌ Add to cart API error:', error);
  //     if (axios.isAxiosError(error)) {
  //       // Enhanced error logging for debugging
  //       logErrorDetails(error, 'Cart API - Add to Cart');
        
  //       // For error 307 (shipping address required), preserve the original error structure
  //       if (isShippingAddressRequiredError(error)) {
  //         throw error; // Throw the original axios error to preserve all error details
  //       }
        
  //       throw new Error(error.response?.data?.message || error.message || 'Failed to add item to cart');
  //     }
  //     throw error;
  //   }
  // },

  // Remove from Cart - GET method (clean cart)
  async removeFromCart(authToken: string): Promise<RemoveFromCartResponse> {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT_CART_CLEAN}`, {
        headers: {
          'X-auth-token': authToken
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Remove from cart API error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to remove items from cart');
      }
      throw error;
    }
  },

  // Set Pickup - GET method
  async setPickup(cartId: string, authToken: string): Promise<SetPickupResponse> {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT_CART_SET_PICKUP}${cartId}`, {
        headers: {
          'X-auth-token': authToken
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Set pickup API error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to set pickup option');
      }
      throw error;
    }
  }
};