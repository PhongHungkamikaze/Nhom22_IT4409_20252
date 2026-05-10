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

export async function saveAnswer(attemptId, rowData) {
    return apiClient.request(`/attempts/${attemptId}/save-answer/`, {
        method: 'POST',
        body: JSON.stringify(rowData),
    });
}

export async function submitQuiz(attemptId) {
    return apiClient.request(`/attempts/${attemptId}/submit/`, {
        method: 'POST',
    });
}

export async function getAttempt(attemptId) {
    return apiClient.request(`/attempts/${attemptId}/`);
}

export default {
    startAttempt,
    finishAttempt,
    getAttempts,
    getAttempt,
    saveAnswer,
    submitQuiz,
};
