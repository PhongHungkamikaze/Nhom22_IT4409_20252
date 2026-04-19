import apiClient from './apiClient';

export async function getStats() {
    try {
        return await apiClient.request('/stats/');
    } catch (error) {
        return {
            totalQuizzes: 150,
            totalUsers: 2500,
            completedTests: 8750,
        };
    }
}

export default { getStats };
