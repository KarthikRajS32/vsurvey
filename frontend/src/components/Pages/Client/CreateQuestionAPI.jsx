import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit3, X, Trash2 } from "lucide-react";
import { useQuestions } from "../../../hooks/useApi";
import authService from "../../../services/authService";
import { db, auth } from "../../../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const CreateQuestionAPI = ({
  profile,
  onProfileEdit,
  onLogout,
  onNavigateToSurveys,
}) => {
  const {
    questions,
    loading,
    error,
    setError,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions();

  const [questionText, setQuestionText] = useState("");
  const [responseType, setResponseType] = useState("");
  const [ratingScale, setRatingScale] = useState("1-5");
  const [options, setOptions] = useState([""]);
  const [message, setMessage] = useState("");
  const [firebaseQuestions, setFirebaseQuestions] = useState([]);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    text: "",
    type: "",
    options: [],
    ratingScale: "1-5",
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Load questions on component mount
  useEffect(() => {
    const loadQuestionsWhenReady = async () => {
      let attempts = 0;
      const maxAttempts = 10;

      while (!authService.isAuthenticated() && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
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
      await loadFirebaseQuestions();
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  };

  const getClientId = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      const clientsRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients");
      const snapshot = await getDocs(clientsRef);
      
      let clientDocId = null;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === currentUser.email) {
          clientDocId = doc.id;
        }
      });
      
      return clientDocId;
    } catch (error) {
      console.error("Error getting client ID:", error);
      return null;
    }
  };

  const loadFirebaseQuestions = async () => {
    try {
      const clientId = await getClientId();
      if (!clientId) {
        console.error('No client ID found for current user');
        return;
      }
      
      console.log('Loading questions for clientId:', clientId);
      const questionsRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions");
      const snapshot = await getDocs(questionsRef);
      const fbQuestions = [];
      snapshot.forEach((doc) => {
        fbQuestions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setFirebaseQuestions(fbQuestions);
    } catch (error) {
      console.error("Error loading Firebase questions:", error);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || !responseType) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      const questionData = {
        text: questionText.trim(),
        type: responseType,
        options:
          responseType === "multiple_choice"
            ? options
                .filter((opt) => opt.trim())
                .map((opt, index) => ({
                  id: `opt_${Date.now()}_${index}`,
                  text: opt.trim(),
                  order: index,
                }))
            : [],
        is_required: true,
        order: 0,
        created_by: profile?.email || "admin@example.com",
        createdAt: new Date().toISOString(),
      };

      if (responseType === "rating") {
        questionData.ratingScale = ratingScale;
      }

      // Save to Firebase in client-specific collection
      const clientId = await getClientId();
      if (!clientId) {
        throw new Error('No client ID found for current user');
      }
      
      console.log('Saving question for clientId:', clientId);
      const questionsRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions");
      await addDoc(questionsRef, questionData);
      console.log("Question saved to Firebase successfully for client:", clientId);

      // Also save to backend API
      await createQuestion(questionData);

      // Reset form
      setQuestionText("");
      setResponseType("");
      setRatingScale("1-5");
      setOptions([""]);
      setMessage("Question created successfully!");
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh Firebase questions list
      await loadFirebaseQuestions();
    } catch (err) {
      console.error("Create question error:", err);
      setMessage(err.message || "Failed to create question");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setEditFormData({
      text: question.text,
      type: question.type,
      options: question.options || [],
      ratingScale: question.ratingScale || '1-5',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update in Firebase
      const clientId = await getClientId();
      if (!clientId) {
        throw new Error('No client ID found for current user');
      }
      
      const questionRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions", editingQuestion.id);
      const updateData = {
        text: editFormData.text,
        type: editFormData.type,
        options: editFormData.type === "multiple_choice" 
          ? (editFormData.options || []).filter(opt => {
              const text = typeof opt === 'string' ? opt : (opt?.text || '');
              return text && text.trim();
            }).map((opt, index) => ({
              id: `opt_${Date.now()}_${index}`,
              text: typeof opt === 'string' ? opt.trim() : (opt?.text?.trim() || ''),
              order: index,
            }))
          : [],
        updatedAt: new Date().toISOString(),
      };

      // Handle rating scale - add if rating type, remove if not
      if (editFormData.type === "rating") {
        updateData.ratingScale = editFormData.ratingScale || '1-5';
      } else if (editingQuestion.ratingScale) {
        // Use Firebase's deleteField() to completely remove the field
        const { deleteField } = await import('firebase/firestore');
        updateData.ratingScale = deleteField();
      }
      await updateDoc(questionRef, updateData);

      // Also update backend API
      await updateQuestion(editingQuestion.id, editFormData);
      
      setIsEditModalOpen(false);
      setEditingQuestion(null);
      setMessage("Question updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh Firebase questions list
      await loadFirebaseQuestions();
    } catch (err) {
      setMessage(err.message || "Failed to update question");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      try {
        const clientId = await getClientId();
        if (!clientId) {
          throw new Error('No client ID found for current user');
        }
        
        // Remove question from all surveys first
        const surveysRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys");
        const surveysSnapshot = await getDocs(surveysRef);
        
        const updatePromises = [];
        surveysSnapshot.forEach((surveyDoc) => {
          const surveyData = surveyDoc.data();
          if (surveyData.questions && surveyData.questions.includes(questionToDelete.id)) {
            const updatedQuestions = surveyData.questions.filter(qId => qId !== questionToDelete.id);
            const surveyRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", surveyDoc.id);
            updatePromises.push(
              updateDoc(surveyRef, {
                questions: updatedQuestions,
                questionCount: updatedQuestions.length,
                updatedAt: new Date().toISOString()
              })
            );
          }
        });
        
        // Wait for all survey updates to complete
        await Promise.all(updatePromises);
        
        // Delete from Firebase
        const questionRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions", questionToDelete.id);
        await deleteDoc(questionRef);
        
        // Also delete from backend API
        await deleteQuestion(questionToDelete.id);
        
        setMessage(`Question deleted successfully! Removed from ${updatePromises.length} survey(s).`);
        setTimeout(() => setMessage(""), 3000);
        
        // Refresh Firebase questions list
        await loadFirebaseQuestions();
      } catch (err) {
        setMessage(err.message || "Failed to delete question");
        setTimeout(() => setMessage(""), 5000);
      }
    }
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Question Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage survey questions
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.includes("success")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
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

              {responseType === "multiple_choice" && (
                <div>
                  <Label>Options</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
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
                  
                  {/* Preview */}
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <Label className="text-sm font-medium">Preview:</Label>
                    <div className="mt-2 space-y-2">
                      {options.filter(opt => opt.trim()).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4" disabled />
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {responseType === "rating" && (
                <div>
                  <Label>Rating Scale</Label>
                  <select
                    className="w-full p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black mt-2"
                    value={ratingScale}
                    onChange={(e) => setRatingScale(e.target.value)}
                  >
                    <option value="1-3">1-3 Scale</option>
                    <option value="1-5">1-5 Scale</option>
                    <option value="1-10">1-10 Scale</option>
                  </select>
                  
                  {/* Preview */}
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <Label className="text-sm font-medium">Preview:</Label>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: parseInt(ratingScale.split('-')[1]) }, (_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {responseType === "yes_no" && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <Label className="text-sm font-medium">Preview:</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="radio" name="preview" className="w-4 h-4" disabled />
                      <span className="text-sm">Yes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="preview" className="w-4 h-4" disabled />
                      <span className="text-sm">No</span>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700">
                Create Question
              </Button>
            </form>
          </div>

          {/* Questions List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Questions ({firebaseQuestions.length})</h2>

            {loading && <p>Loading questions...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {firebaseQuestions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{question.text}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {question.type}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Options:</p>
                          <ul className="text-sm text-gray-700 ml-4">
                            {question.options.map((option, idx) => (
                              <li key={idx}>• {typeof option === 'string' ? option : option.text}</li>
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
                        onClick={() => openDeleteModal(question)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editQuestionText">Question Text</Label>
              <Input
                id="editQuestionText"
                value={editFormData.text}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, text: e.target.value })
                }
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editResponseType">Response Type</Label>
              <select
                id="editResponseType"
                className="w-full p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                value={editFormData.type}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value, options: e.target.value === 'multiple_choice' ? editFormData.options : [] })}
                required
              >
                <option value="">Select response type</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="text">Text</option>
                <option value="rating">Rating</option>
                <option value="yes_no">Yes/No</option>
              </select>
            </div>

            {editFormData.type === "multiple_choice" && (
              <div>
                <Label>Options</Label>
                {(editFormData.options || ['']).map((option, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={typeof option === 'string' ? option : option.text || ''}
                      onChange={(e) => {
                        const newOptions = [...(editFormData.options || [''])];
                        newOptions[index] = e.target.value;
                        setEditFormData({ ...editFormData, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    {(editFormData.options || ['']).length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = (editFormData.options || ['']).filter((_, i) => i !== index);
                          setEditFormData({ ...editFormData, options: newOptions });
                        }}
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
                  onClick={() => {
                    const newOptions = [...(editFormData.options || ['']), ''];
                    setEditFormData({ ...editFormData, options: newOptions });
                  }}
                  className="mt-2"
                >
                  Add Option
                </Button>
                
                {/* Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <Label className="text-sm font-medium">Preview:</Label>
                  <div className="mt-2 space-y-2">
                    {(editFormData.options || []).filter(opt => {
                      const text = typeof opt === 'string' ? opt : opt.text || '';
                      return text.trim();
                    }).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" disabled />
                        <span className="text-sm">{typeof option === 'string' ? option : option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editFormData.type === "rating" && (
              <div>
                <Label>Rating Scale</Label>
                <select
                  className="w-full p-3 border text-sm rounded-[5px] border-gray-400 focus:outline-none focus:ring-1 focus:ring-black mt-2"
                  value={editFormData.ratingScale || '1-5'}
                  onChange={(e) => setEditFormData({ ...editFormData, ratingScale: e.target.value })}
                >
                  <option value="1-3">1-3 Scale</option>
                  <option value="1-5">1-5 Scale</option>
                  <option value="1-10">1-10 Scale</option>
                </select>
                
                {/* Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <Label className="text-sm font-medium">Preview:</Label>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: parseInt((editFormData.ratingScale || '1-5').split('-')[1]) }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editFormData.type === "yes_no" && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <Label className="text-sm font-medium">Preview:</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="editPreview" className="w-4 h-4" disabled />
                    <span className="text-sm">Yes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="editPreview" className="w-4 h-4" disabled />
                    <span className="text-sm">No</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700">
                {loading ? "Updating..." : "Update Question"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{questionToDelete?.text}</strong>?</p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
              >
                Delete Question
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelDelete}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateQuestionAPI;
