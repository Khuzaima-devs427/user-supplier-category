// // contexts/PermissionContext.tsx
// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Define permission types - ADD isStaticAdmin
// export type PermissionKey = 
//   | 'dashboard.view'
//   | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
//   | 'user_categories.view' | 'user_categories.create' | 'user_categories.edit' | 'user_categories.delete'
//   | 'suppliers.view' | 'suppliers.create' | 'suppliers.edit' | 'suppliers.delete'
//   | 'supplier_categories.view' | 'supplier_categories.create' | 'supplier_categories.edit' | 'supplier_categories.delete'
//   | 'projects.view'
//   | 'analytics.view'
//   | 'settings.view'
//   | 'export'
//   | 'import'
//   | 'isStaticAdmin'  // ADD THIS
//   | string; // Allow any string for custom permissions

// // Base permissions interface - ADD isStaticAdmin
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
//   setPermissions: (permissions: any) => void; // CHANGE: Accept any permissions object
//   clearPermissions: () => void;
//   isAdmin: () => boolean;
//   isStaticAdmin: () => boolean; // ADD THIS HELPER
//   getResourcePermissions: (resource: string) => {
//     canView: boolean;
//     canCreate: boolean;
//     canEdit: boolean;
//     canDelete: boolean;
//   };
// }

// // Default permissions (view-only) - ADD isStaticAdmin: false
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
//             typeOfIsStaticAdmin: typeof base.isStaticAdmin
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
//    * Update permissions - CHANGED to accept any object
//    * @param newPermissions - New permissions object from server (can be any object)
//    */
//   const setPermissions = (newPermissions: any) => {
//     console.log('🔄 Setting permissions from server:', {
//       isStaticAdmin: newPermissions.isStaticAdmin,
//       typeOfIsStaticAdmin: typeof newPermissions.isStaticAdmin,
//       user_categories_edit: newPermissions['user_categories.edit'],
//       user_categories_delete: newPermissions['user_categories.delete'],
//       user_categories_create: newPermissions['user_categories.create'],
//       export: newPermissions['export'],
//       import: newPermissions['import'],
//       keys: Object.keys(newPermissions).filter(k => newPermissions[k])
//     });
    
//     // ✅ FIX: Start with server permissions and fill missing with defaults
//     const base: any = {};
    
//     // First, copy ALL boolean values from server (this should include isStaticAdmin: true)
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
    
//     // DEBUG: Verify isStaticAdmin is preserved
//     console.log('✅ Final combined permissions:', {
//       isStaticAdmin: base.isStaticAdmin,
//       typeOfIsStaticAdmin: typeof base.isStaticAdmin,
//       user_categories_create: base['user_categories.create'],
//       user_categories_edit: base['user_categories.edit'],
//       user_categories_delete: base['user_categories.delete'],
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
//     ];
    
//     const result = hasAllPermissions(adminPermissions);
//     console.log(`🔍 Checking isAdmin: ${result}`);
//     return result;
//   };

//   /**
//    * Check if user can perform CRUD operations on a specific resource
//    * @param resource - Resource name (e.g., 'users', 'suppliers')
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

// export default PermissionProvider;





























'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define permission types - ADD hero_slider permissions
export type PermissionKey = 
  | 'dashboard.view'
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  | 'user_categories.view' | 'user_categories.create' | 'user_categories.edit' | 'user_categories.delete'
  | 'suppliers.view' | 'suppliers.create' | 'suppliers.edit' | 'suppliers.delete'
  | 'supplier_categories.view' | 'supplier_categories.create' | 'supplier_categories.edit' | 'supplier_categories.delete'
  // ADD Hero Slider permissions
  | 'hero_slider.view' | 'hero_slider.create' | 'hero_slider.edit' | 'hero_slider.delete'
  | 'projects.view'
  | 'analytics.view'
  | 'settings.view'
  | 'export'
  | 'import'
  | 'isStaticAdmin'
  | string; // Allow any string for custom permissions

// Base permissions interface - ADD hero_slider permissions
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
  manageContent: boolean; // ADD: For content management like hero slider
  viewAnalytics: boolean;
  manageSettings: boolean;
  blockUsers: boolean;
  approveSuppliers: boolean;
  
  // System permissions
  'dashboard.view': boolean;
  'users.view': boolean;
  'users.create': boolean;
  'users.edit': boolean;
  'users.delete': boolean;
  'user_categories.view': boolean;
  'user_categories.create': boolean;
  'user_categories.edit': boolean;
  'user_categories.delete': boolean;
  'suppliers.view': boolean;
  'suppliers.create': boolean;
  'suppliers.edit': boolean;
  'suppliers.delete': boolean;
  'supplier_categories.view': boolean;
  'supplier_categories.create': boolean;
  'supplier_categories.edit': boolean;
  'supplier_categories.delete': boolean;
  // ADD Hero Slider permissions
  'hero_slider.view': boolean;
  'hero_slider.create': boolean;
  'hero_slider.edit': boolean;
  'hero_slider.delete': boolean;
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
}

// Default permissions (view-only) - ADD hero_slider permissions
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
  manageContent: false, // ADD: For content management
  viewAnalytics: false,
  manageSettings: false,
  blockUsers: false,
  approveSuppliers: false,
  
  // System
  'dashboard.view': true,
  'users.view': true,
  'users.create': false,
  'users.edit': false,
  'users.delete': false,
  'user_categories.view': true,
  'user_categories.create': false,
  'user_categories.edit': false,
  'user_categories.delete': false,
  'suppliers.view': true,
  'suppliers.create': false,
  'suppliers.edit': false,
  'suppliers.delete': false,
  'supplier_categories.view': true,
  'supplier_categories.create': false,
  'supplier_categories.edit': false,
  'supplier_categories.delete': false,
  // ADD Hero Slider permissions - default to false for view, true for admin
  'hero_slider.view': false, // CHANGED: Default to false, not everyone should see hero slider
  'hero_slider.create': false,
  'hero_slider.edit': false,
  'hero_slider.delete': false,
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
    // DEBUG: Log initialization
    console.log('🔄 PermissionProvider initializing...');
    
    // First, check if we have stored permissions in localStorage
    if (typeof window !== 'undefined') {
      const savedPermissions = localStorage.getItem('userPermissions');
      if (savedPermissions) {
        try {
          const parsedPermissions = JSON.parse(savedPermissions);
          console.log('📥 Found permissions in localStorage:', {
            isStaticAdmin: parsedPermissions.isStaticAdmin,
            hero_slider_view: parsedPermissions['hero_slider.view'],
            hero_slider_edit: parsedPermissions['hero_slider.edit'],
            keys: Object.keys(parsedPermissions).filter(k => parsedPermissions[k])
          });
          
          // Start with parsed permissions and fill missing with defaults
          const base: any = {};
          
          // First, copy all boolean values from localStorage
          Object.keys(parsedPermissions).forEach(key => {
            const value = parsedPermissions[key];
            if (typeof value === 'boolean') {
              base[key] = value;
            }
          });
          
          // Then, ensure all default keys exist (but don't override localStorage values)
          Object.keys(defaultPermissions).forEach(key => {
            if (!(key in base)) {
              base[key] = defaultPermissions[key as keyof Permissions];
            }
          });
          
          console.log('✅ Initial permissions from localStorage:', {
            isStaticAdmin: base.isStaticAdmin,
            typeOfIsStaticAdmin: typeof base.isStaticAdmin,
            hero_slider_view: base['hero_slider.view'],
            hero_slider_edit: base['hero_slider.edit']
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
      // Merge initial permissions carefully
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
        hasIsStaticAdmin: 'isStaticAdmin' in permissions,
        typeOfIsStaticAdmin: typeof permissions.isStaticAdmin,
        user_categories_create: permissions['user_categories.create'],
        user_categories_edit: permissions['user_categories.edit'],
        user_categories_delete: permissions['user_categories.delete'],
        hero_slider_view: permissions['hero_slider.view'],
        hero_slider_create: permissions['hero_slider.create'],
        hero_slider_edit: permissions['hero_slider.edit'],
        hero_slider_delete: permissions['hero_slider.delete'],
        keys: Object.keys(permissions).filter(k => permissions[k])
      });
    } catch (err) {
      console.error('Error saving permissions to localStorage:', err);
    }
  }, [permissions]);

  // Add debug effect to log permission changes
  useEffect(() => {
    console.log('🔍 CURRENT PERMISSIONS STATE:', {
      isStaticAdmin: permissions.isStaticAdmin,
      typeOfIsStaticAdmin: typeof permissions.isStaticAdmin,
      user_categories_create: permissions['user_categories.create'],
      user_categories_edit: permissions['user_categories.edit'],
      user_categories_delete: permissions['user_categories.delete'],
      hero_slider_view: permissions['hero_slider.view'],
      hero_slider_create: permissions['hero_slider.create'],
      hero_slider_edit: permissions['hero_slider.edit'],
      hero_slider_delete: permissions['hero_slider.delete'],
      export: permissions['export'],
      import: permissions['import']
    });
  }, [permissions]);

  /**
   * Check if user has a specific permission
   * @param permission - Single permission or array of permissions
   * @returns boolean
   */
  const hasPermission = (permission: PermissionKey | PermissionKey[]): boolean => {
    // CRITICAL: If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permission} (isStaticAdmin: true)`);
      return true;
    }

    if (Array.isArray(permission)) {
      return permission.every(p => {
        const permValue = (permissions as any)[p];
        return permValue === true;
      });
    }
    
    const permValue = (permissions as any)[permission];
    const result = permValue === true;
    console.log(`🔍 Checking permission "${permission}": ${result} (isStaticAdmin: ${permissions.isStaticAdmin})`);
    return result;
  };

  /**
   * Check if user has ANY of the given permissions
   * @param permissionsList - Array of permissions to check
   * @returns boolean
   */
  const hasAnyPermission = (permissionsList: PermissionKey[]): boolean => {
    // CRITICAL: Static admin has all permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    return permissionsList.some(permission => {
      const permValue = (permissions as any)[permission];
      return permValue === true;
    });
  };

  /**
   * Check if user has ALL of the given permissions
   * @param permissionsList - Array of permissions to check
   * @returns boolean
   */
  const hasAllPermissions = (permissionsList: PermissionKey[]): boolean => {
    // CRITICAL: Static admin has all permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    return permissionsList.every(permission => {
      const permValue = (permissions as any)[permission];
      return permValue === true;
    });
  };

  /**
   * Update permissions
   * @param newPermissions - New permissions object from server (can be any object)
   */
  const setPermissions = (newPermissions: any) => {
    console.log('🔄 Setting permissions from server:', {
      isStaticAdmin: newPermissions.isStaticAdmin,
      typeOfIsStaticAdmin: typeof newPermissions.isStaticAdmin,
      user_categories_edit: newPermissions['user_categories.edit'],
      user_categories_delete: newPermissions['user_categories.delete'],
      user_categories_create: newPermissions['user_categories.create'],
      hero_slider_view: newPermissions['hero_slider.view'],
      hero_slider_create: newPermissions['hero_slider.create'],
      hero_slider_edit: newPermissions['hero_slider.edit'],
      hero_slider_delete: newPermissions['hero_slider.delete'],
      export: newPermissions['export'],
      import: newPermissions['import'],
      keys: Object.keys(newPermissions).filter(k => newPermissions[k])
    });
    
    // Start with server permissions and fill missing with defaults
    const base: any = {};
    
    // First, copy ALL boolean values from server
    Object.keys(newPermissions).forEach(key => {
      const value = newPermissions[key];
      if (typeof value === 'boolean') {
        base[key] = value;
      }
    });
    
    // Then, ensure all default keys exist (but don't override server values)
    Object.keys(defaultPermissions).forEach(key => {
      if (!(key in base)) {
        base[key] = defaultPermissions[key as keyof Permissions];
      }
    });
    
    // DEBUG: Verify hero slider permissions
    console.log('✅ Final combined permissions:', {
      isStaticAdmin: base.isStaticAdmin,
      typeOfIsStaticAdmin: typeof base.isStaticAdmin,
      user_categories_create: base['user_categories.create'],
      user_categories_edit: base['user_categories.edit'],
      user_categories_delete: base['user_categories.delete'],
      hero_slider_view: base['hero_slider.view'],
      hero_slider_create: base['hero_slider.create'],
      hero_slider_edit: base['hero_slider.edit'],
      hero_slider_delete: base['hero_slider.delete'],
      export: base['export'],
      import: base['import']
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
   * @returns boolean
   */
  const isStaticAdmin = (): boolean => {
    const result = permissions.isStaticAdmin === true;
    console.log(`👑 Checking isStaticAdmin: ${result} (value: ${permissions.isStaticAdmin})`);
    return result;
  };

  /**
   * Check if user is admin (has all admin permissions)
   * @returns boolean
   */
  const isAdmin = (): boolean => {
    // Static admin is always admin
    if (isStaticAdmin()) {
      console.log('👑 User is static admin');
      return true;
    }
    
    const adminPermissions: PermissionKey[] = [
      'users.create', 'users.edit', 'users.delete',
      'user_categories.create', 'user_categories.edit', 'user_categories.delete',
      'suppliers.create', 'suppliers.edit', 'suppliers.delete',
      'supplier_categories.create', 'supplier_categories.edit', 'supplier_categories.delete',
      'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete', // ADD hero slider admin permissions
    ];
    
    const result = hasAllPermissions(adminPermissions);
    console.log(`🔍 Checking isAdmin: ${result}`);
    return result;
  };

  /**
   * Check if user can perform CRUD operations on a specific resource
   * @param resource - Resource name (e.g., 'users', 'suppliers', 'hero_slider')
   * @returns Object with view, create, edit, delete permissions
   */
  const getResourcePermissions = (resource: string) => {
    const result = {
      canView: hasPermission(`${resource}.view` as PermissionKey),
      canCreate: hasPermission(`${resource}.create` as PermissionKey),
      canEdit: hasPermission(`${resource}.edit` as PermissionKey),
      canDelete: hasPermission(`${resource}.delete` as PermissionKey),
    };
    
    console.log(`📊 Resource permissions for "${resource}":`, result);
    return result;
  };

  /**
   * Get hero slider specific permissions helper
   */
  const getHeroSliderPermissions = () => {
    return getResourcePermissions('hero_slider');
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

/**
 * Component to conditionally render content based on permissions
 */
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

/**
 * Component to render based on ANY of the given permissions
 */
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

/**
 * Component to render based on ALL of the given permissions
 */
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
  const { hasPermission } = usePermissions();
  const permKey: PermissionKey = `hero_slider.${permission}`;
  
  if (!hasPermission(permKey)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionProvider;