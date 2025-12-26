'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  LayoutGrid,
  Tag,
  Megaphone,
  Layers,
  Star,
  TrendingUp,
  Shield,
  Percent,
  Info,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavbarProps {
  onSelectContent: (contentId: string) => void;
  selectedContentId: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSelectContent, selectedContentId }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Navigation items with icons
  const navItems: NavItem[] = [
    {
      id: 'hero-slider',
      label: 'Hero Slider',
      icon: <ImageIcon className="w-4 h-4" />,
      description: 'Manage homepage banner slides'
    },
    {
      id: 'category-cards',
      label: 'Category Cards',
      icon: <LayoutGrid className="w-4 h-4" />,
      description: 'Edit category display cards'
    },
    {
      id: 'featured-sale',
      label: 'Featured Sale',
      icon: <Tag className="w-4 h-4" />,
      description: 'Manage featured sales & promotions'
    },
    {
      id: 'announcement-bar',
      label: 'Announcement Bar',
      icon: <Megaphone className="w-4 h-4" />,
      description: 'Configure site announcements'
    },
    {
      id: 'featured-categories',
      label: 'Featured Categories',
      icon: <Layers className="w-4 h-4" />,
      description: 'Highlight important categories'
    },
    {
      id: 'featured-listings',
      label: 'Featured Listings',
      icon: <Star className="w-4 h-4" />,
      description: 'Showcase premium listings'
    },
    {
      id: 'featured-reviews',
      label: 'Featured Reviews',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Display customer testimonials'
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: <Percent className="w-4 h-4" />,
      description: 'Manage special deals & offers'
    },
    {
      id: 'about-us',
      label: 'About Us',
      icon: <Info className="w-4 h-4" />,
      description: 'Edit about us content'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
      description: 'Security settings & compliance'
    }
  ];

  // Split items into two rows (5 items each)
  const firstRowItems = navItems.slice(0, 5);
  const secondRowItems = navItems.slice(5, 10);

  // Check if item is active
  const isActive = (id: string) => {
    return selectedContentId === id;
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  // Handle nav item click
  const handleNavItemClick = (itemId: string) => {
    onSelectContent(itemId);
    setIsMobileMenuOpen(false); // Close mobile menu on click
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block bg-linear-to-r from-blue-50 to-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
          {/* Logo/Brand - Top row */}
          <div className="flex items-center h-16">
            <div className="shrink-0 pt-11">
              <div 
                onClick={() => handleNavItemClick('')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-lg font-semibold">Content Manager</span>
              </div>
            </div>

            {/* First Row of Navigation Items */}
            <div className="flex items-center justify-center space-x-1 ml-7">
              {firstRowItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavItemClick(item.id)}
                    className={`
                      flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-all duration-200
                      ${isActive(item.id)
                        ? 'bg-blue-600 text-white shadow-md transform -translate-y-0.5'
                        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm'
                      }
                    `}
                    onMouseEnter={() => handleDropdownToggle(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <span className={isActive(item.id) ? 'text-white' : 'text-blue-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdown === item.id ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Hover Dropdown */}
                  <div className={`
                    absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0
                    z-50
                  `}>
                    <div className="p-3">
                      <div className="flex items-start space-x-3 p-2 rounded-lg bg-blue-50">
                        <div className="p-2 bg-blue-100 rounded-md">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.label}</h3>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleNavItemClick(item.id)}
                          className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                        >
                          Manage Content
                        </button>
                        <button className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                          Settings
                        </button>
                        <button className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                          View Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row of Navigation Items */}
          <div className="flex items-center justify-center space-x-1 pb-3">
            {secondRowItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavItemClick(item.id)}
                  className={`
                    flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive(item.id)
                      ? 'bg-blue-600 text-white shadow-md transform -translate-y-0.5'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm'
                    }
                  `}
                  onMouseEnter={() => handleDropdownToggle(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <span className={isActive(item.id) ? 'text-white' : 'text-blue-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === item.id ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Hover Dropdown */}
                <div className={`
                  absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                  transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0
                  z-50
                `}>
                  <div className="p-3">
                    <div className="flex items-start space-x-3 p-2 rounded-lg bg-blue-50">
                      <div className="p-2 bg-blue-100 rounded-md">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleNavItemClick(item.id)}
                        className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                      >
                        Manage Content
                      </button>
                      <button className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                        Settings
                      </button>
                      <button className="w-full text-left block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                        View Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="ml-4 flex items-center space-x-2 cursor-pointer" onClick={() => handleNavItemClick('')}>
                <LayoutGrid className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-900">Content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`
                    w-full text-left flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors
                    ${isActive(item.id)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={isActive(item.id) ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Active Path Indicator */}
      <div className="bg-linear-to-r from-blue-50 to-transparent py-2 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-sm text-blue-500">
            <span className="hover:text-blue-700 transition-colors cursor-pointer" onClick={() => handleNavItemClick('')}>
              Home
            </span>
            {/* <span className="mx-2">/</span> */}
            {/* <span className="text-gray-600 cursor-pointer" onClick={() => handleNavItemClick('')}>
              Content
            </span> */}
            {selectedContentId && (
              <>
                <span className="mx-2">/</span>
                <span className="text-blue-600 font-medium">
                  {navItems.find(item => item.id === selectedContentId)?.label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;



