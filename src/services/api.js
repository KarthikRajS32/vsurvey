import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAuthToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    // Fallback to stored token
    return localStorage.getItem('firebaseToken');
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return await response.json();
  }

  // User endpoints
  async createUser(userData) {
    return this.request('/users/', {
      method: 'POST',
      body: userData,
    });
  }

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/?${queryString}`);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(userId) {
    return this.request(`/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Question endpoints
  async createQuestion(questionData) {
    return this.request('/questions/', {
      method: 'POST',
      body: questionData,
    });
  }

  async getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/questions/?${queryString}`);
  }

  async getQuestionById(questionId) {
    return this.request(`/questions/${questionId}`);
  }

  async updateQuestion(questionId, questionData) {
    return this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: questionData,
    });
  }

  async deleteQuestion(questionId) {
    return this.request(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async getQuestionTypes() {
    return this.request('/questions/types/');
  }

  // Survey endpoints
  async createSurvey(surveyData) {
    return this.request('/surveys/', {
      method: 'POST',
      body: surveyData,
    });
  }

  async getSurveys(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/surveys/?${queryString}`);
  }

  async getSurveyById(surveyId, includeQuestions = false) {
    return this.request(`/surveys/${surveyId}?include_questions=${includeQuestions}`);
  }

  async updateSurvey(surveyId, surveyData) {
    return this.request(`/surveys/${surveyId}`, {
      method: 'PUT',
      body: surveyData,
    });
  }

  async deleteSurvey(surveyId) {
    return this.request(`/surveys/${surveyId}`, {
      method: 'DELETE',
    });
  }

  async addQuestionToSurvey(surveyId, questionId, order = 0) {
    return this.request(`/surveys/${surveyId}/questions/${questionId}?order=${order}`, {
      method: 'POST',
    });
  }

  async removeQuestionFromSurvey(surveyId, questionId) {
    return this.request(`/surveys/${surveyId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async updateSurveyStatus(surveyId, status) {
    return this.request(`/surveys/${surveyId}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  // Assignment endpoints
  async assignSurveyToUsers(assignmentData) {
    return this.request('/assignments/', {
      method: 'POST',
      body: assignmentData,
    });
  }

  async getAssignments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/assignments/?${queryString}`);
  }

  async getSurveyAssignments(surveyId) {
    return this.request(`/assignments/survey/${surveyId}`);
  }

  async getUserAssignments(userId) {
    return this.request(`/assignments/user/${userId}`);
  }

  async updateAssignment(assignmentId, assignmentData) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: assignmentData,
    });
  }

  async deleteAssignment(assignmentId) {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  async removeUserFromSurvey(surveyId, userId) {
    return this.request(`/assignments/survey/${surveyId}/user/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
