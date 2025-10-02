import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
};

// Specific hooks for different entities
export const useUsers = () => {
  const { loading, error, execute, setError } = useApi();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });

  const fetchUsers = useCallback(async (params = {}) => {
    return execute(
      () => apiService.getUsers(params),
      (result) => {
        setUsers(result.items || []);
        setPagination({
          total: result.total || 0,
          page: result.page || 1,
          size: result.size || 10,
          pages: result.pages || 0
        });
      }
    );
  }, [execute]);

  const createUser = useCallback(async (userData) => {
    return execute(
      () => apiService.createUser(userData),
      () => {
        // Refresh users list after creation
        fetchUsers({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchUsers, pagination.page, pagination.size]);

  const updateUser = useCallback(async (userId, userData) => {
    return execute(
      () => apiService.updateUser(userId, userData),
      () => {
        // Refresh users list after update
        fetchUsers({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchUsers, pagination.page, pagination.size]);

  const deleteUser = useCallback(async (userId) => {
    return execute(
      () => apiService.deleteUser(userId),
      () => {
        // Refresh users list after deletion
        fetchUsers({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchUsers, pagination.page, pagination.size]);

  const toggleUserStatus = useCallback(async (userId) => {
    return execute(
      () => apiService.toggleUserStatus(userId),
      () => {
        // Refresh users list after status change
        fetchUsers({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchUsers, pagination.page, pagination.size]);

  return {
    users,
    pagination,
    loading,
    error,
    setError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
};

export const useQuestions = () => {
  const { loading, error, execute, setError } = useApi();
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });

  const fetchQuestions = useCallback(async (params = {}) => {
    return execute(
      () => apiService.getQuestions(params),
      (result) => {
        setQuestions(result.items || []);
        setPagination({
          total: result.total || 0,
          page: result.page || 1,
          size: result.size || 10,
          pages: result.pages || 0
        });
      }
    );
  }, [execute]);

  const createQuestion = useCallback(async (questionData) => {
    return execute(
      () => apiService.createQuestion(questionData),
      () => {
        fetchQuestions({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchQuestions, pagination.page, pagination.size]);

  const updateQuestion = useCallback(async (questionId, questionData) => {
    return execute(
      () => apiService.updateQuestion(questionId, questionData),
      () => {
        fetchQuestions({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchQuestions, pagination.page, pagination.size]);

  const deleteQuestion = useCallback(async (questionId) => {
    return execute(
      () => apiService.deleteQuestion(questionId),
      () => {
        fetchQuestions({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchQuestions, pagination.page, pagination.size]);

  return {
    questions,
    pagination,
    loading,
    error,
    setError,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
  };
};

export const useSurveys = () => {
  const { loading, error, execute, setError } = useApi();
  const [surveys, setSurveys] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });

  const fetchSurveys = useCallback(async (params = {}) => {
    return execute(
      () => apiService.getSurveys(params),
      (result) => {
        setSurveys(result.items || []);
        setPagination({
          total: result.total || 0,
          page: result.page || 1,
          size: result.size || 10,
          pages: result.pages || 0
        });
      }
    );
  }, [execute]);

  const createSurvey = useCallback(async (surveyData) => {
    return execute(
      () => apiService.createSurvey(surveyData),
      () => {
        fetchSurveys({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchSurveys, pagination.page, pagination.size]);

  const updateSurvey = useCallback(async (surveyId, surveyData) => {
    return execute(
      () => apiService.updateSurvey(surveyId, surveyData),
      () => {
        fetchSurveys({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchSurveys, pagination.page, pagination.size]);

  const deleteSurvey = useCallback(async (surveyId) => {
    return execute(
      () => apiService.deleteSurvey(surveyId),
      () => {
        fetchSurveys({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchSurveys, pagination.page, pagination.size]);

  const updateSurveyStatus = useCallback(async (surveyId, status) => {
    return execute(
      () => apiService.updateSurveyStatus(surveyId, status),
      () => {
        fetchSurveys({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchSurveys, pagination.page, pagination.size]);

  return {
    surveys,
    pagination,
    loading,
    error,
    setError,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    updateSurveyStatus
  };
};

export const useAssignments = () => {
  const { loading, error, execute, setError } = useApi();
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });

  const fetchAssignments = useCallback(async (params = {}) => {
    return execute(
      () => apiService.getAssignments(params),
      (result) => {
        setAssignments(result.items || []);
        setPagination({
          total: result.total || 0,
          page: result.page || 1,
          size: result.size || 10,
          pages: result.pages || 0
        });
      }
    );
  }, [execute]);

  const assignSurveyToUsers = useCallback(async (assignmentData) => {
    return execute(
      () => apiService.assignSurveyToUsers(assignmentData),
      () => {
        fetchAssignments({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchAssignments, pagination.page, pagination.size]);

  const deleteAssignment = useCallback(async (assignmentId) => {
    return execute(
      () => apiService.deleteAssignment(assignmentId),
      () => {
        fetchAssignments({ page: pagination.page, size: pagination.size });
      }
    );
  }, [execute, fetchAssignments, pagination.page, pagination.size]);

  return {
    assignments,
    pagination,
    loading,
    error,
    setError,
    fetchAssignments,
    assignSurveyToUsers,
    deleteAssignment
  };
};

export default useApi;
