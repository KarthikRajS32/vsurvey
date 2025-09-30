import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ClientAdminHeader from "./ClientAdminHeader";

const AssignUser = ({ profile, onProfileEdit, onLogout, onNavigateToSurveys }) => {
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [surveySearch, setSurveySearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSurveyDropdown, setShowSurveyDropdown] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    // Get current client admin email from localStorage
    const currentUser = localStorage.getItem('currentClientAdmin');
    if (currentUser) {
      const { email } = JSON.parse(currentUser);
      const userKey = `surveyUsers_${email}`;
      const savedUsers = localStorage.getItem(userKey);
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        // Convert to the format expected by AssignUser
        const formattedUsers = parsedUsers.map(user => ({
          id: user.id.toString(),
          name: user.fullName
        }));
        setUsers(formattedUsers);
      }
    }
    
    // Get current client admin email and load their surveys
    if (currentUser) {
      const { email } = JSON.parse(currentUser);
      const surveyKey = `createdSurveys_${email}`;
      const savedSurveys = localStorage.getItem(surveyKey);
      if (savedSurveys) {
        setSurveys(JSON.parse(savedSurveys));
      }
    }
    
    // Listen for surveys updates from other components
    const handleSurveysUpdated = () => {
      const currentUser = localStorage.getItem('currentClientAdmin');
      if (currentUser) {
        const { email } = JSON.parse(currentUser);
        const surveyKey = `createdSurveys_${email}`;
        const updatedSurveys = localStorage.getItem(surveyKey);
        if (updatedSurveys) {
          setSurveys(JSON.parse(updatedSurveys));
        } else {
          setSurveys([]);
        }
      }
    }
    
    const handleUsersUpdated = () => {
      const currentUser = localStorage.getItem('currentClientAdmin');
      if (currentUser) {
        const { email } = JSON.parse(currentUser);
        const userKey = `surveyUsers_${email}`;
        const updatedUsers = localStorage.getItem(userKey);
        if (updatedUsers) {
          const parsedUsers = JSON.parse(updatedUsers);
          const formattedUsers = parsedUsers.map(user => ({
            id: user.id.toString(),
            name: user.fullName
          }));
          setUsers(formattedUsers);
        } else {
          setUsers([]);
        }
      }
    }
    
    window.addEventListener('surveysUpdated', handleSurveysUpdated);
    window.addEventListener('usersUpdated', handleUsersUpdated);
    
    return () => {
      window.removeEventListener('surveysUpdated', handleSurveysUpdated);
      window.removeEventListener('usersUpdated', handleUsersUpdated);
    }
  }, []);



  

  useEffect(() => {
    const saved = localStorage.getItem("userAssignments");
    if (saved) {
      setUserAssignments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(userAssignments).length > 0) {
      localStorage.setItem('userAssignments', JSON.stringify(userAssignments));
    }
  }, [userAssignments]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) &&
    !selectedUser.includes(user.id)
  );

  const filteredSurveys = surveys.filter(survey => 
    survey.name.toLowerCase().includes(surveySearch.toLowerCase()) &&
    !selectedSurveys.includes(survey.id)
  );

  const handleSurveySelection = (surveyId) => {
    if (!selectedSurveys.includes(surveyId)) {
      setSelectedSurveys([...selectedSurveys, surveyId]);
    }
    setSurveySearch("");
    setShowSurveyDropdown(false);
  };

  const handleUserSelection = (userId) => {
    if (!selectedUser.includes(userId)) {
      setSelectedUser([...selectedUser, userId]);
    }
    setUserSearch("");
    setShowUserDropdown(false);
  };

  const removeUserSelection = (userId) => {
    setSelectedUser(selectedUser.filter((id) => id !== userId));
  };

  const removeSurveySelection = (surveyId) => {
    setSelectedSurveys(selectedSurveys.filter((id) => id !== surveyId));
  };

  const assignSurveys = () => {
    if (selectedUser.length > 0 && selectedSurveys.length > 0) {
      const newAssignments = selectedSurveys.map((surveyId) => ({
        ...surveys.find((s) => s.id === surveyId),
        active: true
      }));

      const updatedAssignments = { ...userAssignments };
      
      selectedUser.forEach(userId => {
        updatedAssignments[userId] = [
          ...(updatedAssignments[userId] || []),
          ...newAssignments.filter(
            (survey) =>
              !(updatedAssignments[userId] || []).some(
                (existing) => existing.id === survey.id
              )
          ),
        ];
      });

      setUserAssignments(updatedAssignments);

      const userNames = selectedUser.map(id => users.find(u => u.id === id)?.name).join(', ');
      setConfirmationMessage(`Successfully assigned ${selectedSurveys.length} survey${selectedSurveys.length > 1 ? 's' : ''} to ${userNames}`);
      setTimeout(() => setConfirmationMessage(""), 3000);

      setSelectedUser([]);
      setSelectedSurveys([]);
      setUserSearch("");
      setSurveySearch("");
    }
  };

  const toggleSurveyStatus = (userId, surveyId) => {
    setUserAssignments((prev) => ({
      ...prev,
      [userId]: prev[userId].map((survey) =>
        survey.id === surveyId
          ? { ...survey, active: !survey.active }
          : survey
      ),
    }));
  };



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
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">Assign Surveys to Users</h1>
          <h1 className="text-sm md:text-base lg:text-lg text-gray-400 font-extralight mt-1">Select users and assign surveys to them</h1>
        </div>
        
        <Card className="shadow-lg rounded-none">
          <CardHeader>
            <CardTitle className="text-base md:text-lg lg:text-xl text-gray-800">Assignment Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Selection */}
              <div className="relative">
                <label className="block text-xs md:text-sm font-bold text-black mb-2">SELECT USERS</label>
                <Input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  placeholder={users.length === 0 ? "No users available. Create users first." : "Search and select users..."}
                  className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
                  disabled={users.length === 0}
                />
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-400 rounded-[5px] mt-1 max-h-40 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelection(user.id)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                      >
                        <input type="checkbox" checked={selectedUser.includes(user.id)} readOnly className="mr-2" />
                        {user.name}
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUser.map((userId) => {
                      const user = users.find((u) => u.id === userId);
                      return (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user?.name}
                          <button onClick={() => removeUserSelection(userId)} className="ml-1 text-xs hover:text-red-500">×</button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Survey Selection */}
              <div className="relative">
                <label className="block text-xs md:text-sm font-bold text-black mb-2">SELECT SURVEYS</label>
                <Input
                  type="text"
                  value={surveySearch}
                  onChange={(e) => {
                    setSurveySearch(e.target.value);
                    setShowSurveyDropdown(true);
                  }}
                  onFocus={() => setShowSurveyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSurveyDropdown(false), 200)}
                  placeholder={surveys.length === 0 ? "No surveys available. Create surveys first." : "Search and select surveys..."}
                  className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
                  disabled={surveys.length === 0}
                />
                {showSurveyDropdown && filteredSurveys.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-400 rounded-[5px] mt-1 max-h-40 overflow-y-auto">
                    {filteredSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        onClick={() => handleSurveySelection(survey.id)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                      >
                        <input type="checkbox" checked={false} readOnly className="mr-2" />
                        {survey.name}
                      </div>
                    ))}
                  </div>
                )}
                {selectedSurveys.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSurveys.map((surveyId) => {
                      const survey = surveys.find((s) => s.id === surveyId);
                      return (
                        <Badge key={surveyId} variant="secondary" className="flex items-center gap-1">
                          {survey?.name}
                          <button onClick={() => removeSurveySelection(surveyId)} className="ml-1 text-xs hover:text-red-500">×</button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirmation Message */}
              {confirmationMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                  {confirmationMessage}
                </div>
              )}

              {/* Assign Button */}
              <Button
                onClick={assignSurveys}
                disabled={selectedUser.length === 0 || selectedSurveys.length === 0}
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
              >
                Assign Survey{selectedSurveys.length > 1 ? "s" : ""} to User{selectedUser.length > 1 ? "s" : ""}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <AssignedSurveysPanel 
              userAssignments={userAssignments} 
              users={users} 
              toggleSurveyStatus={toggleSurveyStatus}
              surveys={surveys}
              setUserAssignments={setUserAssignments}
            />
          </div>
        </div>
      </div>
    </div>  );
};

const AssignedSurveysPanel = ({ userAssignments, users, toggleSurveyStatus, surveys, setUserAssignments }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserModal, setSelectedUserModal] = useState(null)
  const [modalSurveySearch, setModalSurveySearch] = useState('')
  const [showModalSurveyDropdown, setShowModalSurveyDropdown] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedSurveysForUser, setSelectedSurveysForUser] = useState([])
  const [surveysToRemove, setSurveysToRemove] = useState([])

  const filteredUserAssignments = Object.entries(userAssignments).filter(([userId, surveys]) => {
    const user = users.find(u => u.id === userId)
    return user && user.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const availableSurveys = surveys.filter(survey => 
    survey.name.toLowerCase().includes(modalSurveySearch.toLowerCase()) &&
    !(userAssignments[selectedUserModal?.id] || []).some(assigned => assigned.id === survey.id) &&
    !selectedSurveysForUser.includes(survey.id)
  )

  const handleSurveySelection = (surveyId) => {
    if (!selectedSurveysForUser.includes(surveyId)) {
      setSelectedSurveysForUser([...selectedSurveysForUser, surveyId])
    }
    setModalSurveySearch('')
    setShowModalSurveyDropdown(false)
  }

  const removeSurveyFromSelection = (surveyId) => {
    setSelectedSurveysForUser(selectedSurveysForUser.filter(id => id !== surveyId))
  }

  const markSurveyForRemoval = (surveyId) => {
    if (!surveysToRemove.includes(surveyId)) {
      setSurveysToRemove([...surveysToRemove, surveyId])
    } else {
      setSurveysToRemove(surveysToRemove.filter(id => id !== surveyId))
    }
  }

  const updateUserSurveys = () => {
    if (selectedUserModal) {
      // Add new surveys
      const newSurveys = selectedSurveysForUser.map(surveyId => {
        const survey = surveys.find(s => s.id === surveyId)
        return { ...survey, active: true }
      })

      // Remove marked surveys and add new ones
      setUserAssignments(prev => ({
        ...prev,
        [selectedUserModal.id]: [
          ...(prev[selectedUserModal.id] || []).filter(s => !surveysToRemove.includes(s.id)),
          ...newSurveys
        ]
      }))

      // Reset modal state
      setSelectedSurveysForUser([])
      setSurveysToRemove([])
      setSelectedUserModal(null)
    }
  }

  const confirmDeleteSurvey = () => {
    if (surveyToDelete && selectedUserModal) {
      setUserAssignments(prev => ({
        ...prev,
        [selectedUserModal.id]: prev[selectedUserModal.id].filter(s => s.id !== surveyToDelete.id)
      }))
    }
    setShowDeleteConfirm(false)
    setSurveyToDelete(null)
  }

  return (
    <div className="lg:w-80 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
      <div className="lg:p-4 lg:mt-20 p-4 space-y-3">
        <div className="mb-3">
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 lg:text-center">
            Assigned Surveys
          </CardTitle>
          <div className="mt-3">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="space-y-2 lg:space-y-3">
            {filteredUserAssignments.map(([userId, surveys]) => {
              const user = users.find((u) => u.id === userId);
              if (!user || surveys.length === 0) return null;
              
              return (
                <div 
                  key={userId} 
                  className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUserModal({ id: userId, name: user.name })}
                >
                  <h4 className="font-medium text-gray-800 text-xs lg:text-sm break-words mb-2">
                    {user.name}
                  </h4>
                  <div className="space-y-1">
                    {surveys.map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between py-1">
                        <span className={`text-xs break-words flex-1 ${
                          survey.active ? "text-gray-600" : "line-through text-gray-400"
                        }`}>
                          {survey.name}
                        </span>
                        <Button
                          variant={survey.active ? "destructive" : "default"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSurveyStatus(userId, survey.id)
                          }}
                          className="text-xs ml-2 px-2 py-1"
                        >
                          {survey.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.keys(userAssignments).length === 0 && (
              <div className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white">
                <p className="text-gray-500 text-xs">
                  No surveys assigned yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </div>
      
      {/* User Modal */}
      {selectedUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">User Management</h3>
              <button 
                onClick={() => {
                  setSelectedUserModal(null)
                  setSelectedSurveysForUser([])
                  setSurveysToRemove([])
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-3">{selectedUserModal.name}</h4>
            </div>
            
            {/* Add Survey Section */}
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-bold text-black mb-2">ADD SURVEY</label>
              <div className="relative">
                <Input
                  type="text"
                  value={modalSurveySearch}
                  onChange={(e) => {
                    setModalSurveySearch(e.target.value)
                    setShowModalSurveyDropdown(true)
                  }}
                  onFocus={() => setShowModalSurveyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowModalSurveyDropdown(false), 200)}
                  placeholder={availableSurveys.length === 0 ? "No new surveys available" : "Search and select surveys..."}
                  className="text-sm rounded-[5px] border-gray-400"
                  disabled={availableSurveys.length === 0}
                />
                {showModalSurveyDropdown && availableSurveys.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-400 rounded-[5px] mt-1 max-h-40 overflow-y-auto">
                    {availableSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        onClick={() => handleSurveySelection(survey.id)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                      >
                        <input type="checkbox" checked={false} readOnly className="mr-2" />
                        {survey.name}
                      </div>
                    ))}
                  </div>
                )}
                {selectedSurveysForUser.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSurveysForUser.map((surveyId) => {
                      const survey = surveys.find((s) => s.id === surveyId)
                      return (
                        <Badge key={surveyId} variant="secondary" className="flex items-center gap-1">
                          {survey?.name}
                          <button onClick={() => removeSurveyFromSelection(surveyId)} className="ml-1 text-xs hover:text-red-500">×</button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Assigned Surveys */}
            <div className="mb-4">
              <h4 className="text-xs sm:text-sm font-bold text-black mb-2">CURRENT SURVEYS</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(userAssignments[selectedUserModal.id] || []).map((survey) => (
                  <div key={survey.id} className={`flex items-center justify-between p-2 border rounded ${
                    surveysToRemove.includes(survey.id) ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}>
                    <span className={`text-sm flex-1 ${
                      surveysToRemove.includes(survey.id) ? 'line-through text-red-400' : 'text-gray-700'
                    }`}>
                      {survey.name}
                    </span>
                    <Button
                      variant={surveysToRemove.includes(survey.id) ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => markSurveyForRemoval(survey.id)}
                      className="text-xs px-2 py-1"
                    >
                      {surveysToRemove.includes(survey.id) ? "Undo" : "Remove"}
                    </Button>
                  </div>
                ))}
                {!(userAssignments[selectedUserModal.id] || []).length && (
                  <p className="text-gray-500 text-sm">No surveys currently assigned</p>
                )}
              </div>
            </div>
            
            {/* Update Button */}
            <Button
              onClick={updateUserSurveys}
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 text-sm"
            >
              Update
            </Button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove "{surveyToDelete?.name}" from {selectedUserModal?.name}?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteSurvey}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignUser;
