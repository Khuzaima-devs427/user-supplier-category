// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Define permission types - ADD hero_slider permissions
// export type PermissionKey = 
//   | 'dashboard.view'
//   | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
//   | 'user_categories.view' | 'user_categories.create' | 'user_categories.edit' | 'user_categories.delete'
//   | 'suppliers.view' | 'suppliers.create' | 'suppliers.edit' | 'suppliers.delete'
//   | 'supplier_categories.view' | 'supplier_categories.create' | 'supplier_categories.edit' | 'supplier_categories.delete'
//   // ADD Hero Slider permissions
//   | 'hero_slider.view' | 'hero_slider.create' | 'hero_slider.edit' | 'hero_slider.delete'
//   | 'projects.view'
//   | 'analytics.view'
//   | 'settings.view'
//   | 'export'
//   | 'import'
//   | 'isStaticAdmin'
//   | string; // Allow any string for custom permissions

// // Base permissions interface - ADD hero_slider permissions
// interface BasePermissions {
//   // CRITICAL: Add isStaticAdmin
//   isStaticAdmin: boolean;
  
//   // Base permissions
//   view: boolean;
//   editProfile: boolean;
//   changePassword: boolean;
  
//   // Action permissions
//   create: boolean;
//   edit: boolean;
//   delete: boolean;
  
//   // Management permissions
//   manageUsers: boolean;
//   manageSuppliers: boolean;
//   manageCategories: boolean;
//   manageContent: boolean; // ADD: For content management like hero slider
//   viewAnalytics: boolean;
//   manageSettings: boolean;
//   blockUsers: boolean;
//   approveSuppliers: boolean;
  
//   // System permissions
//   'dashboard.view': boolean;
//   'users.view': boolean;
//   'users.create': boolean;
//   'users.edit': boolean;
//   'users.delete': boolean;
//   'user_categories.view': boolean;
//   'user_categories.create': boolean;
//   'user_categories.edit': boolean;
//   'user_categories.delete': boolean;
//   'suppliers.view': boolean;
//   'suppliers.create': boolean;
//   'suppliers.edit': boolean;
//   'suppliers.delete': boolean;
//   'supplier_categories.view': boolean;
//   'supplier_categories.create': boolean;
//   'supplier_categories.edit': boolean;
//   'supplier_categories.delete': boolean;
//   // ADD Hero Slider permissions
//   'hero_slider.view': boolean;
//   'hero_slider.create': boolean;
//   'hero_slider.edit': boolean;
//   'hero_slider.delete': boolean;
//   'projects.view': boolean;
//   'analytics.view': boolean;
//   'settings.view': boolean;
//   'export': boolean;
//   'import': boolean;
// }

// // Permissions type with dynamic keys
// export type Permissions = BasePermissions & {
//   [key: string]: boolean;
// };

// export interface PermissionContextType {
//   permissions: Permissions;
//   loading: boolean;
//   error: string | null;
//   hasPermission: (permission: PermissionKey | PermissionKey[]) => boolean;
//   hasAnyPermission: (permissions: PermissionKey[]) => boolean;
//   hasAllPermissions: (permissions: PermissionKey[]) => boolean;
//   setPermissions: (permissions: any) => void;
//   clearPermissions: () => void;
//   isAdmin: () => boolean;
//   isStaticAdmin: () => boolean;
//   getResourcePermissions: (resource: string) => {
//     canView: boolean;
//     canCreate: boolean;
//     canEdit: boolean;
//     canDelete: boolean;
//   };
// }

// // Default permissions (view-only) - ADD hero_slider permissions
// const defaultPermissions: Permissions = {
//   // CRITICAL: Add isStaticAdmin
//   isStaticAdmin: false,
  
//   // Base
//   view: true,
//   editProfile: true,
//   changePassword: true,
  
//   // Actions
//   create: false,
//   edit: false,
//   delete: false,
  
//   // Management
//   manageUsers: false,
//   manageSuppliers: false,
//   manageCategories: false,
//   manageContent: false, // ADD: For content management
//   viewAnalytics: false,
//   manageSettings: false,
//   blockUsers: false,
//   approveSuppliers: false,
  
//   // System
//   'dashboard.view': true,
//   'users.view': true,
//   'users.create': false,
//   'users.edit': false,
//   'users.delete': false,
//   'user_categories.view': true,
//   'user_categories.create': false,
//   'user_categories.edit': false,
//   'user_categories.delete': false,
//   'suppliers.view': true,
//   'suppliers.create': false,
//   'suppliers.edit': false,
//   'suppliers.delete': false,
//   'supplier_categories.view': true,
//   'supplier_categories.create': false,
//   'supplier_categories.edit': false,
//   'supplier_categories.delete': false,
//   // ADD Hero Slider permissions - default to false for view, true for admin
//   'hero_slider.view': false, // CHANGED: Default to false, not everyone should see hero slider
//   'hero_slider.create': false,
//   'hero_slider.edit': false,
//   'hero_slider.delete': false,
//   'projects.view': true,
//   'analytics.view': false,
//   'settings.view': false,
//   'export': false,
//   'import': false,
// };

// const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// interface PermissionProviderProps {
//   children: ReactNode;
//   initialPermissions?: Partial<Permissions>;
// }

// export const PermissionProvider: React.FC<PermissionProviderProps> = ({ 
//   children, 
//   initialPermissions 
// }) => {
//   const [permissions, setPermissionsState] = useState<Permissions>(() => {
//     // DEBUG: Log initialization
//     console.log('🔄 PermissionProvider initializing...');
    
//     // First, check if we have stored permissions in localStorage
//     if (typeof window !== 'undefined') {
//       const savedPermissions = localStorage.getItem('userPermissions');
//       if (savedPermissions) {
//         try {
//           const parsedPermissions = JSON.parse(savedPermissions);
//           console.log('📥 Found permissions in localStorage:', {
//             isStaticAdmin: parsedPermissions.isStaticAdmin,
//             hero_slider_view: parsedPermissions['hero_slider.view'],
//             hero_slider_edit: parsedPermissions['hero_slider.edit'],
//             keys: Object.keys(parsedPermissions).filter(k => parsedPermissions[k])
//           });
          
//           // Start with parsed permissions and fill missing with defaults
//           const base: any = {};
          
//           // First, copy all boolean values from localStorage
//           Object.keys(parsedPermissions).forEach(key => {
//             const value = parsedPermissions[key];
//             if (typeof value === 'boolean') {
//               base[key] = value;
//             }
//           });
          
//           // Then, ensure all default keys exist (but don't override localStorage values)
//           Object.keys(defaultPermissions).forEach(key => {
//             if (!(key in base)) {
//               base[key] = defaultPermissions[key as keyof Permissions];
//             }
//           });
          
//           console.log('✅ Initial permissions from localStorage:', {
//             isStaticAdmin: base.isStaticAdmin,
//             typeOfIsStaticAdmin: typeof base.isStaticAdmin,
//             hero_slider_view: base['hero_slider.view'],
//             hero_slider_edit: base['hero_slider.edit']
//           });
          
//           return base as Permissions;
//         } catch (err) {
//           console.error('❌ Error parsing localStorage permissions:', err);
//         }
//       }
//     }
    
//     // If no localStorage, use default with initialPermissions
//     const base: Permissions = { ...defaultPermissions };
    
//     if (initialPermissions) {
//       // Merge initial permissions carefully
//       Object.keys(initialPermissions).forEach(key => {
//         const value = (initialPermissions as any)[key];
//         if (typeof value === 'boolean') {
//           (base as any)[key] = value;
//         }
//       });
//     }
    
//     console.log('✅ Using default permissions initially');
//     return base;
//   });
  
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Save permissions to localStorage whenever they change
//   useEffect(() => {
//     try {
//       localStorage.setItem('userPermissions', JSON.stringify(permissions));
//       console.log('💾 Saved permissions to localStorage:', {
//         isStaticAdmin: permissions.isStaticAdmin,
//         hasIsStaticAdmin: 'isStaticAdmin' in permissions,
//         typeOfIsStaticAdmin: typeof permissions.isStaticAdmin,
//         user_categories_create: permissions['user_categories.create'],
//         user_categories_edit: permissions['user_categories.edit'],
//         user_categories_delete: permissions['user_categories.delete'],
//         hero_slider_view: permissions['hero_slider.view'],
//         hero_slider_create: permissions['hero_slider.create'],
//         hero_slider_edit: permissions['hero_slider.edit'],
//         hero_slider_delete: permissions['hero_slider.delete'],
//         keys: Object.keys(permissions).filter(k => permissions[k])
//       });
//     } catch (err) {
//       console.error('Error saving permissions to localStorage:', err);
//     }
//   }, [permissions]);

//   // Add debug effect to log permission changes
//   useEffect(() => {
//     console.log('🔍 CURRENT PERMISSIONS STATE:', {
//       isStaticAdmin: permissions.isStaticAdmin,
//       typeOfIsStaticAdmin: typeof permissions.isStaticAdmin,
//       user_categories_create: permissions['user_categories.create'],
//       user_categories_edit: permissions['user_categories.edit'],
//       user_categories_delete: permissions['user_categories.delete'],
//       hero_slider_view: permissions['hero_slider.view'],
//       hero_slider_create: permissions['hero_slider.create'],
//       hero_slider_edit: permissions['hero_slider.edit'],
//       hero_slider_delete: permissions['hero_slider.delete'],
//       export: permissions['export'],
//       import: permissions['import']
//     });
//   }, [permissions]);

//   /**
//    * Check if user has a specific permission
//    * @param permission - Single permission or array of permissions
//    * @returns boolean
//    */
//   const hasPermission = (permission: PermissionKey | PermissionKey[]): boolean => {
//     // CRITICAL: If user is static admin, they have ALL permissions
//     if (permissions.isStaticAdmin === true) {
//       console.log(`✅ Static admin override for permission: ${permission} (isStaticAdmin: true)`);
//       return true;
//     }

//     if (Array.isArray(permission)) {
//       return permission.every(p => {
//         const permValue = (permissions as any)[p];
//         return permValue === true;
//       });
//     }
    
//     const permValue = (permissions as any)[permission];
//     const result = permValue === true;
//     console.log(`🔍 Checking permission "${permission}": ${result} (isStaticAdmin: ${permissions.isStaticAdmin})`);
//     return result;
//   };

//   /**
//    * Check if user has ANY of the given permissions
//    * @param permissionsList - Array of permissions to check
//    * @returns boolean
//    */
//   const hasAnyPermission = (permissionsList: PermissionKey[]): boolean => {
//     // CRITICAL: Static admin has all permissions
//     if (permissions.isStaticAdmin === true) {
//       return true;
//     }
    
//     return permissionsList.some(permission => {
//       const permValue = (permissions as any)[permission];
//       return permValue === true;
//     });
//   };

//   /**
//    * Check if user has ALL of the given permissions
//    * @param permissionsList - Array of permissions to check
//    * @returns boolean
//    */
//   const hasAllPermissions = (permissionsList: PermissionKey[]): boolean => {
//     // CRITICAL: Static admin has all permissions
//     if (permissions.isStaticAdmin === true) {
//       return true;
//     }
    
//     return permissionsList.every(permission => {
//       const permValue = (permissions as any)[permission];
//       return permValue === true;
//     });
//   };

//   /**
//    * Update permissions
//    * @param newPermissions - New permissions object from server (can be any object)
//    */
//   const setPermissions = (newPermissions: any) => {
//     console.log('🔄 Setting permissions from server:', {
//       isStaticAdmin: newPermissions.isStaticAdmin,
//       typeOfIsStaticAdmin: typeof newPermissions.isStaticAdmin,
//       user_categories_edit: newPermissions['user_categories.edit'],
//       user_categories_delete: newPermissions['user_categories.delete'],
//       user_categories_create: newPermissions['user_categories.create'],
//       hero_slider_view: newPermissions['hero_slider.view'],
//       hero_slider_create: newPermissions['hero_slider.create'],
//       hero_slider_edit: newPermissions['hero_slider.edit'],
//       hero_slider_delete: newPermissions['hero_slider.delete'],
//       export: newPermissions['export'],
//       import: newPermissions['import'],
//       keys: Object.keys(newPermissions).filter(k => newPermissions[k])
//     });
    
//     // Start with server permissions and fill missing with defaults
//     const base: any = {};
    
//     // First, copy ALL boolean values from server
//     Object.keys(newPermissions).forEach(key => {
//       const value = newPermissions[key];
//       if (typeof value === 'boolean') {
//         base[key] = value;
//       }
//     });
    
//     // Then, ensure all default keys exist (but don't override server values)
//     Object.keys(defaultPermissions).forEach(key => {
//       if (!(key in base)) {
//         base[key] = defaultPermissions[key as keyof Permissions];
//       }
//     });
    
//     // DEBUG: Verify hero slider permissions
//     console.log('✅ Final combined permissions:', {
//       isStaticAdmin: base.isStaticAdmin,
//       typeOfIsStaticAdmin: typeof base.isStaticAdmin,
//       user_categories_create: base['user_categories.create'],
//       user_categories_edit: base['user_categories.edit'],
//       user_categories_delete: base['user_categories.delete'],
//       hero_slider_view: base['hero_slider.view'],
//       hero_slider_create: base['hero_slider.create'],
//       hero_slider_edit: base['hero_slider.edit'],
//       hero_slider_delete: base['hero_slider.delete'],
//       export: base['export'],
//       import: base['import']
//     });
    
//     setPermissionsState(base as Permissions);
//     setError(null);
//   };

//   /**
//    * Clear all permissions (on logout)
//    */
//   const clearPermissions = () => {
//     console.log('🗑️ Clearing all permissions');
//     setPermissionsState(defaultPermissions);
//     localStorage.removeItem('userPermissions');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   };

//   /**
//    * Check if user is static admin
//    * @returns boolean
//    */
//   const isStaticAdmin = (): boolean => {
//     const result = permissions.isStaticAdmin === true;
//     console.log(`👑 Checking isStaticAdmin: ${result} (value: ${permissions.isStaticAdmin})`);
//     return result;
//   };

//   /**
//    * Check if user is admin (has all admin permissions)
//    * @returns boolean
//    */
//   const isAdmin = (): boolean => {
//     // Static admin is always admin
//     if (isStaticAdmin()) {
//       console.log('👑 User is static admin');
//       return true;
//     }
    
//     const adminPermissions: PermissionKey[] = [
//       'users.create', 'users.edit', 'users.delete',
//       'user_categories.create', 'user_categories.edit', 'user_categories.delete',
//       'suppliers.create', 'suppliers.edit', 'suppliers.delete',
//       'supplier_categories.create', 'supplier_categories.edit', 'supplier_categories.delete',
//       'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete', // ADD hero slider admin permissions
//     ];
    
//     const result = hasAllPermissions(adminPermissions);
//     console.log(`🔍 Checking isAdmin: ${result}`);
//     return result;
//   };

//   /**
//    * Check if user can perform CRUD operations on a specific resource
//    * @param resource - Resource name (e.g., 'users', 'suppliers', 'hero_slider')
//    * @returns Object with view, create, edit, delete permissions
//    */
//   const getResourcePermissions = (resource: string) => {
//     const result = {
//       canView: hasPermission(`${resource}.view` as PermissionKey),
//       canCreate: hasPermission(`${resource}.create` as PermissionKey),
//       canEdit: hasPermission(`${resource}.edit` as PermissionKey),
//       canDelete: hasPermission(`${resource}.delete` as PermissionKey),
//     };
    
//     console.log(`📊 Resource permissions for "${resource}":`, result);
//     return result;
//   };

//   /**
//    * Get hero slider specific permissions helper
//    */
//   const getHeroSliderPermissions = () => {
//     return getResourcePermissions('hero_slider');
//   };

//   const value: PermissionContextType = {
//     permissions,
//     loading,
//     error,
//     hasPermission,
//     hasAnyPermission,
//     hasAllPermissions,
//     setPermissions,
//     clearPermissions,
//     isAdmin,
//     isStaticAdmin,
//     getResourcePermissions,
//   };

//   return (
//     <PermissionContext.Provider value={value}>
//       {children}
//     </PermissionContext.Provider>
//   );
// };

// /**
//  * Custom hook to use permission context
//  */
// export const usePermissions = (): PermissionContextType => {
//   const context = useContext(PermissionContext);
//   if (context === undefined) {
//     throw new Error('usePermissions must be used within a PermissionProvider');
//   }
//   return context;
// };

// /**
//  * Component to conditionally render content based on permissions
//  */
// interface RequirePermissionProps {
//   permission: PermissionKey | PermissionKey[];
//   children: ReactNode;
//   fallback?: ReactNode;
// }

// export const RequirePermission: React.FC<RequirePermissionProps> = ({ 
//   permission, 
//   children, 
//   fallback = null 
// }) => {
//   const { hasPermission } = usePermissions();
  
//   if (!hasPermission(permission)) {
//     return <>{fallback}</>;
//   }
  
//   return <>{children}</>;
// };

// /**
//  * Component to render based on ANY of the given permissions
//  */
// interface RequireAnyPermissionProps {
//   permissions: PermissionKey[];
//   children: ReactNode;
//   fallback?: ReactNode;
// }

// export const RequireAnyPermission: React.FC<RequireAnyPermissionProps> = ({ 
//   permissions, 
//   children, 
//   fallback = null 
// }) => {
//   const { hasAnyPermission } = usePermissions();
  
//   if (!hasAnyPermission(permissions)) {
//     return <>{fallback}</>;
//   }
  
//   return <>{children}</>;
// };

// /**
//  * Component to render based on ALL of the given permissions
//  */
// interface RequireAllPermissionsProps {
//   permissions: PermissionKey[];
//   children: ReactNode;
//   fallback?: ReactNode;
// }

// export const RequireAllPermissions: React.FC<RequireAllPermissionsProps> = ({ 
//   permissions, 
//   children, 
//   fallback = null 
// }) => {
//   const { hasAllPermissions } = usePermissions();
  
//   if (!hasAllPermissions(permissions)) {
//     return <>{fallback}</>;
//   }
  
//   return <>{children}</>;
// };

// /**
//  * Special component for hero slider permissions
//  */
// interface RequireHeroSliderPermissionProps {
//   permission: 'view' | 'create' | 'edit' | 'delete';
//   children: ReactNode;
//   fallback?: ReactNode;
// }

// export const RequireHeroSliderPermission: React.FC<RequireHeroSliderPermissionProps> = ({ 
//   permission, 
//   children, 
//   fallback = null 
// }) => {
//   const { hasPermission } = usePermissions();
//   const permKey: PermissionKey = `hero_slider.${permission}`;
  
//   if (!hasPermission(permKey)) {
//     return <>{fallback}</>;
//   }
  
//   return <>{children}</>;
// };

// export default PermissionProvider;














'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ========== CONTENT MANAGEMENT COMPONENTS ==========
const CONTENT_COMPONENTS = [
  'hero_slider',
  'category_cards',
  'featured_sales',
  'announcement_bar',
  'feature_categories',
  'featured_listings',
  'featured_reviews',
  'deals',
  'about_us',
  'security'
] as const;

type ContentComponent = typeof CONTENT_COMPONENTS[number];

// Define permission types
export type PermissionKey = 
  // Dashboard
  | 'dashboard.view'
  
  // Users Management
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  | 'user_categories.view' | 'user_categories.create' | 'user_categories.edit' | 'user_categories.delete'
  
  // Suppliers Management
  | 'suppliers.view' | 'suppliers.create' | 'suppliers.edit' | 'suppliers.delete'
  | 'supplier_categories.view' | 'supplier_categories.create' | 'supplier_categories.edit' | 'supplier_categories.delete'
  
  // ========== CONTENT MANAGEMENT SECTION ==========
  // Content Management (Parent - Only View)
  | 'content_management.view'
  
  // Content Components
  | 'hero_slider.view' | 'hero_slider.create' | 'hero_slider.edit' | 'hero_slider.delete'
  | 'category_cards.view' | 'category_cards.create' | 'category_cards.edit' | 'category_cards.delete'
  | 'featured_sales.view' | 'featured_sales.create' | 'featured_sales.edit' | 'featured_sales.delete'
  | 'announcement_bar.view' | 'announcement_bar.create' | 'announcement_bar.edit' | 'announcement_bar.delete'
  | 'feature_categories.view' | 'feature_categories.create' | 'feature_categories.edit' | 'feature_categories.delete'
  | 'featured_listings.view' | 'featured_listings.create' | 'featured_listings.edit' | 'featured_listings.delete'
  | 'featured_reviews.view' | 'featured_reviews.create' | 'featured_reviews.edit' | 'featured_reviews.delete'
  | 'deals.view' | 'deals.create' | 'deals.edit' | 'deals.delete'
  | 'about_us.view' | 'about_us.create' | 'about_us.edit' | 'about_us.delete'
  | 'security.view' | 'security.create' | 'security.edit' | 'security.delete'
  
  // Other
  | 'projects.view'
  | 'analytics.view'
  | 'settings.view'
  | 'export'
  | 'import'
  | 'isStaticAdmin'
  | string;

// Base permissions interface
interface BasePermissions {
  // CRITICAL: Add isStaticAdmin
  isStaticAdmin: boolean;
  
  // Base permissions
  view: boolean;
  editProfile: boolean;
  changePassword: boolean;
  
  // Action permissions
  create: boolean;
  edit: boolean;
  delete: boolean;
  
  // Management permissions
  manageUsers: boolean;
  manageSuppliers: boolean;
  manageCategories: boolean;
  viewAnalytics: boolean;
  manageSettings: boolean;
  blockUsers: boolean;
  approveSuppliers: boolean;
  
  // ========== SYSTEM PERMISSIONS ==========
  
  // Dashboard
  'dashboard.view': boolean;
  
  // Users Management
  'users.view': boolean;
  'users.create': boolean;
  'users.edit': boolean;
  'users.delete': boolean;
  
  // User Categories
  'user_categories.view': boolean;
  'user_categories.create': boolean;
  'user_categories.edit': boolean;
  'user_categories.delete': boolean;
  
  // Suppliers Management
  'suppliers.view': boolean;
  'suppliers.create': boolean;
  'suppliers.edit': boolean;
  'suppliers.delete': boolean;
  
  // Supplier Categories
  'supplier_categories.view': boolean;
  'supplier_categories.create': boolean;
  'supplier_categories.edit': boolean;
  'supplier_categories.delete': boolean;
  
  // ========== CONTENT MANAGEMENT SECTION ==========
  // Content Management (Parent - Only View)
  'content_management.view': boolean;
  
  // Content Components
  'hero_slider.view': boolean;
  'hero_slider.create': boolean;
  'hero_slider.edit': boolean;
  'hero_slider.delete': boolean;
  
  'category_cards.view': boolean;
  'category_cards.create': boolean;
  'category_cards.edit': boolean;
  'category_cards.delete': boolean;
  
  'featured_sales.view': boolean;
  'featured_sales.create': boolean;
  'featured_sales.edit': boolean;
  'featured_sales.delete': boolean;
  
  'announcement_bar.view': boolean;
  'announcement_bar.create': boolean;
  'announcement_bar.edit': boolean;
  'announcement_bar.delete': boolean;
  
  'feature_categories.view': boolean;
  'feature_categories.create': boolean;
  'feature_categories.edit': boolean;
  'feature_categories.delete': boolean;
  
  'featured_listings.view': boolean;
  'featured_listings.create': boolean;
  'featured_listings.edit': boolean;
  'featured_listings.delete': boolean;
  
  'featured_reviews.view': boolean;
  'featured_reviews.create': boolean;
  'featured_reviews.edit': boolean;
  'featured_reviews.delete': boolean;
  
  'deals.view': boolean;
  'deals.create': boolean;
  'deals.edit': boolean;
  'deals.delete': boolean;
  
  'about_us.view': boolean;
  'about_us.create': boolean;
  'about_us.edit': boolean;
  'about_us.delete': boolean;
  
  'security.view': boolean;
  'security.create': boolean;
  'security.edit': boolean;
  'security.delete': boolean;
  
  // Other
  'projects.view': boolean;
  'analytics.view': boolean;
  'settings.view': boolean;
  'export': boolean;
  'import': boolean;
}

// Permissions type with dynamic keys
export type Permissions = BasePermissions & {
  [key: string]: boolean;
};

export interface PermissionContextType {
  permissions: Permissions;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: PermissionKey | PermissionKey[]) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  setPermissions: (permissions: any) => void;
  clearPermissions: () => void;
  isAdmin: () => boolean;
  isStaticAdmin: () => boolean;
  getResourcePermissions: (resource: string) => {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  // NEW: Content management specific helpers
  hasContentManagementAccess: () => boolean;
  hasContentComponentPermission: (component: ContentComponent, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  getAllContentPermissions: () => Record<string, boolean>;
}

// Default permissions (view-only)
const defaultPermissions: Permissions = {
  // CRITICAL: Add isStaticAdmin
  isStaticAdmin: false,
  
  // Base
  view: true,
  editProfile: true,
  changePassword: true,
  
  // Actions
  create: false,
  edit: false,
  delete: false,
  
  // Management
  manageUsers: false,
  manageSuppliers: false,
  manageCategories: false,
  viewAnalytics: false,
  manageSettings: false,
  blockUsers: false,
  approveSuppliers: false,
  
  // ========== SYSTEM PERMISSIONS ==========
  
  // Dashboard
  'dashboard.view': true,
  
  // Users Management
  'users.view': true,
  'users.create': false,
  'users.edit': false,
  'users.delete': false,
  
  // User Categories
  'user_categories.view': true,
  'user_categories.create': false,
  'user_categories.edit': false,
  'user_categories.delete': false,
  
  // Suppliers Management
  'suppliers.view': true,
  'suppliers.create': false,
  'suppliers.edit': false,
  'suppliers.delete': false,
  
  // Supplier Categories
  'supplier_categories.view': true,
  'supplier_categories.create': false,
  'supplier_categories.edit': false,
  'supplier_categories.delete': false,
  
  // ========== CONTENT MANAGEMENT SECTION ==========
  // Content Management (Parent - Only View)
  'content_management.view': true, // Can view content management page
  
  // Content Components (View only - requires content_management.view too!)
  'hero_slider.view': true,
  'hero_slider.create': false,
  'hero_slider.edit': false,
  'hero_slider.delete': false,
  
  'category_cards.view': true,
  'category_cards.create': false,
  'category_cards.edit': false,
  'category_cards.delete': false,
  
  'featured_sales.view': true,
  'featured_sales.create': false,
  'featured_sales.edit': false,
  'featured_sales.delete': false,
  
  'announcement_bar.view': true,
  'announcement_bar.create': false,
  'announcement_bar.edit': false,
  'announcement_bar.delete': false,
  
  'feature_categories.view': true,
  'feature_categories.create': false,
  'feature_categories.edit': false,
  'feature_categories.delete': false,
  
  'featured_listings.view': true,
  'featured_listings.create': false,
  'featured_listings.edit': false,
  'featured_listings.delete': false,
  
  'featured_reviews.view': true,
  'featured_reviews.create': false,
  'featured_reviews.edit': false,
  'featured_reviews.delete': false,
  
  'deals.view': true,
  'deals.create': false,
  'deals.edit': false,
  'deals.delete': false,
  
  'about_us.view': true,
  'about_us.create': false,
  'about_us.edit': false,
  'about_us.delete': false,
  
  'security.view': true,
  'security.create': false,
  'security.edit': false,
  'security.delete': false,
  
  // Other
  'projects.view': true,
  'analytics.view': false,
  'settings.view': false,
  'export': false,
  'import': false,
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
  initialPermissions?: Partial<Permissions>;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ 
  children, 
  initialPermissions 
}) => {
  const [permissions, setPermissionsState] = useState<Permissions>(() => {
    console.log('🔄 PermissionProvider initializing...');
    
    // Check localStorage for saved permissions
    if (typeof window !== 'undefined') {
      const savedPermissions = localStorage.getItem('userPermissions');
      if (savedPermissions) {
        try {
          const parsedPermissions = JSON.parse(savedPermissions);
          console.log('📥 Found permissions in localStorage:', {
            isStaticAdmin: parsedPermissions.isStaticAdmin,
            content_management_view: parsedPermissions['content_management.view'],
            hero_slider_view: parsedPermissions['hero_slider.view'],
            keys: Object.keys(parsedPermissions).filter(k => parsedPermissions[k])
          });
          
          // Start with parsed permissions and fill missing with defaults
          const base: any = {};
          
          // Copy all boolean values from localStorage
          Object.keys(parsedPermissions).forEach(key => {
            const value = parsedPermissions[key];
            if (typeof value === 'boolean') {
              base[key] = value;
            }
          });
          
          // Ensure all default keys exist
          Object.keys(defaultPermissions).forEach(key => {
            if (!(key in base)) {
              base[key] = defaultPermissions[key as keyof Permissions];
            }
          });
          
          console.log('✅ Initial permissions from localStorage:', {
            isStaticAdmin: base.isStaticAdmin,
            content_management_view: base['content_management.view'],
            hero_slider_view: base['hero_slider.view'],
            effective_hero_slider_view: base['hero_slider.view'] && base['content_management.view']
          });
          
          return base as Permissions;
        } catch (err) {
          console.error('❌ Error parsing localStorage permissions:', err);
        }
      }
    }
    
    // If no localStorage, use default with initialPermissions
    const base: Permissions = { ...defaultPermissions };
    
    if (initialPermissions) {
      Object.keys(initialPermissions).forEach(key => {
        const value = (initialPermissions as any)[key];
        if (typeof value === 'boolean') {
          (base as any)[key] = value;
        }
      });
    }
    
    console.log('✅ Using default permissions initially');
    return base;
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save permissions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      console.log('💾 Saved permissions to localStorage:', {
        isStaticAdmin: permissions.isStaticAdmin,
        content_management_view: permissions['content_management.view'],
        hero_slider_view: permissions['hero_slider.view'],
        effective_hero_slider_view: permissions['hero_slider.view'] && permissions['content_management.view']
      });
    } catch (err) {
      console.error('Error saving permissions to localStorage:', err);
    }
  }, [permissions]);

  // Add debug effect to log permission changes
  useEffect(() => {
    console.log('🔍 CURRENT PERMISSIONS STATE:', {
      isStaticAdmin: permissions.isStaticAdmin,
      content_management_view: permissions['content_management.view'],
      hero_slider_view: permissions['hero_slider.view'],
      category_cards_view: permissions['category_cards.view'],
      security_view: permissions['security.view'],
      // Check effective permissions (with hierarchy)
      effective_hero_slider_view: permissions['hero_slider.view'] && permissions['content_management.view'],
      effective_category_cards_view: permissions['category_cards.view'] && permissions['content_management.view'],
      effective_security_view: permissions['security.view'] && permissions['content_management.view']
    });
  }, [permissions]);

  /**
   * Check if permission is a content management component permission
   */
  const isContentComponentPermission = (permission: string): boolean => {
    return CONTENT_COMPONENTS.some(component => 
      permission.startsWith(`${component}.`)
    );
  };

  /**
   * Check if user has a specific permission with hierarchy support
   */
  const hasPermission = (permission: PermissionKey | PermissionKey[]): boolean => {
    // CRITICAL: If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permission} (isStaticAdmin: true)`);
      return true;
    }

    if (Array.isArray(permission)) {
      return permission.every(p => checkSinglePermission(p));
    }
    
    return checkSinglePermission(permission);
  };

  /**
   * Check single permission with hierarchy
   */
  const checkSinglePermission = (permission: PermissionKey): boolean => {
    const permStr = permission.toString();
    
    // For content component permissions, need BOTH permissions
    if (isContentComponentPermission(permStr)) {
      const hasParentPermission = permissions['content_management.view'] === true;
      const hasComponentPermission = (permissions as any)[permission] === true;
      const result = hasParentPermission && hasComponentPermission;
      
      console.log(`🔍 Content permission "${permission}": ${result} (parent: ${hasParentPermission}, component: ${hasComponentPermission})`);
      return result;
    }
    
    // For non-content permissions, just check normally
    const permValue = (permissions as any)[permission];
    const result = permValue === true;
    console.log(`🔍 Non-content permission "${permission}": ${result}`);
    return result;
  };

  /**
   * Check if user has ANY of the given permissions
   */
  const hasAnyPermission = (permissionsList: PermissionKey[]): boolean => {
    // CRITICAL: Static admin has all permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    return permissionsList.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has ALL of the given permissions
   */
  const hasAllPermissions = (permissionsList: PermissionKey[]): boolean => {
    // CRITICAL: Static admin has all permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    return permissionsList.every(permission => hasPermission(permission));
  };

  /**
   * Update permissions
   */
  const setPermissions = (newPermissions: any) => {
    console.log('🔄 Setting permissions from server:', {
      isStaticAdmin: newPermissions.isStaticAdmin,
      content_management_view: newPermissions['content_management.view'],
      hero_slider_view: newPermissions['hero_slider.view'],
      category_cards_view: newPermissions['category_cards.view'],
      keys: Object.keys(newPermissions).filter(k => newPermissions[k])
    });
    
    // Start with server permissions and fill missing with defaults
    const base: any = {};
    
    // Copy ALL boolean values from server
    Object.keys(newPermissions).forEach(key => {
      const value = newPermissions[key];
      if (typeof value === 'boolean') {
        base[key] = value;
      }
    });
    
    // Ensure all default keys exist
    Object.keys(defaultPermissions).forEach(key => {
      if (!(key in base)) {
        base[key] = defaultPermissions[key as keyof Permissions];
      }
    });
    
    console.log('✅ Final combined permissions:', {
      isStaticAdmin: base.isStaticAdmin,
      content_management_view: base['content_management.view'],
      hero_slider_view: base['hero_slider.view'],
      effective_hero_slider_view: base['hero_slider.view'] && base['content_management.view']
    });
    
    setPermissionsState(base as Permissions);
    setError(null);
  };

  /**
   * Clear all permissions (on logout)
   */
  const clearPermissions = () => {
    console.log('🗑️ Clearing all permissions');
    setPermissionsState(defaultPermissions);
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Check if user is static admin
   */
  const isStaticAdmin = (): boolean => {
    const result = permissions.isStaticAdmin === true;
    console.log(`👑 Checking isStaticAdmin: ${result} (value: ${permissions.isStaticAdmin})`);
    return result;
  };

  /**
   * Check if user is admin (has all admin permissions)
   */
  const isAdmin = (): boolean => {
    if (isStaticAdmin()) {
      console.log('👑 User is static admin');
      return true;
    }
    
    const adminPermissions: PermissionKey[] = [
      'users.create', 'users.edit', 'users.delete',
      'user_categories.create', 'user_categories.edit', 'user_categories.delete',
      'suppliers.create', 'suppliers.edit', 'suppliers.delete',
      'supplier_categories.create', 'supplier_categories.edit', 'supplier_categories.delete',
      // Content management admin permissions (need parent permission too!)
      'content_management.view',
      'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete',
      'category_cards.create', 'category_cards.edit', 'category_cards.delete',
    ];
    
    const result = hasAllPermissions(adminPermissions);
    console.log(`🔍 Checking isAdmin: ${result}`);
    return result;
  };

  /**
   * Check if user can perform CRUD operations on a specific resource
   */
  const getResourcePermissions = (resource: string) => {
    const isContentComponent = CONTENT_COMPONENTS.includes(resource as ContentComponent);
    
    const result = {
      canView: hasPermission(`${resource}.view` as PermissionKey),
      canCreate: hasPermission(`${resource}.create` as PermissionKey),
      canEdit: hasPermission(`${resource}.edit` as PermissionKey),
      canDelete: hasPermission(`${resource}.delete` as PermissionKey),
      isContentComponent,
      needsContentManagementView: isContentComponent && !permissions['content_management.view']
    };
    
    console.log(`📊 Resource permissions for "${resource}":`, result);
    return result;
  };

  // ========== NEW: CONTENT MANAGEMENT SPECIFIC HELPERS ==========

  /**
   * Check if user has access to content management page
   * Just needs content_management.view permission
   */
  const hasContentManagementAccess = (): boolean => {
    return hasPermission('content_management.view');
  };

  /**
   * Check if user has permission for a specific content component
   * User needs BOTH: content_management.view AND component permission
   */
  const hasContentComponentPermission = (
    component: ContentComponent, 
    action: 'view' | 'create' | 'edit' | 'delete'
  ): boolean => {
    const permissionKey = `${component}.${action}` as PermissionKey;
    return hasPermission(permissionKey);
  };

  /**
   * Get all content management permissions for the user
   * Returns an object with all content component permissions (with hierarchy applied)
   */
  const getAllContentPermissions = (): Record<string, boolean> => {
    const contentPermissions: Record<string, boolean> = {
      'content_management.view': permissions['content_management.view']
    };
    
    CONTENT_COMPONENTS.forEach(component => {
      ['view', 'create', 'edit', 'delete'].forEach(action => {
        const permissionKey = `${component}.${action}`;
        contentPermissions[permissionKey] = hasContentComponentPermission(
          component, 
          action as 'view' | 'create' | 'edit' | 'delete'
        );
      });
    });
    
    return contentPermissions;
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    setPermissions,
    clearPermissions,
    isAdmin,
    isStaticAdmin,
    getResourcePermissions,
    // NEW: Content management helpers
    hasContentManagementAccess,
    hasContentComponentPermission,
    getAllContentPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Custom hook to use permission context
 */
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// ========== PERMISSION COMPONENTS ==========

interface RequirePermissionProps {
  permission: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

interface RequireAnyPermissionProps {
  permissions: PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAnyPermission: React.FC<RequireAnyPermissionProps> = ({ 
  permissions, 
  children, 
  fallback = null 
}) => {
  const { hasAnyPermission } = usePermissions();
  
  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

interface RequireAllPermissionsProps {
  permissions: PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAllPermissions: React.FC<RequireAllPermissionsProps> = ({ 
  permissions, 
  children, 
  fallback = null 
}) => {
  const { hasAllPermissions } = usePermissions();
  
  if (!hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// ========== CONTENT MANAGEMENT SPECIFIC COMPONENTS ==========

/**
 * Component to require content management access
 */
interface RequireContentManagementAccessProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireContentManagementAccess: React.FC<RequireContentManagementAccessProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { hasContentManagementAccess } = usePermissions();
  
  if (!hasContentManagementAccess()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * Component to require specific content component permission
 */
interface RequireContentComponentPermissionProps {
  component: ContentComponent;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireContentComponentPermission: React.FC<RequireContentComponentPermissionProps> = ({ 
  component, 
  action, 
  children, 
  fallback = null 
}) => {
  const { hasContentComponentPermission } = usePermissions();
  
  if (!hasContentComponentPermission(component, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * Special component for hero slider permissions
 */
interface RequireHeroSliderPermissionProps {
  permission: 'view' | 'create' | 'edit' | 'delete';
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireHeroSliderPermission: React.FC<RequireHeroSliderPermissionProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasContentComponentPermission } = usePermissions();
  
  if (!hasContentComponentPermission('hero_slider', permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionProvider;