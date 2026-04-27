import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_LEDGER,
  ENDPOINT_SLIDER,
  ENDPOINT_SPLASH,
  ENDPOINT_EVENT,
  ENDPOINT_ARTICLE,
  ENDPOINT_EVENT_REGISTER_MERCHANT,
  ENDPOINT_EVENT_REGISTER_PUBLIC,
  ENDPOINT_EVENT_REGISTER,
  ENDPOINT_PROVINCE_SHIPPING,
  ENDPOINT_GET_CITY,
  ENDPOINT_DISTRICT_SHIPPING,
} from './constants';

export const getLedger = async (authToken: string) => {
  const response = await axios.post(
    `${BASE_URL}${ENDPOINT_LEDGER}`,
    {},
    {
      headers: {
        'X-auth-token': authToken,
      },
    },
  );
  return response.data;
};

export const getSlider = async () => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_SLIDER}`, {
    limit: '10',
    offset: '0',
  });
  return response.data;
};

export const getSplash = async () => {
  const response = await axios.get(`${BASE_URL}${ENDPOINT_SPLASH}`);
  return response.data;
};

export const postEvent = async (data?: any) => {
  const defaultPayload = {
    status: '1',
    limit: 300,
    offset: 0,
    chapter: '',
  };
  const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT}`, payload);
  return response.data;
};

// export const postFrontEvent = async (data?: any) => {
//   const defaultPayload = {
//     limit: 10,
//     offset: 0,
//   };
//   const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
//   const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_FRONT}`, payload);
//   return response.data;
// };

// export const getEventById = async (id: string) => {
//   const response = await axios.get(`${BASE_URL}${ENDPOINT_EVENT_BY_ID}${id}`);
//   return response.data;
// };

export const postArticle = async (data?: any) => {
  const defaultPayload = { category: 24, limit: 10, offset: 0, orderby: '', order: 'asc' };
  const payload = data ? { ...defaultPayload, ...data } : defaultPayload;
  const response = await axios.post(`${BASE_URL}${ENDPOINT_ARTICLE}`, payload);
  return response.data;
};

// export const getCity = async () => {
//   const url = `${BASE_URL}${ENDPOINT_CITY_GET_CITY}`;

//   const response = await axios.get(url);
//   return response.data;
// };

// export const getCityList = async () => {
//   const url = `${BASE_URL}${ENDPOINT_CITY}`;

//   const response = await axios.get(url);
//   return response.data;
// };

export const getProvince = async () => {
  const url = `${BASE_URL}${ENDPOINT_PROVINCE_SHIPPING}`;
  const response = await axios.get(url);
  return response.data;
};

export const getCityByProvince = async (provinceId: string) => {
  const url = `${BASE_URL}${ENDPOINT_GET_CITY}/${provinceId}`;
  const response = await axios.get(url);
  return response.data;
};

export const getDistrictByCity = async (cityId: string) => {
  const url = `${BASE_URL}${ENDPOINT_DISTRICT_SHIPPING}/${cityId}`;
  const response = await axios.get(url);
  return response.data;
};

// export const getEventsByCustomer = async (authToken: string, data?: any) => {
//   const defaultPayload = {
//     limit: 30,
//     offset: 0,
//   };
//   const payload = data ? { ...defaultPayload, ...data } : defaultPayload;

//   const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_GET_BY_CUSTOMER}`, payload, {
//     headers: {
//       'X-auth-token': authToken,
//     },
//   });
//   return response.data;
// };

export const registerMerchant = async (authToken: string, formData: FormData) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_REGISTER_MERCHANT}`, formData, {
    headers: {
      'X-auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });

  // Return both data and status code
  return {
    ...response.data,
    status: response.status,
  };
};

export const registerPublic = async (authToken: string, formData: FormData) => {
  const response = await axios.post(`${BASE_URL}${ENDPOINT_EVENT_REGISTER_PUBLIC}`, formData, {
    headers: {
      'X-auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });

  // Return both data and status code
  return {
    ...response.data,
    status: response.status,
  };
};

export const registerEvent = async (authToken: string, eventId: string) => {
  try {
    // Use GET method with eventId in URL path
    const response = await axios.get(`${BASE_URL}${ENDPOINT_EVENT_REGISTER}/${eventId}`, {
      headers: {
        'X-auth-token': authToken,
      },
    });

    // Return both data and status code
    return {
      ...response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('❌ Event registration API error:', error);

    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('Event not found. Please check the event ID.');
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.message || 'Invalid request. Please check your data.',
        );
      }
      console.error('❌ Unexpected error response:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Registration failed');
    } else {
      // Other error
      throw error;
    }
  }
};
