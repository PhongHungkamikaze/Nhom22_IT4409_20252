// API base configuration
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Lấy access token từ localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    // Thêm Authorization header nếu có token
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Nếu token hết hạn (401), có thể thử refresh token
        if (response.status === 401) {
          console.warn('Token hết hạn hoặc không hợp lệ');
          // TODO: Implement refresh token logic
        }
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

    // Backend giờ đã trả về user data với role, không cần tạo fake data nữa
    return response;
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

  // Refresh token endpoint
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Lưu access token mới
      localStorage.setItem('accessToken', data.access);
      
      // Nếu có refresh token mới (ROTATE_REFRESH_TOKENS = True)
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      return data.access;
    } catch (error) {
      // Nếu refresh token cũng hết hạn, logout user
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;