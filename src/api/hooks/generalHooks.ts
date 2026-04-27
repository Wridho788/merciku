import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import {
  getLedger,
  getSlider,
  getSplash,
  // getCity,
  // getCityList,
  // getProvince,
  // getCityByProvince,
  // getDistrictByCity,
} from '../api';

// Ledger Hook
export function useLedger(): UseQueryResult<any, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['ledger', token],
    queryFn: () => getLedger(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// UI Content Hooks
export function useSlider(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['slider'],
    queryFn: async () => {
      try {
        return await getSlider();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useSplash(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['splash'],
    queryFn: async () => {
      try {
        return await getSplash();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// Location Hooks
// export function useCity(): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['city'],
//     queryFn: async () => {
//       try {
//         return await getCity();
//       } catch (error) {
//         throw error;
//       }
//     },
//     staleTime: 1000 * 60 * 10, // 10 minutes (city data doesn't change often)
//     retry: 2,
//   });
// }

// export function useCityList(): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['city-list'],
//     queryFn: async () => {
//       try {
//         return await getCityList();
//       } catch (error) {
//         console.error('Error fetching city list:', error);
//         throw error;
//       }
//     },
//     staleTime: 1000 * 60 * 10, // 10 minutes (city data doesn't change often)
//     retry: 2,
//   });
// }

// export function useProvinceList(): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['province'],
//     queryFn: async () => {
//       try {
//         return await getProvince();
//       } catch (error) {
//         throw error;
//       }
//     },
//     staleTime: 1000 * 60 * 10, // 10 minutes
//     retry: 2,
//   });
// }

// export function useCityListByProvince(provinceId: string | null): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['city', provinceId],
//     queryFn: async () => {
//       if (!provinceId) throw new Error('Province ID required');
//       try {
//         return await getCityByProvince(provinceId);
//       } catch (error) {
//         throw error;
//       }
//     },
//     enabled: !!provinceId,
//     staleTime: 1000 * 60 * 10, // 10 minutes
//     retry: 2,
//   });
// }

// export function useDistrictListByCity(cityId: string | null): UseQueryResult<any, Error> {
//   return useQuery({
//     queryKey: ['district', cityId],
//     queryFn: async () => {
//       if (!cityId) throw new Error('City ID required');
//       try {
//         return await getDistrictByCity(cityId);
//       } catch (error) {
//         throw error;
//       }
//     },
//     enabled: !!cityId,
//     staleTime: 1000 * 60 * 10, // 10 minutes
//     retry: 2,
//   });
// }