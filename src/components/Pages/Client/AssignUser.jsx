import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Sidebar from "./AssignedSurveys";

const AssignUser = () => {
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
    const savedUsers = localStorage.getItem('surveyUsers');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Convert to the format expected by AssignUser
      const formattedUsers = parsedUsers.map(user => ({
        id: user.id.toString(),
        name: user.fullName
      }));
      setUsers(formattedUsers);
    }
    
    const savedSurveys = localStorage.getItem('createdSurveys');
    if (savedSurveys) {
      setSurveys(JSON.parse(savedSurveys));
    }
    
    // Listen for surveys updates from other components
    const handleSurveysUpdated = () => {
      const updatedSurveys = localStorage.getItem('createdSurveys');
      if (updatedSurveys) {
        setSurveys(JSON.parse(updatedSurveys));
      } else {
        setSurveys([]);
      }
    }
    
    const handleUsersUpdated = () => {
      const updatedUsers = localStorage.getItem('surveyUsers');
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
        <AssignedSurveysPanel userAssignments={userAssignments} users={users} toggleSurveyStatus={toggleSurveyStatus} />
      </div>
    </div>  );
};

const AssignedSurveysPanel = ({ userAssignments, users, toggleSurveyStatus }) => {
  return (
    <div className="lg:w-80 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
      <div className="lg:p-4 lg:mt-20 p-4 space-y-3">
        <div className="mb-3">
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 lg:text-center">
            Assigned Surveys
          </CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="space-y-2 lg:space-y-3">
            {Object.entries(userAssignments).map(([userId, surveys]) => {
              const user = users.find((u) => u.id === userId);
              if (!user || surveys.length === 0) return null;
              
              return (
                <div key={userId} className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
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
                          onClick={() => toggleSurveyStatus(userId, survey.id)}
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
    </div>
  );
};

export default AssignUser;
