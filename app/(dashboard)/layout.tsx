"use client"

import "../global.css";
import type { Metadata } from "next";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "../../components/ui/sidebar";
import Providers from '../providers';
import { Home, Settings, Users, BarChart3, Folder, Eye, Users2, ChevronDown, Truck ,} from "lucide-react";
import { useState } from "react";

// CN utility function
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Users Menu Component with Sub-options
function UsersMenu() {
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => setIsUsersOpen(!isUsersOpen)}
      >
        <Users className="h-4 w-4" />
        <span>Users</span>
        <ChevronDown 
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            isUsersOpen ? "rotate-0" : "-rotate-90"
          )} 
        />
      </SidebarMenuButton>
      
      {isUsersOpen && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton href="/user/user-categories">
              <Users2 className="h-4 w-4" />
              <span>User Categories</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          
          <SidebarMenuSubItem>
            <SidebarMenuSubButton href="/user/user-view">
              <Eye className="h-4 w-4" />
              <span>View Users</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// Supplier Menu Component with Sub-options
function SupplierMenu() {
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => setIsSupplierOpen(!isSupplierOpen)}
      >
        <Truck className="h-4 w-4" />   {/* ✅ Updated main icon */}
        <span>Suppliers</span>
        <ChevronDown 
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            isSupplierOpen ? "rotate-0" : "-rotate-90"
          )} 
        />
      </SidebarMenuButton>
      
      {isSupplierOpen && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton href="/supplier/supplier-categories">
              <Folder className="h-4 w-4" />   {/* ✅ Supplier Categories icon */}
              <span>Supplier Categories</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          
          <SidebarMenuSubItem>
            <SidebarMenuSubButton href="/supplier/view-suppliers">
              <Eye className="h-4 w-4" />   {/* ✅ View Suppliers icon */}
              <span>View Suppliers</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
        <Providers>
          <SidebarProvider>
            <div className="flex min-h-screen w-full"> {/* ✅ ADDED w-full */}
              {/* Sidebar */}
              <Sidebar>
                <SidebarHeader>
                  <div className="flex items-center gap-2 px-2 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">My App</span>
                      <span className="text-xs text-muted-foreground">v1.0.0</span>
                    </div>
                  </div>
                </SidebarHeader>
                
                <SidebarContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard">
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {/* Users Menu with Sub-options */}
                    <UsersMenu />
                    
                    {/* Suppliers - Simple Link (No sub-menu) */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/supplier">
                          <Truck className="h-4 w-4" />
                          <span>Suppliers</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}
                    <SupplierMenu/>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/project">
                          <Folder className="h-4 w-4" />
                          <span>Projects</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/analytics">
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/settings">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarContent>
              </Sidebar>

              {/* Main content area with SidebarInset */}
              <SidebarInset className="w-full flex-1"> {/* ✅ ADDED w-full flex-1 */}
                <header className="flex h-16 items-center gap-2 border-b border-gray-200 shadow-lg px-4 w-full"> {/* ✅ ADDED w-full */}
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">Welcome to My App</h1>
                </header>
                <main className="flex-1 p-6 w-full"> {/* ✅ ADDED w-full */}
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </Providers>
  );
}