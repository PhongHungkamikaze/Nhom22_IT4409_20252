import apiClient from './apiClient';

const ENDPOINT = '/class-groups/';

export async function getClassGroups(params = {}) {
    return await apiClient.request(ENDPOINT, { method: 'GET', params });
}

export async function getClassGroup(id) {
    return await apiClient.request(`${ENDPOINT}${id}/`, { method: 'GET' });
}

export async function createClassGroup(data) {
    return await apiClient.request(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateClassGroup(id, data) {
    return await apiClient.request(`${ENDPOINT}${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteClassGroup(id) {
    return await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' });
}

export async function getClassGroupMembers(id) {
    return await apiClient.request(`${ENDPOINT}${id}/members/`, { method: 'GET' });
}

export async function addStudentToClassGroup(id, studentIds) {
    const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
    return await apiClient.request(`${ENDPOINT}${id}/add-student/`, {
        method: 'POST',
        body: JSON.stringify({ student_ids: ids }),
    });
}

export async function removeStudentFromClassGroup(id, studentId) {
    return await apiClient.request(`${ENDPOINT}${id}/remove-student/`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId }),
    });
}

export async function assignQuizToClassGroup(id, quizId, dueDate = null) {
    return await apiClient.request(`${ENDPOINT}${id}/assign-quiz/`, {
        method: 'POST',
        body: JSON.stringify({ quiz_id: quizId, due_date: dueDate }),
    });
}

export async function getAssignedQuizzes(id) {
    return await apiClient.request(`${ENDPOINT}${id}/assigned-quizzes/`, { method: 'GET' });
}

const classGroup = {
    getClassGroups,
    getClassGroup,
    createClassGroup,
    updateClassGroup,
    deleteClassGroup,
    getClassGroupMembers,
    addStudentToClassGroup,
    removeStudentFromClassGroup,
    assignQuizToClassGroup,
    getAssignedQuizzes,
};
export default classGroup;
