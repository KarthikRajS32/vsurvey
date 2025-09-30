import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit3, X, Trash2 } from "@/components/ui/icons"
import ClientAdminHeader from "./ClientAdminHeader"


const Surveys = ({ profile, onProfileEdit, onLogout, onNavigateToSurveys }) => {
  const [questionText, setQuestionText] = useState('')
  const [responseType, setResponseType] = useState('')
  const [ratingScale, setRatingScale] = useState('1-5')
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    // Clear old questions and load new ones
    const defaultQuestions = [
      {
        id: 1,
        text: "Is current DMK govt fulfilled all their promise?",
        type: "Multiple choice",
        options: ["Yes", "No", "Dont Know"]
      },
      {
        id: 2,
        text: "Who is best alternative for ruling DMK",
        type: "Multiple choice",
        options: ["ADMK+", "TVK", "NTK", "NO one"]
      },
      {
        id: 3,
        text: "Your support in 2026 Election",
        type: "Multiple choice",
        options: ["DMK+", "ADMK+", "TVK", "NTK", "Others"]
      },
      {
        id: 4,
        text: "Your MLA Constituency",
        type: "Text response"
      },
      {
        id: 5,
        text: "Age",
        type: "Multiple choice",
        options: ["Less than 25", "25 to 35", "36 to 50", "51 to 70", "Greater than 70"]
      },
      {
        id: 6,
        text: "Sex",
        type: "Multiple choice",
        options: ["Male", "Female", "Other"]
      },
      {
        id: 7,
        text: "Are you committed to vote on Election Date",
        type: "Multiple choice",
        options: ["Yes", "No. I Live outside tamilnadu/India", "No but influence in family/friend circle"]
      }
    ]
    setQuestions(defaultQuestions)
    localStorage.setItem('surveyQuestions', JSON.stringify(defaultQuestions))
  }, [])

  const saveQuestionsToStorage = (updatedQuestions) => {
    localStorage.setItem('surveyQuestions', JSON.stringify(updatedQuestions))
  }
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([''])
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editQuestionText, setEditQuestionText] = useState('')
  const [editResponseType, setEditResponseType] = useState('')
  const [editRatingScale, setEditRatingScale] = useState('1-5')
  const [editOptions, setEditOptions] = useState([''])
  const [showResponseTypeDropdown, setShowResponseTypeDropdown] = useState(false)
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  
  const [activeSurveys, setActiveSurveys] = useState([
    { id: 1, name: 'Customer Satisfaction Survey', date: '2024-01-15' },
    { id: 2, name: 'Product Feedback Survey', date: '2024-01-14' },
    { id: 3, name: 'Market Research Survey', date: '2024-01-13' }
  ])
  


  const responseTypes = ['Text response', 'Multiple choice', 'Rating scale', 'Yes/No', 'Date picker']



  const addQuestion = () => {
    if (questionText && responseType) {
      const finalType = responseType === 'Rating scale' ? `Rating scale (${ratingScale})` : responseType
      const newQuestion = {
        id: Date.now(),
        text: questionText,
        type: finalType,
        options: responseType === 'Multiple choice' ? multipleChoiceOptions.filter(opt => opt.trim()) : []
      }
      const updatedQuestions = [newQuestion, ...questions]
      setQuestions(updatedQuestions)
      saveQuestionsToStorage(updatedQuestions)
      setQuestionText('')
      setResponseType('')
      setRatingScale('1-5')
      setMultipleChoiceOptions([''])
    }
  }

  const openEditModal = (question) => {
    setEditingQuestion(question)
    setEditQuestionText(question.text)
    
    if (question.type.includes('Rating scale')) {
      setEditResponseType('Rating scale')
      setEditRatingScale(question.type.includes('1-10') ? '1-10' : '1-5')
    } else {
      setEditResponseType(question.type)
      setEditRatingScale('1-5')
    }
    
    setEditOptions(question.options && question.options.length > 0 ? [...question.options] : [''])
    setIsEditModalOpen(true)
  }

  const saveEditQuestion = () => {
    if (editQuestionText && editResponseType) {
      const finalType = editResponseType === 'Rating scale' ? `Rating scale (${editRatingScale})` : editResponseType
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id 
          ? {
              ...q,
              text: editQuestionText,
              type: finalType,
              options: editResponseType === 'Multiple choice' ? editOptions.filter(opt => opt.trim()) : []
            }
          : q
      )
      setQuestions(updatedQuestions)
      saveQuestionsToStorage(updatedQuestions)
      closeEditModal()
    }
  }

  const openDeleteModal = (question) => {
    setQuestionToDelete(question)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (questionToDelete) {
      const updatedQuestions = questions.filter(q => q.id !== questionToDelete.id)
      setQuestions(updatedQuestions)
      saveQuestionsToStorage(updatedQuestions)
    }
    setIsDeleteModalOpen(false)
    setQuestionToDelete(null)
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false)
    setQuestionToDelete(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingQuestion(null)
    setEditQuestionText('')
    setEditResponseType('')
    setEditRatingScale('1-5')
    setEditOptions([''])
    setShowResponseTypeDropdown(false)
  }

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editOptions]
    newOptions[index] = value
    setEditOptions(newOptions)
  }

  const addEditOption = () => {
    setEditOptions([...editOptions, ''])
  }

  const removeEditOption = (index) => {
    if (editOptions.length > 1) {
      setEditOptions(editOptions.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...multipleChoiceOptions]
    newOptions[index] = value
    setMultipleChoiceOptions(newOptions)
  }

  const addOption = () => {
    setMultipleChoiceOptions([...multipleChoiceOptions, ''])
  }

  const removeOption = (index) => {
    if (multipleChoiceOptions.length > 1) {
      setMultipleChoiceOptions(multipleChoiceOptions.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAdminHeader 
        profile={profile} 
        onProfileEdit={onProfileEdit} 
        onLogout={onLogout} 
        onCreateSurvey={onNavigateToSurveys}
        onNavigateToSurveys={onNavigateToSurveys}
      />
      <div className="pt-20 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 xl:px-10">
      <div className="flex-1 min-w-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">Create Survey Questionnaire</h1>
          <h1 className="text-sm md:text-base lg:text-lg text-gray-400 font-extralight mt-1">Manage and create questionnaires</h1>
        </div>
        <div className="bg-white shadow-2xl p-4 md:p-6">
          <label className="block text-xs md:text-sm font-bold text-black mb-2">QUESTION</label>
          <Input
            type="text"
            placeholder="Enter your survey question here"
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
          />
          
          <label className="block text-xs md:text-sm font-bold text-black mb-2 mt-5">RESPONSE TYPE</label>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <select
              className="flex-1 md:max-w-xs p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
              required
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
            >
              <option value="">Select response type</option>
              {responseTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>

            {responseType === 'Rating scale' && (
              <select
                className="p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                value={ratingScale}
                onChange={(e) => setRatingScale(e.target.value)}
              >
                <option value="1-5">1-5 Scale</option>
                <option value="1-10">1-10 Scale</option>
              </select>
            )}

            <button 
              onClick={addQuestion}
              className="bg-black text-white px-4 py-3 rounded-[8px] text-sm whitespace-nowrap"
            >
              + Add Question
            </button>
          </div>

          {responseType === 'Multiple choice' && (
            <div className="mt-4">
              <label className="block text-xs md:text-sm font-bold text-black mb-2">MULTIPLE CHOICE OPTIONS</label>
              <div className="space-y-2">
                {multipleChoiceOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" className="flex-shrink-0" disabled />
                    <Input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 rounded-[5px] border-gray-400 p-2 text-sm"
                    />
                    {multipleChoiceOptions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addOption} className="text-sm">
                  + Add Option
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold">Available Questions</h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {questions.map((question) => (
              <div key={question.id} className="bg-white shadow-md p-3 md:p-4 rounded border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <p className="font-medium text-sm break-words">{question.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{question.type}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input type="checkbox" disabled className="flex-shrink-0" />
                            <span className="text-xs break-words">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(question)}
                      className="p-2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(question)}
                      className="p-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={() => {}}>
          <DialogContent className="w-full max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              {questionToDelete && (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium text-sm">{questionToDelete.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{questionToDelete.type}</p>
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

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={() => {}}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Edit Question
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEditModal}
                  className="p-1 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-black mb-2">QUESTION</Label>
                <Input
                  value={editQuestionText}
                  onChange={(e) => setEditQuestionText(e.target.value)}
                  placeholder="Enter your survey question here"
                  className="rounded-[5px] border-gray-400 p-3 text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs font-bold text-black mb-2">RESPONSE TYPE</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!showResponseTypeDropdown ? (
                    <div 
                      onClick={() => setShowResponseTypeDropdown(true)}
                      className="flex-1 p-3 border text-sm rounded-[5px] border-gray-400 bg-white cursor-pointer hover:bg-gray-50"
                    >
                      {editResponseType || 'Select response type'}
                    </div>
                  ) : (
                    <select
                      className="flex-1 p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                      value={editResponseType}
                      onChange={(e) => {
                        setEditResponseType(e.target.value)
                        setShowResponseTypeDropdown(false)
                      }}
                      onBlur={() => setShowResponseTypeDropdown(false)}
                      autoFocus
                    >
                      <option value="">Select response type</option>
                      {responseTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  )}
                  
                  {editResponseType === 'Rating scale' && (
                    <select
                      value={editRatingScale}
                      onChange={(e) => setEditRatingScale(e.target.value)}
                      className="w-full sm:w-32 p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="1-5">1-5 Scale</option>
                      <option value="1-10">1-10 Scale</option>
                    </select>
                  )}
                </div>
              </div>

              {editResponseType === 'Multiple choice' && (
                <div>
                  <Label className="text-xs font-bold text-black mb-2">OPTIONS</Label>
                  <div className="space-y-2">
                    {editOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" disabled className="flex-shrink-0" />
                        <Input
                          value={option}
                          onChange={(e) => handleEditOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-[5px] border-gray-400 p-2 text-sm"
                        />
                        {editOptions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEditOption(index)}
                            className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={addEditOption}
                      className="text-sm"
                    >
                      + Add Option
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={saveEditQuestion} className="flex-1">
                  Update Question
                </Button>
                <Button variant="outline" onClick={closeEditModal} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
        </div>
      </div>
    </div>
  )
}

export default Surveys

