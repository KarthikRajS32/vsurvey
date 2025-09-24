import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AssignUser = () => {
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [surveySearch, setSurveySearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSurveyDropdown, setShowSurveyDropdown] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const users = [
    { id: "john.doe", name: "John Doe" },
    { id: "jane.smith", name: "Jane Smith" },
    { id: "mike.johnson", name: "Mike Johnson" },
    { id: "sarah.wilson", name: "Sarah Wilson" },
  ];

  const surveys = [
    { id: 1, name: "Customer Satisfaction Survey" },
    { id: 2, name: "Product Feedback Survey" },
    { id: 3, name: "Market Research Survey" },
    { id: 4, name: "Employee Engagement Survey" },
    { id: 5, name: "Brand Awareness Survey" },
  ];

  

  useEffect(() => {
    localStorage.setItem('userAssignments', JSON.stringify(userAssignments));
  }, [userAssignments]);

  useEffect(() => {
    const saved = localStorage.getItem("userAssignments");
    if (saved) {
      setUserAssignments(JSON.parse(saved));
    }
  }, []);

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
    <div className="w-full xl:max-w-[680px] lg:max-w-[370px] flex flex-col xl:flex-col mt-2 sm:mt-2 md:mt-2 lg:mt-2 px-2 sm:px-2 md:px-6">
      <div className="flex-1">
        <div className="flex flex-col mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">
            Assign Surveys to Users
          </h1>
          <h1 className="text-sm sm:text-base md:text-lg lg:text-x text-gray-400 font-extralight p-2">
            Select a user and assign surveys to them
          </h1>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 mt-5">
        <h2 className="text-xl font-semibold">Assignment Panel</h2>
      </div>

      {/* Assignment Form */}
      <div className="space-y-4 mb-8">
        {/* User Multi-Select */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-bold text-black mb-2">
            SELECT USER
          </label>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setShowUserDropdown(true);
            }}
            onFocus={() => setShowUserDropdown(true)}
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
            placeholder="Search and select users..."
            className="w-full p-3 sm:p-4 md:p-2 border rounded-sm text-sm sm:text-base border-gray-400 focus:outline-none focus:ring-1 focus:ring-black mb-2"
          />
          {showUserDropdown && filteredUsers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-400 rounded-sm mt-1 max-h-40 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelection(user.id)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedUser.includes ? selectedUser.includes(user.id) : selectedUser === user.id}
                    readOnly
                    className="mr-2"
                  />
                  {user.name}
                </div>
              ))}
            </div>
          )}

          {/* Selected Users Display */}
          {((Array.isArray(selectedUser) && selectedUser.length > 0) || (!Array.isArray(selectedUser) && selectedUser)) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(Array.isArray(selectedUser) ? selectedUser : [selectedUser]).map((userId) => {
                const user = users.find((u) => u.id === userId);
                return (
                  <Badge
                    key={userId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {user?.name}
                    <button
                      onClick={() => removeUserSelection(userId)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Survey Multi-Select */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-bold text-black mb-2">
            SELECT SURVEYS
          </label>
          <input
            type="text"
            value={surveySearch}
            onChange={(e) => {
              setSurveySearch(e.target.value);
              setShowSurveyDropdown(true);
            }}
            onFocus={() => setShowSurveyDropdown(true)}
            onBlur={() => setTimeout(() => setShowSurveyDropdown(false), 200)}
            placeholder="Search and select surveys..."
            className="w-full p-3 sm:p-4 md:p-2 border rounded-sm text-sm sm:text-base border-gray-400 focus:outline-none focus:ring-1 focus:ring-black mb-2"
          />
          {showSurveyDropdown && filteredSurveys.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-400 rounded-sm mt-1 max-h-40 overflow-y-auto">
              {filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  onClick={() => handleSurveySelection(survey.id)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    className="mr-2"
                  />
                  {survey.name}
                </div>
              ))}
            </div>
          )}

          {/* Selected Surveys Display */}
          {selectedSurveys.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSurveys.map((surveyId) => {
                const survey = surveys.find((s) => s.id === surveyId);
                return (
                  <Badge
                    key={surveyId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {survey?.name}
                    <button
                      onClick={() => removeSurveySelection(surveyId)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        {confirmationMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-sm text-sm">
            {confirmationMessage}
          </div>
        )}

        {/* Assign Button */}
        <div className="bg-black w-full text-[15px] p-2 rounded-sm flex justify-center text-white">
          <button
            onClick={assignSurveys}
            disabled={selectedUser.length === 0 || selectedSurveys.length === 0}
            className="disabled:opacity-50 w-full"
          >
            Assign Survey{selectedSurveys.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
      
      {/* Right Sidebar - Assigned Surveys Panel */}
      <div className="mt-5 lg:w-86 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
        <div className="lg:p-6 lg:mt-20 p-4 space-y-4">
          <div className="lg:flex lg:items-center lg:justify-center hidden">
            <CardTitle className="text-xl text-black font-semibold flex justify-center">
              Assigned Surveys
            </CardTitle>
            <div className="w-10"></div>
          </div>
          <div className="lg:hidden mb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Assigned Surveys
            </CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="space-y-3">
              {Object.entries(userAssignments).map(([userId, surveys]) => {
                const user = users.find((u) => u.id === userId);
                if (!user || surveys.length === 0) return null;
                
                return (
                  <div key={userId} className="p-5 border-1 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base break-words flex-1">
                        {user.name}
                      </h4>
                    </div>
                    <div className="space-y-2 mt-3">
                      {surveys.map((survey) => (
                        <div key={survey.id} className="flex items-center justify-between py-1">
                          <span
                            className={`text-xs sm:text-ss text-gray-600 break-words ${
                              survey.active ? "" : "line-through text-gray-400"
                            }`}
                          >
                            {survey.name}
                          </span>
                          <Button
                            variant={survey.active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleSurveyStatus(userId, survey.id)}
                            className="text-xs ml-2"
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
                <div className="p-5 border-1 border-black rounded-lg bg-white">
                  <p className="text-gray-500 text-sm">
                    No surveys have been assigned yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default AssignUser;
