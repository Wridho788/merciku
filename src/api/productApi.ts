import axios from 'axios';
import { 
  BASE_URL,
  ENDPOINT_PRODUCT_LATEST,
  ENDPOINT_PRODUCT_BEST_SELLER
} from './constants';

// API Endpoints
export const ENDPOINT_PRODUCT = 'product';
export const ENDPOINT_PRODUCT_CATEGORY = 'product/category';
export const ENDPOINT_PRODUCT_WHISTLIST = 'product/whishlist/';
export const ENDPOINT_PRODUCT_DETAIL = 'product/get/';
export const ENDPOINT_PRODUCT_CEK_RESTRICTED = 'product/cek_restricted';
export const ENDPOINT_PRODUCT_SEARCH = 'product/search';
export const ENDPOINT_PRODUCT_CITY = 'product/city_product';


// Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Product API Service
export const productAPI = {
  // GET Product List (POST method)
  getProducts: async (payload = {}) => {
    const defaultPayload = {
      limit: 30,
      offset: 0,
      orderby: '',
      order: 'asc',
      category: '',
      location: '',
      condition: '',
      ...payload
    };

    try {
      const response = await apiClient.post(ENDPOINT_PRODUCT, defaultPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // GET Product Categories
  getProductCategories: async () => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_CATEGORY, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
  },

  // GET Product Wishlist
  getProductWishlist: async (authToken = '') => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_WHISTLIST, {
        headers: {
          'X-auth-token': authToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product wishlist:', error);
      throw error;
    }
  },

  // GET Product Detail
  getProductDetail: async (productId: any) => {
    try {
      const response = await apiClient.get(`${ENDPOINT_PRODUCT_DETAIL}${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product detail:', error);
      throw error;
    }
  },

  // GET Product Check Restricted
  checkProductRestricted: async (authToken = '') => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_CEK_RESTRICTED, {
        headers: {
          'X-auth-token': authToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking product restrictions:', error);
      throw error;
    }
  },

  // POST Product Search
  searchProducts: async (searchPayload = {}) => {
    try {
      const response = await apiClient.post(ENDPOINT_PRODUCT_SEARCH, searchPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // GET Product Cities
  getProductCities: async () => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_CITY, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product cities:', error);
      throw error;
    }
  },

  // GET Latest Products
  getLatestProducts: async () => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_LATEST, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Latest Products API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest products:', error);
      throw error;
    }
  },

  // GET Best Seller Products
  getBestSellerProducts: async () => {
    try {
      const response = await apiClient.get(ENDPOINT_PRODUCT_BEST_SELLER, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching best seller products:', error);
      throw error;
    }
  }
};

export default productAPI;