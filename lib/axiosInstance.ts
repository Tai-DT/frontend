import axios, { AxiosError } from 'axios';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

if (!STRAPI_API_URL) {
  console.error('NEXT_PUBLIC_STRAPI_API_URL is not defined');
}

if (!STRAPI_API_TOKEN) {
  console.error('NEXT_PUBLIC_STRAPI_API_TOKEN is not defined');
}

const axiosInstance = axios.create({
  baseURL: STRAPI_API_URL || 'http://localhost:1337',
  timeout: 30000, // Increase timeout to 30 seconds for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, 
        config.params ? `Params: ${JSON.stringify(config.params)}` : ''
      );
    }
    
    // Only add Authorization header if token exists
    if (STRAPI_API_TOKEN) {
      config.headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response debugging
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response (${response.status}): ${response.config.url?.split('?')[0]}`);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL, // Added to help with debugging URL issues
        fullURL: `${error.config?.baseURL}${error.config?.url}` // Complete URL for clarity
      });
      
      // More detailed logging for 404 errors to help diagnose API path issues
      if (error.response.status === 404) {
        console.warn('404 Not Found Error - Check if this endpoint exists in your Strapi backend:', 
          `${error.config?.baseURL}${error.config?.url}`);
        console.warn('If you\'re using a new content type, ensure it has been created and has API permissions enabled in Strapi');
      }
    } else if (error.request) {
      console.error('API Request Error:', {
        message: 'No response received',
        request: error.request,
        url: error.config?.url
      });
    } else {
      console.error('API Configuration Error:', {
        message: error.message,
        url: error.config?.url
      });
    }

    // Additional server-side logging
    if (typeof window === 'undefined') {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        path: error.config?.url,
        method: error.config?.method
      };
      console.error('Server-side Axios Error:', errorDetails);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
