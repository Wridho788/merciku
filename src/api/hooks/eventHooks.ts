import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import {
  postEvent,
  // postFrontEvent,
  postArticle,
  // getEventById,
  // getEventsByCustomer,
  registerMerchant,
  registerPublic,
  registerEvent,
} from '../api';
import { chapterApi } from '../chapterApi';

// Event Data Hooks
export function usePostEvent(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await postEvent(data);
      } catch (error) {
        throw error;
      }
    },
  });
}

// export function usePostFrontEvent(): UseMutationResult<any, Error, any> {
//   return useMutation({
//     mutationFn: async (data: any) => {
//       try {
//         return await postFrontEvent(data);
//       } catch (error) {
//         throw error;
//       }
//     },
//   });
// }

// export function useEventById(id: string): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['eventById', id],
//     queryFn: async () => {
//       try {
//         return await getEventById(id);
//       } catch (error) {
//         throw error;
//       }
//     },
//     enabled: !!id,
//     staleTime: 1000 * 60 * 5,
//     retry: 2,
//   });
// }

// interface UseEventsByCustomerPayload {
//   limit?: number;
//   offset?: number;
// }

// export function useEventsByCustomer(
//   payload: UseEventsByCustomerPayload = {},
// ): UseQueryResult<any, Error> {
//   const { token, isAuthenticated } = useAuthStore();

//   const defaultPayload = {
//     limit: 30,
//     offset: 0,
//     ...payload,
//   };

//   return useQuery({
//     queryKey: ['eventsByCustomer', JSON.stringify(defaultPayload), token],
//     queryFn: () => getEventsByCustomer(token!, defaultPayload),
//     enabled: isAuthenticated,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     retry: 2,
//   });
// }

// Article Hooks
export function usePostArticle(): UseMutationResult<any, Error, any> {
  return useMutation({
    mutationFn: async (data: any) => {
      try {
        return await postArticle(data);
      } catch (error) {
        throw error;
      }
    },
  });
}

// Chapter Hooks
interface UseChaptersPayload {
  limit?: number;
  offset?: number;
}

export function useChapters(payload: UseChaptersPayload = {}): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 100,
    offset: 0,
    ...payload,
  };

  return useQuery({
    queryKey: ['chapters', JSON.stringify(defaultPayload)],
    queryFn: async () => {
      try {
        return await chapterApi.getChapters(defaultPayload);
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useChapterById(chapterId: string): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['chapterById', chapterId, token],
    queryFn: () => chapterApi.getChapterById(chapterId, token!),
    enabled: isAuthenticated && !!chapterId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// export function useChaptersByCustomer(customerId: string): UseQueryResult<any, Error> {
//   const { token, isAuthenticated } = useAuthStore();

//   return useQuery({
//     queryKey: ['chaptersByCustomer', customerId, token],
//     queryFn: () => chapterApi.getChaptersByCustomer(customerId, token!),
//     enabled: isAuthenticated && !!customerId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     retry: 2,
//   });
// }

export function useFrontChapters(payload: UseChaptersPayload = {}): UseQueryResult<any, Error> {
  const defaultPayload = {
    limit: 100,
    offset: 0,
    ...payload,
  };

  return useQuery({
    queryKey: ['frontChapters', JSON.stringify(defaultPayload)],
    queryFn: async () => {
      try {
        return await chapterApi.getFrontChapters(defaultPayload);
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Event Registration Hooks
interface UseMerchantRegistrationPayload {
  eventid: string;
  name: string;
  cp: string;
  address: string;
  phone: string;
  email: string;
  menu: string;
  qty: string;
}

export function useMerchantRegistration(): UseMutationResult<
  any,
  Error,
  UseMerchantRegistrationPayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: UseMerchantRegistrationPayload) => {
      try {
        const formData = new FormData();
        formData.append('eventid', payload.eventid);
        formData.append('name', payload.name);
        formData.append('cp', payload.cp);
        formData.append('address', payload.address);
        formData.append('phone', payload.phone);
        formData.append('email', payload.email);
        formData.append('menu', payload.menu);
        formData.append('qty', payload.qty);
        return await registerMerchant(token!, formData);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UsePublicRegistrationPayload {
  eventid: string;
  name: string;
  type: string;
  policeno: string;
  phone: string;
  email: string;
  notes: string;
}

export function usePublicRegistration(): UseMutationResult<
  any,
  Error,
  UsePublicRegistrationPayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: UsePublicRegistrationPayload) => {
      try {
        const formData = new FormData();
        formData.append('eventid', payload.eventid);
        formData.append('name', payload.name);
        formData.append('type', payload.type);
        formData.append('policeno', payload.policeno);
        formData.append('phone', payload.phone);
        formData.append('email', payload.email);
        formData.append('notes', payload.notes);
        return await registerPublic(token!, formData);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useEventRegister(eventId: string): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['eventRegister', eventId, token],
    queryFn: () => registerEvent(token!, eventId),
    enabled: isAuthenticated && !!eventId && !!token,
    retry: 2,
  });
}

// Infinite scroll helpers
export function useInfiniteEvents(): UseMutationResult<
  any,
  Error,
  {
    status: '0' | '1';
    limit: number;
    offset: number;
    chapter?: string;
  }
> {
  return useMutation({
    mutationFn: (data) => postEvent(data),
  });
}

export function useInfiniteArticles(): UseMutationResult<
  any,
  Error,
  {
    limit: number;
    offset: number;
  }
> {
  return useMutation({
    mutationFn: (data) => postArticle(data),
  });
}
