import apiClient from './apiClient';

export async function startAttempt(quizId) {
    return apiClient.request('/attempts/', {
        method: 'POST',
        body: JSON.stringify({ quiz: quizId }),
    });
}

export async function finishAttempt(attemptId) {
    return apiClient.request(`/attempts/${attemptId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
    });
}

export async function getAttempts() {
    return apiClient.request('/attempts/');
}

export default {
    startAttempt,
    finishAttempt,
    getAttempts,
};
