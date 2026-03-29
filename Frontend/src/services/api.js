// API base configuration
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Backend chỉ trả về tokens, tạo user data từ credentials
    return {
      ...response,
      user: {
        username: credentials.username,
        first_name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        last_name: '',
        email: `${credentials.username}@example.com`
      }
    };
  }

  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Quiz endpoints
  async getQuizzes() {
    return this.request('/quizzes/');
  }

  async getQuiz(id) {
    return this.request(`/quizzes/${id}/`);
  }

  async createQuiz(quizData) {
    return this.request('/quizzes/', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  // Attempt endpoints
  async startAttempt(quizId) {
    return this.request('/attempts/', {
      method: 'POST',
      body: JSON.stringify({ quiz: quizId }),
    });
  }

  async submitAnswer(attemptId, questionId, selectedChoices) {
    return this.request('/answers/', {
      method: 'POST',
      body: JSON.stringify({
        attempt: attemptId,
        question: questionId,
        selected_choices: selectedChoices,
      }),
    });
  }

  async finishAttempt(attemptId) {
    return this.request(`/attempts/${attemptId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
  }

  // Stats endpoint (if available)
  async getStats() {
    try {
      return this.request('/stats/');
    } catch (error) {
      // Return mock data if stats endpoint doesn't exist
      return {
        totalQuizzes: 150,
        totalUsers: 2500,
        completedTests: 8750
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;