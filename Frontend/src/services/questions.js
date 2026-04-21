import apiClient from './apiClient';

export async function getQuestions() {
    return apiClient.request('/questions/');
}

export async function getQuestion(id) {
    return apiClient.request(`/questions/${id}/`);
}

export async function createQuestion(questionData) {
    return apiClient.request('/questions/', {
        method: 'POST',
        body: JSON.stringify(questionData),
    });
}

export async function deleteQuestion(id) {
    return apiClient.request(`/questions/${id}/`, {
        method: 'DELETE',
    });
}

export default {
    getQuestions,
    getQuestion,
    createQuestion
    , deleteQuestion
};
