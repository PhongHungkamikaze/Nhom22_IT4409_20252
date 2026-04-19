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

export default {
    getQuizzes,
    getQuiz,
    createQuiz,
};
