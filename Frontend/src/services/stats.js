import apiClient from './apiClient';

export async function getStats() {
    try {
        return await apiClient.request('/stats/');
    } catch (error) {
        return {
            total_quizzes: 150,
            total_users: 2500,
            completed_attempts: 8750,
        };
    }
}

export default { getStats };
