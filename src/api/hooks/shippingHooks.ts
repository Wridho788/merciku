import { useMutation } from '@tanstack/react-query';
import type {  UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { customerApi } from '../customerApi';
// import { getProvince, getCityByProvince, getDistrictByCity } from '../api';
import type { SetShippingRequest, SetShippingResponse } from '../types';

// Location Hooks
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getProvince, getCityByProvince, getDistrictByCity } from '../api';

export function useProvince(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['province'],
    queryFn: async () => {
      try {
        return await getProvince();
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

export function useCityByProvince(provinceId: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['city', provinceId],
    queryFn: async () => {
      if (!provinceId) throw new Error('Province ID required');
      try {
        return await getCityByProvince(provinceId);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

export function useDistrictByCity(cityId: string | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['district', cityId],
    queryFn: async () => {
      if (!cityId) throw new Error('City ID required');
      try {
        return await getDistrictByCity(cityId);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!cityId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

// Set Shipping Hook
export function useSetShipping(): UseMutationResult<
  SetShippingResponse,
  Error,
  SetShippingRequest,
  unknown
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: SetShippingRequest) => {
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      return await customerApi.setShipping(payload, token);
    },
    onSuccess: (data) => {
      console.log('✅ Set shipping success:', data);
    },
    onError: (error) => {
      console.error('❌ Set shipping error:', error);
    },
  });
}