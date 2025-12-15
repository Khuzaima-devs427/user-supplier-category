// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend-of-user-supplier-category.onrender.com/api';
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'My App';
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

// Type safety for environment variables
interface EnvironmentVariables {
  API_BASE_URL: string;
  BACKEND_URL?: string;
  CLOUDINARY_CLOUD_NAME: string;
  APP_NAME: string;
  ENVIRONMENT: 'development' | 'production' | 'test';
}

export const env: EnvironmentVariables = {
  API_BASE_URL,
  // BACKEND_URL,
  CLOUDINARY_CLOUD_NAME,
  APP_NAME,
  ENVIRONMENT: ENVIRONMENT as 'development' | 'production' | 'test',
};