import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Building,
} from "lucide-react";
import { db } from "../../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const SurveyResults = () => {
  const [clients, setClients] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientSurveys, setClientSurveys] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsRef = collection(
        db,
        "superadmin",
        "u1JiUOCTXxaOkoK83AFH",
        "clients"
      );
      const snapshot = await getDocs(clientsRef);
      const clientsList = [];
      let surveysCount = 0;
      let responsesCount = 0;

      for (const doc of snapshot.docs) {
        const clientData = doc.data();

        // Get surveys count for this client
        const surveysRef = collection(
          db,
          "superadmin",
          "u1JiUOCTXxaOkoK83AFH",
          "clients",
          doc.id,
          "surveys"
        );
        const surveysSnapshot = await getDocs(surveysRef);
        const clientSurveysCount = surveysSnapshot.size;

        // Get actual responses count for this client by counting all survey responses
        let clientResponsesCount = 0;
        for (const surveyDoc of surveysSnapshot.docs) {
          const surveyResponsesRef = collection(
            db,
            "superadmin",
            "u1JiUOCTXxaOkoK83AFH",
            "clients",
            doc.id,
            "surveys",
            surveyDoc.id,
            "responses"
          );
          const surveyResponsesSnapshot = await getDocs(surveyResponsesRef);
          clientResponsesCount += surveyResponsesSnapshot.size;
        }

        surveysCount += clientSurveysCount;
        responsesCount += clientResponsesCount;

        clientsList.push({
          id: doc.id,
          name: clientData.name || clientData.email,
          email: clientData.email,
          surveysCount: clientSurveysCount,
          responsesCount: clientResponsesCount,
        });
      }

      setClients(clientsList);
      setTotalSurveys(surveysCount);
      setTotalResponses(responsesCount);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientExpansion = async (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);

      // Load surveys for this client if not already loaded
      if (!clientSurveys[clientId]) {
        try {
          const surveysRef = collection(
            db,
            "superadmin",
            "u1JiUOCTXxaOkoK83AFH",
            "clients",
            clientId,
            "surveys"
          );
          const surveysSnapshot = await getDocs(surveysRef);
          const surveys = [];

          for (const surveyDoc of surveysSnapshot.docs) {
            const surveyData = surveyDoc.data();

            // Get actual response count for this survey
            const surveyResponsesRef = collection(
              db,
              "superadmin",
              "u1JiUOCTXxaOkoK83AFH",
              "clients",
              clientId,
              "surveys",
              surveyDoc.id,
              "responses"
            );
            const surveyResponsesSnapshot = await getDocs(surveyResponsesRef);
            const surveyResponseCount = surveyResponsesSnapshot.size;

            surveys.push({
              id: surveyDoc.id,
              name: surveyData.name,
              questionCount: surveyData.questionCount || 0,
              responses: surveyResponseCount,
              createdAt: surveyData.createdAt,
            });
          }

          setClientSurveys((prev) => ({
            ...prev,
            [clientId]: surveys,
          }));
        } catch (error) {
          console.error("Error loading client surveys:", error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Survey Results
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            View and analyze survey responses from all clients
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Surveys
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {totalSurveys}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Responses
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {totalResponses}
                  </p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Clients ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => {
                const isExpanded = expandedClient === client.id;
                const surveys = clientSurveys[client.id] || [];

                return (
                  <Card key={client.id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {client.name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                            <span>Surveys: {client.surveysCount}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Responses: {client.responsesCount}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => toggleClientExpansion(client.id)}
                          variant="outline"
                          className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                        >
                          View
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Surveys */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isExpanded
                            ? "max-h-screen opacity-100 mt-4 sm:mt-6"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="border-t pt-4 sm:pt-6">
                          <h4 className="font-semibold mb-3 text-sm sm:text-base">
                            Surveys by {client.name}
                          </h4>
                          {surveys.length > 0 ? (
                            <div className="space-y-3">
                              {surveys.map((survey) => (
                                <div
                                  key={survey.id}
                                  className="bg-gray-50 p-3 sm:p-4 rounded-lg"
                                >
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                                        {survey.name}
                                      </h5>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                                        <span>
                                          Questions: {survey.questionCount}
                                        </span>
                                        <span className="hidden sm:inline">
                                          •
                                        </span>
                                        <span>
                                          Created:{" "}
                                          {new Date(
                                            survey.createdAt
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {survey.responses} responses
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No surveys found for this client
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {clients.length === 0 && (
                <div className="text-center py-8">
                  <Building className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    No clients found
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyResults;
