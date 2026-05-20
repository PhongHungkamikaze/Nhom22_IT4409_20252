import apiClient from './apiClient';

export async function getQuestions(params = {}) {
    return apiClient.request('/questions/', { params });
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

export async function partialUpdateQuestion(id, data) {
    return apiClient.request(`/questions/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export default {
    getQuestions,
    getQuestion,
    createQuestion
    , deleteQuestion,
    partialUpdateQuestion
};
