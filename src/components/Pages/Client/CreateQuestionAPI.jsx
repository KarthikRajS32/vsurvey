import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit3, X, Trash2 } from "lucide-react"
import ClientAdminHeader from "./ClientAdminHeader"
import { useQuestions } from "../../../hooks/useApi"
import authService from "../../../services/authService"

const CreateQuestionAPI = ({ profile, onProfileEdit, onLogout, onNavigateToSurveys }) => {
  const {
    questions,
    loading,
    error,
    setError,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
  } = useQuestions();

  const [questionText, setQuestionText] = useState('')
  const [responseType, setResponseType] = useState('')
  const [ratingScale, setRatingScale] = useState('1-5')
  const [options, setOptions] = useState([''])
  const [message, setMessage] = useState('')

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editFormData, setEditFormData] = useState({
    text: '',
    type: '',
    options: []
  })

  // Load questions on component mount
  useEffect(() => {
    const loadQuestionsWhenReady = async () => {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!authService.isAuthenticated() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (authService.isAuthenticated()) {
        loadQuestions();
      }
    };
    
    loadQuestionsWhenReady();
  }, []);

  const loadQuestions = async () => {
    try {
      await fetchQuestions();
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!questionText.trim() || !responseType) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      const questionData = {
        text: questionText.trim(),
        type: responseType,
        options: responseType === 'multiple_choice' 
          ? options.filter(opt => opt.trim()).map((opt, index) => ({
              id: `opt_${Date.now()}_${index}`,
              text: opt.trim(),
              order: index
            }))
          : [],
        is_required: true,
        order: 0,
        created_by: profile?.email || 'admin@example.com'
      };

      await createQuestion(questionData);
      
      // Reset form
      setQuestionText('')
      setResponseType('')
      setRatingScale('1-5')
      setOptions([''])
      setMessage('Question created successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Create question error:', err)
      setMessage(err.message || 'Failed to create question')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setEditFormData({
      text: question.text,
      type: question.type,
      options: question.options || []
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await updateQuestion(editingQuestion.id, editFormData);
      setIsEditModalOpen(false)
      setEditingQuestion(null)
      setMessage('Question updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to update question')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        setMessage('Question deleted successfully!')
        setTimeout(() => setMessage(''), 3000)
      } catch (err) {
        setMessage(err.message || 'Failed to delete question')
        setTimeout(() => setMessage(''), 5000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAdminHeader 
        profile={profile} 
        onProfileEdit={onProfileEdit} 
        onLogout={onLogout}
      />
      
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-600 mt-2">Create and manage survey questions</p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Question Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Question</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="questionText">Question Text *</Label>
                <Input
                  id="questionText"
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div>
                <Label htmlFor="responseType">Response Type *</Label>
                <select
                  id="responseType"
                  className="w-full p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  required
                >
                  <option value="">Select response type</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text</option>
                  <option value="rating">Rating</option>
                  <option value="yes_no">Yes/No</option>
                </select>
              </div>

              {responseType === 'multiple_choice' && (
                <div>
                  <Label>Options</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Question'}
              </Button>
            </form>
          </div>

          {/* Questions List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
            
            {loading && <p>Loading questions...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{question.text}</p>
                      <p className="text-sm text-gray-600 mt-1">Type: {question.type}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Options:</p>
                          <ul className="text-sm text-gray-700 ml-4">
                            {question.options.map((option, idx) => (
                              <li key={idx}>• {option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editQuestionText">Question Text</Label>
              <Input
                id="editQuestionText"
                value={editFormData.text}
                onChange={(e) => setEditFormData({...editFormData, text: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Question'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateQuestionAPI
