import apiClient from './apiClient';

export async function submitAnswer(attemptId, questionId, selectedChoices) {
    return apiClient.request('/answers/', {
        method: 'POST',
        body: JSON.stringify({
            attempt: attemptId,
            question: questionId,
            selected_choices: selectedChoices,
        }),
    });
}

export default {
    submitAnswer,
};
