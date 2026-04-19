import apiClient from './apiClient';

export async function getUserProfile() {
    try {
        return await apiClient.request('/auth/profile/');
    } catch (err) {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export async function updateUserProfile(userData) {
    return apiClient.request('/auth/profile/', {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

export default {
    getUserProfile,
    updateUserProfile,
};
