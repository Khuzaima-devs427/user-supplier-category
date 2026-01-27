// 'use client';

// import React, { useState } from 'react';
// import Navbar from './_components/content-management-Navbar/page';
// import HeroSlider from './hero-slider/hero-slider';
// import Category from './category-cards/category-cards'; 
// import FeaturedSalesPage from './featured-sales/featured-sales';
// import Announcement from './announcement-bar/announcement-bar';
// import FeatureCategory from './featured-categories/featured-categories';
// import FeaturedListings from './featured-listings/featured-listings';
// // Import other components as you need them
// // import FeaturedSale from './featured-sale';
// // import AnnouncementBar from './announcement-bar';
// // etc...

// const Page = () => {
//   const [selectedContent, setSelectedContent] = useState<string>('hero-slider'); // Default to hero-slider

//   const handleSelectContent = (contentId: string) => {
//     setSelectedContent(contentId);
//   };

//   // Function to render the selected component
//   const renderContent = () => {
//     switch (selectedContent) {
//       case 'hero-slider':
//         return <HeroSlider />;
//       case 'category-cards':
//         return <Category />; // Capital C
//       case 'featured-sale':
//         return <FeaturedSalesPage />;
//       case 'announcement-bar':
//         return <Announcement/>;
//       case 'featured-categories':
//         return <FeatureCategory/>;
//       case 'featured-listings':
//         return <FeaturedListings/>
//       // Add other cases as you import more components
//       // case 'featured-sale':
//       //   return <FeaturedSale />;
//       default:
//         return <HeroSlider />; // Default fallback
//     }
//   };

//   return (
//     <div>
//       <Navbar 
//         onSelectContent={handleSelectContent} 
//         selectedContentId={selectedContent}
//       />
      
//       <main>
//         <div className="bg-white rounded-lg shadow p-2">
//           {renderContent()}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Page;







'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './_components/content-management-Navbar/page';
import HeroSlider from './hero-slider/hero-slider';
import Category from './category-cards/category-cards'; 
import FeaturedSalesPage from './featured-sales/featured-sales';
import Announcement from './announcement-bar/announcement-bar';
import FeatureCategory from './featured-categories/featured-categories';
import FeaturedListings from './featured-listings/featured-listings';
import FeaturedReviews from './featured-reviews/featured-reviews';
import { usePermissions } from '../../_components/contexts/PermissionContext';

// Define content component types and their permission keys
const CONTENT_COMPONENTS = [
  {
    id: 'hero-slider',
    label: 'Hero Slider',
    permissionKey: 'hero_slider',
    component: HeroSlider
  },
  {
    id: 'category-cards',
    label: 'Category Cards',
    permissionKey: 'category_cards',
    component: Category
  },
  {
    id: 'featured-sale',
    label: 'Featured Sales',
    permissionKey: 'featured_sales',
    component: FeaturedSalesPage
  },
  {
    id: 'announcement-bar',
    label: 'Announcement Bar',
    permissionKey: 'announcement_bar',
    component: Announcement
  },
  {
    id: 'featured-categories',
    label: 'Featured Categories',
    permissionKey: 'feature_categories',
    component: FeatureCategory
  },
  {
    id: 'featured-listings',
    label: 'Featured Listings',
    permissionKey: 'featured_listings',
    component: FeaturedListings
  },
  {
    id: 'featured-reviews',
    label: 'Featured Reviews',
    permissionKey: 'featured_reviews',
    component: FeaturedReviews
  },
];

const Page = () => {
  const router = useRouter();
  const { 
    hasPermission, 
    hasContentManagementAccess, 
    hasContentComponentPermission,
    isStaticAdmin 
  } = usePermissions();
  
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessibleComponents, setAccessibleComponents] = useState<any[]>([]);

  // Check permissions and find accessible components
  useEffect(() => {
    console.log('🔐 Checking Content Management Permissions...');
    
    // Check if user has access to content management page
    const canAccessContentManagement = hasContentManagementAccess();
    
    console.log('📊 Content Management Access Check:', {
      canAccessContentManagement,
      hasPermission_content_management_view: hasPermission('content_management.view'),
      isStaticAdmin: isStaticAdmin()
    });
    
    if (!canAccessContentManagement) {
      console.log('🚫 User does not have access to Content Management');
      setHasAccess(false);
      setLoading(false);
      return;
    }
    
    // Find all components the user has permission to view
    const accessible = CONTENT_COMPONENTS.filter(component => {
      const hasViewPermission = hasContentComponentPermission(
        component.permissionKey as any, 
        'view'
      );
      
      console.log(`🔍 Checking ${component.label}:`, {
        permissionKey: component.permissionKey,
        hasViewPermission,
        hasPermission: hasPermission(`${component.permissionKey}.view`),
        effectivePermission: hasPermission(`${component.permissionKey}.view`)
      });
      
      return hasViewPermission;
    });
    
    console.log('✅ Accessible Components:', accessible.map(c => c.label));
    setAccessibleComponents(accessible);
    
    // Set default selected content
    if (accessible.length > 0) {
      // Try to use hero-slider if accessible, otherwise use first accessible component
      const defaultComponent = accessible.find(c => c.id === 'hero-slider') || accessible[0];
      setSelectedContent(defaultComponent.id);
      console.log(`🎯 Default selected component: ${defaultComponent.label}`);
    } else {
      console.log('⚠️ User has content_management.view but no component access');
    }
    
    setHasAccess(true);
    setLoading(false);
  }, [hasPermission, hasContentManagementAccess, hasContentComponentPermission, isStaticAdmin]);

  const handleSelectContent = (contentId: string) => {
    // Find the component by ID
    const component = CONTENT_COMPONENTS.find(c => c.id === contentId);
    
    if (!component) {
      console.error(`❌ Component not found: ${contentId}`);
      return;
    }
    
    // Check if user has permission to view this component
    const hasComponentAccess = hasContentComponentPermission(
      component.permissionKey as any, 
      'view'
    );
    
    console.log(`🔐 Selecting content "${component.label}":`, {
      permissionKey: component.permissionKey,
      hasComponentAccess,
      hasPermission: hasPermission(`${component.permissionKey}.view`),
      hasContentManagementAccess: hasContentManagementAccess()
    });
    
    if (!hasComponentAccess) {
      // Show error message (you could use toast notification)
      console.log(`🚫 User does not have permission to access ${component.label}`);
      alert(`You don't have permission to access ${component.label}`);
      return;
    }
    
    setSelectedContent(contentId);
  };

  // Function to render the selected component with permission check
  const renderContent = () => {
    if (!selectedContent) {
      return <NoContentAccessible />;
    }
    
    const component = CONTENT_COMPONENTS.find(c => c.id === selectedContent);
    
    if (!component) {
      return (
        <AccessDenied 
          message="Selected component not found"
        />
      );
    }
    
    // Double-check permission before rendering
    const hasComponentAccess = hasContentComponentPermission(
      component.permissionKey as any, 
      'view'
    );
    
    console.log(`🔐 Rendering content "${component.label}":`, {
      permissionKey: component.permissionKey,
      hasComponentAccess,
      isStaticAdmin: isStaticAdmin()
    });
    
    if (!hasComponentAccess) {
      return (
        <AccessDenied 
          message={`You don't have permission to access ${component.label}`}
        />
      );
    }
    
    const ComponentToRender = component.component;
    return <ComponentToRender />;
  };

  // Access Denied Component
  const AccessDenied = ({ message = 'You do not have permission to access this content' }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // No Access to Content Management
  const NoContentManagementAccess = () => (
    <AccessDenied message="You do not have permission to access Content Management. You need 'content_management.view' permission." />
  );

  // No Components Accessible (but has content_management.view)
  const NoContentAccessible = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Accessible Content</h2>
        <p className="text-gray-600 mb-4">
          You have access to Content Management but don't have permission to view any specific content sections.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          You need view permission for at least one content component (e.g., 'hero_slider.view').
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // No access to content management at all
  if (!hasAccess) {
    return <NoContentManagementAccess />;
  }

  // Has access but no accessible components
  if (accessibleComponents.length === 0) {
    return <NoContentAccessible />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navbar without accessibleComponents prop */}
      <Navbar 
        onSelectContent={handleSelectContent} 
        selectedContentId={selectedContent}
      />
      
      <main >
        <div className="bg-white rounded-lg shadow p-2">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Page;