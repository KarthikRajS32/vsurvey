import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit3, Trash2, Plus } from "lucide-react";
import { db, auth } from "../../../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const CreateSurveysAPI = ({ profile, onProfileEdit, onLogout }) => {
  const [surveyName, setSurveyName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    questions: []
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);

  useEffect(() => {
    loadQuestions();
    loadSurveys();
  }, []);

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

  const loadQuestions = async () => {
    try {
      const clientId = await getClientId();
      if (!clientId) {
        console.error('No client ID found for current user');
        return;
      }
      
      const questionsRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions");
      const snapshot = await getDocs(questionsRef);
      const questionsList = [];
      snapshot.forEach((doc) => {
        questionsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setQuestions(questionsList);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const loadSurveys = async () => {
    try {
      const clientId = await getClientId();
      if (!clientId) {
        console.error('No client ID found for current user');
        return;
      }
      
      const surveysRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys");
      const snapshot = await getDocs(surveysRef);
      const surveysList = [];
      snapshot.forEach((doc) => {
        surveysList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setSurveys(surveysList);
    } catch (error) {
      console.error("Error loading surveys:", error);
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    
    if (!surveyName.trim() || selectedQuestions.length === 0) {
      setMessage("Please enter survey name and select at least one question");
      return;
    }

    try {
      setLoading(true);
      const clientId = await getClientId();
      if (!clientId) {
        throw new Error('No client ID found for current user');
      }
      
      const surveysRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys");
      
      const surveyData = {
        name: surveyName.trim(),
        questions: selectedQuestions,
        questionCount: selectedQuestions.length,
        createdAt: new Date().toISOString(),
        createdBy: profile?.email || "admin@example.com"
      };

      await addDoc(surveysRef, surveyData);
      
      setSurveyName("");
      setSelectedQuestions([]);
      setMessage("Survey created successfully!");
      setTimeout(() => setMessage(""), 3000);
      
      await loadSurveys();
    } catch (error) {
      console.error("Error creating survey:", error);
      setMessage("Failed to create survey");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setEditFormData({
      name: survey.name,
      questions: survey.questions || []
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const clientId = await getClientId();
      if (!clientId) {
        throw new Error('No client ID found for current user');
      }
      
      const surveyRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", editingSurvey.id);
      
      await updateDoc(surveyRef, {
        name: editFormData.name,
        questions: editFormData.questions,
        questionCount: editFormData.questions.length,
        updatedAt: new Date().toISOString()
      });

      setIsEditModalOpen(false);
      setEditingSurvey(null);
      setMessage("Survey updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      
      await loadSurveys();
    } catch (error) {
      console.error("Error updating survey:", error);
      setMessage("Failed to update survey");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (survey) => {
    setSurveyToDelete(survey);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (surveyToDelete) {
      try {
        const clientId = await getClientId();
        if (!clientId) {
          throw new Error('No client ID found for current user');
        }
        
        // Delete all survey responses first
        const responsesRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", surveyToDelete.id, "responses");
        const responsesSnapshot = await getDocs(responsesRef);
        
        const responseDeletePromises = [];
        responsesSnapshot.forEach((responseDoc) => {
          const responseRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", surveyToDelete.id, "responses", responseDoc.id);
          responseDeletePromises.push(deleteDoc(responseRef));
        });
        
        // Remove survey from all user assignments
        const assignmentsRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "survey_assignments");
        const assignmentsSnapshot = await getDocs(assignmentsRef);
        
        const assignmentDeletePromises = [];
        assignmentsSnapshot.forEach((assignmentDoc) => {
          const assignmentData = assignmentDoc.data();
          if (assignmentData.survey_id === surveyToDelete.id) {
            const assignmentRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "survey_assignments", assignmentDoc.id);
            assignmentDeletePromises.push(deleteDoc(assignmentRef));
          }
        });
        
        // Wait for all deletions to complete
        await Promise.all([...responseDeletePromises, ...assignmentDeletePromises]);
        
        // Delete the survey
        const surveyRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", surveyToDelete.id);
        await deleteDoc(surveyRef);
        
        setMessage(`Survey deleted successfully! Removed ${responseDeletePromises.length} response(s) and ${assignmentDeletePromises.length} assignment(s).`);
        setTimeout(() => setMessage(""), 3000);
        
        await loadSurveys();
      } catch (error) {
        console.error("Error deleting survey:", error);
        setMessage("Failed to delete survey");
        setTimeout(() => setMessage(""), 3000);
      }
    }
    setIsDeleteModalOpen(false);
    setSurveyToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSurveyToDelete(null);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleEditQuestionSelection = (questionId) => {
    setEditFormData(prev => ({
      ...prev,
      questions: prev.questions.includes(questionId)
        ? prev.questions.filter(id => id !== questionId)
        : [...prev.questions, questionId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto p-6">
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Survey Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Create New Survey</h2>
            <p className="text-gray-600 mb-4">Select questions and create survey</p>

            <form onSubmit={handleCreateSurvey} className="space-y-4">
              <div>
                <Label htmlFor="surveyName">SURVEY NAME</Label>
                <Input
                  id="surveyName"
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder="Type your survey name here"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || selectedQuestions.length === 0}
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Survey"}
              </Button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Available Questions ({questions.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No questions available</p>
                ) : (
                  questions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((question) => (
                    <div key={question.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{question.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{question.type}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 ml-4">
                              {question.options.map((option, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                  {idx + 1}. {typeof option === 'string' ? option : option.text}
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
            </div>
          </div>

          {/* Surveys List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Created Surveys ({surveys.length})</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {surveys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No surveys created yet</p>
              ) : (
                surveys.map((survey) => (
                  <div key={survey.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{survey.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Questions: {survey.questionCount || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(survey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(survey)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(survey)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Survey</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editSurveyName">Survey Name</Label>
              <Input
                id="editSurveyName"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Select Questions</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
                {questions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((question) => (
                  <div key={question.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={editFormData.questions.includes(question.id)}
                      onChange={() => toggleEditQuestionSelection(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.text}</p>
                      <p className="text-xs text-gray-500">{question.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700">
                {loading ? "Updating..." : "Update Survey"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
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
            <p>Are you sure you want to delete <strong>{surveyToDelete?.name}</strong>?</p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700"
              >
                Delete Survey
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

export default CreateSurveysAPI;