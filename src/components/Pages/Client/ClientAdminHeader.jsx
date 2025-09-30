import { useState } from "react"
import { User } from "@/components/ui/icons"
import { IoIosArrowDown } from "react-icons/io"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const ClientAdminHeader = ({ profile, onProfileEdit, onLogout, onCreateSurvey, onNavigateToSurveys }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-4">
        <div className="flex items-center justify-between flex-1">
          <h1 
            className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onNavigateToSurveys}
          >
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">V-Survey</span> 
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extralight ml-1">Portal</span>
          </h1>
          
          {onCreateSurvey && (
            <Button
              onClick={onCreateSurvey}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mr-4"
            >
              <Plus className="w-4 h-4" />
              Create Survey
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg p-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="hidden sm:inline text-gray-700 font-medium text-sm">
                {profile?.name || 'Client Admin'}
              </span>
              <IoIosArrowDown className="text-base" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                <button
                  onClick={() => {
                    onProfileEdit()
                    setIsDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    onLogout()
                    setIsDropdownOpen(false)
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
      
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default ClientAdminHeader