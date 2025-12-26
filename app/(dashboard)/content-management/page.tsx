'use client';

import React, { useState } from 'react';
import Navbar from './_components/content-management-Navbar/page';
import HeroSlider from './hero-slider/hero-slider';
import Category from './category-cards'; // Fixed: Capital C for component
// Import other components as you need them
// import FeaturedSale from './featured-sale';
// import AnnouncementBar from './announcement-bar';
// etc...

const Page = () => {
  const [selectedContent, setSelectedContent] = useState<string>('hero-slider'); // Default to hero-slider

  const handleSelectContent = (contentId: string) => {
    setSelectedContent(contentId);
  };

  // Function to render the selected component
  const renderContent = () => {
    switch (selectedContent) {
      case 'hero-slider':
        return <HeroSlider />;
      case 'category-cards':
        return <Category />; // Capital C
      // Add other cases as you import more components
      // case 'featured-sale':
      //   return <FeaturedSale />;
      default:
        return <HeroSlider />; // Default fallback
    }
  };

  return (
    <div>
      <Navbar 
        onSelectContent={handleSelectContent} 
        selectedContentId={selectedContent}
      />
      
      <main>
        <div className="bg-white rounded-lg shadow p-2">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Page;