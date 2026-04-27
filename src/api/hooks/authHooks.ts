import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { customerApi } from '../customerApi';
import type {
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

// Authentication Hooks
export function useLogin(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      try {
        return await customerApi.login(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRegister(): UseMutationResult<RegisterResponse, Error, RegisterRequest> {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      try {
        return await customerApi.register(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useForgotPassword(): UseMutationResult<
  ForgotPasswordResponse,
  Error,
  ForgotPasswordRequest
> {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      try {
        return await customerApi.forgotPassword(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useRequestOTP(): UseMutationResult<RequestOTPResponse, Error, RequestOTPRequest> {
  return useMutation({
    mutationFn: async (payload: RequestOTPRequest) => {
      try {
        return await customerApi.requestOTP(payload);
      } catch (error) {
        throw error;
      }
    },
  });
}

interface UseSimpleRequestOTPOptions {
  enabled?: boolean;
  onSuccess?: (data: RequestOTPResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Simple hook for requesting OTP with username validation
 * Only allows mutation when username is provided and not empty
 */
export function useSimpleRequestOTP(
  username: string,
  options?: UseSimpleRequestOTPOptions
): UseMutationResult<RequestOTPResponse, Error, RequestOTPRequest> & {
  canRequest: boolean;
  requestOTP: () => void;
} {
  // Validate username - must exist and not be empty/whitespace
  const canRequest = Boolean(username && username.trim().length > 0);

  const mutation = useMutation({
    mutationFn: async (payload: RequestOTPRequest): Promise<RequestOTPResponse> => {
      if (!payload.username || !payload.username.trim()) {
        throw new Error('Username is required to request OTP');
      }
      try {
        return await customerApi.requestOTP(payload);
      } catch (error) {
        console.error('Request OTP Error:', error);
        throw error;
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  // Simple wrapper function for easier usage
  const requestOTP = () => {
    if (canRequest) {
      mutation.mutate({ username: username.trim() });
    } else {
      console.warn('Cannot request OTP: Username is required');
    }
  };

  return {
    ...mutation,
    canRequest,
    requestOTP,
  };
}

interface UseVerifyOTPPayload {
  id_customer: string;
  otp: string;
}

export function useVerifyOTP(): UseMutationResult<any, Error, UseVerifyOTPPayload> {
  return useMutation({
    mutationFn: async (payload: UseVerifyOTPPayload) => {
      if (!payload.id_customer || payload.id_customer.trim() === '') {
        throw new Error('Customer ID is required');
      }
      if (!payload.otp || payload.otp.trim() === '') {
        throw new Error('OTP code is required');
      }
      try {
        return await customerApi.verifyOTP(payload.id_customer, payload.otp);
      } catch (error) {
        console.error('Verify OTP Hook Error:', error);
        throw error;
      }
    },
  });
}

// Profile & Customer Hooks
interface UseUpdateProfilePayload {
  data: UpdateProfileRequest;
}

export function useUpdateProfile(): UseMutationResult<
  UpdateProfileResponse,
  Error,
  UseUpdateProfilePayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ data }: UseUpdateProfilePayload) => customerApi.updateProfile(data, token!),
  });
}

interface UseChangePasswordPayload {
  data: ChangePasswordRequest;
  authToken: string;
}

export function useChangePassword(): UseMutationResult<
  ChangePasswordResponse,
  Error,
  UseChangePasswordPayload
> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ data }: UseChangePasswordPayload) => customerApi.changePassword(data, token!),
  });
}

export function useProfile(): UseQueryResult<GetProfileResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => customerApi.getProfile(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// export function useCustomerById(customerId: string): UseQueryResult<GetProfileResponse, Error> {
//   const { token, isAuthenticated } = useAuthStore();

//   return useQuery({
//     queryKey: ['customer', customerId, token],
//     queryFn: () => customerApi.getCustomerById(customerId, token!),
//     enabled: isAuthenticated && !!customerId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     retry: 2,
//   });
// }

export function useDecodeToken(): UseQueryResult<DecodeTokenResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['decodeToken', token],
    queryFn: () => customerApi.decodeToken(token!),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes (token info doesn't change often)
    retry: 2,
  });
}

// Notification Hooks
export function useNotifications(
  payload?: NotificationPayload,
): UseQueryResult<NotificationResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', token, JSON.stringify(payload || {})],
    queryFn: () => customerApi.getNotifications(token!, payload),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes (notifications update more frequently)
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUnreadNotifications(): UseQueryResult<NotificationResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['unreadNotifications', token],
    queryFn: () => customerApi.getNotifications(token!, { read: '0' }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute (unread count should be more fresh)
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status || 0)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useNotificationDetail(
  notificationId: string,
  payload?: NotificationPayload,
): UseQueryResult<NotificationDetailResponse, Error> {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notificationDetail', notificationId, token, JSON.stringify(payload || {})],
    queryFn: () => customerApi.getNotificationDetail(notificationId, token!, payload),
    enabled: isAuthenticated && !!notificationId,
    staleTime: 1000 * 60 * 2, // shorter cache for detail to allow refresh
    retry: 2,
  });
}

// Upload & Logout Hooks
interface UseUploadImagePayload {
  file: File;
  authToken: string;
}

export function useUploadImage(): UseMutationResult<any, Error, UseUploadImagePayload> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async ({ file }: UseUploadImagePayload) => {
      if (!file) {
        throw new Error('File is required for upload');
      }
      try {
        return await customerApi.uploadImage(file, token!);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useLogout(): UseMutationResult<LogoutResponse, Error, string> {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        return await customerApi.logout(token!);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Clear localStorage on successful logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userLog');
    },
  });
}