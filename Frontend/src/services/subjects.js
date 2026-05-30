import apiClient from './apiClient';

const SUBJECTS_ENDPOINT = '/subjects/';

export async function getSubjects(params = {}) {
    return await apiClient.request(SUBJECTS_ENDPOINT, { 
        method: 'GET',
        params 
    });
}

export async function createSubject(data) {
    return await apiClient.request(SUBJECTS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function deleteSubject(id) {
    return await apiClient.request(`${SUBJECTS_ENDPOINT}${id}/`, {
        method: 'DELETE'
    });
}
export async function updateSubject(id, data) {
    return await apiClient.request(`${SUBJECTS_ENDPOINT}${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

const subjects = { getSubjects, createSubject, deleteSubject, updateSubject };
export default subjects;
