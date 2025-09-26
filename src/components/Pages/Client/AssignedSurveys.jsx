import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "@/components/ui/icons"
import { IoMdMenu } from "react-icons/io"

const Sidebar = () => {
    const [personnel, setPersonnel] = useState([
      { id: 1, name: 'John Smith', survey: 'Customer Satisfaction', date: '2024-01-15', status: 'Active' },
      { id: 2, name: 'Sarah Johnson', survey: 'Product Feedback', date: '2024-01-14', status: 'In Progress' },
      { id: 3, name: 'Mike Wilson', survey: 'Market Research', date: '2024-01-13', status: 'Completed' }
    ])
    
    const [surveys, setSurveys] = useState([])
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [surveyToDelete, setSurveyToDelete] = useState(null)
    
    useEffect(() => {
      const savedSurveys = localStorage.getItem('createdSurveys')
      if (savedSurveys) {
        setSurveys(JSON.parse(savedSurveys))
      }
      
      // Listen for surveys updates from other components
      const handleSurveysUpdated = () => {
        const updatedSurveys = localStorage.getItem('createdSurveys')
        if (updatedSurveys) {
          setSurveys(JSON.parse(updatedSurveys))
        } else {
          setSurveys([])
        }
      }
      
      window.addEventListener('surveysUpdated', handleSurveysUpdated)
      
      return () => {
        window.removeEventListener('surveysUpdated', handleSurveysUpdated)
      }
    }, [])
    
    const saveSurveysToStorage = (updatedSurveys) => {
      localStorage.setItem('createdSurveys', JSON.stringify(updatedSurveys))
      // Trigger custom event to sync across components
      window.dispatchEvent(new Event('surveysUpdated'))
    }
    
    const openDeleteModal = (survey) => {
      setSurveyToDelete(survey)
      setIsDeleteModalOpen(true)
    }
    
    const confirmDelete = () => {
      if (surveyToDelete) {
        const updatedSurveys = surveys.filter(s => s.id !== surveyToDelete.id)
        setSurveys(updatedSurveys)
        saveSurveysToStorage(updatedSurveys)
      }
      setIsDeleteModalOpen(false)
      setSurveyToDelete(null)
    }
    
    const cancelDelete = () => {
      setIsDeleteModalOpen(false)
      setSurveyToDelete(null)
    }

  return (
    <div className="lg:w-90 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
        <div className="lg:p-4 lg:mt-20 p-4 space-y-3">
          {/* Created Surveys Section */}
          <div className="mb-6">
            <CardTitle className="text-base lg:text-lg font-semibold text-black lg:text-center mb-3">
              Created Surveys ({surveys.length})
            </CardTitle>
            <CardContent className="p-0">
              <div className="space-y-2 lg:space-y-3">
                {surveys.length === 0 ? (
                  <div className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white">
                    <p className="text-gray-500 text-xs text-center">
                      No surveys created yet
                    </p>
                  </div>
                ) : (
                  surveys.map((survey) => (
                    <div key={survey.id} className="p-3 lg:p-4 border border-black rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-xs lg:text-sm break-words">
                            {survey.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Questions: {survey.questionCount || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {survey.date}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(survey)}
                          className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
          
          {/* Assigned Surveys Section
          <div className="mb-3">
            <CardTitle className="text-base lg:text-lg font-semibold text-black lg:text-center mt-5">
              Assigned Surveys
            </CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="space-y-2 lg:space-y-3">  
              {personnel.map((person) => (
                <div key={person.id} className="p-3 lg:p-4 border border-black rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-xs lg:text-sm break-words">
                        {person.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 break-words">
                        {person.survey}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {person.date}
                      </p>
                    </div>
                    <button className="text-base text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <IoMdMenu />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent> */}
        </div>
        
        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={() => {}}>
          <DialogContent className="w-full max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this survey? This action cannot be undone.
              </p>
              {surveyToDelete && (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium text-sm">{surveyToDelete.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Created: {surveyToDelete.date}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={confirmDelete} variant="destructive" className="flex-1">
                  Delete
                </Button>
                <Button onClick={cancelDelete} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default Sidebar
