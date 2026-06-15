// Lightweight API client that handles Authorization header and token refresh
// Read base URL from Vite env (set VITE_API_BASE_URL), otherwise use '/api' so dev proxy works
const rawBase = typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : undefined;
const DEFAULT_BASE = rawBase || '/api';

const normalizeBase = (u) => {
    if (!u) return '';
    // remove trailing slash(es)
    return u.replace(/\/+$|\\/u, '').replace(/\\/g, '/');
};

const API_BASE_URL = normalizeBase(DEFAULT_BASE);

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    async request(endpoint, options = {}) {
        // ensure endpoint begins with a slash
        const ep = endpoint && endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        let url = `${this.baseURL}${ep}`;

        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value);
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const accessToken = localStorage.getItem('accessToken');

        const config = {
            headers: {
                // Chỉ set Content-Type nếu body KHÔNG phải FormData
                ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
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

                const errorText = await response.text();
                let errorData = null;
                try {
                    errorData = errorText ? JSON.parse(errorText) : null;
                } catch (parseError) {
                    errorData = errorText || null;
                }
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                // Cung cấp error.response để tương thích với các trang dùng err.response?.data
                error.response = { status: response.status, data: errorData };
                throw error;
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
            const refreshEp = '/auth/token/refresh/';
            const response = await fetch(`${this.baseURL}${refreshEp}`, {
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
