import { Button } from "@/components/ui/button"
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";

const TopBar = ({ setActiveTab, onLogout, isSuperAdmin = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const menuItems = [
    { id: "Users", label: "Create Users" },
    { id: "Questions", label: "Create Questions" },
    { id: "surveys", label: "Create Survey" },
    { id: "assignuser", label: "Assign User" },
  ];
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
          <h1 className="text-gray-800">
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium" >V-Survey</span> 
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extralight ml-1">Portal</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {!isSuperAdmin && (
            <Button 
              onClick={() => setActiveTab('surveys')}
              className="bg-purple-700 text-xs sm:text-sm px-3 sm:px-4 lg:px-6 py-2 sm:py-3"
            >
              <span className="hidden sm:inline">+ Create Survey</span>
              <span className="sm:hidden">+ Survey</span>
            </Button>
          )}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg p-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>
              <span className="hidden sm:inline text-gray-700 font-medium text-sm">
                {isSuperAdmin ? 'Super Admin' : 'Chris Loo'}
              </span>
              <IoIosArrowDown className="text-base" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                <button
                  onClick={() => {
                    onLogout()
                    setIsProfileDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setIsMobileMenuOpen(false)
              }}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 text-sm text-gray-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileDropdownOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default TopBar