// import { useState, useEffect } from 'react'
// import { Building, BarChart3, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

// const SuperAdminSidebar = ({ activeTab, setActiveTab, onSidebarToggle }) => {
//   const [isOpen, setIsOpen] = useState(true)

//   useEffect(() => {
//     if (onSidebarToggle) {
//       onSidebarToggle(isOpen)
//     }
//   }, [isOpen, onSidebarToggle])

//   const menuItems = [
//     {
//       id: "clients",
//       label: "Create Clients",
//       icon: <Building className="w-4 h-4" />
//     },
//     {
//       id: "results",
//       label: "Survey Results",
//       icon: <BarChart3 className="w-4 h-4" />
//     }
//   ]

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen)
//   }

//   return (
//     <>
//       {/* Sidebar */}
//       <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
//         isOpen ? 'w-64' : 'w-16'
//       }`}>
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div className={`flex items-center gap-3 ${isOpen ? 'block' : 'hidden'}`}>
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">SA</span>
//             </div>
//             <span className="font-semibold text-gray-800">Super Admin</span>
//           </div>

//           {!isOpen && (
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
//               <span className="text-white font-bold text-sm">SA</span>
//             </div>
//           )}

//           <button
//             onClick={toggleSidebar}
//             className="p-1 rounded-md hover:bg-gray-100 transition-colors"
//           >
//             {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="p-4 space-y-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id)}
//               className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors group ${
//                 activeTab === item.id
//                   ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//               title={!isOpen ? item.label : ''}
//             >
//               <div className="flex-shrink-0">
//                 {item.icon}
//               </div>
//               <span className={`transition-all duration-300 ${
//                 isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0 overflow-hidden'
//               }`}>
//                 {item.label}
//               </span>
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Mobile overlay */}
//       <div
//         className={`lg:hidden fixed inset-0 bg-black transition-opacity z-30 ${
//           isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
//         }`}
//         onClick={toggleSidebar}
//       />
//     </>
//   )
// }

// export default SuperAdminSidebar

import { useState, useEffect } from "react";
import { Building, BarChart3 } from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const SuperAdminSidebar = ({ activeTab, setActiveTab, onSidebarToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen);
    }
  }, [isOpen, onSidebarToggle]);

  const menuItems = [
    {
      id: "clients",
      label: "Create Clients",
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: "results",
      label: "Survey Results",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];



  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarPrimitive className={`mt-4 hidden lg:flex h-screen fixed left-0 top-0 pt-16 lg:pt-20 z-40 bg-white shadow-lg transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}>
        <SidebarContent>
          <div className="flex justify-end p-2">
            <SidebarTrigger 
              open={isOpen} 
              setOpen={setIsOpen}
              className="hover:bg-gray-100"
            />
          </div>
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      className={`w-full justify-start px-3 py-2 ${
                        activeTab === item.id ? 'bg-gray-100 border-r-2 border-black text-black font-medium' : 'text-gray-700'
                      }`}
                      title={!isOpen ? item.label : ''}
                    >
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        {isOpen && (
                          <span className="ml-3 text-sm truncate transition-opacity duration-300">
                            {item.label}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarPrimitive>
    </SidebarProvider>
  );
};

export default SuperAdminSidebar;