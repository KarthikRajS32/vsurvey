import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ClientAdminHeader from "./ClientAdminHeader"


const Surveys = ({ profile, onProfileEdit, onLogout, onNavigateToSurveys }) => {
  const [questions, setQuestions] = useState([])
  const [surveyName, setSurveyName] = useState('')
  const [surveys, setSurveys] = useState([])

  useEffect(() => {
    const savedQuestions = localStorage.getItem('surveyQuestions')
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
    
    // Get current client admin email and load their surveys
    const currentUser = localStorage.getItem('currentClientAdmin')
    if (currentUser) {
      const { email } = JSON.parse(currentUser)
      const surveyKey = `createdSurveys_${email}`
      const savedSurveys = localStorage.getItem(surveyKey)
      if (savedSurveys) {
        setSurveys(JSON.parse(savedSurveys))
      }
    }
    
    // Listen for storage changes to sync surveys across components
    const handleSurveysUpdated = () => {
      const currentUser = localStorage.getItem('currentClientAdmin')
      if (currentUser) {
        const { email } = JSON.parse(currentUser)
        const surveyKey = `createdSurveys_${email}`
        const updatedSurveys = localStorage.getItem(surveyKey)
        if (updatedSurveys) {
          setSurveys(JSON.parse(updatedSurveys))
        } else {
          setSurveys([])
        }
      }
    }
    
    window.addEventListener('surveysUpdated', handleSurveysUpdated)
    
    return () => {
      window.removeEventListener('surveysUpdated', handleSurveysUpdated)
    }
  }, [])
  
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSurveySelectModal, setShowSurveySelectModal] = useState(false)
  const [selectedSurveys, setSelectedSurveys] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPersonnelModal, setShowPersonnelModal] = useState(false)




  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const saveSurveysToStorage = (updatedSurveys) => {
    const currentUser = localStorage.getItem('currentClientAdmin')
    if (currentUser) {
      const { email } = JSON.parse(currentUser)
      const surveyKey = `createdSurveys_${email}`
      localStorage.setItem(surveyKey, JSON.stringify(updatedSurveys))
      // Trigger custom event to sync across components in same tab
      window.dispatchEvent(new Event('surveysUpdated'))
    }
  }

  const createSurvey = () => {
    const newSurvey = {
      id: Date.now(),
      name: surveyName.trim(),
      date: new Date().toISOString().split('T')[0],
      questions: selectedQuestions,
      questionCount: selectedQuestions.length
    }
    
    const updatedSurveys = [newSurvey, ...surveys]
    setSurveys(updatedSurveys)
    saveSurveysToStorage(updatedSurveys)
    setSelectedQuestions([])
    setSurveyName('')
  }
  
  const updateSurveyQuestions = (surveyId, questionIds) => {
    const updatedSurveys = surveys.map(survey => 
      survey.id === surveyId 
        ? {
            ...survey,
            questions: [...new Set([...survey.questions, ...questionIds])],
            questionCount: [...new Set([...survey.questions, ...questionIds])].length
          }
        : survey
    )
    setSurveys(updatedSurveys)
    saveSurveysToStorage(updatedSurveys)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAdminHeader 
        profile={profile} 
        onProfileEdit={onProfileEdit} 
        onLogout={onLogout} 
        onNavigateToSurveys={onNavigateToSurveys}
      />
      <div className="pt-20 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 xl:px-10">
      <div className="flex-1 min-w-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">Create New Survey</h1>
          <h1 className="text-sm md:text-base lg:text-lg text-gray-400 font-extralight mt-1">Select questions and create survey</h1>
        </div>
        
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-bold text-black mb-2">SURVEY NAME</label>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
                type="text"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Type your survey name here"
                className="flex-1 bg-transparent text-sm md:text-base border-b-2 border-gray-300 outline-none placeholder-gray-400 focus:placeholder-transparent focus:border-black px-2 py-2"
            />
            <button 
              onClick={createSurvey}
              className="bg-black text-white px-4 py-2 rounded-[10px] text-sm whitespace-nowrap"
            >
              + Create Survey
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg lg:text-xl font-semibold">Available Questions ({questions.length})</h2>
          <Button 
            onClick={() => setShowSurveySelectModal(true)}
            disabled={selectedQuestions.length === 0}
            className="bg-black text-white text-sm px-4 py-2"
          >
            Select Survey
          </Button>
        </div>

        <div className="space-y-3 md:space-y-4">
          {questions.length === 0 ? (
            <div className="bg-white shadow-md p-4 rounded text-center">
              <p className="text-gray-500 text-sm">No questions available. Create questions first.</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="bg-white shadow-md p-3 md:p-4 rounded">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm break-words">{question.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{question.type}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="ml-4 mt-2">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input type="checkbox" disabled className="flex-shrink-0" />
                            <span className="text-xs break-words">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Created Surveys List */}
        {/* <div className="mt-6">
          <h2 className="text-base md:text-lg lg:text-xl font-semibold mb-4">Created Surveys ({surveys.length})</h2>
          <div className="space-y-3">
            {surveys.length === 0 ? (
              <div className="bg-white shadow-md p-4 rounded text-center">
                <p className="text-gray-500 text-sm">No surveys created yet.</p>
              </div>
            ) : (
              surveys.map((survey) => (
                <div key={survey.id} className="bg-white shadow-md p-3 md:p-4 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm break-words">{survey.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Created: {survey.date}</p>
                      <p className="text-xs text-gray-500">Questions: {survey.questionCount}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}
      </div>
      
        </div>
      </div>

      {showSurveySelectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold">Select Surveys</h3>
              <button 
                onClick={() => setShowSurveySelectModal(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            
            <Input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            {surveys.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No surveys created yet. Create a survey first.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <Button 
                    onClick={() => setSelectedSurveys(surveys.map(s => s.id))}
                    className="text-xs"
                    variant="outline"
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={() => setSelectedSurveys([])}
                    variant="outline"
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  {surveys
                    .filter(survey => survey.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((survey) => (
                    <div key={survey.id} className="flex items-start gap-2 p-2 md:p-3 border rounded">
                      <input
                        type="checkbox"
                        checked={selectedSurveys.includes(survey.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSurveys([...selectedSurveys, survey.id])
                          } else {
                            setSelectedSurveys(selectedSurveys.filter(id => id !== survey.id))
                          }
                        }}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-sm break-words">{survey.name}</p>
                        <p className="text-xs text-gray-500">{survey.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="flex flex-col md:flex-row justify-end gap-2">
              <Button 
                onClick={() => setShowSurveySelectModal(false)}
                variant="outline"
                className="text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Update selected surveys with new questions
                  selectedSurveys.forEach(surveyId => {
                    updateSurveyQuestions(surveyId, selectedQuestions)
                  })
                  setSelectedQuestions([])
                  setSelectedSurveys([])
                  setShowSurveySelectModal(false)
                  // alert(`Questions assigned to ${selectedSurveys.length} survey${selectedSurveys.length > 1 ? 's' : ''} successfully!`)
                }}
                className="bg-black text-white text-xs"
                disabled={selectedSurveys.length === 0 || surveys.length === 0 || selectedQuestions.length === 0}
              >
                Assign Questions ({selectedSurveys.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Surveys

