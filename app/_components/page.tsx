"use client";
import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useState } from "react";

// interface SidebarItem {
//   name: string;
//   path: string;
//   children?: SidebarItem[];
// }

// const sidebarItems: SidebarItem[] = [
//   { name: "Home", path: "/home" },
//   { name: "Dashboard", path: "/dashboard" },
//   { 
//     name: "User", 
//     path: "/user",
//     children: [
//       { name: "User View", path: "/user/user-view" },
//       { name: "User Categories", path: "/user/user-categories" },
//     ]
//   },
//   { name: "Supplier", path: "/supplier" },
//   { name: "Profile", path: "/profile" },
//   { name: "Settings", path: "/settings" },
//   { name: "About", path: "/about" },
// ];

// const SideBar: React.FC = () => {
//   const pathname = usePathname();
//   const [openItems, setOpenItems] = useState<string[]>([]);

//   const toggleItem = (path: string) => {
//     setOpenItems(prev =>
//       prev.includes(path)
//         ? prev.filter(item => item !== path)
//         : [...prev, path]
//     );
//   };

//   const isItemOpen = (path: string) => openItems.includes(path);
//   const isActive = (path: string) => pathname === path;
//   const isChildActive = (children: SidebarItem[] = []) => 
//     children.some(child => pathname === child.path);

//   return (
//     <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
//       <h2 className="text-2xl font-bold mb-6">Menu</h2>
//       <nav className="flex-1">
//         {sidebarItems.map((item) => (
//           <div key={item.path} className="mb-1">
//             {/* Parent Item */}
//             {item.children ? (
//               <div>
//                 <button
//                   onClick={() => toggleItem(item.path)}
//                   className={`w-full flex justify-between items-center p-2 rounded mb-1 hover:bg-gray-700 transition-colors ${
//                     isActive(item.path) || isChildActive(item.children) 
//                       ? "bg-gray-700" 
//                       : ""
//                   }`}
//                 >
//                   <span>{item.name}</span>
//                   <svg
//                     className={`w-4 h-4 transition-transform ${
//                       isItemOpen(item.path) ? "rotate-90" : ""
//                     }`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
                
//                 {/* Children Items */}
//                 {isItemOpen(item.path) && (
//                   <div className="ml-4 border-l-2 border-gray-600 pl-2">
//                     {item.children.map((child) => (
//                       <Link
//                         key={child.path}
//                         href={child.path}
//                         className={`block p-2 rounded mb-1 hover:bg-gray-700 transition-colors ${
//                           isActive(child.path) ? "bg-gray-700" : ""
//                         }`}
//                       >
//                         {child.name}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               // Regular item without children
//               <Link
//                 href={item.path}
//                 className={`block p-2 rounded mb-1 hover:bg-gray-700 transition-colors ${
//                   isActive(item.path) ? "bg-gray-700" : ""
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             )}
//           </div>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default SideBar;