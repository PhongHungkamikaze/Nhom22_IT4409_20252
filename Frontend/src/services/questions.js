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

/**
 * Bulk import questions from CSV or Excel file
 * @param {File} file - CSV or Excel file
 * @param {number} subjectId - Subject ID for the questions
 * @returns {Promise<Object>} - {message, created_count, errors}
 */
export async function bulkImportQuestions(file, subjectId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', subjectId);

    return apiClient.request('/questions/bulk-import/', {
        method: 'POST',
        body: formData,
    });
}

/**
 * Generate questions using AI
 * @param {string} prompt - Description of questions to generate
 * @param {number} count - Number of questions to generate
 * @param {number} subjectId - Subject ID for the questions
 * @param {string} type - Question type ('single' or 'multiple')
 * @returns {Promise<Object>} - Array of generated questions
 */
export async function generateAIQuestions(prompt, count, subjectId, type = 'single') {
    return apiClient.request('/questions/generate-ai/', {
        method: 'POST',
        body: JSON.stringify({
            content: prompt,  // ← Backend expects "content", not "prompt"
            count: parseInt(count),
            subject_id: subjectId,
            type: type,
        }),
    });
}

export default {
    getQuestions,
    getQuestion,
    createQuestion,
    deleteQuestion,
    partialUpdateQuestion,
    bulkImportQuestions,
    generateAIQuestions,
};
