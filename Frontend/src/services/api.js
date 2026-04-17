// API base configuration
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Refresh control
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.subscribers = [];
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
          // Try to refresh token and retry the original request once
          // If a refresh is already in progress, wait for it
          const retryRequest = async () => {
            // wait for refresh to complete (or start it)
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              this.refreshPromise = this.refreshToken()
                .then((newAccess) => {
                  this.isRefreshing = false;
                  return newAccess;
                })
                .catch((err) => {
                  this.isRefreshing = false;
                  throw err;
                });
            }

            try {
              const newAccess = await this.refreshPromise;
              if (!newAccess) throw new Error('No new access token');

              // set new Authorization header and retry
              const retryConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${newAccess}`,
                },
              };

              const retryResp = await fetch(url, retryConfig);
              if (!retryResp.ok) {
                throw new Error(`HTTP error! status: ${retryResp.status}`);
              }
              return await retryResp.json();
            } catch (err) {
              throw err;
            }
          };

          return await retryRequest();
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

  async getAttempts() {
    return this.request('/attempts/');
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

  // User Profile endpoints
  async getUserProfile() {
    try {
      console.log('Fetching user profile from /auth/profile/');
      return await this.request('/auth/profile/');
    } catch (err) {
      console.warn('Failed to fetch profile:', err.message);
      // Fallback: return user from localStorage
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
  }

  async updateUserProfile(userData) {
    console.log('updateUserProfile called with:', userData);
    try {
      const response = await this.request('/auth/profile/', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      console.log('Profile update successful:', response);
      return response;
    } catch (err) {
      console.error('Failed to update profile:', err.message);
      throw new Error(err.message || 'Không thể cập nhật thông tin cá nhân');
    }
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
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
