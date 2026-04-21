import apiClient from './apiClient';

const USERS_ENDPOINT = '/users/';

export async function getUsers(params = '') {
    // params can be a query string like '?page=1&search=foo'
    const endpoint = `${USERS_ENDPOINT}${params}`;
    return await apiClient.request(endpoint, { method: 'GET' });
}

export async function getUser(id) {
    return await apiClient.request(`${USERS_ENDPOINT}${id}/`, { method: 'GET' });
}

export async function createUser(payload) {
    return await apiClient.request(USERS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateUser(id, payload) {
    return await apiClient.request(`${USERS_ENDPOINT}${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function partialUpdateUser(id, payload) {
    return await apiClient.request(`${USERS_ENDPOINT}${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function deleteUser(id) {
    return await apiClient.request(`${USERS_ENDPOINT}${id}/`, {
        method: 'DELETE',
    });
}

const users = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    partialUpdateUser,
    deleteUser,
};

export default users;
