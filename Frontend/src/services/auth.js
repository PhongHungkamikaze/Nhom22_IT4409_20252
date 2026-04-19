import apiClient from './apiClient';

export async function login(credentials) {
    const response = await apiClient.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
    return response;
}

export async function register(userData) {
    return apiClient.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function changePassword(oldPassword, newPassword) {
    return apiClient.request('/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
}

export default {
    login,
    register,
    changePassword,
};
