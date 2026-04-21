import apiClient from './apiClient';

export async function getQuizzes() {
    return apiClient.request('/quizzes/');
}

export async function getQuiz(id) {
    return apiClient.request(`/quizzes/${id}/`);
}

export async function createQuiz(quizData) {
    return apiClient.request('/quizzes/', {
        method: 'POST',
        body: JSON.stringify(quizData),
    });
}

export async function updateQuiz(id, quizData) {
    return apiClient.request(`/quizzes/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(quizData),
    });
}

export async function partialUpdateQuiz(id, quizData) {
    return apiClient.request(`/quizzes/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(quizData),
    });
}

export async function deleteQuiz(id) {
    return apiClient.request(`/quizzes/${id}/`, {
        method: 'DELETE',
    });
}

export default {
    getQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    partialUpdateQuiz,
    deleteQuiz,
};
