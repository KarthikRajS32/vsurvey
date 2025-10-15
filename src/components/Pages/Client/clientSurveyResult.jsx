import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { BarChart3, Users, Calendar, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, auth } from "../../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const SurveyResults = ({ profile, onProfileEdit, onLogout }) => {
  const [surveys, setSurveys] = useState([]);
  const [expandedSurvey, setExpandedSurvey] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalResponses, setTotalResponses] = useState(0);
  const [locationCache, setLocationCache] = useState({});
  const [surveyQuestions, setSurveyQuestions] = useState({});
  const [sortConfig, setSortConfig] = useState({});
  const [filters, setFilters] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const getLocationName = async (lat, lng) => {
    const cacheKey = `${lat},${lng}`;
    if (locationCache[cacheKey]) {
      return locationCache[cacheKey];
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const location = data.display_name;
        setLocationCache(prev => ({ ...prev, [cacheKey]: location }));
        return location;
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
    
    return `${lat}, ${lng}`;
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

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const clientId = await getClientId();
      if (!clientId) return;

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

      // Calculate total responses from all surveys
      let total = 0;
      for (const survey of surveysList) {
        const responsesRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", survey.id, "response");
        const responsesSnapshot = await getDocs(responsesRef);
        total += responsesSnapshot.docs.length;
      }
      setTotalResponses(total);
    } catch (error) {
      console.error("Error loading surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSurveyExpansion = async (surveyId) => {
    if (expandedSurvey === surveyId) {
      setExpandedSurvey(null);
    } else {
      setExpandedSurvey(surveyId);

      // Load responses for this survey if not already loaded
      if (!surveyResponses[surveyId]) {
        try {
          const clientId = await getClientId();
          if (!clientId) return;

          // Get responses and extract question IDs
          const responsesRef = collection(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "surveys", surveyId, "response");
          const responsesSnapshot = await getDocs(responsesRef);
          const questionIds = new Set();
          const questionsData = {};
          
          // Extract all question IDs from responses
          responsesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.answers) {
              Object.keys(data.answers).forEach(questionId => {
                questionIds.add(questionId);
              });
            }
          });

          // Fetch question details
          for (const questionId of questionIds) {
            try {
              const questionRef = doc(db, "superadmin", "U0UjGVvDJoDbLtWAhyjp", "clients", clientId, "questions", questionId);
              const questionDoc = await getDoc(questionRef);
              if (questionDoc.exists()) {
                const questionData = questionDoc.data();
                questionsData[questionId] = questionData.question_text || questionData.text || questionData.question || `Question ${questionId}`;
              }
            } catch (err) {
              console.error("Error fetching question:", err);
            }
          }

          setSurveyQuestions(prev => ({
            ...prev,
            [surveyId]: questionsData
          }));

          const responses = [];

          for (const responseDoc of responsesSnapshot.docs) {
            const responseData = responseDoc.data();

            // Fetch user name using userId
            let userName = 'N/A';
            if (responseData.userId) {
              try {
                const userRef = doc(db, "users", responseData.userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  userName = userData.full_name || userData.name || 'N/A';
                }
              } catch (err) {
                console.error("Error fetching user:", err);
              }
            }

            // Format timestamp
            let formattedDate = 'N/A';
            if (responseData.submittedAt) {
              try {
                if (responseData.submittedAt.toDate) {
                  formattedDate = responseData.submittedAt.toDate().toLocaleString();
                } else {
                  formattedDate = new Date(responseData.submittedAt).toLocaleString();
                }
              } catch (err) {
                console.error("Error formatting date:", err);
              }
            }

            // Convert geoCode to location name
            let locationName = 'N/A';
            if (responseData.geoCode && responseData.geoCode._lat && responseData.geoCode._long) {
              locationName = await getLocationName(responseData.geoCode._lat, responseData.geoCode._long);
            }

            responses.push({
              id: responseDoc.id,
              ...responseData,
              userName: userName,
              formattedSubmittedAt: formattedDate,
              locationName: locationName
            });
          }

          setSurveyResponses(prev => ({
            ...prev,
            [surveyId]: responses
          }));
        } catch (error) {
          console.error("Error loading survey responses:", error);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Survey Results</h1>
          <p className="text-gray-600 mt-2">View and analyze survey responses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                  <p className="text-3xl font-bold text-blue-600">{surveys.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-3xl font-bold text-green-600">{totalResponses}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Survey Cards */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading surveys...</p>
          ) : (
            <>
              {surveys.map((survey) => {
                const isExpanded = expandedSurvey === survey.id;
                const allResponses = surveyResponses[survey.id] || [];
                const questions = surveyQuestions[survey.id] || {};
                const questionIds = Object.keys(questions);
                
                // Apply filters
                const filteredResponses = allResponses.filter(response => {
                  const surveyFilters = filters[survey.id] || {};
                  return (
                    (!surveyFilters.area || response.area === surveyFilters.area) &&
                    (!surveyFilters.boothNumber || response.boothNumber === surveyFilters.boothNumber) &&
                    (!surveyFilters.constitution || response.constitution === surveyFilters.constitution) &&
                    (!surveyFilters.userName || response.userName === surveyFilters.userName)
                  );
                });
                
                // Apply sorting
                const sortedResponses = [...filteredResponses].sort((a, b) => {
                  const config = sortConfig[survey.id];
                  if (!config) return 0;
                  
                  let aValue = a[config.key];
                  let bValue = b[config.key];
                  
                  // Handle question answers
                  if (config.key.startsWith('question_')) {
                    const questionId = config.key.replace('question_', '');
                    aValue = a.answers?.[questionId] || '';
                    bValue = b.answers?.[questionId] || '';
                  }
                  
                  // Handle different data types
                  if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                  }
                  
                  if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
                  if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
                  return 0;
                });
                
                const responses = sortedResponses;
                
                // Get unique values for filters
                const getUniqueValues = (key) => {
                  const values = allResponses.map(r => r[key]).filter(v => v && v !== 'N/A');
                  return [...new Set(values)].sort();
                };
                
                const handleSort = (key) => {
                  setSortConfig(prev => {
                    const currentConfig = prev[survey.id];
                    const newDirection = currentConfig?.key === key && currentConfig?.direction === 'asc' ? 'desc' : 'asc';
                    return {
                      ...prev,
                      [survey.id]: { key, direction: newDirection }
                    };
                  });
                };
                
                const handleFilter = (filterKey, value) => {
                  setFilters(prev => ({
                    ...prev,
                    [survey.id]: {
                      ...prev[survey.id],
                      [filterKey]: value === 'all' ? null : value
                    }
                  }));
                };
                
                const getSortIcon = (key) => {
                  const config = sortConfig[survey.id];
                  if (config?.key !== key) return <ArrowUpDown className="w-4 h-4" />;
                  return config.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
                };

                return (
                  <Card key={survey.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{survey.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Responses: {responses.length}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          
                          {/* Filters */}
                          {isExpanded && allResponses.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              {['area', 'boothNumber', 'constitution', 'userName'].map((filterKey) => {
                                const labels = { area: 'Area', boothNumber: 'Booth Number', constitution: 'Constitution', userName: 'User Name' };
                                const placeholders = { area: 'All Areas', boothNumber: 'All Booths', constitution: 'All Constitutions', userName: 'All Users' };
                                const dropdownKey = `${survey.id}_${filterKey}`;
                                const isOpen = openDropdowns[dropdownKey];
                                const currentFilter = filters[survey.id]?.[filterKey];
                                
                                return (
                                  <div key={filterKey} className="relative">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{labels[filterKey]}</label>
                                    <button
                                      onClick={() => setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                                      className="w-full h-8 px-3 text-xs border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <span className={currentFilter ? 'text-gray-900' : 'text-gray-500'}>
                                        {currentFilter || placeholders[filterKey]}
                                      </span>
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                    {isOpen && (
                                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                        <div
                                          onClick={() => {
                                            handleFilter(filterKey, 'all');
                                            setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                          }}
                                          className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                                        >
                                          {placeholders[filterKey]}
                                        </div>
                                        {getUniqueValues(filterKey).map(value => (
                                          <div
                                            key={value}
                                            onClick={() => {
                                              handleFilter(filterKey, value);
                                              setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                                            }}
                                            className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                                          >
                                            {value}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => toggleSurveyExpansion(survey.id)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          View Responses
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Content - Responses Table */}
                      {isExpanded && (
                        <div className="mt-6 border-t pt-6">
                          {responses.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                      <button onClick={() => handleSort('index')} className="flex items-center gap-1 hover:text-gray-700">
                                        S.No {getSortIcon('index')}
                                      </button>
                                    </th>
                                    {questionIds.map((questionId) => (
                                      <th key={questionId} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button onClick={() => handleSort(`question_${questionId}`)} className="flex items-center gap-1 hover:text-gray-700">
                                          {questions[questionId]} {getSortIcon(`question_${questionId}`)}
                                        </button>
                                      </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('area')} className="flex items-center gap-1 hover:text-gray-700">
                                        Area {getSortIcon('area')}
                                      </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('boothNumber')} className="flex items-center gap-1 hover:text-gray-700">
                                        Booth Number {getSortIcon('boothNumber')}
                                      </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('constitution')} className="flex items-center gap-1 hover:text-gray-700">
                                        Constitution {getSortIcon('constitution')}
                                      </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('locationName')} className="flex items-center gap-1 hover:text-gray-700">
                                        Location {getSortIcon('locationName')}
                                      </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('formattedSubmittedAt')} className="flex items-center gap-1 hover:text-gray-700">
                                        Submitted At {getSortIcon('formattedSubmittedAt')}
                                      </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <button onClick={() => handleSort('userName')} className="flex items-center gap-1 hover:text-gray-700">
                                        User Name {getSortIcon('userName')}
                                      </button>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {responses.map((response, index) => (
                                    <tr key={response.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                      {questionIds.map((questionId) => (
                                        <td key={questionId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                          {response.answers && response.answers[questionId] ? response.answers[questionId] : 'N/A'}
                                        </td>
                                      ))}
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.area || 'N/A'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.boothNumber || 'N/A'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.constitution || 'N/A'}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                        {response.locationName || 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {response.formattedSubmittedAt || 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.userName || 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No responses found for this survey
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {surveys.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No surveys found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;