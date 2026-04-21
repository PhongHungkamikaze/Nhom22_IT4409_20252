// Lightweight API client that handles Authorization header and token refresh
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const accessToken = localStorage.getItem('accessToken');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                if (response.status === 401) {
                    // Try refresh once and retry
                    const retry = async () => {
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

                    return await retry();
                }

                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Some endpoints may return no content (204). Parse safely.
            const text = await response.text();
            if (!text) return null;
            return JSON.parse(text);
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.access);
            if (data.refresh) localStorage.setItem('refreshToken', data.refresh);
            return data.access;
        } catch (error) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw error;
        }
    }
}

const apiClient = new ApiClient();
export default apiClient;
