// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { clientService } from '../../app/utils/api-client';

// interface LoginFormData {
//   name: string;
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }

// interface ApiResponse {
//   success: boolean;
//   message?: string;
//   data?: {
//     token?: string;
//     user?: any;
//   };
// }

// const LoginPage = () => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string>('');
//   const [showPassword, setShowPassword] = useState(false);

//   const [formData, setFormData] = useState<LoginFormData>({
//     name: '',
//     email: '',
//     password: '',
//     rememberMe: false,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//     // Clear errors when user types
//     if (error) setError('');
//   };

//   const validateForm = (): boolean => {
//     // Clear previous messages
//     setError('');

//     // Required fields validation - NOW INCLUDES NAME
//     if (!formData.name) {
//       setError('Name is required');
//       return false;
//     }

//     if (!formData.email) {
//       setError('Email address is required');
//       return false;
//     }

//     if (!formData.password) {
//       setError('Password is required');
//       return false;
//     }

//     // Name validation
//     if (formData.name.trim().length < 2) {
//       setError('Name must be at least 2 characters long');
//       return false;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setError('Please enter a valid email address');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       // Include name in login data as required by backend
//       const loginData = {
//         name: formData.name.trim(),
//         email: formData.email,
//         password: formData.password,
//       };

//       console.log('🔐 Logging in with data:', {
//         ...loginData,
//         password: '***'
//       });

//       // Try different endpoints in case of routing issues
//       let response;
//       const endpoints = ['/login', '/auth/login']; // Try both patterns
      
//       for (const endpoint of endpoints) {
//         try {
//           console.log(`Trying endpoint: ${endpoint}`);
//           response = await clientService.post<ApiResponse>(endpoint, loginData);
//           console.log(`Success with endpoint: ${endpoint}`);
//           break; // Exit loop if successful
//         } catch (err: any) {
//           console.log(`Failed with endpoint ${endpoint}:`, err.message);
//           // Continue to next endpoint
//         }
//       }

//       if (!response) {
//         throw new Error('Could not reach login endpoint. Please check if the server is running.');
//       }

//       const result = response.data;

//       if (result.success) {
//         console.log('✅ Login successful:', result);
        
//         // Store token if available
//         if (result.data?.token) {
//           localStorage.setItem('token', result.data.token);
//           // Store user data if available
//           if (result.data.user) {
//             localStorage.setItem('user', JSON.stringify(result.data.user));
//           }
//         }

//         // Store remember me preference
//         if (formData.rememberMe && result.data?.token) {
//           localStorage.setItem('rememberMe', 'true');
//         } else {
//           localStorage.removeItem('rememberMe');
//         }

//         // Redirect to dashboard or home page
//         router.push('/dashboard');
//       } else {
//         setError(result.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (error: any) {
//       console.error('❌ Login error:', error);
      
//       if (error.response?.status === 401) {
//         setError('Invalid email or password. Please try again.');
//       } else if (error.response?.status === 400) {
//         setError(error.response.data?.message || 'Validation failed. Please check all fields.');
//       } else if (error.response?.status === 404) {
//         setError('Login endpoint not found. Please make sure the backend is running.');
//       } else if (error.response?.data?.message) {
//         setError(error.response.data.message);
//       } else if (error.message?.includes('Network Error')) {
//         setError('Network error. Please check your internet connection.');
//       } else {
//         setError('An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-lg">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
//           Sign in to your account
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Don't have an account?{' '}
//           <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
//             Sign up here
//           </Link>
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
//         <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-200">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//               <p className="text-sm text-red-600 flex items-center">
//                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//                 {error}
//               </p>
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Full Name *
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   autoComplete="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-400 sm:text-sm"
//                   placeholder="John Doe"
//                 />
//               </div>
//               <p className="mt-1 text-xs text-gray-500">
//                 Enter the name you used during registration
//               </p>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email Address *
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-400 sm:text-sm"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password *
//               </label>
//               <div className="mt-1 relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="current-password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-400 sm:text-sm pr-10"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                     </svg>
//                   ) : (
//                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="rememberMe"
//                   name="rememberMe"
//                   type="checkbox"
//                   checked={formData.rememberMe}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-sm">
//                 <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
//                   Forgot your password?
//                 </Link>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//               >
//                 {isLoading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     Signing in...
//                   </>
//                 ) : (
//                   'Sign in'
//                 )}
//               </button>
//             </div>
//           </form>

//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-500">
//             By signing in, you agree to our Terms and Conditions and Privacy Policy.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

















'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientService } from '../../app/utils/api-client';
import { usePermissions } from '../../_components/contexts/PermissionContext';

interface LoginFormData {
  // name: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: any;
    permissions?: any;
  };
}

const STATIC_ADMIN_EMAIL = 'admin@example.com';

const LoginPage = () => {
  const router = useRouter();
  const { setPermissions } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    // name: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    setError('');

    // if (!formData.name) {
    //   setError('Name is required');
    //   return false;
    // }

    if (!formData.email) {
      setError('Email address is required');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    // if (formData.name.trim().length < 2) {
    //   setError('Name must be at least 2 characters long');
    //   return false;
    // }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginData = {
        // name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      };

      console.log('🔐 Attempting login with:', { 
        email: loginData.email,
        // nameLength: loginData.name.length,
        hasPassword: !!loginData.password,
        isStaticAdminAttempt: loginData.email === STATIC_ADMIN_EMAIL
      });

      // First try /login endpoint
      let response;
      try {
        response = await clientService.post<ApiResponse>('/login', loginData);
        console.log('✅ Login successful via /login endpoint');
      } catch (err: any) {
        console.log('❌ /login failed, trying /auth/login:', err.message);
        try {
          response = await clientService.post<ApiResponse>('/auth/login', loginData);
          console.log('✅ Login successful via /auth/login endpoint');
        } catch (err2: any) {
          console.error('❌ Both login endpoints failed:', err2.message);
          throw new Error('Could not reach login endpoint. Please check if the server is running.');
        }
      }

      const result = response.data;

      if (!result.success) {
        setError(result.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (!result.data) {
        setError('Login response missing user data. Please contact administrator.');
        return;
      }

      console.log('✅ Login API response:', {
        hasToken: !!result.data.token,
        hasPermissions: !!result.data.permissions,
        hasUser: !!result.data.user,
      });

      // Store token if available
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        console.log('🔐 Token stored in localStorage');
      }

      // Store user data if available
      if (result.data.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
        console.log('👤 User data stored:', result.data.user);
      }

      // ========== CRITICAL: Handle permissions ==========
      let finalPermissions;
      
      if (result.data.permissions) {
        const permissions = result.data.permissions;
        
        console.log('📋 Permissions received from server:', {
          isStaticAdmin: permissions.isStaticAdmin,
          user_categories_edit: permissions['user_categories.edit'],
          user_categories_delete: permissions['user_categories.delete'],
          user_categories_create: permissions['user_categories.create'],
          export_permission: permissions['export'],
          import_permission: permissions['import'],
          allTruePermissions: Object.keys(permissions).filter(k => permissions[k])
        });

        // ========== IMPORTANT FIX ==========
        // Trust the backend permissions completely for static admin
        // Only add missing isStaticAdmin flag if needed
        finalPermissions = permissions;
        
        // Check if this is static admin login
        const isStaticAdminLogin = loginData.email === STATIC_ADMIN_EMAIL && loginData.password === 'admin123';
        
        if (isStaticAdminLogin) {
          console.log('👑 Static admin login detected - ensuring isStaticAdmin flag is true');
          
          // Just ensure the isStaticAdmin flag is set to true
          // Don't override the permissions object from backend
          finalPermissions = {
            ...finalPermissions, // Keep all backend permissions
            isStaticAdmin: true  // Ensure this flag is true
          };
          
          // Debug: Verify that key permissions are present
          console.log('🔍 Static admin permissions after fix:', {
            isStaticAdmin: finalPermissions.isStaticAdmin,
            has_user_categories_create: finalPermissions['user_categories.create'] === true,
            has_user_categories_edit: finalPermissions['user_categories.edit'] === true,
            has_user_categories_delete: finalPermissions['user_categories.delete'] === true,
            has_export: finalPermissions['export'] === true,
            has_import: finalPermissions['import'] === true
          });
        }
        
      } else {
        console.warn('⚠️ No permissions received from server - user may have view-only access');
        // Set default view-only permissions
        finalPermissions = {
          view: true,
          editProfile: true,
          changePassword: true,
          'dashboard.view': true,
          'users.view': true,
          'user_categories.view': true,
          'suppliers.view': true,
          'supplier_categories.view': true,
          'projects.view': true,
          isStaticAdmin: false
        };
      }

      console.log('✅ Final permissions to be stored:', {
        isStaticAdmin: finalPermissions.isStaticAdmin,
        user_categories_edit: finalPermissions['user_categories.edit'],
        user_categories_delete: finalPermissions['user_categories.delete'],
        user_categories_create: finalPermissions['user_categories.create'],
        export_permission: finalPermissions['export'],
        import_permission: finalPermissions['import'],
        keysWithTrue: Object.keys(finalPermissions).filter(k => finalPermissions[k])
      });

      // Store in context
      setPermissions(finalPermissions);
      
      // Store in localStorage for persistence
      localStorage.setItem('userPermissions', JSON.stringify(finalPermissions));
      
      console.log('✅ Permissions stored in context and localStorage');

      // Store remember me preference
      if (formData.rememberMe && result.data.token) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Wait for state updates, then redirect
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard...');
        router.push('/dashboard');
        router.refresh();
      }, 300);

    } catch (error: any) {
      console.error('❌ Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Validation failed. Please check all fields.');
      } else if (error.response?.status === 404) {
        setError('Login service unavailable. Please contact administrator.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else if (error.message?.includes('login endpoint')) {
        setError('Login service is currently unavailable. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                placeholder="John Doe"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the exact name used during registration
              </p>
            </div> */}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-12 transition duration-150"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New to our platform?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;