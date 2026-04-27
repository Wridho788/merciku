import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_CHAPTER,
  ENDPOINT_CHAPTER_BY_ID,
  // ENDPOINT_CHAPTER_GET_BY_CUSTOMER,
  ENDPOINT_GET_FRONT,
} from './constants';

// Types for Chapter API
export interface ChapterListRequest {
  limit: number;
  offset: number;
}

export interface ChapterItem {
  id: string;
  title: string;
  name: string;
  description?: string;
  image?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // For additional fields from API
}

export interface ChapterListResponse {
  status: boolean;
  message: string;
  content: {
    result: ChapterItem[];
    total: number;
    [key: string]: any;
  };
}

export interface ChapterDetailResponse {
  status: boolean;
  message: string;
  content: ChapterItem;
}

export interface ChapterByCustomerResponse {
  status: boolean;
  message: string;
  content: {
    result: ChapterItem[];
    total: number;
    [key: string]: any;
  };
}

// Axios instance for chapter API
const chapterApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Chapter API functions
export const chapterApi = {
  // Get chapters list with pagination
  getChapters: async (payload: ChapterListRequest): Promise<ChapterListResponse> => {
    try {
      const response = await chapterApiClient.post(
        ENDPOINT_CHAPTER,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapters');
      }
      throw error;
    }
  },

  // Get chapter by ID
  getChapterById: async (chapterId: string, authToken: string): Promise<ChapterDetailResponse> => {
    try {
      const response = await chapterApiClient.get(
        `${ENDPOINT_CHAPTER_BY_ID}${chapterId}`,
        {
          headers: {
            'X-auth-token': authToken,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching chapter detail:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chapter detail');
      }
      throw error;
    }
  },

  // Get chapters by customer ID
  // getChaptersByCustomer: async (customerId: string, authToken: string): Promise<ChapterByCustomerResponse> => {
  //   try {
  //     const response = await chapterApiClient.get(
  //       `${ENDPOINT_CHAPTER_GET_BY_CUSTOMER}${customerId}`,
  //       {
  //         headers: {
  //           'X-auth-token': authToken,
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error('❌ Error fetching customer chapters:', error);
  //     if (axios.isAxiosError(error)) {
  //       throw new Error(error.response?.data?.message || 'Failed to fetch customer chapters');
  //     }
  //     throw error;
  //   }
  // },

  // Get front chapters
  getFrontChapters: async (payload: ChapterListRequest): Promise<ChapterListResponse> => {
    try {
      const response = await chapterApiClient.post(
        ENDPOINT_GET_FRONT,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching front chapters:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch front chapters');
      }
      throw error;
    }
  },
};

export default chapterApi;
