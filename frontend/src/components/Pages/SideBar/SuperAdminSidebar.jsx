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