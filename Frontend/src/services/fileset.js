import apiClient from './apiClient';

const ENDPOINT = '/filesets/';

export async function getFiles(params = {}) {
    return await apiClient.request(ENDPOINT, { method: 'GET', params });
}

export async function getFile(id) {
    return await apiClient.request(`${ENDPOINT}${id}/`, { method: 'GET' });
}

export async function uploadFile(data) {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.file) formData.append('file', data.file);
    if (data.subject) formData.append('subject', data.subject);
    return await apiClient.request(ENDPOINT, {
        method: 'POST',
        body: formData,
    });
}

export async function updateFile(id, data) {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.file) formData.append('file', data.file);
    if (data.subject !== undefined) formData.append('subject', data.subject);
    return await apiClient.request(`${ENDPOINT}${id}/`, {
        method: 'PUT',
        body: formData,
    });
}

export async function deleteFile(id) {
    return await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' });
}

const fileset = { getFiles, getFile, uploadFile, updateFile, deleteFile };
export default fileset;
